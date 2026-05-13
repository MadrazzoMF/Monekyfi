import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';
import { AVATARS } from '../data/avatars';
import { Button, Card, ProgressBar } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

const STEPS = ['avatar', 'name', 'level'];

const START_LEVELS = [
  { id: 'never', emoji: '🙈', title: 'Nunca controlei dinheiro', desc: 'Bora do zero. Sem vergonha — todo macaco já foi pobre um dia.' },
  { id: 'basic', emoji: '🐒', title: 'Já sei o básico', desc: 'Você anota gastos de vez em quando. Vamos firmar o hábito e avançar.' },
  { id: 'advanced', emoji: '🦍', title: 'Quero avançar', desc: 'Controle você já tem. Foco em investir e mentalidade de macaco rico.' },
];

export default function OnboardingScreen() {
  const { completeOnboarding } = useGame();
  const [step, setStep] = useState(0);
  const [avatarId, setAvatarId] = useState('classic');
  const [name, setName] = useState('');
  const [startLevel, setStartLevel] = useState(null);

  const startable = AVATARS.filter((a) => a.unlock === 'start');
  const canNext = step === 0 ? !!avatarId : step === 1 ? true : !!startLevel;

  function next() {
    if (step < STEPS.length - 1) setStep(step + 1);
    else completeOnboarding({ name, avatarId, startLevel: startLevel || 'never' });
  }
  function back() {
    if (step > 0) setStep(step - 1);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.jungle }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        <View style={{ alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 56 }}>🐵</Text>
          <Text style={{ fontSize: 30, fontWeight: '900', color: colors.white, marginTop: 4 }}>MonkeyFi</Text>
          <Text style={{ color: '#DFF3E5', fontWeight: '600', marginTop: 2 }}>O Duolingo financeiro dos macacos</Text>
        </View>

        <ProgressBar value={(step + 1) / STEPS.length} color={colors.banana} track="#0A5C2B" style={{ marginBottom: spacing.lg }} />

        <Card>
          {step === 0 && (
            <View>
              <Text style={font.h2}>Escolha seu macaco</Text>
              <Text style={[font.small, { marginTop: 4, marginBottom: spacing.md }]}>Você desbloqueia novos avatares conforme sobe de nível.</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
                {startable.map((a) => {
                  const sel = avatarId === a.id;
                  return (
                    <Pressable
                      key={a.id}
                      onPress={() => setAvatarId(a.id)}
                      style={{
                        width: '31%',
                        aspectRatio: 1,
                        borderRadius: radius.md,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: sel ? colors.banana : colors.cream,
                        borderWidth: 2,
                        borderColor: sel ? colors.bananaDark : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 40 }}>{a.emoji}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text style={[font.small, { marginTop: spacing.sm, textAlign: 'center' }]}>
                {startable.find((a) => a.id === avatarId)?.name}
              </Text>
            </View>
          )}

          {step === 1 && (
            <View>
              <Text style={font.h2}>Como te chamam na selva?</Text>
              <Text style={[font.small, { marginTop: 4, marginBottom: spacing.md }]}>Esse nome aparece no ranking semanal.</Text>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Ex: MacacoDoPix"
                placeholderTextColor={colors.muted}
                maxLength={20}
                style={{
                  borderWidth: 2,
                  borderColor: colors.border,
                  borderRadius: radius.md,
                  paddingHorizontal: spacing.md,
                  paddingVertical: 14,
                  fontSize: 18,
                  fontWeight: '700',
                  color: colors.ink,
                  backgroundColor: colors.cream,
                }}
              />
              <Text style={[font.small, { marginTop: spacing.sm }]}>Pode deixar em branco — viramos "Macaco Anônimo".</Text>
            </View>
          )}

          {step === 2 && (
            <View>
              <Text style={font.h2}>De onde você tá partindo?</Text>
              <Text style={[font.small, { marginTop: 4, marginBottom: spacing.md }]}>Isso ajusta sua trilha. Dá pra mudar depois.</Text>
              <View style={{ gap: spacing.sm }}>
                {START_LEVELS.map((l) => {
                  const sel = startLevel === l.id;
                  return (
                    <Pressable
                      key={l.id}
                      onPress={() => setStartLevel(l.id)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: spacing.md,
                        padding: spacing.md,
                        borderRadius: radius.md,
                        backgroundColor: sel ? colors.jungle + '12' : colors.cream,
                        borderWidth: 2,
                        borderColor: sel ? colors.jungle : colors.border,
                      }}
                    >
                      <Text style={{ fontSize: 30 }}>{l.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={font.bodyStrong}>{l.title}</Text>
                        <Text style={[font.small, { marginTop: 2 }]}>{l.desc}</Text>
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </Card>

        <View style={{ flex: 1 }} />
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg }}>
          {step > 0 && <Button title="Voltar" variant="ghost" onPress={back} style={{ flex: 1, backgroundColor: colors.white }} />}
          <Button
            title={step === STEPS.length - 1 ? 'Começar a aprender' : 'Continuar'}
            variant="banana"
            onPress={next}
            disabled={!canNext}
            style={{ flex: 2 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
