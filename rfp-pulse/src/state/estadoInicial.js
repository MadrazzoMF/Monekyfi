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

/** Estado sem editais, com um usuário admin local para permitir transições. */
export function criarEstadoLimpo() {
  const s = criarEstadoInicial();
  const usuario = { id: 'us_local', nome: 'Usuário local', papel: 'admin' };
  s.usuarios.porId[usuario.id] = usuario;
  s.usuarios.ids.push(usuario.id);
  s.usuarioAtualId = usuario.id;
  return s;
}
