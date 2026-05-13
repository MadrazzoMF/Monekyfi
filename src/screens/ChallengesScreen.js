import React, { useState, useMemo } from 'react';
import { View, Text, Pressable } from 'react-native';
import { useGame } from '../state/GameContext';
import { CHALLENGES, CHALLENGE_TAGS } from '../data/challenges';
import { getDailyChallenge, todayKey } from '../data/dailyChallenge';
import { Screen, Card, Tag, LockBadge, SectionTitle } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

export default function ChallengesScreen({ navigation }) {
  const { isPremium, completedChallenges, challengeLog } = useGame();
  const [filter, setFilter] = useState('Todos');
  const tk = todayKey();
  const daily = getDailyChallenge(tk, isPremium);

  const list = useMemo(() => {
    return CHALLENGES.filter((c) => filter === 'Todos' || c.tag === filter);
  }, [filter]);

  const doneCount = completedChallenges.length;

  return (
    <Screen>
      <Text style={[font.h2, { marginBottom: 4 }]}>Desafios práticos</Text>
      <Text style={[font.small, { marginBottom: spacing.md }]}>
        Conhecimento vira hábito quando vira ação. {doneCount} de {CHALLENGES.length} feitos.
      </Text>

      {/* Desafio do dia em destaque */}
      <Card accent={colors.banana} onPress={() => navigation.navigate('ChallengeDetail', { challengeId: daily.id, daily: true })}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Tag text="Desafio do dia" color={colors.bananaDark} />
          {challengeLog[tk] ? <Text style={{ color: colors.success, fontWeight: '800', fontSize: 12 }}>✓ feito hoje</Text> : null}
        </View>
        <Text style={[font.bodyStrong, { marginTop: 6 }]}>{daily.title}</Text>
        <Text style={[font.small, { marginTop: 4 }]}>{daily.tag} · +{daily.xp} XP</Text>
      </Card>

      <SectionTitle>Todos os desafios</SectionTitle>

      {/* Filtros */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: spacing.md }}>
        {['Todos', ...CHALLENGE_TAGS].map((t) => {
          const sel = filter === t;
          return (
            <Pressable
              key={t}
              onPress={() => setFilter(t)}
              style={{
                paddingHorizontal: 12, paddingVertical: 7, borderRadius: radius.pill,
                backgroundColor: sel ? colors.jungle : colors.white,
                borderWidth: 1, borderColor: sel ? colors.jungle : colors.border,
              }}
            >
              <Text style={{ fontWeight: '700', fontSize: 12, color: sel ? colors.white : colors.muted }}>{t}</Text>
            </Pressable>
          );
        })}
      </View>

      {list.map((c) => {
        const done = completedChallenges.includes(c.id);
        const locked = c.tier === 'premium' && !isPremium;
        return (
          <Card
            key={c.id}
            style={{ marginBottom: spacing.sm }}
            accent={done ? colors.success : locked ? colors.premium : colors.jungle}
            onPress={() => locked ? navigation.navigate('Premium') : navigation.navigate('ChallengeDetail', { challengeId: c.id })}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
              <Text style={{ fontSize: 22 }}>{done ? '✅' : locked ? '🔒' : '🎯'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[font.bodyStrong, locked && { color: colors.muted }]} numberOfLines={1}>{c.title}</Text>
                <Text style={font.small}>{c.tag} · +{c.xp} XP{done ? ' · concluído' : ''}</Text>
              </View>
              {locked ? <LockBadge /> : <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>}
            </View>
          </Card>
        );
      })}
    </Screen>
  );
}
