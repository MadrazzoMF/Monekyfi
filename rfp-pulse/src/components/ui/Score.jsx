const cor = (score) => (score >= 70 ? 'bg-go' : score >= 40 ? 'bg-cond' : 'bg-nogo');

export function Score({ valor, compacto = false }) {
  const v = Math.max(0, Math.min(100, Number(valor) || 0));
  return (
    <div className={`flex items-center gap-2 ${compacto ? 'min-w-[6rem]' : 'min-w-[8rem]'}`} title={`Score de aderência ${v}/100`}>
      <span className="tabular-nums text-sm font-semibold w-7 text-right">{v}</span>
      <div className="score-bar" role="progressbar" aria-valuenow={v} aria-valuemin={0} aria-valuemax={100}>
        <span className={cor(v)} style={{ width: `${v}%` }} />
      </div>
    </div>
  );
}
