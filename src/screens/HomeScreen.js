import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useGame } from '../state/GameContext';
import { MODULES, lessonsForModule } from '../data/lessons';
import { getDailyChallenge, todayKey } from '../data/dailyChallenge';
import { Screen, Card, ProgressBar, Tag, LockBadge, SectionTitle, Button } from '../components/ui';
import StatsHeader from '../components/StatsHeader';
import { colors, spacing, radius, font } from '../theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function LessonRow({ lesson, index, locked, done, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [{
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
        paddingVertical: 10,
        opacity: pressed ? 0.7 : 1,
      }]}
    >
      <View style={{
        width: 34, height: 34, borderRadius: radius.pill,
        alignItems: 'center', justifyContent: 'center',
        backgroundColor: done ? colors.jungle : locked ? colors.border : colors.banana,
      }}>
        <Text style={{ fontSize: 15, fontWeight: '900', color: done ? colors.white : locked ? colors.muted : colors.bark }}>
          {done ? '✓' : locked ? '🔒' : index + 1}
        </Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[font.bodyStrong, locked && { color: colors.muted }]} numberOfLines={1}>{lesson.title}</Text>
        <Text style={font.small}>{lesson.minutes} min · {lesson.xp} XP{done ? ' · concluída' : ''}</Text>
      </View>
      <Text style={{ color: colors.muted, fontSize: 18 }}>›</Text>
    </Pressable>
  );
}

function ModuleCard({ module, navigation }) {
  const { completedLessons, isPremium } = useGame();
  const lessons = lessonsForModule(module.id);
  const doneCount = lessons.filter((l) => completedLessons.includes(l.id)).length;
  const moduleLocked = module.tier === 'premium' && !isPremium;
  const progress = lessons.length ? doneCount / lessons.length : 0;

  return (
    <Card style={{ marginBottom: spacing.md }} accent={moduleLocked ? colors.premium : colors.jungle}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
        <Text style={{ fontSize: 26 }}>{module.emoji}</Text>
        <View style={{ flex: 1 }}>
          <Text style={font.h3}>{module.title}</Text>
          <Text style={font.small} numberOfLines={2}>{module.blurb}</Text>
        </View>
        {moduleLocked && <LockBadge />}
      </View>

      <View style={{ marginTop: spacing.sm }}>
        <ProgressBar value={progress} />
        <Text style={[font.small, { marginTop: 6 }]}>{doneCount}/{lessons.length} lições</Text>
      </View>

      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: spacing.sm }} />

      {lessons.map((l, i) => {
        const done = completedLessons.includes(l.id);
        // Dentro de um módulo aberto, as lições liberam em sequência (a 1ª sempre aberta).
        const prevDone = i === 0 || completedLessons.includes(lessons[i - 1].id);
        const locked = moduleLocked || (!done && !prevDone);
        return (
          <LessonRow
            key={l.id}
            lesson={l}
            index={i}
            locked={locked}
            done={done}
            onPress={() => {
              if (moduleLocked) return navigation.navigate('Premium');
              if (locked) return; // bloqueada pela sequência
              navigation.navigate('Lesson', { lessonId: l.id });
            }}
          />
        );
      })}
    </Card>
  );
}

export default function HomeScreen({ navigation }) {
  const { profile, isPremium, challengeLog } = useGame();
  const tk = todayKey();
  const challenge = getDailyChallenge(tk, isPremium);
  const doneToday = challengeLog[tk] != null;

  return (
    <Screen>
      <Text style={[font.h2, { marginBottom: spacing.md }]}>
        {greeting()}, {profile.name || 'macaco'} 🐵
      </Text>

      <StatsHeader />

      <SectionTitle right={<Tag text="Hoje" color={colors.bananaDark} />}>Desafio do dia</SectionTitle>
      <Card accent={doneToday ? colors.success : colors.banana} onPress={() => navigation.navigate('ChallengeDetail', { challengeId: challenge.id, daily: true })}>
        <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
          <Text style={{ fontSize: 26 }}>{doneToday ? '✅' : '🎯'}</Text>
          <View style={{ flex: 1 }}>
            <Tag text={challenge.tag} color={colors.jungle} />
            <Text style={[font.bodyStrong, { marginTop: 6 }]}>{challenge.title}</Text>
            <Text style={[font.body, { marginTop: 4 }]} numberOfLines={2}>{challenge.desc}</Text>
            <Text style={[font.small, { marginTop: 6 }]}>{doneToday ? 'Feito! Volta amanhã pro próximo. 🔥' : `+${challenge.xp} XP ao concluir`}</Text>
          </View>
        </View>
      </Card>

      <SectionTitle right={!isPremium ? <Pressable onPress={() => navigation.navigate('Premium')}><Text style={{ color: colors.premium, fontWeight: '800', fontSize: 13 }}>Desbloquear tudo</Text></Pressable> : null}>
        Sua trilha
      </SectionTitle>
      {MODULES.map((m) => (
        <ModuleCard key={m.id} module={m} navigation={navigation} />
      ))}

      {!isPremium && (
        <Card accent={colors.premium} style={{ marginTop: spacing.xs }}>
          <Text style={font.h3}>🔓 MonkeyFi Premium</Text>
          <Text style={[font.body, { marginVertical: spacing.sm }]}>
            Todos os módulos, desafios avançados, conquistas exclusivas e o avatar 🚀 — por R$ 9,90/mês.
          </Text>
          <Button title="Ver o Premium" variant="premium" onPress={() => navigation.navigate('Premium')} />
        </Card>
      )}
    </Screen>
  );
}
