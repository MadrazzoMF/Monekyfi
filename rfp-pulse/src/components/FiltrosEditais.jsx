import { StatusEdital, Modalidade, Recomendacao } from '../domain/enums.js';
import { rotulo } from '../lib/formatos.js';
import { FILTROS_PADRAO } from '../lib/filtros.js';

function GrupoCheckbox({ legenda, grupoRotulo, valores, selecionados, onChange }) {
  const alternar = (v) =>
    onChange(selecionados.includes(v) ? selecionados.filter((x) => x !== v) : [...selecionados, v]);
  return (
    <fieldset className="flex flex-col gap-1">
      <legend>{legenda}</legend>
      <div className="flex flex-wrap gap-2">
        {valores.map((v) => (
          <label key={v} className="flex gap-1">
            <input type="checkbox" checked={selecionados.includes(v)} onChange={() => alternar(v)} />
            {rotulo(grupoRotulo, v)}
          </label>
        ))}
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
    <form
      className="flex flex-col gap-4"
      role="search"
      aria-label="Filtros"
      onSubmit={(e) => e.preventDefault()}
    >
      <label className="flex flex-col gap-1">
        Buscar
        <input
          type="search"
          placeholder="título, órgão, processo, tag"
          value={filtros.busca}
          onChange={(e) => set({ busca: e.target.value })}
        />
      </label>

      <GrupoCheckbox
        legenda="Status"
        grupoRotulo="status"
        valores={StatusEdital.valores}
        selecionados={filtros.status}
        onChange={(status) => set({ status })}
      />
      <GrupoCheckbox
        legenda="Modalidade"
        grupoRotulo="modalidade"
        valores={Modalidade.valores}
        selecionados={filtros.modalidade}
        onChange={(modalidade) => set({ modalidade })}
      />
      <GrupoCheckbox
        legenda="Recomendação"
        grupoRotulo="recomendacao"
        valores={Recomendacao.valores}
        selecionados={filtros.recomendacao}
        onChange={(recomendacao) => set({ recomendacao })}
      />

      <div className="flex flex-wrap gap-4">
        <label className="flex flex-col gap-1">
          Responsável
          <select
            value={filtros.responsavelId}
            onChange={(e) => set({ responsavelId: e.target.value })}
          >
            <option value="">Todos</option>
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.nome}
              </option>
            ))}
          </select>
        </label>
        <label className="flex gap-1 items-end">
          <input
            type="checkbox"
            checked={filtros.apenasComPrazo}
            onChange={(e) => set({ apenasComPrazo: e.target.checked })}
          />
          Só com prazo aberto
        </label>
        {ativos ? (
          <button type="button" onClick={() => onChange({ ...FILTROS_PADRAO, ordenarPor: filtros.ordenarPor, direcao: filtros.direcao })}>
            Limpar filtros
          </button>
        ) : null}
      </div>
    </form>
  );
}
