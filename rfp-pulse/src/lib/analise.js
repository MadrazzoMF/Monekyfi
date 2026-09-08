// Motor de análise heurístico. Puro, sem React.
// Recebe o texto bruto do edital e devolve sugestões de critérios, riscos,
// itens de checklist e metadados, cada um com o trecho de origem.
// Nesta fase é baseado em regras (regex). Um provedor externo pode ser
// plugado depois com a mesma assinatura.

import { calcularDiasRestantes } from './datas.js';

// ---------- utilitários ----------

function semAcento(s) {
  return String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Divide o texto em trechos (frases/itens) preservando a posição original. */
export function dividirEmTrechos(texto) {
  const trechos = [];
  const re = /[^.;\n]+[.;]?/g;
  let m;
  while ((m = re.exec(texto)) !== null) {
    const bruto = m[0];
    const inicio = m.index + (bruto.length - bruto.trimStart().length);
    const limpo = bruto.trim();
    if (limpo.length < 12) continue;
    trechos.push({ texto: limpo, inicio, fim: inicio + limpo.length });
  }
  return trechos;
}

function primeiroMatch(padroes, texto) {
  for (const p of padroes) {
    const m = texto.match(p);
    if (m) return m;
  }
  return null;
}

// ---------- regras ----------

const OBRIGATORIO = /\b(exig|obrigat|dever[áa]|m[íi]nim|sob pena|inabilita|indispens|imprescind|requisito|habilita[çc][ãa]o)/i;
const OPCIONAL = /\b(preferencial|desej[áa]vel|diferencial|opcional|facultativ|pontua[çc][ãa]o adicional)/i;

const REGRAS_CRITERIO = [
  {
    categoria: 'fiscal',
    padrao: /certid(?:[ãa]o|[õo]es)\s+negativa|regularidade\s+fiscal|\bCND\b|\bSICAF\b|d[ée]bitos?\s+(?:federais|estaduais|municipais|trabalhistas)|\bFGTS\b|\bINSS\b|\bCNDT\b/i,
    descricao: (t) => `Regularidade fiscal: ${resumir(t)}`,
    pesoBase: 4,
  },
  {
    categoria: 'juridica',
    padrao: /contrato\s+social|ato\s+constitutivo|\bCEIS\b|\bCNEP\b|habilita[çc][ãa]o\s+jur[íi]dica|inid[oô]ne|impedid[ao]s?\s+de\s+licitar|\bMSA\b|aceite\s+(?:integral\s+)?d[oa]\s+(?:contrato|minuta)/i,
    descricao: (t) => `Habilitação jurídica: ${resumir(t)}`,
    pesoBase: 3,
  },
  {
    categoria: 'tecnica',
    padrao: /atestados?\s+(?:de\s+)?(?:capacidade|qualifica[çc][ãa]o)?\s*t[ée]cnic|atestados?\s+de\s+(?:execu[çc][ãa]o|fornecimento|presta[çc][ãa]o)|\bCREA\b|\bCAU\b|certifica[çc][ãa]o\s+(?:ISO|CMMI|MPS|ITIL|PMP|AWS|Azure)|\bISO\s*\d{4,5}\b|\bCMMI\b|\bMPS\.?BR\b|respons[áa]vel\s+t[ée]cnico|experi[êe]ncia\s+(?:m[íi]nima|comprovada|compat[íi]vel|em)|acervo\s+t[ée]cnico|revenda\s+autorizada|parceria\s+oficial|\bSLA\s+de\s+\d/i,
    descricao: (t) => `Qualificação técnica: ${resumir(t)}`,
    pesoBase: 5,
  },
  {
    categoria: 'economico_financeira',
    padrao: /capital\s+social|patrim[ôo]nio\s+l[íi]quido|[íi]ndices?\s+(?:de\s+)?liquidez|balan[çc]o\s+patrimonial|faturamento\s+(?:anual|m[íi]nimo)|solv[êe]ncia|\bILG\b|\bILC\b/i,
    descricao: (t) => `Qualificação econômico-financeira: ${resumir(t)}`,
    pesoBase: 3,
  },
  {
    categoria: 'documental',
    padrao: /alvar[áa]|licen[çc]a\s+(?:sanit[áa]ria|ambiental|de\s+funcionamento)|declara[çc][ãa]o\s+de|\bPCMSO\b|\bPGR\b|\bPPRA\b|amostras?\s+d|apresenta[çc][ãa]o\s+de\s+(?:cronograma|plano|portf[óo]lio)|seguro\s+de\s+responsabilidade/i,
    descricao: (t) => `Documentação: ${resumir(t)}`,
    pesoBase: 2,
  },
];

const REGRAS_RISCO = [
  {
    tipo: 'contratual',
    padrao: /multa|penalidade|san[çc][õo]es?|rescis[ãa]o\s+unilateral|descumprimento\s+de\s+SLA|\bSLA\b/i,
    titulo: (t) => (/multa/i.test(t) ? 'Multa ou penalidade contratual' : 'Exigência de SLA / cláusula sancionatória'),
    severidade: (t) => {
      const pct = t.match(/(\d{1,3})\s*%/);
      if (pct && Number(pct[1]) >= 20) return 'alto';
      return /multa/i.test(t) ? 'medio' : 'medio';
    },
    probabilidade: 'media',
  },
  {
    tipo: 'financeiro',
    padrao: /pagamento[^.;]{0,40}?\d+\s+dias|reajuste|glosa|reten[çc][ãa]o|garantia\s+contratual|capital\s+de\s+giro|sem\s+reajuste|pre[çc]o\s+fixo|pontos?\s+de\s+fun[çc][ãa]o/i,
    titulo: (t) => {
      const dias = t.match(/(\d+)\s+dias/);
      if (/pagamento/i.test(t) && dias) return `Prazo de pagamento de ${dias[1]} dias`;
      if (/glosa|pontos? de fun/i.test(t)) return 'Risco de glosa na medição';
      if (/reajuste/i.test(t)) return 'Condição de reajuste desfavorável';
      return 'Condição financeira desfavorável';
    },
    severidade: (t) => {
      const dias = t.match(/(\d+)\s+dias/);
      if (dias && Number(dias[1]) >= 60) return 'alto';
      if (/glosa/i.test(t)) return 'alto';
      return 'medio';
    },
    probabilidade: 'alta',
  },
  {
    tipo: 'operacional',
    padrao: /24\s*(?:h|horas)|equipe\s+residente|atendimento\s+em\s+at[ée]\s+\d+\s*h|entregas?\s+(?:semanais|di[áa]rias|quinzenais)|\d+\s+(?:unidades|munic[íi]pios|pontos|centros)|mobiliza[çc][ãa]o|em\s+at[ée]\s+\d+\s+dias\s+(?:ap[óo]s|da)/i,
    titulo: (t) => `Exigência operacional: ${resumir(t, 60)}`,
    severidade: () => 'alto',
    probabilidade: 'media',
  },
  {
    tipo: 'juridico',
    padrao: /cons[óo]rcio\s+(?:vedado|n[ãa]o\s+(?:ser[áa]\s+)?(?:permitido|admitido))|subcontrata[çc][ãa]o\s+(?:vedada|proibida|n[ãa]o)|exclusividade|propriedade\s+intelectual|cess[ãa]o\s+de\s+direitos|foro\s+de/i,
    titulo: (t) => `Cláusula jurídica sensível: ${resumir(t, 60)}`,
    severidade: () => 'medio',
    probabilidade: 'media',
  },
  {
    tipo: 'escopo_aberto',
    padrao: /a\s+crit[ée]rio\s+d[ao]\s+contratante|n[ãa]o\s+especificad|conforme\s+(?:necessidade|demanda)|entre\s+outros|demais\s+servi[çc]os|quantidade\s+estimada|sob\s+demanda|e\s+outras\s+atividades|escopo\s+(?:poder[áa]|pode)\s+ser/i,
    titulo: (t) => `Escopo aberto: ${resumir(t, 60)}`,
    severidade: () => 'medio',
    probabilidade: 'alta',
  },
];

const REGRAS_CHECKLIST = [
  {
    tipo: 'garantia',
    padrao: /garantia\s+(?:de\s+)?(?:proposta|manuten[çc][ãa]o\s+de\s+proposta|contratual|de\s+execu[çc][ãa]o)/i,
    titulo: (t) => {
      const pct = t.match(/(\d{1,2}(?:,\d+)?)\s*%/);
      return `Providenciar garantia${pct ? ` de ${pct[1]}%` : ''}`;
    },
    criticidade: 'alta',
  },
  {
    tipo: 'visita_tecnica',
    padrao: /visita\s+t[ée]cnica|vistoria/i,
    titulo: () => 'Realizar visita técnica',
    criticidade: (t) => (/obrigat|dever[áa]|exig/i.test(t) ? 'bloqueante' : 'media'),
  },
  {
    tipo: 'assinatura',
    padrao: /assinad[ao]s?\s+(?:pelo|por|digitalmente)|assinatura\s+(?:digital|eletr[ôo]nica|do\s+representante)|procura[çc][ãa]o|\bNDA\b|termo\s+de\s+confidencialidade/i,
    titulo: (t) => (/NDA|confidencialidade/i.test(t) ? 'Assinar NDA / termo de confidencialidade' : 'Colher assinatura do representante legal'),
    criticidade: 'alta',
  },
  {
    tipo: 'documento',
    padrao: /amostras?\s+d|cat[áa]logo|portf[óo]lio|planilha\s+de\s+(?:custos|composi[çc][ãa]o)|cronograma\s+f[íi]sico|proposta\s+t[ée]cnica/i,
    titulo: (t) => `Preparar: ${resumir(t, 50)}`,
    criticidade: 'media',
  },
];

function resumir(t, max = 90) {
  const limpo = t.replace(/\s+/g, ' ').trim();
  return limpo.length > max ? `${limpo.slice(0, max - 1)}…` : limpo;
}

// ---------- metadados ----------

export function extrairMetadados(texto) {
  const t = String(texto ?? '');
  const plano = semAcento(t);
  const meta = {};

  const mod = primeiroMatch(
    [/\bpreg[ãa]o\b/i, /\bconcorr[êe]ncia\b/i, /\bdispensa\b/i, /\bRFP\b|request\s+for\s+proposal|solicita[çc][ãa]o\s+de\s+proposta|convida\s+fornecedores/i],
    t,
  );
  if (mod) {
    const s = semAcento(mod[0]).toLowerCase();
    if (s.startsWith('pregao')) meta.modalidade = 'pregao';
    else if (s.startsWith('concorrencia')) meta.modalidade = 'concorrencia';
    else if (s.startsWith('dispensa')) meta.modalidade = 'dispensa';
    else meta.modalidade = 'rfp_privada';
  }

  const num = t.match(/\b(PE|CP|DL|RFP|CH|TP|PP|RDC)[-\s]*(?:n[º°o.]?\s*)?([A-Z0-9-]*\d[\/-]\d{2,4}(?:-\d+)?)\b/i)
    ?? t.match(/(?:preg[ãa]o|concorr[êe]ncia|dispensa|processo|edital)\s+(?:eletr[ôo]nic[oa]\s+)?(?:n[º°o.]?\s*)?(\d{1,5}\/\d{4})/i);
  if (num) meta.numeroProcesso = num.length === 3 ? `${num[1].toUpperCase()} ${num[2]}` : num[1];

  const valores = [...t.matchAll(/R\$\s*([\d.]+(?:,\d{1,2})?)/g)].map((m) => {
    const n = Number(m[1].replace(/\./g, '').replace(',', '.'));
    return Number.isFinite(n) ? Math.round(n * 100) : 0;
  });
  const ctxValor = t.match(/valor\s+(?:estimado|global|total|m[áa]ximo)[^R$]{0,60}R\$\s*([\d.]+(?:,\d{1,2})?)/i);
  if (ctxValor) {
    meta.valorEstimado = Math.round(Number(ctxValor[1].replace(/\./g, '').replace(',', '.')) * 100);
  } else if (valores.length) {
    meta.valorEstimado = Math.max(...valores);
  }

  const datas = [...t.matchAll(/(\d{2})\/(\d{2})\/(\d{4})/g)].map((m) => ({
    iso: `${m[3]}-${m[2]}-${m[1]}`,
    idx: m.index,
  }));
  for (const d of datas) {
    const antes = plano.slice(Math.max(0, d.idx - 80), d.idx).toLowerCase();
    if (/abertura|sess[ãa]o|disputa/.test(antes) && !meta.dataAberturaPropostas) meta.dataAberturaPropostas = d.iso;
    else if (/limite|envio|at[ée]|prazo|entrega|encerra|recebimento/.test(antes) && !meta.dataLimiteEnvio) meta.dataLimiteEnvio = d.iso;
  }
  if (!meta.dataLimiteEnvio && meta.dataAberturaPropostas) meta.dataLimiteEnvio = meta.dataAberturaPropostas;

  const orgao =
    t.match(/^\s*(?:[OA]\s+)?([A-ZÀ-Ú][^\n,.]{5,90}?)\s+(?:torna\s+p[úu]blico|convida|comunica|informa)/im) ??
    t.match(/((?:Prefeitura(?:\s+Municipal)?|Minist[ée]rio|Secretaria|Tribunal|Departamento|Ag[êe]ncia|Funda[çc][ãa]o|Universidade|Instituto|Banco|Companhia|Empresa)\s+[^\n,.;]{3,80})/);
  if (orgao) meta.orgao = orgao[1].trim();

  const titulo =
    t.match(/(?:objeto|para|visando)\s*:?\s+(?:a\s+)?((?:contrata[çc][ãa]o|aquisi[çc][ãa]o|fornecimento|execu[çc][ãa]o|presta[çc][ãa]o|implanta[çc][ãa]o|desenvolvimento|constru[çc][ãa]o|registro\s+de\s+pre[çc]os)[^.;\n]{10,120})/i) ??
    t.match(/((?:contrata[çc][ãa]o|aquisi[çc][ãa]o|fornecimento|execu[çc][ãa]o|implanta[çc][ãa]o|desenvolvimento|constru[çc][ãa]o)[^.;\n]{10,120})/i);
  if (titulo) {
    const s = titulo[1].trim();
    meta.titulo = s.charAt(0).toUpperCase() + s.slice(1);
  }

  return meta;
}

// ---------- análise principal ----------

/**
 * @param {string} textoBruto
 * @param {{hoje?: string, dataLimiteEnvio?: string}} opcoes
 * @returns {{ metadados, criterios, riscos, checklist, trechos }}
 */
export function analisarTexto(textoBruto, opcoes = {}) {
  const texto = String(textoBruto ?? '');
  const metadados = extrairMetadados(texto);
  const trechos = dividirEmTrechos(texto);

  const criterios = [];
  const riscos = [];
  const checklist = [];
  const vistos = new Set();

  const unico = (chave) => {
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  };

  for (const tr of trechos) {
    const t = tr.texto;

    for (const regra of REGRAS_CRITERIO) {
      if (!regra.padrao.test(t)) continue;
      if (!unico(`c:${regra.categoria}:${t}`)) continue;
      const opcional = OPCIONAL.test(t);
      const obrigatorio = !opcional && (OBRIGATORIO.test(t) || ['fiscal', 'juridica'].includes(regra.categoria));
      criterios.push({
        categoria: regra.categoria,
        descricao: regra.descricao(t),
        trechoOrigem: t,
        obrigatorio,
        situacao: 'nao_avaliado',
        peso: obrigatorio ? regra.pesoBase : Math.max(1, regra.pesoBase - 2),
        evidencia: '',
        notaInterna: 'Sugerido pelo motor de análise',
      });
    }

    for (const regra of REGRAS_RISCO) {
      if (!regra.padrao.test(t)) continue;
      if (!unico(`r:${regra.tipo}:${t}`)) continue;
      riscos.push({
        tipo: regra.tipo,
        titulo: regra.titulo(t),
        trechoOrigem: t,
        severidade: regra.severidade(t),
        probabilidade: regra.probabilidade,
        impactoEstimado: 0,
        mitigacao: '',
        aceito: false,
      });
    }

    for (const regra of REGRAS_CHECKLIST) {
      if (!regra.padrao.test(t)) continue;
      if (!unico(`k:${regra.tipo}:${t}`)) continue;
      checklist.push({
        titulo: regra.titulo(t),
        tipo: regra.tipo,
        dataLimite: null,
        criticidade: typeof regra.criticidade === 'function' ? regra.criticidade(t) : regra.criticidade,
        concluido: false,
        trechoOrigem: t,
      });
    }
  }

  // Checklist derivado dos critérios obrigatórios de documento
  for (const c of criterios) {
    if (!c.obrigatorio) continue;
    if (!['fiscal', 'documental', 'juridica'].includes(c.categoria)) continue;
    const titulo = `Reunir: ${c.descricao.replace(/^[^:]+:\s*/, '')}`;
    if (!unico(`k:doc:${titulo}`)) continue;
    checklist.push({
      titulo,
      tipo: 'documento',
      dataLimite: null,
      criticidade: 'bloqueante',
      concluido: false,
      trechoOrigem: c.trechoOrigem,
    });
  }

  // Prazo de envio: sempre entra no checklist; risco se estiver muito perto
  const dataLimite = opcoes.dataLimiteEnvio ?? metadados.dataLimiteEnvio ?? null;
  checklist.push({
    titulo: 'Enviar proposta dentro do prazo',
    tipo: 'prazo',
    dataLimite,
    criticidade: 'bloqueante',
    concluido: false,
    trechoOrigem: '',
  });
  if (dataLimite && opcoes.hoje) {
    const dias = calcularDiasRestantes(dataLimite, opcoes.hoje);
    if (dias !== null && dias < 0) {
      riscos.unshift({ tipo: 'prazo', titulo: 'Prazo de envio já expirado', trechoOrigem: '', severidade: 'critico', probabilidade: 'alta', impactoEstimado: 0, mitigacao: 'Confirmar prorrogação com o órgão', aceito: false });
    } else if (dias !== null && dias <= 5) {
      riscos.unshift({ tipo: 'prazo', titulo: `Apenas ${dias} dia(s) para envio`, trechoOrigem: '', severidade: dias <= 2 ? 'critico' : 'alto', probabilidade: 'alta', impactoEstimado: 0, mitigacao: 'Priorizar equipe e documentos bloqueantes', aceito: false });
    }
  }

  return { metadados, criterios, riscos, checklist, trechos };
}

/** Localiza cada trecho de origem no texto para destacar na visão dividida. */
export function localizarTrechos(texto, itens) {
  const t = String(texto ?? '');
  const marcas = [];
  for (const item of itens) {
    if (!item?.trechoOrigem) continue;
    const idx = t.indexOf(item.trechoOrigem);
    if (idx < 0) continue;
    marcas.push({ inicio: idx, fim: idx + item.trechoOrigem.length, id: item.id, tipo: item._tipo });
  }
  marcas.sort((a, b) => a.inicio - b.inicio || b.fim - a.fim);
  // remove sobreposições (mantém a primeira)
  const semSobreposicao = [];
  let ultimoFim = -1;
  for (const m of marcas) {
    if (m.inicio < ultimoFim) continue;
    semSobreposicao.push(m);
    ultimoFim = m.fim;
  }
  return semSobreposicao;
}
