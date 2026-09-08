import { NavLink, Outlet } from 'react-router-dom';
import { useAppDispatch, useUsuarioAtual, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { rotulo } from '../lib/formatos.js';

const linkClasse = ({ isActive }) =>
  `no-underline rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-600 text-white hover:text-white' : 'text-ink-muted hover:text-ink hover:bg-surface-sunken'
  }`;

export function Layout() {
  const usuarios = useUsuarios();
  const usuario = useUsuarioAtual();
  const dispatch = useAppDispatch();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-10 border-b border-line bg-surface-raised/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 md:px-6 h-14 flex items-center gap-6">
          <NavLink to="/" className="no-underline hover:no-underline flex items-center gap-2 text-ink">
            <span className="inline-grid place-items-center h-8 w-8 rounded-lg bg-brand-600 text-white font-bold text-sm">RP</span>
            <h1 className="text-base">RFP-Pulse</h1>
          </NavLink>
          <nav aria-label="Principal" className="flex-1">
            <ul className="flex gap-1">
              <li><NavLink to="/" end className={linkClasse}>Dashboard</NavLink></li>
              <li><NavLink to="/novo" className={linkClasse}>Importar edital</NavLink></li>
            </ul>
          </nav>
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="hidden sm:inline">Usuário</span>
            <select
              className="select !w-auto !py-1 text-xs"
              value={usuario?.id ?? ''}
              onChange={(e) => e.target.value && dispatch(acoes.definirUsuarioAtual(e.target.value))}
              aria-label="Usuário atual"
            >
              {!usuario ? <option value="">selecione</option> : null}
              {usuarios.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} · {rotulo('papel', u.papel)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </header>
      <main className="mx-auto w-full max-w-7xl px-4 md:px-6 py-6 flex-1">
        <Outlet />
      </main>
      <footer className="border-t border-line py-4 text-center text-xs text-ink-faint">
        RFP-Pulse · triagem de editais · dados salvos localmente neste navegador
      </footer>
    </div>
  );
}
