import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppState, useEditais, useUsuarios } from '../state/hooks.js';
import { aplicarFiltros, FILTROS_PADRAO } from '../lib/filtros.js';
import { ResumoEditais } from '../components/ResumoEditais.jsx';
import { FiltrosEditais } from '../components/FiltrosEditais.jsx';
import { TabelaEditais } from '../components/TabelaEditais.jsx';
import { Vazio } from '../components/ui/Vazio.jsx';

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
  const limpar = () => atualizarFiltros({ ...FILTROS_PADRAO, ordenarPor: filtros.ordenarPor, direcao: filtros.direcao });

  const visiveis = useMemo(() => aplicarFiltros(editais, filtros), [editais, filtros]);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2>Editais</h2>
          <p className="text-sm text-ink-muted">Triagem, prazos e recomendação go/no-go em um só lugar.</p>
        </div>
        <Link to="/novo" className="btn-primary">+ Importar edital</Link>
      </header>

      {editais.length === 0 ? (
        <Vazio
          titulo="Nenhum edital importado ainda"
          descricao="Cole o texto de um edital ou RFP e deixe o motor de análise sugerir critérios, riscos e checklist."
          acao={<Link to="/novo" className="btn-primary">Importar o primeiro edital</Link>}
        />
      ) : (
        <>
          <ResumoEditais editais={editais} />
          <FiltrosEditais filtros={filtros} onChange={atualizarFiltros} usuarios={usuarios} />
          <p className="text-xs text-ink-muted" aria-live="polite">
            Mostrando {visiveis.length} de {editais.length} editais
          </p>
          <TabelaEditais
            editais={visiveis}
            ordenarPor={filtros.ordenarPor}
            direcao={filtros.direcao}
            onOrdenar={(ordenarPor, direcao) => atualizarFiltros({ ...filtros, ordenarPor, direcao })}
            usuariosPorId={state.usuarios.porId}
            onLimpar={limpar}
          />
        </>
      )}
    </section>
  );
}
