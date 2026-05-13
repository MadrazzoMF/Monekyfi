import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';
import { ACHIEVEMENTS } from '../data/achievements';
import { Card } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

export default function AchievementsScreen({ navigation }) {
  const { unlockedAchievements } = useGame();
  const unlocked = unlockedAchievements.length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.screenBg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 22, color: colors.muted }}>‹ Voltar</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: spacing.xxl }} showsVerticalScrollIndicator={false}>
        <Text style={[font.h2, { marginBottom: 4 }]}>Conquistas 🏅</Text>
        <Text style={[font.small, { marginBottom: spacing.md }]}>{unlocked} de {ACHIEVEMENTS.length} desbloqueadas</Text>
        {ACHIEVEMENTS.map((a) => {
          const got = unlockedAchievements.includes(a.id);
          return (
            <Card key={a.id} style={{ marginBottom: spacing.sm }} accent={got ? colors.success : colors.border}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
                <View style={{
                  width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center',
                  backgroundColor: got ? colors.banana : colors.cream, opacity: got ? 1 : 0.6,
                }}>
                  <Text style={{ fontSize: 22 }}>{got ? a.emoji : '🔒'}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[font.bodyStrong, !got && { color: colors.muted }]}>{a.name}</Text>
                  <Text style={font.small}>{a.desc}</Text>
                </View>
                {got && <Text style={{ color: colors.success, fontWeight: '900' }}>✓</Text>}
              </View>
            </Card>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
