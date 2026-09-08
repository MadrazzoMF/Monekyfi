// Score de aderência (0-100), ponderado por peso.
// Derivado. NUNCA gravar o resultado em uma entidade.

import { SituacaoCriterio as Sit } from '../domain/enums.js';

export const PONTUACAO_POR_SITUACAO = Object.freeze({
  [Sit.ATENDE]: 1,
  [Sit.PARCIAL]: 0.5,
  [Sit.NAO_ATENDE]: 0,
});

function pesoValido(peso) {
  return Number.isFinite(peso) && peso > 0;
}

/**
 * @param {Array<{situacao:string, peso:number}>} criterios
 * @returns {number} inteiro entre 0 e 100
 */
export function calcularScoreAderencia(criterios) {
  if (!Array.isArray(criterios) || criterios.length === 0) return 0;

  let somaPesos = 0;
  let somaPontos = 0;

  for (const c of criterios) {
    if (!c || c.situacao === Sit.NAO_AVALIADO) continue;
    const fator = PONTUACAO_POR_SITUACAO[c.situacao];
    if (fator === undefined) continue;
    if (!pesoValido(c.peso)) continue;
    somaPesos += c.peso;
    somaPontos += c.peso * fator;
  }

  if (somaPesos === 0) return 0;
  const score = Math.round((somaPontos / somaPesos) * 100);
  return Math.max(0, Math.min(100, score));
}

/** Quantidade de critérios que já foram avaliados (fora nao_avaliado). */
export function contarAvaliados(criterios) {
  if (!Array.isArray(criterios)) return 0;
  return criterios.filter((c) => c && c.situacao !== Sit.NAO_AVALIADO).length;
}
