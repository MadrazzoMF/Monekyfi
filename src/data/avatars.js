// Avatares de macaco. Os primeiros são livres na criação da conta;
// os demais desbloqueiam ao subir de nível. `premium` é o avatar exclusivo da assinatura.
export const AVATARS = [
  { id: 'classic', emoji: '🐵', name: 'Macaco Clássico', unlock: 'start' },
  { id: 'shy', emoji: '🙈', name: 'Não Vejo Gastos', unlock: 'start' },
  { id: 'cool', emoji: '🐒', name: 'Macaco Estiloso', unlock: 'start' },
  { id: 'ape', emoji: '🦍', name: 'Gorila do Cofre', unlock: 'level:milionario' },
  { id: 'orang', emoji: '🦧', name: 'Orangotango Sábio', unlock: 'level:investidor' },
  { id: 'king', emoji: '👑', name: 'Macaco Coroado', unlock: 'level:magnata' },
  { id: 'astro', emoji: '🚀', name: 'Macaco Foguete', unlock: 'premium' },
];

export function getAvatar(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

export function isAvatarUnlocked(avatar, { levelId, isPremium, unlockedByAchievement }) {
  if (avatar.unlock === 'start') return true;
  if (avatar.unlock === 'premium') return !!isPremium;
  if (avatar.unlock.startsWith('level:')) {
    const order = ['pobre', 'esperto', 'investidor', 'milionario', 'magnata'];
    const need = avatar.unlock.split(':')[1];
    return order.indexOf(levelId) >= order.indexOf(need);
  }
  return !!unlockedByAchievement;
}
