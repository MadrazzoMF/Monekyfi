// Acesso ao domínio pelo console do navegador, sem interface.
// Uso: window.rfp.dispatch(rfp.acoes.transicionarStatus('ed_...', 'em_analise'))
//      window.rfp.editais()           -> lista com score/recomendação/dias derivados
//      window.rfp.edital('ed_...')    -> edital completo
//
// Nesta fase o store vive no useReducer do Provider, então o console opera
// sobre uma cópia própria que sincroniza com o localStorage. Recarregue a
// página depois de despachar para a UI refletir o novo estado.

import { reducer } from '../state/reducer.js';
import { acoes } from '../state/acoes.js';
import * as seletores from '../state/seletores.js';
import { carregarEstado, salvarEstado, limparEstado } from '../state/persistencia.js';
import { criarSeed } from '../domain/seed/editais.seed.js';
import * as enums from '../domain/enums.js';
import { TRANSICOES, podeTransicionar } from '../domain/maquinaEstados.js';
import * as lib from './derivados.js';

export function instalarConsole(alvo = globalThis) {
  const getState = () => carregarEstado() ?? criarSeed();
  const dispatch = (action) => {
    const antes = getState();
    const depois = reducer(antes, action);
    if (depois === antes) {
      console.warn('[rfp] estado não mudou (ação rejeitada ou sem efeito)');
      return antes;
    }
    salvarEstado(depois);
    console.info('[rfp] ok:', action.type, '— recarregue a página para ver na UI');
    return depois;
  };

  alvo.rfp = {
    getState,
    dispatch,
    acoes,
    seletores,
    enums,
    TRANSICOES,
    podeTransicionar,
    lib,
    editais: (hoje) => seletores.listarEditais(getState(), hoje),
    edital: (id, hoje) => seletores.obterEditalCompleto(getState(), id, hoje),
    resetarSeed: () => {
      limparEstado();
      salvarEstado(criarSeed());
      console.info('[rfp] seed recarregado — recarregue a página');
    },
  };
  console.info('[rfp-pulse] window.rfp disponível. Tente rfp.editais()');
}
