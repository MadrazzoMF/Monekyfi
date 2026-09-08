// Persistência em localStorage com versionamento de schema.
// Para evoluir o schema: incremente SCHEMA_VERSION e adicione uma migração
// em MIGRACOES[versaoAntiga] que transforma o estado para versaoAntiga + 1.

import { criarEstadoInicial, COLECOES } from './estadoInicial.js';

export const SCHEMA_VERSION = 1;
export const CHAVE_STORAGE = 'rfp-pulse:estado';

/**
 * Migrações sequenciais. Chave = versão de origem, valor = fn(state) -> state na versão seguinte.
 * Ex.: { 1: (s) => ({ ...s, novaColecao: colecaoVazia() }) }
 */
export const MIGRACOES = Object.freeze({});

export function migrar(envelope) {
  let { schemaVersion, state } = envelope;
  if (!Number.isInteger(schemaVersion) || schemaVersion > SCHEMA_VERSION) {
    throw new Error(`schemaVersion desconhecida: ${schemaVersion}`);
  }
  while (schemaVersion < SCHEMA_VERSION) {
    const fn = MIGRACOES[schemaVersion];
    if (!fn) throw new Error(`Sem migração da versão ${schemaVersion}`);
    state = fn(state);
    schemaVersion += 1;
  }
  return state;
}

function estadoValido(state) {
  if (!state || typeof state !== 'object') return false;
  return COLECOES.every(
    (c) => state[c] && typeof state[c].porId === 'object' && Array.isArray(state[c].ids),
  );
}

/** Garante que coleções ausentes existam (tolerante a schema parcialmente novo). */
function preencherAusentes(state) {
  const base = criarEstadoInicial();
  return { ...base, ...state };
}

export function serializar(state) {
  return JSON.stringify({ schemaVersion: SCHEMA_VERSION, state });
}

/** Retorna o estado migrado, ou null se não houver nada válido gravado. */
export function desserializar(texto) {
  if (!texto) return null;
  try {
    const envelope = JSON.parse(texto);
    if (!envelope || typeof envelope !== 'object' || !('schemaVersion' in envelope)) return null;
    const state = migrar(envelope);
    if (!estadoValido(state)) return null;
    return preencherAusentes(state);
  } catch (erro) {
    if (typeof console !== 'undefined') {
      console.warn('[rfp-pulse] estado gravado descartado:', erro.message);
    }
    return null;
  }
}

function storageDisponivel(storage) {
  return storage && typeof storage.getItem === 'function';
}

export function carregarEstado(storage = globalThis.localStorage) {
  if (!storageDisponivel(storage)) return null;
  return desserializar(storage.getItem(CHAVE_STORAGE));
}

export function salvarEstado(state, storage = globalThis.localStorage) {
  if (!storageDisponivel(storage)) return false;
  try {
    storage.setItem(CHAVE_STORAGE, serializar(state));
    return true;
  } catch {
    return false;
  }
}

export function limparEstado(storage = globalThis.localStorage) {
  if (!storageDisponivel(storage)) return;
  storage.removeItem(CHAVE_STORAGE);
}
