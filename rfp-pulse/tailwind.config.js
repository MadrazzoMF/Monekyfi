/** @type {import('tailwindcss').Config} */
const v = (nome) => `rgb(var(--${nome}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: v('bg'),
        surface: v('surface'),
        raised: v('raised'),
        overlay: v('overlay'),
        line: { DEFAULT: v('line'), strong: v('line-strong') },
        ink: { DEFAULT: v('ink'), muted: v('ink-muted'), faint: v('ink-faint'), inverse: v('ink-inverse') },
        accent: { DEFAULT: v('accent'), strong: v('accent-strong'), soft: v('accent-soft') },
        go: v('go'),
        nogo: v('nogo'),
        cond: v('cond'),
        info: v('info'),
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 0 0 rgb(var(--line) / 1) inset, 0 8px 24px -12px rgb(0 0 0 / 0.45)',
        pop: '0 12px 40px -12px rgb(0 0 0 / 0.6)',
        glow: '0 0 0 1px rgb(var(--accent) / 0.4), 0 8px 24px -8px rgb(var(--accent) / 0.5)',
      },
      borderRadius: { xl2: '14px', xl3: '18px' },
      keyframes: {
        entrar: { from: { opacity: 0, transform: 'translateY(6px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
        toast: { from: { opacity: 0, transform: 'translateY(12px) scale(0.98)' }, to: { opacity: 1, transform: 'translateY(0) scale(1)' } },
      },
      animation: { entrar: 'entrar .25s ease-out both', toast: 'toast .2s ease-out both' },
    },
  },
  plugins: [],
};
