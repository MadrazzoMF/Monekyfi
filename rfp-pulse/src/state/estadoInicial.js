// Shape normalizado. Cada coleção: { porId: {[id]: entidade}, ids: [] }.
// `ids` preserva ordem de inserção.

export function colecaoVazia() {
  return { porId: {}, ids: [] };
}

export function criarEstadoInicial() {
  return {
    editais: colecaoVazia(),
    criterios: colecaoVazia(),
    checklist: colecaoVazia(),
    riscos: colecaoVazia(),
    aprovacoes: colecaoVazia(),
    usuarios: colecaoVazia(),
    usuarioAtualId: null,
  };
}

export const COLECOES = Object.freeze([
  'editais',
  'criterios',
  'checklist',
  'riscos',
  'aprovacoes',
  'usuarios',
]);
