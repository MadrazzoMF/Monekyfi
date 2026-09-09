import { Link, useNavigate } from 'react-router-dom';
import { formatarMoeda, formatarData, rotulo } from '../lib/formatos.js';
import { BadgeRecomendacao, BadgeStatus, BadgeOutline } from './ui/Badge.jsx';
import { BarraScore } from './ui/AnelScore.jsx';
import { Prazo } from './ui/Prazo.jsx';
import { Vazio } from './ui/Vazio.jsx';
import { Icone } from './ui/Icone.jsx';

const COLUNAS = [
  { chave: 'titulo', titulo: 'Edital' },
  { chave: 'status', titulo: 'Status' },
  { chave: 'valorEstimado', titulo: 'Valor', alinhar: 'text-right' },
  { chave: 'diasRestantes', titulo: 'Prazo' },
  { chave: 'scoreAderencia', titulo: 'Score' },
  { chave: 'recomendacao', titulo: 'Recomendação' },
  { chave: 'responsavel', titulo: 'Responsável', ordenavel: false },
];

function Iniciais({ nome }) {
  if (!nome) return <span className="text-ink-faint">—</span>;
  const ini = nome.split(' ').map((p) => p[0]).slice(0, 2).join('');
  return (
    <span className="inline-flex items-center gap-2 text-ink-muted">
      <span className="grid h-6 w-6 place-items-center rounded-full bg-raised border border-line text-[10px] font-semibold text-ink">{ini}</span>
      <span className="hidden 2xl:inline">{nome.split(' ')[0]}</span>
    </span>
  );
}

export function TabelaEditais({ editais, ordenarPor, direcao, onOrdenar, usuariosPorId, onLimpar }) {
  const navigate = useNavigate();
  const alternar = (chave) => {
    if (ordenarPor === chave) onOrdenar(chave, direcao === 'asc' ? 'desc' : 'asc');
    else onOrdenar(chave, 'asc');
  };

  if (editais.length === 0) {
    return (
      <Vazio
        icone="busca"
        titulo="Nenhum edital com esses filtros"
        descricao="Tente ampliar a busca ou limpar os filtros."
        acao={
          <div className="flex gap-2">
            {onLimpar ? <button type="button" className="btn-secondary" onClick={onLimpar}>Limpar filtros</button> : null}
            <Link to="/novo" className="btn-primary"><Icone nome="importar" /> Importar edital</Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="tabela">
          <thead>
            <tr>
              {COLUNAS.map((c) => (
                <th key={c.chave} scope="col" className={c.alinhar} aria-sort={ordenarPor === c.chave ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  {c.ordenavel === false ? c.titulo : (
                    <button type="button" onClick={() => alternar(c.chave)}>
                      {c.titulo}
                      <Icone nome={ordenarPor === c.chave ? (direcao === 'asc' ? 'seta_cima' : 'seta_baixo') : 'ordenar'} tamanho={12} className={ordenarPor === c.chave ? 'text-accent' : 'opacity-50'} />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {editais.map((e, idx) => (
              <tr
                key={e.id}
                onClick={() => navigate(`/edital/${e.id}`)}
                className="animate-entrar"
                style={{ animationDelay: `${Math.min(idx, 12) * 20}ms` }}
              >
                <td className="min-w-[16rem] max-w-[26rem]">
                  <Link to={`/edital/${e.id}`} className="font-medium text-ink no-underline hover:text-accent" onClick={(ev) => ev.stopPropagation()}>
                    {e.titulo}
                  </Link>
                  <div className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
                    <Icone nome="predio" tamanho={12} className="text-ink-faint" />
                    <span className="truncate">{e.orgao}</span>
                    {e.numeroProcesso ? <span className="text-ink-faint">· {e.numeroProcesso}</span> : null}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    <BadgeOutline>{rotulo('modalidade', e.modalidade)}</BadgeOutline>
                    {e.tags.slice(0, 3).map((t) => <BadgeOutline key={t}>#{t}</BadgeOutline>)}
                  </div>
                </td>
                <td><BadgeStatus valor={e.status} /></td>
                <td className="text-right tabular-nums whitespace-nowrap text-ink">{formatarMoeda(e.valorEstimado)}</td>
                <td className="whitespace-nowrap">
                  <Prazo dias={e.diasRestantes} />
                  <div className="text-[11px] text-ink-faint">{formatarData(e.dataLimiteEnvio)}</div>
                </td>
                <td><BarraScore valor={e.scoreAderencia} largura="w-20" /></td>
                <td><BadgeRecomendacao valor={e.recomendacao} /></td>
                <td className="whitespace-nowrap"><Iniciais nome={e.responsavelId ? usuariosPorId[e.responsavelId]?.nome : null} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
