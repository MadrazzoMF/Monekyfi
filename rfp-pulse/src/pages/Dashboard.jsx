import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, useEditais, useUsuarios } from '../state/hooks.js';
import { aplicarFiltros, FILTROS_PADRAO } from '../lib/filtros.js';
import { ResumoEditais } from '../components/ResumoEditais.jsx';
import { FiltrosEditais } from '../components/FiltrosEditais.jsx';
import { TabelaEditais } from '../components/TabelaEditais.jsx';

const CHAVE_FILTROS = 'rfp-pulse:filtros';

function lerFiltros() {
  try {
    const salvo = globalThis.localStorage?.getItem(CHAVE_FILTROS);
    return salvo ? { ...FILTROS_PADRAO, ...JSON.parse(salvo) } : { ...FILTROS_PADRAO };
  } catch {
    return { ...FILTROS_PADRAO };
  }
}

export function Dashboard() {
  const state = useAppState();
  const editais = useEditais();
  const usuarios = useUsuarios();
  const [filtros, setFiltros] = useState(lerFiltros);

  const atualizarFiltros = (novos) => {
    setFiltros(novos);
    try {
      globalThis.localStorage?.setItem(CHAVE_FILTROS, JSON.stringify(novos));
    } catch {
      /* ignora */
    }
  };

  const visiveis = useMemo(() => aplicarFiltros(editais, filtros), [editais, filtros]);

  return (
    <section className="flex flex-col gap-4">
      <header className="flex gap-4">
        <h2>Editais</h2>
        <Link to="/novo">+ Importar edital</Link>
      </header>

      <ResumoEditais editais={editais} />

      <FiltrosEditais filtros={filtros} onChange={atualizarFiltros} usuarios={usuarios} />

      <p aria-live="polite">
        {visiveis.length} de {editais.length} editais
      </p>

      <TabelaEditais
        editais={visiveis}
        ordenarPor={filtros.ordenarPor}
        direcao={filtros.direcao}
        onOrdenar={(ordenarPor, direcao) => atualizarFiltros({ ...filtros, ordenarPor, direcao })}
        usuariosPorId={state.usuarios.porId}
      />
    </section>
  );
}
