import React from 'react';
import { View, Text } from 'react-native';
import { useGame } from '../state/GameContext';
import { getAvatar } from '../data/avatars';
import { ProgressBar, Pill } from './ui';
import { colors, spacing, radius, font } from '../theme';

// Faixa de status reaproveitada no topo de várias telas.
export default function StatsHeader({ compact }) {
  const { profile, level, nextLevel, progressToNext, xpToNext, xp, streak, isPremium } = useGame();
  const avatar = getAvatar(profile.avatarId);

  return (
    <View style={{ backgroundColor: colors.jungle, borderRadius: radius.lg, padding: spacing.md }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
        <View style={{ width: 52, height: 52, borderRadius: radius.pill, backgroundColor: colors.banana, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 28 }}>{avatar.emoji}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ color: colors.white, fontWeight: '900', fontSize: 16 }}>{level.name}</Text>
            {isPremium && <Text style={{ fontSize: 13 }}>👑</Text>}
          </View>
          <Text style={{ color: '#DFF3E5', fontSize: 12, fontWeight: '600' }}>
            {profile.name || 'Macaco Anônimo'}
          </Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Pill icon="🔥" label={String(streak)} bg="#0A5C2B" fg={colors.white} />
          <Pill icon="🍌" label={String(xp)} bg={colors.banana} fg={colors.bark} />
        </View>
      </View>
      {!compact && (
        <View style={{ marginTop: spacing.md }}>
          <ProgressBar value={progressToNext} color={colors.banana} track="#0A5C2B" />
          <Text style={{ color: '#DFF3E5', fontSize: 11, marginTop: 6, fontWeight: '600' }}>
            {nextLevel ? `Faltam ${xpToNext} XP pra virar ${nextLevel.name}` : 'Você chegou ao topo da selva 👑'}
          </Text>
        </View>
      )}
    </View>
  );
}
