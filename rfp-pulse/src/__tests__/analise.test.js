import { describe, it, expect } from 'vitest';
import { analisarTexto, extrairMetadados, dividirEmTrechos, localizarTrechos } from '../lib/analise.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

const TEXTO = `A PREFEITURA MUNICIPAL DE CAMPINAS torna público que realizará licitação na modalidade PREGÃO ELETRÔNICO nº 045/2026, para contratação de empresa especializada em suporte técnico de TI. Valor estimado: R$ 1.850.000,00. Abertura das propostas em 20/10/2026. Envio das propostas até 18/10/2026.
Exige-se atestado de capacidade técnica compatível com 50% do objeto.
Certidões negativas de débitos federais, estaduais e municipais.
Índice de liquidez geral igual ou superior a 1,0.
Certificação ITIL da equipe será considerada diferencial.
O pagamento será efetuado em 60 dias após a medição.
Multa de 30% em caso de descumprimento do SLA.
Garantia de proposta de 1% do valor estimado.
A visita técnica é obrigatória e deverá ser agendada.
Demais serviços conforme necessidade da contratante.`;

describe('extrairMetadados', () => {
  const m = extrairMetadados(TEXTO);
  it('modalidade, número, valor, datas, órgão, título', () => {
    expect(m.modalidade).toBe('pregao');
    expect(m.numeroProcesso).toBe('045/2026');
    expect(m.valorEstimado).toBe(185_000_000);
    expect(m.dataAberturaPropostas).toBe('2026-10-20');
    expect(m.dataLimiteEnvio).toBe('2026-10-18');
    expect(m.orgao).toMatch(/PREFEITURA MUNICIPAL DE CAMPINAS/);
    expect(m.titulo).toMatch(/^Contratação de empresa especializada/);
  });
  it('RFP privada e texto vazio', () => {
    expect(extrairMetadados('O Banco Horizonte convida fornecedores a apresentar proposta (RFP).').modalidade).toBe('rfp_privada');
    expect(extrairMetadados('')).toEqual({});
  });
  it('dispensa e concorrência', () => {
    expect(extrairMetadados('Dispensa de licitação art. 75').modalidade).toBe('dispensa');
    expect(extrairMetadados('Concorrência pública CP 012/2026').numeroProcesso).toBe('CP 012/2026');
  });
});

describe('analisarTexto', () => {
  const r = analisarTexto(TEXTO, { hoje: '2026-09-08' });
  const cat = (c) => r.criterios.filter((x) => x.categoria === c);

  it('gera critérios com categoria e trecho de origem', () => {
    expect(cat('tecnica').length).toBeGreaterThanOrEqual(1);
    expect(cat('fiscal')).toHaveLength(1);
    expect(cat('economico_financeira')).toHaveLength(1);
    for (const c of r.criterios) {
      expect(TEXTO).toContain(c.trechoOrigem);
      expect(c.situacao).toBe('nao_avaliado');
      expect(c.peso).toBeGreaterThanOrEqual(1);
      expect(c.peso).toBeLessThanOrEqual(5);
    }
  });

  it('marca obrigatório vs opcional', () => {
    const atestado = r.criterios.find((c) => /atestado/i.test(c.trechoOrigem));
    expect(atestado.obrigatorio).toBe(true);
    const itil = r.criterios.find((c) => /ITIL/.test(c.trechoOrigem));
    expect(itil.obrigatorio).toBe(false);
    expect(cat('fiscal')[0].obrigatorio).toBe(true);
  });

  it('gera riscos tipados', () => {
    const tipos = r.riscos.map((x) => x.tipo);
    expect(tipos).toContain('financeiro');
    expect(tipos).toContain('contratual');
    expect(tipos).toContain('escopo_aberto');
    const pag = r.riscos.find((x) => x.tipo === 'financeiro');
    expect(pag.titulo).toBe('Prazo de pagamento de 60 dias');
    expect(pag.severidade).toBe('alto');
    const multa = r.riscos.find((x) => x.tipo === 'contratual');
    expect(multa.severidade).toBe('alto');
  });

  it('gera checklist com garantia, visita e prazo de envio', () => {
    const tipos = r.checklist.map((x) => x.tipo);
    expect(tipos).toContain('garantia');
    expect(tipos).toContain('visita_tecnica');
    expect(r.checklist.find((x) => x.tipo === 'visita_tecnica').criticidade).toBe('bloqueante');
    const prazo = r.checklist.find((x) => x.tipo === 'prazo');
    expect(prazo.dataLimite).toBe('2026-10-18');
    expect(prazo.criticidade).toBe('bloqueante');
    expect(r.checklist.find((x) => x.tipo === 'garantia').titulo).toBe('Providenciar garantia de 1%');
  });

  it('cria risco de prazo quando faltam poucos dias ou já venceu', () => {
    const perto = analisarTexto('Envio até 10/09/2026.', { hoje: '2026-09-08' });
    expect(perto.riscos[0]).toMatchObject({ tipo: 'prazo', severidade: 'critico' });
    const vencido = analisarTexto('Envio até 01/09/2026.', { hoje: '2026-09-08' });
    expect(vencido.riscos[0].titulo).toMatch(/expirado/);
    const longe = analisarTexto('Envio até 01/12/2026.', { hoje: '2026-09-08' });
    expect(longe.riscos.find((x) => x.tipo === 'prazo')).toBeUndefined();
  });

  it('texto vazio ou nulo não quebra', () => {
    const v = analisarTexto('');
    expect(v.criterios).toEqual([]);
    expect(v.riscos).toEqual([]);
    expect(v.checklist).toHaveLength(1); // só o prazo de envio
    expect(analisarTexto(null).criterios).toEqual([]);
  });

  it('não duplica o mesmo trecho', () => {
    const dup = analisarTexto('Certidão negativa federal exigida. Certidão negativa federal exigida.');
    expect(dup.criterios.filter((c) => c.categoria === 'fiscal')).toHaveLength(1);
  });

  it('funciona nos textos do seed', () => {
    const s = criarSeed('2026-09-08');
    let comAchados = 0;
    for (const id of s.editais.ids) {
      const r2 = analisarTexto(s.editais.porId[id].textoBruto, { hoje: '2026-09-08' });
      expect(r2.checklist.length).toBeGreaterThan(0);
      if (r2.criterios.length + r2.riscos.length > 0) comAchados += 1;
    }
    expect(comAchados).toBeGreaterThanOrEqual(8);
  });
});

describe('dividirEmTrechos e localizarTrechos', () => {
  it('preserva posições', () => {
    const tx = 'Primeira frase longa aqui. Segunda frase longa aqui; terceira frase longa.';
    const tr = dividirEmTrechos(tx);
    expect(tr).toHaveLength(3);
    for (const t of tr) expect(tx.slice(t.inicio, t.fim)).toBe(t.texto);
  });
  it('localiza sem sobreposição e ignora ausentes', () => {
    const tx = 'abc def ghi jkl';
    const marcas = localizarTrechos(tx, [
      { id: '1', trechoOrigem: 'def ghi' },
      { id: '2', trechoOrigem: 'ghi jkl' },
      { id: '3', trechoOrigem: 'zzz' },
      { id: '4', trechoOrigem: '' },
    ]);
    expect(marcas.map((m) => m.id)).toEqual(['1']);
  });
});
