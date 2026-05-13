// Special conquests. `check(state)` receives the game state and returns a boolean.
export const ACHIEVEMENTS = [
  {
    id: 'first_step',
    name: 'Primeiro Passo',
    emoji: '🍌',
    desc: 'Completou sua primeira lição.',
    check: (s) => s.completedLessons.length >= 1,
  },
  {
    id: 'first_challenge',
    name: 'Mão na Massa',
    emoji: '💪',
    desc: 'Completou seu primeiro desafio.',
    check: (s) => s.completedChallenges.length >= 1,
  },
  {
    id: 'streak_7',
    name: '7 Dias de Streak',
    emoji: '🔥',
    desc: 'Usou o app 7 dias seguidos.',
    check: (s) => s.streak >= 7,
  },
  {
    id: 'streak_30',
    name: 'Macaco de Ferro',
    emoji: '⚡',
    desc: 'Usou o app 30 dias seguidos.',
    check: (s) => s.streak >= 30,
  },
  {
    id: 'module_1_done',
    name: 'Domou a Grana',
    emoji: '🎯',
    desc: 'Completou o módulo "Controlando a Grana".',
    check: (s) => s.completedModules.includes('m1'),
  },
  {
    id: 'module_invest_done',
    name: 'Investidor de Verdade',
    emoji: '📈',
    desc: 'Completou o módulo de investimentos.',
    check: (s) => s.completedModules.includes('m2'),
  },
  {
    id: 'challenges_30',
    name: '30 Desafios Feitos',
    emoji: '🏆',
    desc: 'Completou 30 desafios práticos.',
    check: (s) => s.completedChallenges.length >= 30,
  },
  {
    id: 'perfect_quiz',
    name: 'Gabaritou',
    emoji: '💯',
    desc: 'Acertou todas as perguntas de um quiz.',
    check: (s) => s.perfectQuizzes.length >= 1,
  },
  {
    id: 'xp_1000',
    name: 'Mil Bananas',
    emoji: '🪙',
    desc: 'Acumulou 1000 XP.',
    check: (s) => s.xp >= 1000,
  },
  {
    id: 'no_spend_day',
    name: 'Dia Sem Gastar',
    emoji: '🚫',
    desc: 'Completou o desafio "24h sem gastar nada".',
    check: (s) => s.completedChallenges.includes('c-no-spend-24h'),
  },
];

export function evaluateAchievements(state) {
  return ACHIEVEMENTS.filter((a) => a.check(state)).map((a) => a.id);
}
