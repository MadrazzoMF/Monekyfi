import { useContext, useMemo } from 'react';
import { AppStateContext, AppDispatchContext } from './AppContext.jsx';
import { listarEditais, obterEditalCompleto, listarUsuarios } from './seletores.js';

export function useAppState() {
  const ctx = useContext(AppStateContext);
  if (ctx === null) throw new Error('useAppState precisa estar dentro de <AppProvider>');
  return ctx;
}

export function useAppDispatch() {
  const ctx = useContext(AppDispatchContext);
  if (ctx === null) throw new Error('useAppDispatch precisa estar dentro de <AppProvider>');
  return ctx;
}

const hojeIso = () => new Date().toISOString().slice(0, 10);

export function useEditais() {
  const state = useAppState();
  return useMemo(() => listarEditais(state, hojeIso()), [state]);
}

export function useEdital(id) {
  const state = useAppState();
  return useMemo(() => obterEditalCompleto(state, id, hojeIso()), [state, id]);
}

export function useUsuarios() {
  const state = useAppState();
  return useMemo(() => listarUsuarios(state), [state]);
}

export function useUsuarioAtual() {
  const state = useAppState();
  return state.usuarioAtualId ? state.usuarios.porId[state.usuarioAtualId] ?? null : null;
}
