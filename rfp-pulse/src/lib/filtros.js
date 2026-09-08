// Filtro e ordenação de editais derivados. Puro, sem React.

export const FILTROS_PADRAO = Object.freeze({
  busca: '',
  status: [],
  modalidade: [],
  recomendacao: [],
  responsavelId: '',
  apenasComPrazo: false,
  ordenarPor: 'diasRestantes',
  direcao: 'asc',
});

function normalizar(texto) {
  return String(texto ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

export function filtrarEditais(editais, filtros = FILTROS_PADRAO) {
  const f = { ...FILTROS_PADRAO, ...filtros };
  const busca = normalizar(f.busca).trim();

  return editais.filter((e) => {
    if (f.status.length && !f.status.includes(e.status)) return false;
    if (f.modalidade.length && !f.modalidade.includes(e.modalidade)) return false;
    if (f.recomendacao.length && !f.recomendacao.includes(e.recomendacao)) return false;
    if (f.responsavelId && e.responsavelId !== f.responsavelId) return false;
    if (f.apenasComPrazo && (e.diasRestantes === null || e.diasRestantes < 0)) return false;
    if (busca) {
      const alvo = normalizar(
        [e.titulo, e.orgao, e.numeroProcesso, ...(e.tags ?? [])].join(' '),
      );
      if (!alvo.includes(busca)) return false;
    }
    return true;
  });
}

const COMPARADORES = {
  titulo: (a, b) => a.titulo.localeCompare(b.titulo, 'pt-BR'),
  orgao: (a, b) => a.orgao.localeCompare(b.orgao, 'pt-BR'),
  valorEstimado: (a, b) => a.valorEstimado - b.valorEstimado,
  scoreAderencia: (a, b) => a.scoreAderencia - b.scoreAderencia,
  status: (a, b) => a.status.localeCompare(b.status),
  recomendacao: (a, b) => a.recomendacao.localeCompare(b.recomendacao),
  dataImportacao: (a, b) => String(a.dataImportacao).localeCompare(String(b.dataImportacao)),
  // sem prazo vai para o fim, independente da direção
  diasRestantes: (a, b) => {
    const x = a.diasRestantes, y = b.diasRestantes;
    if (x === null && y === null) return 0;
    if (x === null) return Number.POSITIVE_INFINITY;
    if (y === null) return Number.NEGATIVE_INFINITY;
    return x - y;
  },
};

export const CAMPOS_ORDENAVEIS = Object.freeze(Object.keys(COMPARADORES));

export function ordenarEditais(editais, ordenarPor = 'diasRestantes', direcao = 'asc') {
  const cmp = COMPARADORES[ordenarPor] ?? COMPARADORES.diasRestantes;
  const sinal = direcao === 'desc' ? -1 : 1;
  return [...editais].sort((a, b) => {
    const r = cmp(a, b);
    if (r === Number.POSITIVE_INFINITY) return 1;
    if (r === Number.NEGATIVE_INFINITY) return -1;
    return r * sinal;
  });
}

export function aplicarFiltros(editais, filtros = FILTROS_PADRAO) {
  const f = { ...FILTROS_PADRAO, ...filtros };
  return ordenarEditais(filtrarEditais(editais, f), f.ordenarPor, f.direcao);
}

export function resumirEditais(editais) {
  const total = editais.length;
  const porRecomendacao = { go: 0, no_go: 0, condicional: 0, indefinido: 0 };
  let vencendo7 = 0;
  let vencidos = 0;
  let valorTotal = 0;
  for (const e of editais) {
    porRecomendacao[e.recomendacao] = (porRecomendacao[e.recomendacao] ?? 0) + 1;
    if (e.diasRestantes !== null && e.diasRestantes < 0) vencidos += 1;
    else if (e.diasRestantes !== null && e.diasRestantes <= 7) vencendo7 += 1;
    valorTotal += e.valorEstimado;
  }
  return { total, porRecomendacao, vencendo7, vencidos, valorTotal };
}
