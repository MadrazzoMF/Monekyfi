import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Icone } from './Icone.jsx';

const ToastContext = createContext(null);

const ICONE = { ok: 'check', erro: 'alerta', info: 'info' };
const COR = { ok: 'text-go', erro: 'text-nogo', info: 'text-info' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const seq = useRef(0);

  const remover = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const notificar = useCallback(
    (mensagem, tipo = 'ok', duracao = 3200) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-3), { id, mensagem, tipo }]);
      if (duracao > 0) setTimeout(() => remover(id), duracao);
      return id;
    },
    [remover],
  );

  const api = useMemo(
    () => ({ notificar, ok: (m) => notificar(m, 'ok'), erro: (m) => notificar(m, 'erro', 5000), info: (m) => notificar(m, 'info') }),
    [notificar],
  );

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-[min(92vw,22rem)]" aria-live="polite" role="status">
        {toasts.map((t) => (
          <div key={t.id} className="toast">
            <Icone nome={ICONE[t.tipo]} className={COR[t.tipo]} />
            <span className="flex-1 text-ink">{t.mensagem}</span>
            <button type="button" className="btn-icon !p-1" onClick={() => remover(t.id)} aria-label="Fechar">
              <Icone nome="x" tamanho={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast precisa estar dentro de <ToastProvider>');
  return ctx;
}
