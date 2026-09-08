// Junta as três funções puras e anexa os campos derivados a um edital.
// A saída é um objeto NOVO; o edital gravado no estado nunca recebe esses campos.

import { calcularDiasRestantes } from './datas.js';
import { calcularScoreAderencia } from './score.js';
import { definirRecomendacao } from './recomendacao.js';

/**
 * @param {object} edital
 * @param {Array} criterios  critérios do edital
 * @param {Array} riscos     riscos do edital
 * @param {string|Date} hoje
 */
export function derivarEdital(edital, criterios, riscos, hoje) {
  return {
    ...edital,
    scoreAderencia: calcularScoreAderencia(criterios),
    recomendacao: definirRecomendacao(edital, criterios, riscos),
    diasRestantes: calcularDiasRestantes(edital.dataLimiteEnvio, hoje),
  };
}
