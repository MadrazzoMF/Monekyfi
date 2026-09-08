import { StatusEdital, Modalidade, Recomendacao } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { FILTROS_PADRAO } from '../lib/filtros.js';

function Chips({ legenda, grupoRotulo, valores, selecionados, onChange }) {
  const alternar = (v) =>
    onChange(selecionados.includes(v) ? selecionados.filter((x) => x !== v) : [...selecionados, v]);
  return (
    <fieldset className="flex flex-col gap-1.5">
      <legend className="label">{legenda}</legend>
      <div className="flex flex-wrap gap-1.5">
        {valores.map((v) => {
          const on = selecionados.includes(v);
          return (
            <label
              key={v}
              className={`cursor-pointer rounded-full border px-2.5 py-1 text-xs font-medium transition-colors select-none ${
                on ? 'bg-brand-600 border-brand-600 text-white' : 'border-line text-ink-muted hover:border-brand-300 hover:text-ink'
              }`}
            >
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
  const ativos =
    filtros.busca ||
    filtros.status.length ||
    filtros.modalidade.length ||
    filtros.recomendacao.length ||
    filtros.responsavelId ||
    filtros.apenasComPrazo;

  return (
    <form className="card flex flex-col gap-4" role="search" aria-label="Filtros" onSubmit={(e) => e.preventDefault()}>
      <div className="flex flex-col md:flex-row gap-3 md:items-end">
        <label className="field flex-1">
          <span className="label">Buscar</span>
          <input
            type="search"
            className="input"
            placeholder="título, órgão, processo, tag"
            value={filtros.busca}
            onChange={(e) => set({ busca: e.target.value })}
          />
        </label>
        <label className="field md:w-56">
          <span className="label">Responsável</span>
          <select className="select" value={filtros.responsavelId} onChange={(e) => set({ responsavelId: e.target.value })}>
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2 text-sm py-2">
          <input type="checkbox" className="checkbox" checked={filtros.apenasComPrazo} onChange={(e) => set({ apenasComPrazo: e.target.checked })} />
          Só prazo aberto
        </label>
        {ativos ? (
          <button
            type="button"
            className="btn-ghost"
            onClick={() => onChange({ ...FILTROS_PADRAO, ordenarPor: filtros.ordenarPor, direcao: filtros.direcao })}
          >
            Limpar filtros
          </button>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Chips legenda="Status" grupoRotulo="status" valores={StatusEdital.valores} selecionados={filtros.status} onChange={(status) => set({ status })} />
        <Chips legenda="Modalidade" grupoRotulo="modalidade" valores={Modalidade.valores} selecionados={filtros.modalidade} onChange={(modalidade) => set({ modalidade })} />
        <Chips legenda="Recomendação" grupoRotulo="recomendacao" valores={Recomendacao.valores} selecionados={filtros.recomendacao} onChange={(recomendacao) => set({ recomendacao })} />
      </div>
    </form>
  );
}
