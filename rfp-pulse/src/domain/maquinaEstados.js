// Máquina de estados do Edital. Tabela ÚNICA de transições permitidas.
// Qualquer transição fora daqui é rejeitada pelo reducer.

import { StatusEdital as S } from './enums.js';

export const TRANSICOES = Object.freeze({
  [S.IMPORTADO]: Object.freeze([S.EM_ANALISE]),
  [S.EM_ANALISE]: Object.freeze([S.TRIADO, S.DESCARTADO]),
  [S.TRIADO]: Object.freeze([S.EM_APROVACAO]),
  [S.EM_APROVACAO]: Object.freeze([S.APROVADO, S.REPROVADO]),
  [S.APROVADO]: Object.freeze([S.PROPOSTA_ENVIADA]),
  [S.PROPOSTA_ENVIADA]: Object.freeze([]),
  [S.DESCARTADO]: Object.freeze([]),
  [S.REPROVADO]: Object.freeze([]),
});

export const STATUS_TERMINAIS = Object.freeze(
  Object.keys(TRANSICOES).filter((s) => TRANSICOES[s].length === 0),
);

export function podeTransicionar(de, para) {
  const destinos = TRANSICOES[de];
  if (!destinos) return false;
  return destinos.includes(para);
}

export function transicoesPossiveis(de) {
  return TRANSICOES[de] ?? [];
}
