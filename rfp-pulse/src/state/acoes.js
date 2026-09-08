// Tipos de ação + action creators. Componentes só despacham via estes creators.

export const Acao = Object.freeze({
  CARREGAR_ESTADO: 'estado/carregar',
  RESETAR_PARA_SEED: 'estado/resetarParaSeed',

  IMPORTAR_EDITAL: 'edital/importar',
  ATUALIZAR_EDITAL: 'edital/atualizar',
  TRANSICIONAR_STATUS: 'edital/transicionarStatus',

  ADICIONAR_CRITERIO: 'criterio/adicionar',
  ATUALIZAR_CRITERIO: 'criterio/atualizar',
  REMOVER_CRITERIO: 'criterio/remover',

  ADICIONAR_ITEM_CHECKLIST: 'checklist/adicionar',
  ATUALIZAR_ITEM_CHECKLIST: 'checklist/atualizar',
  REMOVER_ITEM_CHECKLIST: 'checklist/remover',

  ADICIONAR_RISCO: 'risco/adicionar',
  ATUALIZAR_RISCO: 'risco/atualizar',
  REMOVER_RISCO: 'risco/remover',

  ADICIONAR_USUARIO: 'usuario/adicionar',
  DEFINIR_USUARIO_ATUAL: 'usuario/definirAtual',
});

export const acoes = {
  carregarEstado: (estado) => ({ type: Acao.CARREGAR_ESTADO, payload: estado }),
  resetarParaSeed: () => ({ type: Acao.RESETAR_PARA_SEED }),

  /** dados: campos de Edital (sem id obrigatório). criterios/checklist/riscos opcionais. */
  importarEdital: (dados, { criterios = [], checklist = [], riscos = [] } = {}) => ({
    type: Acao.IMPORTAR_EDITAL,
    payload: { dados, criterios, checklist, riscos },
  }),
  atualizarEdital: (id, mudancas) => ({
    type: Acao.ATUALIZAR_EDITAL,
    payload: { id, mudancas },
  }),
  transicionarStatus: (editalId, paraStatus, { usuarioId, comentario = '', timestamp } = {}) => ({
    type: Acao.TRANSICIONAR_STATUS,
    payload: { editalId, paraStatus, usuarioId, comentario, timestamp },
  }),

  adicionarCriterio: (dados) => ({ type: Acao.ADICIONAR_CRITERIO, payload: dados }),
  atualizarCriterio: (id, mudancas) => ({
    type: Acao.ATUALIZAR_CRITERIO,
    payload: { id, mudancas },
  }),
  removerCriterio: (id) => ({ type: Acao.REMOVER_CRITERIO, payload: { id } }),

  adicionarItemChecklist: (dados) => ({ type: Acao.ADICIONAR_ITEM_CHECKLIST, payload: dados }),
  atualizarItemChecklist: (id, mudancas) => ({
    type: Acao.ATUALIZAR_ITEM_CHECKLIST,
    payload: { id, mudancas },
  }),
  removerItemChecklist: (id) => ({ type: Acao.REMOVER_ITEM_CHECKLIST, payload: { id } }),

  adicionarRisco: (dados) => ({ type: Acao.ADICIONAR_RISCO, payload: dados }),
  atualizarRisco: (id, mudancas) => ({ type: Acao.ATUALIZAR_RISCO, payload: { id, mudancas } }),
  removerRisco: (id) => ({ type: Acao.REMOVER_RISCO, payload: { id } }),

  adicionarUsuario: (dados) => ({ type: Acao.ADICIONAR_USUARIO, payload: dados }),
  definirUsuarioAtual: (id) => ({ type: Acao.DEFINIR_USUARIO_ATUAL, payload: { id } }),
};
