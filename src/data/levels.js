// Monkey ranks — each unlocks a new avatar. XP thresholds are cumulative.
export const LEVELS = [
  {
    id: 'pobre',
    name: 'Macaco Pobre',
    emoji: '🐒',
    minXp: 0,
    blurb: 'Todo mundo começa de algum lugar. Bora aprender a domar a grana.',
    color: '#8A8378',
  },
  {
    id: 'esperto',
    name: 'Macaco Esperto',
    emoji: '🙈',
    minXp: 300,
    blurb: 'Você já sabe pra onde vai seu dinheiro. Esperteza é poder.',
    color: '#0E7C3A',
  },
  {
    id: 'investidor',
    name: 'Macaco Investidor',
    emoji: '🐵',
    minXp: 900,
    blurb: 'Seu dinheiro trabalha enquanto você dorme. Bem-vindo ao jogo.',
    color: '#1FA34F',
  },
  {
    id: 'milionario',
    name: 'Macaco Milionário',
    emoji: '🦍',
    minXp: 2000,
    blurb: 'Disciplina virou hábito. As bananas estão se multiplicando.',
    color: '#E8A800',
  },
  {
    id: 'magnata',
    name: 'Macaco Magnata',
    emoji: '👑',
    minXp: 4500,
    blurb: 'Você não corre atrás de dinheiro — ele corre atrás de você.',
    color: '#7C3AED',
  },
];

export function levelForXp(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXp) current = lvl;
  }
  return current;
}

export function nextLevelForXp(xp) {
  return LEVELS.find((lvl) => lvl.minXp > xp) || null;
}

// Progress (0..1) toward the next rank.
export function levelProgress(xp) {
  const current = levelForXp(xp);
  const next = nextLevelForXp(xp);
  if (!next) return 1;
  const span = next.minXp - current.minXp;
  return Math.max(0, Math.min(1, (xp - current.minXp) / span));
}
