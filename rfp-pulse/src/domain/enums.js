// Enums do domínio. Objetos congelados: use sempre as constantes, nunca strings soltas.

function enumDe(valores) {
  const obj = {};
  for (const v of valores) obj[v.toUpperCase()] = v;
  obj.valores = Object.freeze([...valores]);
  obj.contem = (x) => valores.includes(x);
  return Object.freeze(obj);
}

export const Modalidade = enumDe([
  'pregao',
  'concorrencia',
  'dispensa',
  'rfp_privada',
  'outro',
]);

export const StatusEdital = enumDe([
  'importado',
  'em_analise',
  'triado',
  'em_aprovacao',
  'aprovado',
  'proposta_enviada',
  'descartado',
  'reprovado',
]);

export const Recomendacao = enumDe(['go', 'no_go', 'condicional', 'indefinido']);

export const CategoriaCriterio = enumDe([
  'juridica',
  'fiscal',
  'tecnica',
  'economico_financeira',
  'documental',
]);

export const SituacaoCriterio = enumDe([
  'atende',
  'nao_atende',
  'parcial',
  'nao_avaliado',
]);

export const TipoChecklist = enumDe([
  'documento',
  'prazo',
  'assinatura',
  'visita_tecnica',
  'garantia',
]);

export const Criticidade = enumDe(['bloqueante', 'alta', 'media', 'baixa']);

export const TipoRisco = enumDe([
  'contratual',
  'financeiro',
  'operacional',
  'juridico',
  'prazo',
  'escopo_aberto',
]);

export const Severidade = enumDe(['critico', 'alto', 'medio', 'baixo']);

export const Probabilidade = enumDe(['alta', 'media', 'baixa']);

export const PapelUsuario = enumDe(['analista', 'aprovador', 'admin']);
