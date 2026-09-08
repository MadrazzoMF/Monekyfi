import { formatarDiasRestantes } from '../../lib/formatos.js';

export function Prazo({ dias }) {
  if (dias === null || dias === undefined) return <span className="text-ink-faint">sem prazo</span>;
  const classe =
    dias < 0 ? 'text-nogo font-semibold' : dias <= 3 ? 'text-nogo font-semibold' : dias <= 7 ? 'text-cond font-medium' : 'text-ink';
  return <span className={`${classe} tabular-nums`}>{formatarDiasRestantes(dias)}</span>;
}
