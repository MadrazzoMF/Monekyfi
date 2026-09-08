import { createContext, useEffect, useReducer } from 'react';
import { reducer } from './reducer.js';
import { carregarEstado, salvarEstado } from './persistencia.js';
import { criarSeed } from '../domain/seed/editais.seed.js';

export const AppStateContext = createContext(null);
export const AppDispatchContext = createContext(null);

function inicializar() {
  return carregarEstado() ?? criarSeed();
}

export function AppProvider({ children, estadoInicial }) {
  const [state, dispatch] = useReducer(reducer, estadoInicial, (e) => e ?? inicializar());

  useEffect(() => {
    salvarEstado(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={state}>
      <AppDispatchContext.Provider value={dispatch}>{children}</AppDispatchContext.Provider>
    </AppStateContext.Provider>
  );
}
