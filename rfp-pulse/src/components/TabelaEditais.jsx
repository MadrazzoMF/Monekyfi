import { Link } from 'react-router-dom';
import { formatarMoeda, formatarData, rotulo } from '../lib/formatos.js';
import { BadgeRecomendacao, BadgeStatus, BadgeOutline } from './ui/Badge.jsx';
import { Score } from './ui/Score.jsx';
import { Prazo } from './ui/Prazo.jsx';
import { Vazio } from './ui/Vazio.jsx';

const COLUNAS = [
  { chave: 'titulo', titulo: 'Edital' },
  { chave: 'status', titulo: 'Status' },
  { chave: 'valorEstimado', titulo: 'Valor estimado', alinhar: 'text-right' },
  { chave: 'diasRestantes', titulo: 'Prazo' },
  { chave: 'scoreAderencia', titulo: 'Score' },
  { chave: 'recomendacao', titulo: 'Recomendação' },
  { chave: 'responsavel', titulo: 'Responsável', ordenavel: false },
];

export function TabelaEditais({ editais, ordenarPor, direcao, onOrdenar, usuariosPorId, onLimpar }) {
  const alternar = (chave) => {
    if (ordenarPor === chave) onOrdenar(chave, direcao === 'asc' ? 'desc' : 'asc');
    else onOrdenar(chave, 'asc');
  };

  if (editais.length === 0) {
    return (
      <Vazio
        titulo="Nenhum edital encontrado"
        descricao="Ajuste os filtros ou importe um novo edital."
        acao={
          <div className="flex gap-2">
            {onLimpar ? <button type="button" className="btn-secondary" onClick={onLimpar}>Limpar filtros</button> : null}
            <Link to="/novo" className="btn-primary">Importar edital</Link>
          </div>
        }
      />
    );
  }

  return (
    <div className="card !p-0 overflow-x-auto">
      <table className="tabela">
        <thead>
          <tr>
            {COLUNAS.map((c) => (
              <th
                key={c.chave}
                scope="col"
                className={c.alinhar}
                aria-sort={ordenarPor === c.chave ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {c.ordenavel === false ? (
                  c.titulo
                ) : (
                  <button type="button" onClick={() => alternar(c.chave)}>
                    {c.titulo}
                    <span aria-hidden="true" className={ordenarPor === c.chave ? 'text-brand-600' : 'text-ink-faint'}>
                      {ordenarPor === c.chave ? (direcao === 'asc' ? '↑' : '↓') : '↕'}
                    </span>
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {editais.map((e) => (
            <tr key={e.id}>
              <td className="min-w-[18rem]">
                <Link to={`/edital/${e.id}`} className="font-medium text-ink hover:text-brand-700 no-underline hover:underline">
                  {e.titulo}
                </Link>
                <div className="mt-0.5 text-xs text-ink-muted">
                  {e.orgao}
                  {e.numeroProcesso ? <span> · {e.numeroProcesso}</span> : null}
                </div>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  <BadgeOutline>{rotulo('modalidade', e.modalidade)}</BadgeOutline>
                  {e.tags.slice(0, 3).map((t) => (
                    <BadgeOutline key={t}>#{t}</BadgeOutline>
                  ))}
                </div>
              </td>
              <td><BadgeStatus valor={e.status} /></td>
              <td className="text-right tabular-nums whitespace-nowrap">{formatarMoeda(e.valorEstimado)}</td>
              <td className="whitespace-nowrap">
                <Prazo dias={e.diasRestantes} />
                <div className="text-xs text-ink-faint">{formatarData(e.dataLimiteEnvio)}</div>
              </td>
              <td><Score valor={e.scoreAderencia} compacto /></td>
              <td><BadgeRecomendacao valor={e.recomendacao} /></td>
              <td className="whitespace-nowrap text-ink-muted">{e.responsavelId ? usuariosPorId[e.responsavelId]?.nome ?? '—' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
