import { useContext } from 'react';
import { AppStateContext, AppDispatchContext } from './AppContext.jsx';

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
