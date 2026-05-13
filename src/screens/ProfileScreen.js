import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { useGame } from '../state/GameContext';
import { AVATARS, getAvatar, isAvatarUnlocked } from '../data/avatars';
import { ACHIEVEMENTS } from '../data/achievements';
import { LESSONS } from '../data/lessons';
import { CHALLENGES } from '../data/challenges';
import { LEVELS } from '../data/levels';
import { Screen, Card, Button, ProgressBar, SectionTitle, Tag } from '../components/ui';
import StatsHeader from '../components/StatsHeader';
import { colors, spacing, radius, font } from '../theme';

function Stat({ label, value }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: '900', color: colors.bark }}>{value}</Text>
      <Text style={font.small}>{label}</Text>
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const game = useGame();
  const { profile, level, xp, streak, isPremium, completedLessons, completedChallenges, unlockedAchievements, setAvatar, setPremium, resetProgress } = game;

  const onPickAvatar = (a) => {
    const unlocked = isAvatarUnlocked(a, { levelId: level.id, isPremium });
    if (!unlocked) {
      if (a.unlock === 'premium') return navigation.navigate('Premium');
      const need = LEVELS.find((l) => l.id === a.unlock.split(':')[1]);
      return Alert.alert('Avatar bloqueado', `Desbloqueia quando você virar ${need ? need.name : 'um nível mais alto'}.`);
    }
    setAvatar(a.id);
  };

  const confirmReset = () => {
    Alert.alert('Recomeçar do zero?', 'Isso apaga seu XP, streak, lições e conquistas. Não dá pra desfazer.', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Apagar tudo', style: 'destructive', onPress: () => resetProgress() },
    ]);
  };

  return (
    <Screen>
      <Text style={[font.h2, { marginBottom: spacing.md }]}>Perfil</Text>
      <StatsHeader />

      <Card style={{ marginTop: spacing.md, flexDirection: 'row', paddingVertical: spacing.md }}>
        <Stat label="XP total" value={xp} />
        <View style={{ width: 1, backgroundColor: colors.border }} />
        <Stat label="Streak" value={`${streak}🔥`} />
        <View style={{ width: 1, backgroundColor: colors.border }} />
        <Stat label="Lições" value={`${completedLessons.length}/${LESSONS.length}`} />
        <View style={{ width: 1, backgroundColor: colors.border }} />
        <Stat label="Desafios" value={`${completedChallenges.length}/${CHALLENGES.length}`} />
      </Card>

      <SectionTitle right={<Text style={font.small}>{unlockedAchievements.length}/{ACHIEVEMENTS.length}</Text>}>Conquistas</SectionTitle>
      <Card onPress={() => navigation.navigate('Achievements')}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
          <Text style={{ fontSize: 28 }}>🏅</Text>
          <View style={{ flex: 1 }}>
            <Text style={font.bodyStrong}>Ver minhas conquistas</Text>
            <Text style={font.small}>{unlockedAchievements.length} desbloqueadas até agora</Text>
          </View>
          <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>
        </View>
      </Card>

      <SectionTitle>Níveis de macaco</SectionTitle>
      <Card>
        {LEVELS.map((l, i) => {
          const reached = xp >= l.minXp;
          const current = level.id === l.id;
          return (
            <View key={l.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: 8, opacity: reached ? 1 : 0.5 }}>
              <Text style={{ fontSize: 24 }}>{l.emoji}</Text>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={font.bodyStrong}>{l.name}</Text>
                  {current && <Tag text="Atual" color={colors.jungle} />}
                </View>
                <Text style={font.small}>{l.minXp === 0 ? 'desde o início' : `${l.minXp} XP`}</Text>
              </View>
              {reached && <Text style={{ color: colors.success, fontWeight: '900' }}>✓</Text>}
            </View>
          );
        })}
      </Card>

      <SectionTitle>Seu macaco</SectionTitle>
      <Card>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {AVATARS.map((a) => {
            const unlocked = isAvatarUnlocked(a, { levelId: level.id, isPremium });
            const sel = profile.avatarId === a.id;
            return (
              <Pressable
                key={a.id}
                onPress={() => onPickAvatar(a)}
                style={{
                  width: '22%', aspectRatio: 1, borderRadius: radius.md,
                  alignItems: 'center', justifyContent: 'center',
                  backgroundColor: sel ? colors.banana : colors.cream,
                  borderWidth: 2, borderColor: sel ? colors.bananaDark : colors.border,
                  opacity: unlocked ? 1 : 0.45,
                }}
              >
                <Text style={{ fontSize: 30 }}>{unlocked ? a.emoji : '🔒'}</Text>
              </Pressable>
            );
          })}
        </View>
        <Text style={[font.small, { marginTop: spacing.sm }]}>{getAvatar(profile.avatarId).name}</Text>
      </Card>

      <SectionTitle>Assinatura</SectionTitle>
      <Card accent={isPremium ? colors.premium : colors.border}>
        {isPremium ? (
          <>
            <Text style={font.bodyStrong}>👑 MonkeyFi Premium ativo</Text>
            <Text style={[font.small, { marginVertical: spacing.sm }]}>Todos os módulos, desafios avançados, conquistas e avatares exclusivos liberados.</Text>
            <Button title="Desativar (demo)" variant="ghost" small onPress={() => setPremium(false)} style={{ backgroundColor: colors.white, alignSelf: 'flex-start' }} />
          </>
        ) : (
          <>
            <Text style={font.bodyStrong}>Versão gratuita</Text>
            <Text style={[font.small, { marginVertical: spacing.sm }]}>Você tem o módulo 1 completo, desafios diários básicos e o ranking. O resto está logo ali.</Text>
            <Button title="Conhecer o Premium — R$ 9,90/mês" variant="premium" onPress={() => navigation.navigate('Premium')} />
          </>
        )}
      </Card>

      <View style={{ height: spacing.lg }} />
      <Button title="Recomeçar do zero" variant="danger" onPress={confirmReset} />
      <Text style={[font.small, { textAlign: 'center', marginTop: spacing.md }]}>MonkeyFi · Madrazzo MF · v0.1.0 (beta)</Text>
    </Screen>
  );
}
