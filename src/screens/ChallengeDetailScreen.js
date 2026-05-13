import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';
import { getChallengeById } from '../data/challenges';
import { todayKey } from '../data/dailyChallenge';
import { Button, Card, Tag } from '../components/ui';
import { colors, spacing, font } from '../theme';

export default function ChallengeDetailScreen({ route, navigation }) {
  const { challengeId, daily } = route.params || {};
  const challenge = getChallengeById(challengeId);
  const { completeChallenge, completedChallenges, challengeLog } = useGame();

  if (!challenge) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg, padding: spacing.lg }}>
        <Text style={font.h2}>Desafio não encontrado.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </SafeAreaView>
    );
  }

  const tk = todayKey();
  const done = completedChallenges.includes(challenge.id);
  const doneToday = daily && challengeLog[tk] === challenge.id;

  function markDone() {
    const r = completeChallenge(challenge.id, daily ? { dayKey: tk } : {});
    const lines = [];
    if (r.xpGained > 0) lines.push(`+${r.xpGained} XP 🍌`);
    else lines.push('Você já tinha feito esse desafio — sem XP novo, mas valeu reforçar o hábito. 💪');
    if (r.leveledUp && r.newLevel) lines.push(`Subiu de nível: ${r.newLevel.name} ${r.newLevel.emoji}`);
    if (r.newAchievements?.length) lines.push('Nova conquista desbloqueada! 🏅');
    Alert.alert('Desafio concluído!', lines.join('\n'), [{ text: 'Boa!', onPress: () => navigation.goBack() }]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.lg }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 22, color: colors.muted }}>‹ Voltar</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <Text style={{ fontSize: 56 }}>{done ? '✅' : '🎯'}</Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: spacing.sm }}>
          <Tag text={challenge.tag} color={colors.jungle} />
          {daily && <Tag text="Desafio do dia" color={colors.bananaDark} />}
          {challenge.tier === 'premium' && <Tag text="Premium" color={colors.premium} />}
        </View>
        <Text style={[font.h1, { marginTop: spacing.sm }]}>{challenge.title}</Text>
        <Text style={[font.body, { marginTop: spacing.sm }]}>{challenge.desc}</Text>

        <Card style={{ marginTop: spacing.lg }}>
          <Text style={font.bodyStrong}>Recompensa</Text>
          <Text style={[font.h2, { marginTop: 4 }]}>+{challenge.xp} XP 🍌</Text>
          <Text style={[font.small, { marginTop: 4 }]}>
            {done ? 'Concluído. Refazer não dá XP, mas dá disciplina.' : 'Faça de verdade — o app confia em você. A grana é sua.'}
          </Text>
        </Card>
      </View>

      <View style={{ padding: spacing.lg }}>
        <Button
          title={doneToday ? 'Já concluído hoje ✓' : done ? 'Marcar como feito de novo' : 'Marquei como feito'}
          variant={done ? 'ghost' : 'banana'}
          onPress={markDone}
          style={done ? { backgroundColor: colors.white } : undefined}
        />
      </View>
    </SafeAreaView>
  );
}
