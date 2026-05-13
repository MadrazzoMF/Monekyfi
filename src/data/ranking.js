// Ranking semanal — mock local com "macacos" fictícios. Quando o Supabase entrar,
// isto vira uma query ordenada por XP da semana. O usuário é injetado dinamicamente.
export const BOT_PLAYERS = [
  { id: 'bot-1', name: 'ZéBananeira', emoji: '🐵', weeklyXp: 740 },
  { id: 'bot-2', name: 'CarlaInveste', emoji: '🦧', weeklyXp: 690 },
  { id: 'bot-3', name: 'TioPão', emoji: '🙈', weeklyXp: 610 },
  { id: 'bot-4', name: 'MacacoDoPix', emoji: '🐒', weeklyXp: 540 },
  { id: 'bot-5', name: 'LariStreak', emoji: '🔥', weeklyXp: 480 },
  { id: 'bot-6', name: 'GorilaCDB', emoji: '🦍', weeklyXp: 430 },
  { id: 'bot-7', name: 'PedroDelivery0', emoji: '🍌', weeklyXp: 360 },
  { id: 'bot-8', name: 'AnaSemGastar', emoji: '🚫', weeklyXp: 300 },
  { id: 'bot-9', name: 'JoãoTesouro', emoji: '🏦', weeklyXp: 250 },
  { id: 'bot-10', name: 'BiaOrçamento', emoji: '📊', weeklyXp: 190 },
  { id: 'bot-11', name: 'MacacoMagnata77', emoji: '👑', weeklyXp: 120 },
  { id: 'bot-12', name: 'NovatoDaSelva', emoji: '🌴', weeklyXp: 60 },
];

export function buildRanking(user) {
  const all = [
    ...BOT_PLAYERS,
    { id: 'me', name: user.name || 'Você', emoji: user.emoji || '🐵', weeklyXp: user.weeklyXp || 0, isMe: true },
  ];
  return all
    .sort((a, b) => b.weeklyXp - a.weeklyXp)
    .map((p, i) => ({ ...p, position: i + 1 }));
}
