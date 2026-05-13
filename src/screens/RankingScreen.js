import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useGame } from '../state/GameContext';
import { getAvatar } from '../data/avatars';
import { buildRanking } from '../data/ranking';
import { Screen, Card, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

function medal(pos) {
  if (pos === 1) return '🥇';
  if (pos === 2) return '🥈';
  if (pos === 3) return '🥉';
  return null;
}

export default function RankingScreen() {
  const { profile, weeklyXp } = useGame();
  const avatar = getAvatar(profile.avatarId);
  const ranking = useMemo(
    () => buildRanking({ name: profile.name, emoji: avatar.emoji, weeklyXp }),
    [profile.name, avatar.emoji, weeklyXp]
  );
  const me = ranking.find((r) => r.isMe);

  return (
    <Screen>
      <Text style={[font.h2, { marginBottom: 4 }]}>Ranking semanal 🏆</Text>
      <Text style={[font.small, { marginBottom: spacing.md }]}>
        Zera toda segunda. Quanto mais lição e desafio essa semana, mais alto você fica.
      </Text>

      <Card accent={colors.banana} style={{ marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: 32 }}>{avatar.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={font.bodyStrong}>Você está em {me ? `#${me.position}` : '—'}</Text>
            <Text style={font.small}>{weeklyXp} XP esta semana</Text>
          </View>
          <Tag text={me && me.position <= 3 ? 'Top 3!' : 'Sobe mais!'} color={colors.jungle} />
        </View>
      </Card>

      {ranking.map((r) => {
        const isMe = !!r.isMe;
        return (
          <View
            key={r.id}
            style={{
              flexDirection: 'row', alignItems: 'center', gap: spacing.md,
              paddingVertical: 12, paddingHorizontal: spacing.md, marginBottom: 6,
              borderRadius: radius.md,
              backgroundColor: isMe ? colors.jungle + '12' : colors.white,
              borderWidth: 1, borderColor: isMe ? colors.jungle : colors.border,
            }}
          >
            <Text style={{ width: 28, textAlign: 'center', fontWeight: '900', color: colors.muted }}>
              {medal(r.position) || r.position}
            </Text>
            <Text style={{ fontSize: 22 }}>{r.emoji}</Text>
            <Text style={[font.bodyStrong, { flex: 1 }, isMe && { color: colors.jungle }]} numberOfLines={1}>
              {r.name}{isMe ? ' (você)' : ''}
            </Text>
            <Text style={{ fontWeight: '800', color: colors.bark }}>{r.weeklyXp} XP</Text>
          </View>
        );
      })}
    </Screen>
  );
}
