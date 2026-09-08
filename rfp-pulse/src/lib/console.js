// Acesso ao domínio pelo console do navegador, ligado ao store real do Provider.
// Uso: rfp.editais()                       -> lista derivada
//      rfp.edital('ed_02')                 -> edital completo
//      rfp.dispatch(rfp.acoes.transicionarStatus('ed_04', 'em_analise'))
//      rfp.resetarSeed()

import { acoes } from '../state/acoes.js';
import * as seletores from '../state/seletores.js';
import * as enums from '../domain/enums.js';
import { TRANSICOES, podeTransicionar } from '../domain/maquinaEstados.js';
import * as derivados from './derivados.js';
import * as score from './score.js';
import * as recomendacao from './recomendacao.js';
import * as datas from './datas.js';

export function instalarConsole({ getState, dispatch }, alvo = globalThis) {
  alvo.rfp = {
    getState,
    dispatch,
    acoes,
    seletores,
    enums,
    TRANSICOES,
    podeTransicionar,
    lib: { ...derivados, ...score, ...recomendacao, ...datas },
    editais: (hoje) => seletores.listarEditais(getState(), hoje),
    edital: (id, hoje) => seletores.obterEditalCompleto(getState(), id, hoje),
    resetarSeed: () => dispatch(acoes.resetarParaSeed()),
  };
  if (!alvo.__rfpAvisado) {
    alvo.__rfpAvisado = true;
    console.info('[rfp-pulse] window.rfp disponível. Tente rfp.editais()');
  }
}
