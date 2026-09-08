import { createContext, useEffect, useReducer, useRef } from 'react';
import { reducer } from './reducer.js';
import { carregarEstado, salvarEstado } from './persistencia.js';
import { criarSeed } from '../domain/seed/editais.seed.js';
import { criarEstadoLimpo } from './estadoInicial.js';
import { instalarConsole } from '../lib/console.js';

export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

// VITE_SEM_SEED=true gera um build que começa vazio (sem editais de exemplo).
const SEM_SEED = import.meta.env?.VITE_SEM_SEED === 'true';

function inicializar() {
  return carregarEstado() ?? (SEM_SEED ? criarEstadoLimpo() : criarSeed());
}

export function AppProvider({ children, estadoInicial }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial, (e) => e ?? inicializar());
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    salvarEstado(state);
  }, [state]);

  useEffect(() => {
    if (import.meta.env?.DEV) {
      instalarConsole({ getState: () => stateRef.current, dispatch });
    }
  }, [dispatch]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
