import React from 'react';
import { View, Text, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useGame } from '../state/GameContext';
import { Button, Card } from '../components/ui';
import { colors, spacing, radius, font } from '../theme';

const PERKS = [
  { icon: '📈', title: 'Todos os módulos', desc: 'Investimentos, armadilhas financeiras e mentalidade de macaco rico — liberados na hora.' },
  { icon: '🎯', title: 'Desafios avançados', desc: 'Abrir corretora, primeiro aporte, automatizar investimento, negociar dívida e mais.' },
  { icon: '🏅', title: 'Conquistas exclusivas', desc: 'Selos que só quem é premium consegue desbloquear.' },
  { icon: '🚀', title: 'Avatar premium', desc: 'O Macaco Foguete, só pra assinantes.' },
  { icon: '💛', title: 'Apoia o projeto', desc: 'Ajuda os macacos do Madrazzo MF a criar mais conteúdo.' },
];

export default function PremiumScreen({ navigation }) {
  const { setPremium, isPremium } = useGame();

  function subscribe() {
    // Placeholder: aqui entraria o fluxo de pagamento real (App Store / Play / Stripe).
    setPremium(true);
    Alert.alert('Bem-vindo ao Premium! 👑', 'Tudo desbloqueado. Bora pra cima — selva inteira liberada.', [
      { text: 'Aproveitar', onPress: () => navigation.goBack() },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.premium }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', padding: spacing.md }}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={12}>
          <Text style={{ fontSize: 22, color: '#FFFFFFCC' }}>✕</Text>
        </Pressable>
      </View>

      <View style={{ flex: 1, paddingHorizontal: spacing.lg }}>
        <Text style={{ fontSize: 54 }}>👑🐵</Text>
        <Text style={{ fontSize: 30, fontWeight: '900', color: colors.white, marginTop: 6 }}>MonkeyFi Premium</Text>
        <Text style={{ color: '#EFE3FF', fontWeight: '600', marginTop: 4, marginBottom: spacing.lg }}>
          Vira Macaco Magnata mais rápido. R$ 9,90/mês, cancela quando quiser.
        </Text>

        <Card style={{ borderRadius: radius.lg }}>
          {PERKS.map((p, i) => (
            <View key={p.title} style={{ flexDirection: 'row', gap: spacing.md, paddingVertical: 10, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: colors.border }}>
              <Text style={{ fontSize: 22 }}>{p.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={font.bodyStrong}>{p.title}</Text>
                <Text style={font.small}>{p.desc}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>

      <View style={{ padding: spacing.lg }}>
        {isPremium ? (
          <Button title="Você já é Premium 👑" variant="banana" onPress={() => navigation.goBack()} />
        ) : (
          <>
            <Button title="Assinar por R$ 9,90/mês" variant="banana" onPress={subscribe} />
            <Text style={{ color: '#EFE3FF', textAlign: 'center', fontSize: 12, marginTop: spacing.sm }}>
              Beta: o primeiro mês é grátis pra quem entrou cedo. 🍌
            </Text>
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
