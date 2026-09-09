import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { reducer } from '../state/reducer.js';
import { acoes } from '../state/acoes.js';
import { criarEstadoInicial } from '../state/estadoInicial.js';
import { obterEdital, obterEditalCompleto, listarEditais } from '../state/seletores.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

const HOJE = '2026-09-08';

function estadoComUsuario() {
  let s = criarEstadoInicial();
  s = reducer(s, acoes.adicionarUsuario({ id: 'us_1', nome: 'Ana', papel: 'analista' }));
  s = reducer(s, acoes.definirUsuarioAtual('us_1'));
  return s;
}

function importar(s) {
  return reducer(
    s,
    acoes.importarEdital(
      {
        id: 'ed_t',
        titulo: 'Teste',
        orgao: 'Órgão',
        modalidade: 'pregao',
        valorEstimado: 100_00,
        dataLimiteEnvio: '2026-09-10',
        scoreAderencia: 999, // deve ser descartado
        recomendacao: 'go', // deve ser descartado
      },
      {
        criterios: [
          { id: 'cr_a', categoria: 'fiscal', descricao: 'CND', obrigatorio: true, situacao: 'atende', peso: 4 },
          { id: 'cr_b', categoria: 'tecnica', descricao: 'Atestado', obrigatorio: true, situacao: 'nao_avaliado', peso: 5 },
        ],
        riscos: [{ id: 'rs_a', tipo: 'prazo', titulo: 'Curto', severidade: 'alto' }],
        checklist: [{ id: 'ck_a', titulo: 'Enviar', tipo: 'prazo', criticidade: 'bloqueante' }],
      },
    ),
  );
}

beforeEach(() => vi.spyOn(console, 'warn').mockImplementation(() => {}));
afterEach(() => vi.restoreAllMocks());

describe('importar edital', () => {
  it('normaliza entidades e liga ids', () => {
    const s = importar(estadoComUsuario());
    expect(s.editais.ids).toEqual(['ed_t']);
    expect(s.editais.porId.ed_t.criterioIds).toEqual(['cr_a', 'cr_b']);
    expect(s.editais.porId.ed_t.riscoIds).toEqual(['rs_a']);
    expect(s.editais.porId.ed_t.checklistIds).toEqual(['ck_a']);
    expect(s.criterios.porId.cr_a.editalId).toBe('ed_t');
    expect(s.editais.porId.ed_t.status).toBe('importado');
  });

  it('nunca grava campos derivados', () => {
    const s = importar(estadoComUsuario());
    expect(s.editais.porId.ed_t).not.toHaveProperty('scoreAderencia');
    expect(s.editais.porId.ed_t).not.toHaveProperty('recomendacao');
    expect(s.editais.porId.ed_t).not.toHaveProperty('diasRestantes');
  });

  it('lança em dados inválidos', () => {
    expect(() => reducer(estadoComUsuario(), acoes.importarEdital({ titulo: 'x', orgao: 'y', modalidade: 'invalida' }))).toThrow();
    expect(() => reducer(estadoComUsuario(), acoes.importarEdital({ orgao: 'y' }))).toThrow(/titulo/);
    expect(() => reducer(estadoComUsuario(), acoes.importarEdital({ titulo: 'x', orgao: 'y', valorEstimado: 10.5 }))).toThrow(/centavos/);
  });
});

describe('transição de status', () => {
  it('aceita transição válida e registra aprovação append-only', () => {
    let s = importar(estadoComUsuario());
    s = reducer(s, acoes.transicionarStatus('ed_t', 'em_analise', { comentario: 'ok', timestamp: '2026-09-08T10:00:00Z' }));
    expect(s.editais.porId.ed_t.status).toBe('em_analise');
    expect(s.aprovacoes.ids).toHaveLength(1);
    const reg = s.aprovacoes.porId[s.aprovacoes.ids[0]];
    expect(reg).toMatchObject({ editalId: 'ed_t', deStatus: 'importado', paraStatus: 'em_analise', usuarioId: 'us_1', comentario: 'ok' });
    expect(Object.isFrozen(reg)).toBe(true);
  });

  it('REJEITA transição inválida sem alterar o estado', () => {
    const s = importar(estadoComUsuario());
    const depois = reducer(s, acoes.transicionarStatus('ed_t', 'aprovado'));
    expect(depois).toBe(s); // mesma referência
    expect(depois.aprovacoes.ids).toHaveLength(0);
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('transição inválida'));
  });

  it('rejeita status desconhecido, edital inexistente e sem usuário', () => {
    const s = importar(estadoComUsuario());
    expect(reducer(s, acoes.transicionarStatus('ed_t', 'voando'))).toBe(s);
    expect(reducer(s, acoes.transicionarStatus('nao_existe', 'em_analise'))).toBe(s);
    const semUsuario = { ...s, usuarioAtualId: null };
    expect(reducer(semUsuario, acoes.transicionarStatus('ed_t', 'em_analise'))).toBe(semUsuario);
  });

  it('percorre o fluxo completo e bloqueia depois do terminal', () => {
    let s = importar(estadoComUsuario());
    for (const st of ['em_analise', 'triado', 'em_aprovacao', 'aprovado', 'proposta_enviada']) {
      s = reducer(s, acoes.transicionarStatus('ed_t', st));
      expect(s.editais.porId.ed_t.status).toBe(st);
    }
    expect(s.aprovacoes.ids).toHaveLength(5);
    const final = reducer(s, acoes.transicionarStatus('ed_t', 'em_analise'));
    expect(final).toBe(s);
  });

  it('não permite mudar status por atualizarEdital', () => {
    const s = importar(estadoComUsuario());
    expect(reducer(s, acoes.atualizarEdital('ed_t', { status: 'aprovado' }))).toBe(s);
    const s2 = reducer(s, acoes.atualizarEdital('ed_t', { titulo: 'Novo', scoreAderencia: 5 }));
    expect(s2.editais.porId.ed_t.titulo).toBe('Novo');
    expect(s2.editais.porId.ed_t).not.toHaveProperty('scoreAderencia');
  });
});

