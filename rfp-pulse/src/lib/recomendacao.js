// Recomendação go / no_go / condicional / indefinido.
// Derivada. NUNCA gravar o resultado em uma entidade.

import { Recomendacao as R, SituacaoCriterio as Sit, Severidade } from '../domain/enums.js';
import { calcularScoreAderencia, contarAvaliados } from './score.js';

export const LIMIAR_GO = 70;
export const LIMIAR_CONDICIONAL = 40;

/** Critérios eliminatórios: obrigatório e não atendido. */
export function criteriosEliminatorios(criterios) {
  if (!Array.isArray(criterios)) return [];
  return criterios.filter(
    (c) => c && c.obrigatorio === true && c.situacao === Sit.NAO_ATENDE,
  );
}

/** Riscos críticos que ninguém aceitou formalmente. */
export function riscosCriticosNaoAceitos(riscos) {
  if (!Array.isArray(riscos)) return [];
  return riscos.filter((r) => r && r.severidade === Severidade.CRITICO && !r.aceito);
}

/**
 * REGRA DURA: qualquer critério obrigatório com situacao 'nao_atende'
 * força 'no_go', ignorando o score.
 *
 * Ordem de avaliação:
 *  1. eliminatório          -> no_go
 *  2. nada avaliado ainda   -> indefinido
 *  3. risco crítico aberto  -> condicional (no máximo)
 *  4. score >= 70           -> go
 *  5. score >= 40           -> condicional
 *  6. abaixo                -> no_go
 *
 * @param {object} edital  (reservado para regras futuras, ex.: prazo vencido)
 * @param {Array} criterios
 * @param {Array} riscos
 * @returns {string} Recomendacao
 */
export function definirRecomendacao(edital, criterios = [], riscos = []) {
  if (criteriosEliminatorios(criterios).length > 0) return R.NO_GO;
  if (contarAvaliados(criterios) === 0) return R.INDEFINIDO;

  const score = calcularScoreAderencia(criterios);
  const temRiscoCriticoAberto = riscosCriticosNaoAceitos(riscos).length > 0;

  if (score >= LIMIAR_GO) {
    return temRiscoCriticoAberto ? R.CONDICIONAL : R.GO;
  }
  if (score >= LIMIAR_CONDICIONAL) return R.CONDICIONAL;
  return R.NO_GO;
}
