// Seletores. Único ponto onde campos derivados (score, recomendação, dias) aparecem.

import { derivarEdital } from '../lib/derivados.js';

const hojeIso = () => new Date().toISOString().slice(0, 10);

export function listarUsuarios(state) {
  return state.usuarios.ids.map((id) => state.usuarios.porId[id]);
}

export function obterCriteriosDoEdital(state, editalId) {
  const edital = state.editais.porId[editalId];
  if (!edital) return [];
  return edital.criterioIds.map((id) => state.criterios.porId[id]).filter(Boolean);
}

export function obterChecklistDoEdital(state, editalId) {
  const edital = state.editais.porId[editalId];
  if (!edital) return [];
  return edital.checklistIds.map((id) => state.checklist.porId[id]).filter(Boolean);
}

export function obterRiscosDoEdital(state, editalId) {
  const edital = state.editais.porId[editalId];
  if (!edital) return [];
  return edital.riscoIds.map((id) => state.riscos.porId[id]).filter(Boolean);
}

export function obterHistoricoDoEdital(state, editalId) {
  return state.aprovacoes.ids
    .map((id) => state.aprovacoes.porId[id])
    .filter((r) => r.editalId === editalId);
}

/** Edital com campos derivados anexados. */
export function obterEdital(state, editalId, hoje = hojeIso()) {
  const edital = state.editais.porId[editalId];
  if (!edital) return null;
  return derivarEdital(
    edital,
    obterCriteriosDoEdital(state, editalId),
    obterRiscosDoEdital(state, editalId),
    hoje,
  );
}

/** Edital + todas as entidades filhas, já derivado. */
export function obterEditalCompleto(state, editalId, hoje = hojeIso()) {
  const edital = obterEdital(state, editalId, hoje);
  if (!edital) return null;
  return {
    ...edital,
    criterios: obterCriteriosDoEdital(state, editalId),
    checklist: obterChecklistDoEdital(state, editalId),
    riscos: obterRiscosDoEdital(state, editalId),
    historico: obterHistoricoDoEdital(state, editalId),
    responsavel: edital.responsavelId ? state.usuarios.porId[edital.responsavelId] ?? null : null,
  };
}

export function listarEditais(state, hoje = hojeIso()) {
  return state.editais.ids.map((id) => obterEdital(state, id, hoje));
}
