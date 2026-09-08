import { resumirEditais } from '../lib/filtros.js';
import { formatarMoeda } from '../lib/formatos.js';

export function ResumoEditais({ editais }) {
  const r = resumirEditais(editais);
  const itens = [
    ['Total', r.total],
    ['GO', r.porRecomendacao.go],
    ['Condicional', r.porRecomendacao.condicional],
    ['NO-GO', r.porRecomendacao.no_go],
    ['Indefinido', r.porRecomendacao.indefinido],
    ['Vencem em 7 dias', r.vencendo7],
    ['Vencidos', r.vencidos],
    ['Valor somado', formatarMoeda(r.valorTotal)],
  ];
  return (
    <dl className="grid grid-cols-2 gap-4 md:grid-cols-4" aria-label="Resumo dos editais">
      {itens.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}
