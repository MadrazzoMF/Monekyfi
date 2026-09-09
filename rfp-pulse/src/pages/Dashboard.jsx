import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch, useAppState, useEditais, useUsuarios } from '../state/hooks.js';
import { acoes } from '../state/acoes.js';
import { aplicarFiltros, FILTROS_PADRAO } from '../lib/filtros.js';
import { ResumoEditais } from '../components/ResumoEditais.jsx';
import { FiltrosEditais } from '../components/FiltrosEditais.jsx';
import { TabelaEditais } from '../components/TabelaEditais.jsx';
import { Vazio } from '../components/ui/Vazio.jsx';
import { Icone } from '../components/ui/Icone.jsx';
import { useToast } from '../components/ui/Toast.jsx';

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
  const dispatch = useAppDispatch();
  const toast = useToast();
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
  const filtrarPorKpi = (parcial) => {
    const chave = Object.keys(parcial)[0];
    const igual = JSON.stringify(filtros[chave]) === JSON.stringify(parcial[chave]);
    atualizarFiltros({ ...filtros, [chave]: igual ? FILTROS_PADRAO[chave] : parcial[chave] });
  };

  const visiveis = useMemo(() => aplicarFiltros(editais, filtros), [editais, filtros]);

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2>Editais</h2>
          <p className="mt-1 text-sm text-ink-muted">Triagem, prazos e recomendação go/no-go em um só lugar.</p>
        </div>
        <Link to="/novo" className="btn-primary"><Icone nome="importar" /> Importar edital</Link>
      </header>

      {editais.length === 0 ? (
        <Vazio
          icone="faisca"
          titulo="Nenhum edital importado ainda"
          descricao="Cole o texto de um edital ou RFP e deixe o motor de análise sugerir critérios, riscos e checklist."
          acao={
            <div className="flex flex-wrap justify-center gap-2">
              <Link to="/novo" className="btn-primary"><Icone nome="importar" /> Importar o primeiro edital</Link>
              <button type="button" className="btn-secondary" onClick={() => { dispatch(acoes.resetarParaSeed()); toast.ok('10 editais de exemplo carregados'); }}>
                <Icone nome="exemplo" /> Carregar 10 exemplos
              </button>
            </div>
          }
        />
      ) : (
        <>
          <ResumoEditais editais={editais} onFiltrar={filtrarPorKpi} />
          <FiltrosEditais filtros={filtros} onChange={atualizarFiltros} usuarios={usuarios} />
          <div className="flex items-center justify-between text-xs text-ink-muted" aria-live="polite">
            <span>Mostrando <strong className="text-ink">{visiveis.length}</strong> de {editais.length} editais</span>
            <span className="hidden md:inline">Clique em uma linha para abrir</span>
          </div>
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
