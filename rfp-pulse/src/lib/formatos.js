// Formatação e rótulos em pt-BR. Puro, sem React.

export function formatarMoeda(centavos) {
  if (!Number.isFinite(centavos)) return '—';
  return (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function formatarData(iso) {
  if (!iso) return '—';
  const [a, m, d] = iso.slice(0, 10).split('-');
  if (!a || !m || !d) return '—';
  return `${d}/${m}/${a}`;
}

export function formatarDataHora(iso) {
  if (!iso) return '—';
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return '—';
  return dt.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}

export function formatarDiasRestantes(dias) {
  if (dias === null || dias === undefined) return 'sem prazo';
  if (dias < 0) return `vencido há ${-dias} d`;
  if (dias === 0) return 'vence hoje';
  return `${dias} d`;
}

export const Rotulos = Object.freeze({
  modalidade: {
    pregao: 'Pregão',
    concorrencia: 'Concorrência',
    dispensa: 'Dispensa',
    rfp_privada: 'RFP privada',
    outro: 'Outro',
  },
  status: {
    importado: 'Importado',
    em_analise: 'Em análise',
    triado: 'Triado',
    em_aprovacao: 'Em aprovação',
    aprovado: 'Aprovado',
    proposta_enviada: 'Proposta enviada',
    descartado: 'Descartado',
    reprovado: 'Reprovado',
  },
  recomendacao: {
    go: 'GO',
    no_go: 'NO-GO',
    condicional: 'Condicional',
    indefinido: 'Indefinido',
  },
  categoria: {
    juridica: 'Jurídica',
    fiscal: 'Fiscal',
    tecnica: 'Técnica',
    economico_financeira: 'Econômico-financeira',
    documental: 'Documental',
  },
  situacao: {
    atende: 'Atende',
    nao_atende: 'Não atende',
    parcial: 'Parcial',
    nao_avaliado: 'Não avaliado',
  },
  tipoChecklist: {
    documento: 'Documento',
    prazo: 'Prazo',
    assinatura: 'Assinatura',
    visita_tecnica: 'Visita técnica',
    garantia: 'Garantia',
  },
  criticidade: {
    bloqueante: 'Bloqueante',
    alta: 'Alta',
    media: 'Média',
    baixa: 'Baixa',
  },
  tipoRisco: {
    contratual: 'Contratual',
    financeiro: 'Financeiro',
    operacional: 'Operacional',
    juridico: 'Jurídico',
    prazo: 'Prazo',
    escopo_aberto: 'Escopo aberto',
  },
  severidade: {
    critico: 'Crítico',
    alto: 'Alto',
    medio: 'Médio',
    baixo: 'Baixo',
  },
  probabilidade: { alta: 'Alta', media: 'Média', baixa: 'Baixa' },
  papel: { analista: 'Analista', aprovador: 'Aprovador', admin: 'Admin' },
});

export function rotulo(grupo, valor) {
  return Rotulos[grupo]?.[valor] ?? valor ?? '—';
}

/** R$ 102.680.000 -> "R$ 102,7 mi". Para KPIs. */
export function formatarMoedaCompacta(centavos) {
  if (!Number.isFinite(centavos)) return '—';
  const v = centavos / 100;
  const abs = Math.abs(v);
  const fmt = (n, suf) => `R$ ${n.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} ${suf}`;
  if (abs >= 1e9) return fmt(v / 1e9, 'bi');
  if (abs >= 1e6) return fmt(v / 1e6, 'mi');
  if (abs >= 1e3) return fmt(v / 1e3, 'mil');
  return formatarMoeda(centavos);
}
