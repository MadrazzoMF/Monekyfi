const corPor = (v) => (v >= 70 ? 'text-go' : v >= 40 ? 'text-cond' : 'text-nogo');

/** Anel de score SVG. tamanho em px. */
export function AnelScore({ valor, tamanho = 64, espessura = 6, rotulo = 'Score' }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  const r = (tamanho - espessura) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - v / 100);
  return (
    <div className="relative inline-grid place-items-center" style={{ width: tamanho, height: tamanho }} role="img" aria-label={`${rotulo} ${v} de 100`}>
      <svg width={tamanho} height={tamanho} className="-rotate-90">
        <circle cx={tamanho / 2} cy={tamanho / 2} r={r} fill="none" strokeWidth={espessura} className="stroke-line" />
        <circle
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={r}
          fill="none"
          strokeWidth={espessura}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
          className={`${corPor(v)} stroke-current transition-[stroke-dashoffset] duration-500`}
        />
      </svg>
      <span className={`absolute font-semibold tabular-nums tracking-tight ${corPor(v)}`} style={{ fontSize: tamanho * 0.3 }}>
        {v}
      </span>
    </div>
  );
}

export function BarraScore({ valor, largura = 'w-24' }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  const bg = v >= 70 ? 'bg-go' : v >= 40 ? 'bg-cond' : 'bg-nogo';
  return (
    <div className={`flex items-center gap-2 ${largura}`} title={`Score ${v}/100`}>
      <span className={`tabular-nums text-sm font-semibold w-6 text-right ${corPor(v)}`}>{v}</span>
      <div className="bar" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <span className={bg} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
