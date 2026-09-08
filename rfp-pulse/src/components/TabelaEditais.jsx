import { Link } from 'react-router-dom';
import { formatarMoeda, formatarDiasRestantes, rotulo } from '../lib/formatos.js';

const COLUNAS = [
  { chave: 'titulo', titulo: 'Edital' },
  { chave: 'orgao', titulo: 'Órgão' },
  { chave: 'modalidade', titulo: 'Modalidade', ordenavel: false },
  { chave: 'status', titulo: 'Status' },
  { chave: 'valorEstimado', titulo: 'Valor estimado' },
  { chave: 'diasRestantes', titulo: 'Prazo' },
  { chave: 'scoreAderencia', titulo: 'Score' },
  { chave: 'recomendacao', titulo: 'Recomendação' },
  { chave: 'responsavel', titulo: 'Responsável', ordenavel: false },
];

export function TabelaEditais({ editais, ordenarPor, direcao, onOrdenar, usuariosPorId }) {
  const alternar = (chave) => {
    if (ordenarPor === chave) onOrdenar(chave, direcao === 'asc' ? 'desc' : 'asc');
    else onOrdenar(chave, 'asc');
  };

  if (editais.length === 0) {
    return <p>Nenhum edital encontrado com esses filtros.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table>
        <thead>
          <tr>
            {COLUNAS.map((c) => (
              <th
                key={c.chave}
                scope="col"
                aria-sort={ordenarPor === c.chave ? (direcao === 'asc' ? 'ascending' : 'descending') : 'none'}
              >
                {c.ordenavel === false ? (
                  c.titulo
                ) : (
                  <button type="button" onClick={() => alternar(c.chave)}>
                    {c.titulo}
                    {ordenarPor === c.chave ? (direcao === 'asc' ? ' ↑' : ' ↓') : ''}
                  </button>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {editais.map((e) => (
            <tr key={e.id}>
              <td>
                <Link to={`/edital/${e.id}`}>{e.titulo}</Link>
                {e.numeroProcesso ? <div>{e.numeroProcesso}</div> : null}
              </td>
              <td>{e.orgao}</td>
              <td>{rotulo('modalidade', e.modalidade)}</td>
              <td>{rotulo('status', e.status)}</td>
              <td>{formatarMoeda(e.valorEstimado)}</td>
              <td>{formatarDiasRestantes(e.diasRestantes)}</td>
              <td>{e.scoreAderencia}</td>
              <td>{rotulo('recomendacao', e.recomendacao)}</td>
              <td>{e.responsavelId ? usuariosPorId[e.responsavelId]?.nome ?? '—' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
