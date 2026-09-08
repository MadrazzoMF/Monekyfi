import { describe, it, expect } from 'vitest';
import { filtrarEditais, ordenarEditais, aplicarFiltros, resumirEditais } from '../lib/filtros.js';
import { listarEditais } from '../state/seletores.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

const HOJE = '2026-09-08';
const lista = listarEditais(criarSeed(HOJE), HOJE);

describe('filtrarEditais', () => {
  it('sem filtros devolve tudo', () => {
    expect(filtrarEditais(lista)).toHaveLength(10);
  });
  it('por status múltiplo', () => {
    const r = filtrarEditais(lista, { status: ['importado', 'triado'] });
    expect(r.map((e) => e.id).sort()).toEqual(['ed_03', 'ed_04', 'ed_10']);
  });
  it('por recomendação', () => {
    expect(filtrarEditais(lista, { recomendacao: ['no_go'] }).map((e) => e.id)).toEqual(['ed_02', 'ed_08']);
  });
  it('busca ignora acento e caixa, cobre órgão e tags', () => {
    expect(filtrarEditais(lista, { busca: 'PAVIMENTACAO' }).map((e) => e.id)).toEqual(['ed_02']);
    expect(filtrarEditais(lista, { busca: 'datasus' }).map((e) => e.id)).toEqual(['ed_05']);
    expect(filtrarEditais(lista, { busca: 'facilities' }).map((e) => e.id)).toEqual(['ed_10']);
    expect(filtrarEditais(lista, { busca: 'zzzz' })).toEqual([]);
  });
  it('apenas com prazo exclui vencidos e sem data', () => {
    const r = filtrarEditais(lista, { apenasComPrazo: true });
    expect(r.every((e) => e.diasRestantes >= 0)).toBe(true);
    expect(r).toHaveLength(8);
  });
  it('por responsável', () => {
    expect(filtrarEditais(lista, { responsavelId: 'us_ana' }).map((e) => e.id)).toEqual(['ed_01', 'ed_03', 'ed_06', 'ed_08']);
  });
});

describe('ordenarEditais', () => {
  it('dias restantes asc, vencidos primeiro', () => {
    const r = ordenarEditais(lista, 'diasRestantes', 'asc').map((e) => e.diasRestantes);
    expect(r).toEqual([-15, -3, 2, 2, 7, 15, 18, 24, 30, 60]);
  });
  it('sem prazo vai pro fim nas duas direções', () => {
    const comNull = [...lista, { ...lista[0], id: 'x', diasRestantes: null }];
    expect(ordenarEditais(comNull, 'diasRestantes', 'asc').at(-1).id).toBe('x');
    expect(ordenarEditais(comNull, 'diasRestantes', 'desc').at(-1).id).toBe('x');
  });
  it('score desc', () => {
    const r = ordenarEditais(lista, 'scoreAderencia', 'desc').map((e) => e.scoreAderencia);
    expect(r).toEqual([...r].sort((a, b) => b - a));
  });
  it('não muta a entrada', () => {
    const copia = [...lista];
    ordenarEditais(lista, 'titulo', 'desc');
    expect(lista).toEqual(copia);
  });
});

describe('aplicarFiltros e resumo', () => {
  it('combina filtro + ordenação', () => {
    const r = aplicarFiltros(lista, { recomendacao: ['go'], ordenarPor: 'valorEstimado', direcao: 'desc' });
    expect(r.map((e) => e.id)).toEqual(['ed_05', 'ed_07', 'ed_03', 'ed_06', 'ed_01']);
  });
  it('resumo conta recomendações e prazos', () => {
    const r = resumirEditais(lista);
    expect(r.total).toBe(10);
    expect(r.porRecomendacao).toEqual({ go: 5, no_go: 2, condicional: 2, indefinido: 1 });
    expect(r.vencidos).toBe(2);
    expect(r.vencendo7).toBe(3);
    expect(r.valorTotal).toBeGreaterThan(0);
  });
});
