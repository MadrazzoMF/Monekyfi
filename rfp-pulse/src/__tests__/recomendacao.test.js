import { describe, it, expect } from 'vitest';
import {
  definirRecomendacao,
  criteriosEliminatorios,
  LIMIAR_GO,
  LIMIAR_CONDICIONAL,
} from '../lib/recomendacao.js';
import { calcularScoreAderencia } from '../lib/score.js';

const c = (situacao, peso = 1, obrigatorio = false) => ({ situacao, peso, obrigatorio });
const r = (severidade, aceito = false) => ({ severidade, aceito });
const edital = { id: 'x' };

describe('definirRecomendacao — regra dura', () => {
  it('critério obrigatório nao_atende força no_go mesmo com score alto', () => {
    const criterios = [c('atende', 5), c('atende', 5), c('atende', 5), c('nao_atende', 1, true)];
    expect(calcularScoreAderencia(criterios)).toBeGreaterThan(LIMIAR_GO);
    expect(definirRecomendacao(edital, criterios, [])).toBe('no_go');
  });

  it('critério NÃO obrigatório nao_atende não elimina', () => {
    const criterios = [c('atende', 5), c('atende', 5), c('nao_atende', 1, false)];
    expect(definirRecomendacao(edital, criterios, [])).toBe('go');
  });

  it('obrigatório parcial não elimina', () => {
    expect(definirRecomendacao(edital, [c('parcial', 3, true), c('atende', 5)], [])).toBe('go');
  });

  it('eliminatório vence até sobre riscos e ausência de avaliação', () => {
    expect(definirRecomendacao(edital, [c('nao_atende', 1, true), c('nao_avaliado', 5, true)], [r('critico')])).toBe('no_go');
  });

  it('criteriosEliminatorios lista exatamente os obrigatórios não atendidos', () => {
    const a = c('nao_atende', 1, true);
    const lista = [a, c('nao_atende', 1, false), c('atende', 1, true), null];
    expect(criteriosEliminatorios(lista)).toEqual([a]);
    expect(criteriosEliminatorios(null)).toEqual([]);
  });
});

describe('definirRecomendacao — faixas de score', () => {
  it('indefinido quando nada foi avaliado', () => {
    expect(definirRecomendacao(edital, [c('nao_avaliado', 5, true)], [])).toBe('indefinido');
    expect(definirRecomendacao(edital, [], [])).toBe('indefinido');
    expect(definirRecomendacao(edital, undefined, undefined)).toBe('indefinido');
  });

  it('go no limiar e acima', () => {
    // 7 atende + 3 nao_atende = 70
    const exato = [c('atende', 7), c('nao_atende', 3)];
    expect(calcularScoreAderencia(exato)).toBe(LIMIAR_GO);
    expect(definirRecomendacao(edital, exato, [])).toBe('go');
  });

  it('condicional entre os limiares', () => {
    const meio = [c('atende', 1), c('nao_atende', 1)]; // 50
    expect(definirRecomendacao(edital, meio, [])).toBe('condicional');
    const borda = [c('atende', 4), c('nao_atende', 6)]; // 40
    expect(calcularScoreAderencia(borda)).toBe(LIMIAR_CONDICIONAL);
    expect(definirRecomendacao(edital, borda, [])).toBe('condicional');
  });

  it('no_go abaixo do limiar condicional', () => {
    expect(definirRecomendacao(edital, [c('atende', 1), c('nao_atende', 3)], [])).toBe('no_go'); // 25
    expect(definirRecomendacao(edital, [c('nao_atende', 1)], [])).toBe('no_go'); // 0
  });
});

describe('definirRecomendacao — riscos', () => {
  const alto = [c('atende', 5)];

  it('risco crítico não aceito rebaixa go para condicional', () => {
    expect(definirRecomendacao(edital, alto, [r('critico', false)])).toBe('condicional');
  });

  it('risco crítico aceito não rebaixa', () => {
    expect(definirRecomendacao(edital, alto, [r('critico', true)])).toBe('go');
  });

  it('risco alto não rebaixa', () => {
    expect(definirRecomendacao(edital, alto, [r('alto', false)])).toBe('go');
  });

  it('risco crítico não altera no_go por score', () => {
    expect(definirRecomendacao(edital, [c('nao_atende', 1)], [r('critico')])).toBe('no_go');
  });
});
