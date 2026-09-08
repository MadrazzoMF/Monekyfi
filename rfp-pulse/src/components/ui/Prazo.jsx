import { formatarDiasRestantes } from '../../lib/formatos.js';
import { Icone } from './Icone.jsx';

export function Prazo({ dias, comIcone = false }) {
  if (dias === null || dias === undefined) return <span className="text-ink-faint">sem prazo</span>;
  const classe = dias < 0 ? 'text-nogo' : dias <= 3 ? 'text-nogo' : dias <= 7 ? 'text-cond' : 'text-ink';
  const peso = dias <= 7 ? 'font-semibold' : 'font-medium';
  return (
    <span className={`inline-flex items-center gap-1.5 ${classe} ${peso} tabular-nums`}>
      {comIcone ? <Icone nome={dias < 0 ? 'alerta' : 'relogio'} tamanho={14} /> : null}
      {formatarDiasRestantes(dias)}
    </span>
  );
}
