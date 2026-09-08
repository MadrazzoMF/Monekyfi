import { rotulo } from '../../lib/formatos.js';

const VARIANTE_RECOMENDACAO = { go: 'badge-go', no_go: 'badge-nogo', condicional: 'badge-cond', indefinido: 'badge-indef' };
const VARIANTE_STATUS = {
  importado: 'badge-neutral',
  em_analise: 'badge-brand',
  triado: 'badge-brand',
  em_aprovacao: 'badge-cond',
  aprovado: 'badge-go',
  proposta_enviada: 'badge-go',
  descartado: 'badge-neutral',
  reprovado: 'badge-nogo',
};
const VARIANTE_SEVERIDADE = { critico: 'badge-nogo', alto: 'badge-cond', medio: 'badge-brand', baixo: 'badge-neutral' };
const VARIANTE_CRITICIDADE = { bloqueante: 'badge-nogo', alta: 'badge-cond', media: 'badge-brand', baixa: 'badge-neutral' };
const VARIANTE_SITUACAO = { atende: 'badge-go', nao_atende: 'badge-nogo', parcial: 'badge-cond', nao_avaliado: 'badge-neutral' };

export function Badge({ variante = 'badge-neutral', children, title }) {
  return (
    <span className={variante} title={title}>
      {children}
    </span>
  );
}

export const BadgeRecomendacao = ({ valor }) => (
  <Badge variante={VARIANTE_RECOMENDACAO[valor] ?? 'badge-neutral'}>{rotulo('recomendacao', valor)}</Badge>
);
export const BadgeStatus = ({ valor }) => (
  <Badge variante={VARIANTE_STATUS[valor] ?? 'badge-neutral'}>{rotulo('status', valor)}</Badge>
);
export const BadgeSeveridade = ({ valor }) => (
  <Badge variante={VARIANTE_SEVERIDADE[valor] ?? 'badge-neutral'}>{rotulo('severidade', valor)}</Badge>
);
export const BadgeCriticidade = ({ valor }) => (
  <Badge variante={VARIANTE_CRITICIDADE[valor] ?? 'badge-neutral'}>{rotulo('criticidade', valor)}</Badge>
);
export const BadgeSituacao = ({ valor }) => (
  <Badge variante={VARIANTE_SITUACAO[valor] ?? 'badge-neutral'}>{rotulo('situacao', valor)}</Badge>
);
export const BadgeOutline = ({ children }) => <Badge variante="badge-outline">{children}</Badge>;
