import React from 'react';
import { Text, View, Pressable, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius, font, shadow } from '../theme';

export function Screen({ children, scroll = true, style, contentStyle, edges = ['top', 'bottom'] }) {
  const Inner = scroll ? ScrollView : View;
  const innerProps = scroll
    ? { contentContainerStyle: [{ padding: spacing.lg, paddingBottom: spacing.xxl }, contentStyle], showsVerticalScrollIndicator: false }
    : { style: [{ flex: 1, padding: spacing.lg }, contentStyle] };
  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: colors.screenBg }, style]} edges={edges}>
      <Inner {...innerProps}>{children}</Inner>
    </SafeAreaView>
  );
}

export function Card({ children, style, onPress, accent }) {
  const base = [styles.card, accent && { borderLeftWidth: 5, borderLeftColor: accent }, style];
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [...base, pressed && { opacity: 0.85 }]}>
        {children}
      </Pressable>
    );
  }
  return <View style={base}>{children}</View>;
}

export function Button({ title, onPress, variant = 'primary', disabled, style, small }) {
  const palette = {
    primary: { bg: colors.jungle, fg: colors.white },
    banana: { bg: colors.banana, fg: colors.bark },
    ghost: { bg: 'transparent', fg: colors.jungle, border: colors.jungle },
    danger: { bg: colors.danger, fg: colors.white },
    premium: { bg: colors.premium, fg: colors.white },
  }[variant] || { bg: colors.jungle, fg: colors.white };
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.button,
        small && { paddingVertical: 10, paddingHorizontal: 16 },
        { backgroundColor: palette.bg },
        palette.border && { borderWidth: 2, borderColor: palette.border },
        disabled && { opacity: 0.4 },
        pressed && !disabled && { opacity: 0.85, transform: [{ scale: 0.98 }] },
        style,
      ]}
    >
      <Text style={[font.button, { color: palette.fg }, small && { fontSize: 14 }]}>{title}</Text>
    </Pressable>
  );
}

export function ProgressBar({ value = 0, height = 12, color = colors.banana, track = '#EFE4C8', style }) {
  const pct = Math.max(0, Math.min(1, value));
  return (
    <View style={[{ height, backgroundColor: track, borderRadius: radius.pill, overflow: 'hidden' }, style]}>
      <View style={{ width: `${pct * 100}%`, height: '100%', backgroundColor: color, borderRadius: radius.pill }} />
    </View>
  );
}

export function Pill({ icon, label, bg = colors.cream, fg = colors.bark, style }) {
  return (
    <View style={[styles.pill, { backgroundColor: bg }, style]}>
      {icon ? <Text style={{ fontSize: 14 }}>{icon}</Text> : null}
      <Text style={{ fontSize: 13, fontWeight: '800', color: fg }}>{label}</Text>
    </View>
  );
}

export function SectionTitle({ children, right }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.lg, marginBottom: spacing.sm }}>
      <Text style={font.h3}>{children}</Text>
      {right || null}
    </View>
  );
}

export function Tag({ text, color = colors.jungle }) {
  return (
    <View style={{ alignSelf: 'flex-start', backgroundColor: color + '1A', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill }}>
      <Text style={{ color, fontWeight: '800', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 }}>{text}</Text>
    </View>
  );
}

export function LockBadge({ label = 'Premium' }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.premium + '1A', paddingHorizontal: 8, paddingVertical: 4, borderRadius: radius.pill }}>
      <Text style={{ fontSize: 12 }}>🔒</Text>
      <Text style={{ color: colors.premium, fontWeight: '800', fontSize: 11 }}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadow.card,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: radius.pill,
  },
});
