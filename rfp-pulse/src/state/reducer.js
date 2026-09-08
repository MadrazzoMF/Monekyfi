// Reducer raiz. Puro. Rejeita transições de status fora da tabela TRANSICOES.
// Transição inválida: devolve o MESMO objeto de estado (referência idêntica).

import { Acao } from './acoes.js';
import { criarEstadoInicial } from './estadoInicial.js';
import { podeTransicionar } from '../domain/maquinaEstados.js';
import {
  criarEdital,
  criarCriterio,
  criarItemChecklist,
  criarRisco,
  criarRegistroAprovacao,
  criarUsuario,
  removerDerivados,
} from '../domain/entidades.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

// ---------- helpers de coleção normalizada ----------

function inserir(colecao, entidade) {
  if (colecao.porId[entidade.id]) {
    return { porId: { ...colecao.porId, [entidade.id]: entidade }, ids: colecao.ids };
  }
  return {
    porId: { ...colecao.porId, [entidade.id]: entidade },
    ids: [...colecao.ids, entidade.id],
  };
}

function atualizar(colecao, id, mudancas) {
  const atual = colecao.porId[id];
  if (!atual) return colecao;
  return { ...colecao, porId: { ...colecao.porId, [id]: { ...atual, ...mudancas } } };
}

function remover(colecao, id) {
  if (!colecao.porId[id]) return colecao;
  const porId = { ...colecao.porId };
  delete porId[id];
  return { porId, ids: colecao.ids.filter((x) => x !== id) };
}

function rejeitar(motivo, state) {
  if (typeof console !== 'undefined') console.warn(`[rfp-pulse] ação rejeitada: ${motivo}`);
  return state;
}

// ---------- handlers ----------

function importarEdital(state, { dados, criterios, checklist, riscos }) {
  const edital = criarEdital(dados);
  let novo = { ...state, editais: inserir(state.editais, edital) };

  const criterioIds = [];
  for (const c of criterios) {
    const ent = criarCriterio({ ...c, editalId: edital.id });
    novo.criterios = inserir(novo.criterios, ent);
    criterioIds.push(ent.id);
  }
  const checklistIds = [];
  for (const c of checklist) {
    const ent = criarItemChecklist({ ...c, editalId: edital.id });
    novo.checklist = inserir(novo.checklist, ent);
    checklistIds.push(ent.id);
  }
  const riscoIds = [];
  for (const r of riscos) {
    const ent = criarRisco({ ...r, editalId: edital.id });
    novo.riscos = inserir(novo.riscos, ent);
    riscoIds.push(ent.id);
  }

  novo.editais = atualizar(novo.editais, edital.id, {
    criterioIds: [...edital.criterioIds, ...criterioIds],
    checklistIds: [...edital.checklistIds, ...checklistIds],
    riscoIds: [...edital.riscoIds, ...riscoIds],
  });
  return novo;
}

function transicionarStatus(state, { editalId, paraStatus, usuarioId, comentario, timestamp }) {
  const edital = state.editais.porId[editalId];
  if (!edital) return rejeitar(`edital ${editalId} não existe`, state);

  const deStatus = edital.status;
  if (!podeTransicionar(deStatus, paraStatus)) {
    return rejeitar(`transição inválida ${deStatus} -> ${paraStatus}`, state);
  }

  const usuario = usuarioId ?? state.usuarioAtualId;
  if (!usuario) return rejeitar('transição exige usuarioId', state);

  const registro = criarRegistroAprovacao({
    editalId,
    deStatus,
    paraStatus,
    usuarioId: usuario,
    comentario,
    timestamp,
  });

  return {
    ...state,
    editais: atualizar(state.editais, editalId, { status: paraStatus }),
    aprovacoes: inserir(state.aprovacoes, registro),
  };
}

function adicionarFilho(state, chaveColecao, chaveIds, factory, dados) {
  const edital = state.editais.porId[dados.editalId];
  if (!edital) return rejeitar(`edital ${dados.editalId} não existe`, state);
  const ent = factory(dados);
  return {
    ...state,
    [chaveColecao]: inserir(state[chaveColecao], ent),
    editais: atualizar(state.editais, edital.id, {
      [chaveIds]: [...edital[chaveIds], ent.id],
    }),
  };
}

