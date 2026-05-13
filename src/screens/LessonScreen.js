import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';
import { getLessonById, getModuleById } from '../data/lessons';
import { Button, Card, ProgressBar, Tag } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

// Fases da lição: 'cards' -> 'quiz' -> 'done'
export default function LessonScreen({ route, navigation }) {
  const { lessonId } = route.params || {};
  const lesson = getLessonById(lessonId);
  const module = lesson ? getModuleById(lesson.moduleId) : null;
  const { completeLesson } = useGame();

  const [phase, setPhase] = useState('cards');
  const [cardIdx, setCardIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [answers, setAnswers] = useState([]); // booleans: acertou?
  const [result, setResult] = useState(null);

  const totalSteps = useMemo(() => (lesson ? lesson.cards.length + lesson.quiz.length : 1), [lesson]);
  const stepsDone = phase === 'cards' ? cardIdx : phase === 'quiz' ? lesson.cards.length + qIdx : totalSteps;

  if (!lesson) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg, padding: spacing.lg }}>
        <Text style={font.h2}>Lição não encontrada.</Text>
        <Button title="Voltar" onPress={() => navigation.goBack()} style={{ marginTop: spacing.md }} />
      </SafeAreaView>
    );
  }

  function nextCard() {
    if (cardIdx < lesson.cards.length - 1) setCardIdx(cardIdx + 1);
    else setPhase('quiz');
  }

  function submitAnswer() {
    if (picked == null) return;
    const correct = picked === lesson.quiz[qIdx].answer;
    const nextAnswers = [...answers, correct];
    setAnswers(nextAnswers);
    if (qIdx < lesson.quiz.length - 1) {
      setQIdx(qIdx + 1);
      setPicked(null);
    } else {
      const correctCount = nextAnswers.filter(Boolean).length;
      const r = completeLesson(lesson.id, { correct: correctCount, total: lesson.quiz.length });
      setResult({ ...r, correctCount, total: lesson.quiz.length });
      setPhase('done');
    }
  }

  const card = lesson.cards[cardIdx];
  const question = lesson.quiz[qIdx];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      {/* Top bar */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 22, color: colors.muted }}>✕</Text>
        </Pressable>
        <View style={{ flex: 1 }}>
          <ProgressBar value={totalSteps ? stepsDone / totalSteps : 0} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        {phase !== 'done' && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 18 }}>{module?.emoji}</Text>
            <Text style={font.small}>{module?.title} · {lesson.title}</Text>
          </View>
        )}

        {phase === 'cards' && (
          <Card accent={card.type === 'tip' ? colors.banana : colors.jungle}>
            {card.type === 'tip' && <Tag text="Dica" color={colors.bananaDark} />}
            {card.title ? <Text style={[font.h2, { marginTop: card.type === 'tip' ? 8 : 0 }]}>{card.title}</Text> : null}
            <Text style={[font.body, { marginTop: spacing.sm }]}>{card.body}</Text>
          </Card>
        )}

        {phase === 'quiz' && (
          <View>
            <Tag text={`Pergunta ${qIdx + 1} de ${lesson.quiz.length}`} color={colors.jungle} />
            <Text style={[font.h3, { marginTop: spacing.sm, marginBottom: spacing.md }]}>{question.q}</Text>
            <View style={{ gap: spacing.sm }}>
              {question.options.map((opt, i) => {
                const sel = picked === i;
                return (
                  <Pressable
                    key={i}
                    onPress={() => setPicked(i)}
                    style={{
                      padding: spacing.md,
                      borderRadius: radius.md,
                      backgroundColor: sel ? colors.jungle + '14' : colors.white,
                      borderWidth: 2,
                      borderColor: sel ? colors.jungle : colors.border,
                    }}
                  >
                    <Text style={[font.body, sel && { fontWeight: '700' }]}>{opt}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}

        {phase === 'done' && result && (
          <View style={{ alignItems: 'center' }}>
            <Text style={{ fontSize: 64 }}>{result.correctCount === result.total ? '🏆' : '🍌'}</Text>
            <Text style={[font.h1, { marginTop: spacing.sm, textAlign: 'center' }]}>
              {result.alreadyDone ? 'Revisão concluída!' : 'Lição concluída!'}
            </Text>
            <Text style={[font.body, { textAlign: 'center', marginTop: 4 }]}>
              Você acertou {result.correctCount} de {result.total} no quiz.
            </Text>

            <Card style={{ marginTop: spacing.lg, width: '100%', alignItems: 'center' }}>
              <Text style={font.h2}>+{result.xpGained} XP 🍌</Text>
              {result.perfect && <Text style={[font.small, { marginTop: 4, color: colors.success }]}>Gabaritou! +10 XP de bônus incluso</Text>}
              {result.alreadyDone && <Text style={[font.small, { marginTop: 4 }]}>(XP reduzido — você já tinha feito essa)</Text>}
            </Card>

            {result.leveledUp && result.newLevel && (
              <Card accent={colors.banana} style={{ marginTop: spacing.md, width: '100%' }}>
                <Text style={font.h3}>🎉 Você subiu de nível!</Text>
                <Text style={[font.body, { marginTop: 4 }]}>Agora você é <Text style={{ fontWeight: '800' }}>{result.newLevel.name}</Text> {result.newLevel.emoji}</Text>
              </Card>
            )}

            {result.newAchievements?.length > 0 && (
              <Card accent={colors.premium} style={{ marginTop: spacing.md, width: '100%' }}>
                <Text style={font.h3}>🏅 Conquista desbloqueada!</Text>
                <Text style={[font.body, { marginTop: 4 }]}>Veja em Perfil → Conquistas.</Text>
              </Card>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom action */}
      <View style={{ padding: spacing.lg, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: colors.screenBg }}>
        {phase === 'cards' && (
          <Button title={cardIdx < lesson.cards.length - 1 ? 'Continuar' : 'Ir pro quiz'} onPress={nextCard} />
        )}
        {phase === 'quiz' && (
          <Button title="Responder" onPress={submitAnswer} disabled={picked == null} variant="banana" />
        )}
        {phase === 'done' && (
          <Button title="Voltar pra trilha" onPress={() => navigation.goBack()} />
        )}
      </View>
    </SafeAreaView>
  );
}
