// MonkeyFi visual identity — banana-yellow + jungle-green, playful and bold.
export const colors = {
  jungle: '#0E7C3A',
  jungleDark: '#0A5C2B',
  jungleLight: '#1FA34F',
  banana: '#FFC93C',
  bananaDark: '#E8A800',
  bark: '#3D2B1F',
  barkSoft: '#5C4433',
  cream: '#FFF7E6',
  white: '#FFFFFF',
  ink: '#1C1A17',
  muted: '#8A8378',
  border: '#E7DCC4',
  danger: '#E5484D',
  success: '#1FA34F',
  premium: '#7C3AED',
  card: '#FFFFFF',
  screenBg: '#FFF7E6',
  xpBar: '#FFC93C',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
};

export const font = {
  // We rely on system fonts to keep the bundle lean; weights carry the brand.
  h1: { fontSize: 28, fontWeight: '800', color: colors.ink },
  h2: { fontSize: 22, fontWeight: '800', color: colors.ink },
  h3: { fontSize: 18, fontWeight: '700', color: colors.ink },
  body: { fontSize: 16, fontWeight: '400', color: colors.ink, lineHeight: 24 },
  bodyStrong: { fontSize: 16, fontWeight: '700', color: colors.ink },
  small: { fontSize: 13, fontWeight: '500', color: colors.muted },
  button: { fontSize: 16, fontWeight: '800', color: colors.white },
};

export const shadow = {
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
};
