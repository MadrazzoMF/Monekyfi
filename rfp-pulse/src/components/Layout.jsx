import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAppDispatch, useUsuarioAtual, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { rotulo } from '../lib/formatos.js';
import { lerTema, aplicarTema } from '../lib/tema.js';
import { Icone } from './ui/Icone.jsx';

const NAV = [
  { para: '/', rotulo: 'Dashboard', icone: 'painel', fim: true },
  { para: '/novo', rotulo: 'Importar edital', icone: 'importar' },
];

function Marca() {
  return (
    <NavLink to="/" className="flex items-center gap-2.5 no-underline text-ink hover:text-ink">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-gradient-to-br from-accent to-accent-strong text-white shadow-glow">
        <Icone nome="faisca" tamanho={16} strokeWidth={2} />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-[15px] font-semibold tracking-tight">RFP-Pulse</span>
        <span className="text-[10px] uppercase tracking-[0.14em] text-ink-faint">triagem de editais</span>
      </span>
    </NavLink>
  );
}

function SeletorUsuario({ compacto = false }) {
  const usuarios = useUsuarios();
  const usuario = useUsuarioAtual();
  const dispatch = useAppDispatch();
  return (
    <label className={`flex items-center gap-2 ${compacto ? '' : 'rounded-lg border border-line bg-raised/60 p-2'}`}>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent/15 text-accent text-xs font-semibold">
        {usuario ? usuario.nome.split(' ').map((p) => p[0]).slice(0, 2).join('') : <Icone nome="usuario" tamanho={14} />}
      </span>
      <select
        className="select select-sm !bg-transparent !border-0 !pl-0 !shadow-none w-full"
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
  );
}

function BotaoTema({ tema, onToggle }) {
  return (
    <button type="button" className="btn-icon" onClick={onToggle} aria-label={tema === 'dark' ? 'Mudar para tema claro' : 'Mudar para tema escuro'} title="Alternar tema">
      <Icone nome={tema === 'dark' ? 'sol' : 'lua'} />
    </button>
  );
}

export function Layout() {
  const [tema, setTema] = useState(lerTema);
  const navigate = useNavigate();

  useEffect(() => aplicarTema(tema), [tema]);

  // atalhos: "/" foca a busca, "n" abre importação
  useEffect(() => {
    const onKey = (e) => {
      const alvo = e.target;
      const digitando = alvo && (alvo.tagName === 'INPUT' || alvo.tagName === 'TEXTAREA' || alvo.tagName === 'SELECT' || alvo.isContentEditable);
      if (digitando) return;
      if (e.key === '/') {
        const busca = document.querySelector('input[type="search"]');
        if (busca) {
          e.preventDefault();
          busca.focus();
        }
      } else if (e.key === 'n' && !e.metaKey && !e.ctrlKey) {
        navigate('/novo');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[232px_minmax(0,1fr)]">
      {/* sidebar (desktop) */}
      <aside className="hidden lg:flex sticky top-0 h-screen flex-col gap-6 border-r border-line bg-surface/80 px-4 py-5">
        <Marca />
        <nav aria-label="Principal" className="flex flex-col gap-1">
          {NAV.map((n) => (
            <NavLink key={n.para} to={n.para} end={n.fim} className="nav-item">
              <Icone nome={n.icone} />
              {n.rotulo}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3">
          <div className="rounded-lg border border-line bg-raised/40 p-3 text-[11px] leading-relaxed text-ink-faint">
            <div className="mb-1 font-medium text-ink-muted">Atalhos</div>
            <div className="flex items-center gap-2"><span className="kbd">/</span> buscar</div>
            <div className="flex items-center gap-2"><span className="kbd">n</span> novo edital</div>
          </div>
          <SeletorUsuario />
          <div className="flex items-center justify-between text-[11px] text-ink-faint">
            <span>dados locais</span>
            <BotaoTema tema={tema} onToggle={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))} />
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        {/* topo (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-surface/85 px-4 backdrop-blur">
          <Marca />
          <nav aria-label="Principal" className="ml-auto flex items-center gap-1">
            {NAV.map((n) => (
              <NavLink key={n.para} to={n.para} end={n.fim} className="nav-item !px-2.5" aria-label={n.rotulo}>
                <Icone nome={n.icone} />
              </NavLink>
            ))}
            <BotaoTema tema={tema} onToggle={() => setTema((t) => (t === 'dark' ? 'light' : 'dark'))} />
          </nav>
        </header>
        <div className="lg:hidden border-b border-line bg-surface/60 px-4 py-2">
          <SeletorUsuario compacto />
        </div>

        <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
