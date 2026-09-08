import { describe, it, expect } from 'vitest';
import { calcularScoreAderencia, contarAvaliados } from '../lib/score.js';

const c = (situacao, peso = 1, extra = {}) => ({ situacao, peso, ...extra });

describe('calcularScoreAderencia', () => {
  it('retorna 0 para lista vazia ou inválida', () => {
    expect(calcularScoreAderencia([])).toBe(0);
    expect(calcularScoreAderencia(null)).toBe(0);
    expect(calcularScoreAderencia(undefined)).toBe(0);
  });

  it('retorna 0 quando nada foi avaliado', () => {
    expect(calcularScoreAderencia([c('nao_avaliado', 5), c('nao_avaliado', 3)])).toBe(0);
  });

  it('100 quando tudo atende, 0 quando nada atende', () => {
    expect(calcularScoreAderencia([c('atende', 1), c('atende', 5)])).toBe(100);
    expect(calcularScoreAderencia([c('nao_atende', 1), c('nao_atende', 5)])).toBe(0);
  });

  it('pondera por peso', () => {
    // atende peso 4 (4 pts), nao_atende peso 1 (0 pts) -> 4/5 = 80
    expect(calcularScoreAderencia([c('atende', 4), c('nao_atende', 1)])).toBe(80);
    // invertido -> 1/5 = 20
    expect(calcularScoreAderencia([c('atende', 1), c('nao_atende', 4)])).toBe(20);
  });

  it('parcial vale metade do peso', () => {
    expect(calcularScoreAderencia([c('parcial', 2)])).toBe(50);
    // atende 3 (3) + parcial 2 (1) + nao_atende 1 (0) = 4/6 = 66.67 -> 67
    expect(calcularScoreAderencia([c('atende', 3), c('parcial', 2), c('nao_atende', 1)])).toBe(67);
  });

  it('ignora nao_avaliado no denominador', () => {
    expect(calcularScoreAderencia([c('atende', 1), c('nao_avaliado', 5)])).toBe(100);
  });

  it('ignora peso zero, negativo ou inválido', () => {
    expect(calcularScoreAderencia([c('atende', 0), c('nao_atende', 2)])).toBe(0);
    expect(calcularScoreAderencia([c('atende', -3), c('atende', 2)])).toBe(100);
    expect(calcularScoreAderencia([c('nao_atende', NaN), c('atende', 2)])).toBe(100);
  });

  it('ignora situação desconhecida e itens nulos', () => {
    expect(calcularScoreAderencia([c('bizarro', 5), null, c('atende', 1)])).toBe(100);
  });

  it('não depende de obrigatorio (isso é regra da recomendação)', () => {
    expect(
      calcularScoreAderencia([c('atende', 1, { obrigatorio: false }), c('nao_atende', 1, { obrigatorio: true })]),
    ).toBe(50);
  });
});

describe('contarAvaliados', () => {
  it('conta só os avaliados', () => {
    expect(contarAvaliados([c('atende'), c('nao_avaliado'), c('parcial')])).toBe(2);
    expect(contarAvaliados([])).toBe(0);
    expect(contarAvaliados(null)).toBe(0);
  });
});
