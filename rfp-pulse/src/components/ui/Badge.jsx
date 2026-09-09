import { rotulo } from '../../lib/formatos.js';

const REC = { go: 'badge-go', no_go: 'badge-nogo', condicional: 'badge-cond', indefinido: 'badge-neutral' };
const STATUS = {
  importado: 'badge-neutral',
  em_analise: 'badge-info',
  triado: 'badge-accent',
  em_aprovacao: 'badge-cond',
  aprovado: 'badge-go',
  proposta_enviada: 'badge-go',
  descartado: 'badge-neutral',
  reprovado: 'badge-nogo',
};
const SEV = { critico: 'badge-nogo', alto: 'badge-cond', medio: 'badge-info', baixo: 'badge-neutral' };
const CRIT = { bloqueante: 'badge-nogo', alta: 'badge-cond', media: 'badge-info', baixa: 'badge-neutral' };
const SIT = { atende: 'badge-go', nao_atende: 'badge-nogo', parcial: 'badge-cond', nao_avaliado: 'badge-neutral' };

export function Badge({ variante = 'badge-neutral', dot = false, children, title, className = '' }) {
  return (
    <span className={`${variante} ${dot ? 'badge-dot' : ''} ${className}`} title={title}>
      {children}
    </span>
  );
}

export const BadgeRecomendacao = ({ valor }) => <Badge variante={REC[valor] ?? 'badge-neutral'} dot>{rotulo('recomendacao', valor)}</Badge>;
export const BadgeStatus = ({ valor }) => <Badge variante={STATUS[valor] ?? 'badge-neutral'}>{rotulo('status', valor)}</Badge>;
export const BadgeSeveridade = ({ valor }) => <Badge variante={SEV[valor] ?? 'badge-neutral'} dot>{rotulo('severidade', valor)}</Badge>;
export const BadgeCriticidade = ({ valor }) => <Badge variante={CRIT[valor] ?? 'badge-neutral'}>{rotulo('criticidade', valor)}</Badge>;
export const BadgeSituacao = ({ valor }) => <Badge variante={SIT[valor] ?? 'badge-neutral'} dot>{rotulo('situacao', valor)}</Badge>;
export const BadgeOutline = ({ children }) => <Badge variante="badge-outline">{children}</Badge>;

const REC_PILL = {
  go: 'bg-go/12 border-go/40 text-go',
  no_go: 'bg-nogo/12 border-nogo/40 text-nogo',
  condicional: 'bg-cond/12 border-cond/40 text-cond',
  indefinido: 'bg-raised border-line text-ink-muted',
};
export function PillRecomendacao({ valor }) {
  return (
    <span className={`rec-pill ${REC_PILL[valor] ?? REC_PILL.indefinido}`}>
      <span className="h-2 w-2 rounded-full bg-current" />
      {rotulo('recomendacao', valor)}
    </span>
  );
}