describe('score recalcula ao mudar critérios (derivação)', () => {
  it('atualizar critério muda score e recomendação nos seletores', () => {
    let s = importar(estadoComUsuario());
    // só cr_a avaliado (atende, peso 4) -> 100, go
    let e = obterEdital(s, 'ed_t', HOJE);
    expect(e.scoreAderencia).toBe(100);
    expect(e.recomendacao).toBe('go');
    expect(e.diasRestantes).toBe(2);

    // cr_b obrigatório vira nao_atende -> no_go, score 4/9 = 44
    s = reducer(s, acoes.atualizarCriterio('cr_b', { situacao: 'nao_atende' }));
    e = obterEdital(s, 'ed_t', HOJE);
    expect(e.scoreAderencia).toBe(44);
    expect(e.recomendacao).toBe('no_go');

    // cr_b parcial -> 6.5/9 = 72, go
    s = reducer(s, acoes.atualizarCriterio('cr_b', { situacao: 'parcial' }));
    e = obterEdital(s, 'ed_t', HOJE);
    expect(e.scoreAderencia).toBe(72);
    expect(e.recomendacao).toBe('go');

    // risco crítico aberto -> condicional
    s = reducer(s, acoes.adicionarRisco({ id: 'rs_b', editalId: 'ed_t', tipo: 'juridico', titulo: 'Grave', severidade: 'critico' }));
    expect(obterEdital(s, 'ed_t', HOJE).recomendacao).toBe('condicional');
    s = reducer(s, acoes.atualizarRisco('rs_b', { aceito: true }));
    expect(obterEdital(s, 'ed_t', HOJE).recomendacao).toBe('go');

    // remover critério
    s = reducer(s, acoes.removerCriterio('cr_b'));
    expect(s.editais.porId.ed_t.criterioIds).toEqual(['cr_a']);
    expect(obterEdital(s, 'ed_t', HOJE).scoreAderencia).toBe(100);
  });

  it('atualizar critério com peso inválido lança', () => {
    const s = importar(estadoComUsuario());
    expect(() => reducer(s, acoes.atualizarCriterio('cr_a', { peso: 9 }))).toThrow(/peso/);
  });

  it('edital gravado continua sem campos derivados', () => {
    const s = importar(estadoComUsuario());
    obterEdital(s, 'ed_t', HOJE);
    expect(s.editais.porId.ed_t).not.toHaveProperty('scoreAderencia');
  });

  it('obterEditalCompleto agrega filhos e histórico', () => {
    let s = importar(estadoComUsuario());
    s = reducer(s, acoes.transicionarStatus('ed_t', 'em_analise'));
    const e = obterEditalCompleto(s, 'ed_t', HOJE);
    expect(e.criterios).toHaveLength(2);
    expect(e.riscos).toHaveLength(1);
    expect(e.checklist).toHaveLength(1);
    expect(e.historico).toHaveLength(1);
    expect(obterEditalCompleto(s, 'nada')).toBeNull();
  });
});

describe('seed', () => {
  const s = criarSeed(HOJE);
  const lista = listarEditais(s, HOJE);

  it('tem 10 editais com filhos', () => {
    expect(lista).toHaveLength(10);
    for (const e of lista) {
      expect(e.criterioIds.length).toBeGreaterThan(0);
      expect(e.checklistIds.length).toBeGreaterThan(0);
      expect(e.riscoIds.length).toBeGreaterThan(0);
    }
  });

  it('varia status e prazos', () => {
    const status = new Set(lista.map((e) => e.status));
    expect(status.size).toBeGreaterThanOrEqual(7);
    const dias = lista.map((e) => e.diasRestantes);
    expect(dias).toContain(2);
    expect(dias).toContain(60);
    expect(dias.some((d) => d < 0)).toBe(true);
  });

  it('tem casos de no_go por critério eliminatório', () => {
    const porId = Object.fromEntries(lista.map((e) => [e.id, e]));
    expect(porId.ed_02.recomendacao).toBe('no_go');
    expect(porId.ed_02.scoreAderencia).toBeGreaterThan(70); // score alto, mas eliminado
    expect(porId.ed_08.recomendacao).toBe('no_go');
    expect(porId.ed_04.recomendacao).toBe('indefinido');
    expect(porId.ed_03.recomendacao).toBe('go');
  });

  it('todo histórico referencia transições válidas', () => {
    const { podeTransicionar } = require('../domain/maquinaEstados.js');
    for (const id of s.aprovacoes.ids) {
      const r = s.aprovacoes.porId[id];
      expect(podeTransicionar(r.deStatus, r.paraStatus)).toBe(true);
    }
  });

  it('RESETAR_PARA_SEED devolve seed', () => {
    const vazio = criarEstadoInicial();
    expect(reducer(vazio, acoes.resetarParaSeed()).editais.ids).toHaveLength(10);
  });
});