function removerFilho(state, chaveColecao, chaveIds, id) {
  const ent = state[chaveColecao].porId[id];
  if (!ent) return state;
  const edital = state.editais.porId[ent.editalId];
  return {
    ...state,
    [chaveColecao]: remover(state[chaveColecao], id),
    editais: edital
      ? atualizar(state.editais, edital.id, {
          [chaveIds]: edital[chaveIds].filter((x) => x !== id),
        })
      : state.editais,
  };
}

// ---------- reducer ----------

export function reducer(state = criarEstadoInicial(), action) {
  const { type, payload } = action;

  switch (type) {
    case Acao.CARREGAR_ESTADO:
      return payload;

    case Acao.RESETAR_PARA_SEED:
      return criarSeed();

    case Acao.IMPORTAR_EDITAL:
      return importarEdital(state, payload);

    case Acao.ATUALIZAR_EDITAL: {
      // status só muda por TRANSICIONAR_STATUS; derivados nunca entram.
      const { status, id: _id, ...mudancas } = removerDerivados(payload.mudancas);
      if (status !== undefined) {
        return rejeitar('status só muda via transicionarStatus', state);
      }
      return { ...state, editais: atualizar(state.editais, payload.id, mudancas) };
    }

    case Acao.TRANSICIONAR_STATUS:
      return transicionarStatus(state, payload);

    case Acao.ADICIONAR_CRITERIO:
      return adicionarFilho(state, 'criterios', 'criterioIds', criarCriterio, payload);
    case Acao.ATUALIZAR_CRITERIO: {
      const { id: _id, editalId: _e, ...mudancas } = payload.mudancas;
      const atual = state.criterios.porId[payload.id];
      if (!atual) return state;
      // re-passa pela factory para validar enums e peso
      const validado = criarCriterio({ ...atual, ...mudancas });
      return { ...state, criterios: atualizar(state.criterios, payload.id, validado) };
    }
    case Acao.REMOVER_CRITERIO:
      return removerFilho(state, 'criterios', 'criterioIds', payload.id);

    case Acao.ADICIONAR_ITEM_CHECKLIST:
      return adicionarFilho(state, 'checklist', 'checklistIds', criarItemChecklist, payload);
    case Acao.ATUALIZAR_ITEM_CHECKLIST: {
      const { id: _id, editalId: _e, ...mudancas } = payload.mudancas;
      const atual = state.checklist.porId[payload.id];
      if (!atual) return state;
      const validado = criarItemChecklist({ ...atual, ...mudancas });
      return { ...state, checklist: atualizar(state.checklist, payload.id, validado) };
    }
    case Acao.REMOVER_ITEM_CHECKLIST:
      return removerFilho(state, 'checklist', 'checklistIds', payload.id);

    case Acao.ADICIONAR_RISCO:
      return adicionarFilho(state, 'riscos', 'riscoIds', criarRisco, payload);
    case Acao.ATUALIZAR_RISCO: {
      const { id: _id, editalId: _e, ...mudancas } = payload.mudancas;
      const atual = state.riscos.porId[payload.id];
      if (!atual) return state;
      const validado = criarRisco({ ...atual, ...mudancas });
      return { ...state, riscos: atualizar(state.riscos, payload.id, validado) };
    }
    case Acao.REMOVER_RISCO:
      return removerFilho(state, 'riscos', 'riscoIds', payload.id);

    case Acao.ADICIONAR_USUARIO:
      return { ...state, usuarios: inserir(state.usuarios, criarUsuario(payload)) };
    case Acao.DEFINIR_USUARIO_ATUAL:
      if (!state.usuarios.porId[payload.id]) {
        return rejeitar(`usuário ${payload.id} não existe`, state);
      }
      return { ...state, usuarioAtualId: payload.id };

    default:
      return state;
  }
}
