import { resumirEditais } from '../lib/filtros.js';
import { formatarMoeda } from '../lib/formatos.js';

export function ResumoEditais({ editais }) {
  const r = resumirEditais(editais);
  const itens = [
    { k: 'Editais', v: r.total },
    { k: 'GO', v: r.porRecomendacao.go, cor: 'text-go' },
    { k: 'Condicional', v: r.porRecomendacao.condicional, cor: 'text-cond' },
    { k: 'NO-GO', v: r.porRecomendacao.no_go, cor: 'text-nogo' },
    { k: 'Vencem em 7 dias', v: r.vencendo7, cor: r.vencendo7 ? 'text-cond' : '' },
    { k: 'Vencidos', v: r.vencidos, cor: r.vencidos ? 'text-nogo' : '' },
    { k: 'Valor somado', v: formatarMoeda(r.valorTotal), pequeno: true, titulo: formatarMoeda(r.valorTotal) },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7" aria-label="Resumo dos editais">
      {itens.map((i) => (
        <div key={i.k} className="kpi">
          <dt>{i.k}</dt>
          <dd className={`${i.cor ?? ''} ${i.pequeno ? '!text-sm truncate' : ''}`} title={i.titulo}>{i.v}</dd>
        </div>
      ))}
    </dl>
  );
}
