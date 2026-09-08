// Funções puras de data. Todas as datas entram como 'YYYY-MM-DD' ou ISO.
// Nenhuma função aqui lê o relógio: `hoje` é sempre parâmetro.

const MS_POR_DIA = 24 * 60 * 60 * 1000;

/** Converte 'YYYY-MM-DD' ou ISO em timestamp UTC à meia-noite do dia. */
export function paraDiaUtc(data) {
  if (data instanceof Date) {
    return Date.UTC(data.getUTCFullYear(), data.getUTCMonth(), data.getUTCDate());
  }
  if (typeof data !== 'string' || data.length < 10) return NaN;
  const [ano, mes, dia] = data.slice(0, 10).split('-').map(Number);
  if (!ano || !mes || !dia) return NaN;
  return Date.UTC(ano, mes - 1, dia);
}

/**
 * Dias inteiros entre hoje e a data limite.
 *  > 0  -> faltam N dias
 *  = 0  -> vence hoje
 *  < 0  -> vencido há N dias
 *  null -> sem data limite ou data inválida
 */
export function calcularDiasRestantes(dataLimite, hoje) {
  if (!dataLimite || !hoje) return null;
  const limite = paraDiaUtc(dataLimite);
  const agora = paraDiaUtc(hoje);
  if (Number.isNaN(limite) || Number.isNaN(agora)) return null;
  return Math.round((limite - agora) / MS_POR_DIA);
}

export function prazoVencido(dataLimite, hoje) {
  const dias = calcularDiasRestantes(dataLimite, hoje);
  return dias !== null && dias < 0;
}

/** Soma dias a uma data 'YYYY-MM-DD' e devolve 'YYYY-MM-DD'. Útil no seed. */
export function somarDias(data, dias) {
  const base = paraDiaUtc(data);
  if (Number.isNaN(base)) return null;
  return new Date(base + dias * MS_POR_DIA).toISOString().slice(0, 10);
}
