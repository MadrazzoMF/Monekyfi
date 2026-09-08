import { resumirEditais } from '../lib/filtros.js';
import { formatarMoeda, formatarMoedaCompacta } from '../lib/formatos.js';
import { Icone } from './ui/Icone.jsx';

export function ResumoEditais({ editais, onFiltrar }) {
  const r = resumirEditais(editais);
  const itens = [
    { k: 'Editais ativos', v: r.total, icone: 'arquivo' },
    { k: 'GO', v: r.porRecomendacao.go, cor: 'text-go', icone: 'check', filtro: { recomendacao: ['go'] } },
    { k: 'Condicional', v: r.porRecomendacao.condicional, cor: 'text-cond', icone: 'info', filtro: { recomendacao: ['condicional'] } },
    { k: 'NO-GO', v: r.porRecomendacao.no_go, cor: 'text-nogo', icone: 'x', filtro: { recomendacao: ['no_go'] } },
    { k: 'Vencem em 7 dias', v: r.vencendo7, cor: r.vencendo7 ? 'text-cond' : '', icone: 'relogio' },
    { k: 'Vencidos', v: r.vencidos, cor: r.vencidos ? 'text-nogo' : '', icone: 'alerta' },
    { k: 'Valor em análise', v: formatarMoedaCompacta(r.valorTotal), titulo: formatarMoeda(r.valorTotal), icone: 'moeda', pequeno: true },
  ];
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-7" aria-label="Resumo dos editais">
      {itens.map((i, idx) => {
        const clicavel = Boolean(i.filtro && onFiltrar);
        const Tag = clicavel ? 'button' : 'div';
        return (
          <Tag
            key={i.k}
            type={clicavel ? 'button' : undefined}
            onClick={clicavel ? () => onFiltrar(i.filtro) : undefined}
            className={`kpi text-left animate-entrar ${clicavel ? 'hover:border-line-strong cursor-pointer' : ''}`}
            style={{ animationDelay: `${idx * 30}ms` }}
          >
            <span className={`kpi-icone ${i.cor ?? ''}`}><Icone nome={i.icone} tamanho={15} /></span>
            <dt>{i.k}</dt>
            <dd className={`${i.cor ?? ''} ${i.pequeno ? '!text-[19px] whitespace-nowrap' : ''}`} title={i.titulo}>{i.v}</dd>
          </Tag>
        );
      })}
    </dl>
  );
}
