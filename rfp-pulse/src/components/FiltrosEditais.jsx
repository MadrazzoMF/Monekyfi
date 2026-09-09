import { useState } from 'react';
import { StatusEdital, Modalidade, Recomendacao } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { FILTROS_PADRAO } from '../lib/filtros.js';
import { Icone } from './ui/Icone.jsx';

function Chips({ legenda, grupoRotulo, valores, selecionados, onChange }) {
  const alternar = (v) => onChange(selecionados.includes(v) ? selecionados.filter((x) => x !== v) : [...selecionados, v]);
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="label mb-2">{legenda}</legend>
      <div className="flex flex-wrap gap-1.5">
        {valores.map((v) => {
          const on = selecionados.includes(v);
          return (
            <label key={v} className="chip" data-on={on ? 'true' : 'false'}>
              <input type="checkbox" className="sr-only" checked={on} onChange={() => alternar(v)} />
              {rotulo(grupoRotulo, v)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}

export function FiltrosEditais({ filtros, onChange, usuarios }) {
  const set = (parcial) => onChange({ ...filtros, ...parcial });
  const nAtivos = filtros.status.length + filtros.modalidade.length + filtros.recomendacao.length + (filtros.responsavelId ? 1 : 0) + (filtros.apenasComPrazo ? 1 : 0);
  const [aberto, setAberto] = useState(nAtivos > 0);
  const ativos = filtros.busca || nAtivos > 0;

  return (
    <form className="card flex flex-col" role="search" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col gap-3 p-3 md:flex-row md:items-center">
        <label className="relative flex-1">
          <Icone nome="busca" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            className="input !pl-9 !pr-12"
            placeholder="Buscar por título, órgão, processo ou tag"
            value={filtros.busca}
            onChange={(e) => set({ busca: e.target.value })}
            aria-label="Buscar"
          />
          <span className="kbd absolute right-3 top-1/2 -translate-y-1/2 hidden md:inline-flex">/</span>
        </label>
        <div className="flex items-center gap-2">
          <select className="select select-sm md:w-48" value={filtros.responsavelId} onChange={(e) => set({ responsavelId: e.target.value })} aria-label="Responsável">
            <option value="">Todos os responsáveis</option>
            {usuarios.map((u) => <option key={u.id} value={u.id}>{u.nome}</option>)}
          </select>
          <label className="chip flex items-center gap-1.5" data-on={filtros.apenasComPrazo ? 'true' : 'false'}>
            <input type="checkbox" className="sr-only" checked={filtros.apenasComPrazo} onChange={(e) => set({ apenasComPrazo: e.target.checked })} />
            <Icone nome="relogio" tamanho={13} /> Prazo aberto
          </label>
          <button type="button" className={`btn-secondary btn-sm ${aberto ? '!border-accent/50' : ''}`} onClick={() => setAberto((a) => !a)} aria-expanded={aberto}>
            <Icone nome="filtro" tamanho={14} /> Filtros{nAtivos ? <span className="badge-accent !px-1.5 !py-0">{nAtivos}</span> : null}
          </button>
          {ativos ? (
            <button type="button" className="btn-ghost btn-sm" onClick={() => onChange({ ...FILTROS_PADRAO, ordenarPor: filtros.ordenarPor, direcao: filtros.direcao })}>
              <Icone nome="x" tamanho={14} /> Limpar
            </button>
          ) : null}
        </div>
      </div>
      {aberto ? (
        <div className="divider grid gap-5 p-4 md:grid-cols-3 animate-entrar">
          <Chips legenda="Status" grupoRotulo="status" valores={StatusEdital.valores} selecionados={filtros.status} onChange={(status) => set({ status })} />
          <Chips legenda="Modalidade" grupoRotulo="modalidade" valores={Modalidade.valores} selecionados={filtros.modalidade} onChange={(modalidade) => set({ modalidade })} />
          <Chips legenda="Recomendação" grupoRotulo="recomendacao" valores={Recomendacao.valores} selecionados={filtros.recomendacao} onChange={(recomendacao) => set({ recomendacao })} />
        </div>
      ) : null}
    </form>
  );
}
