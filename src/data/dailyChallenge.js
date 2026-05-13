import { CHALLENGES } from './challenges';

// Retorna a chave do dia, ex: "2026-05-13" no fuso local.
export function todayKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function hashString(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

// Sorteio determinístico: o mesmo dia => o mesmo desafio pra todo mundo.
// `isPremium` libera o pool completo; grátis vê só os desafios 'free'.
export function getDailyChallenge(dateKey = todayKey(), isPremium = false) {
  const pool = isPremium ? CHALLENGES : CHALLENGES.filter((c) => c.tier === 'free');
  const idx = hashString(dateKey) % pool.length;
  return pool[idx];
}

export function daysBetween(aKey, bKey) {
  const a = new Date(aKey + 'T00:00:00');
  const b = new Date(bKey + 'T00:00:00');
  return Math.round((b - a) / (1000 * 60 * 60 * 24));
}
