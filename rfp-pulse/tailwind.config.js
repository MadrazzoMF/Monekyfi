/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'media',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dbe6fe',
          200: '#bfd3fe',
          300: '#93b4fd',
          400: '#608bfa',
          500: '#3b66f5',
          600: '#2547ea',
          700: '#1d36d7',
          800: '#1e2eae',
          900: '#1e2c89',
        },
        ink: {
          DEFAULT: 'rgb(var(--ink) / <alpha-value>)',
          muted: 'rgb(var(--ink-muted) / <alpha-value>)',
          faint: 'rgb(var(--ink-faint) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          raised: 'rgb(var(--surface-raised) / <alpha-value>)',
          sunken: 'rgb(var(--surface-sunken) / <alpha-value>)',
        },
        line: 'rgb(var(--line) / <alpha-value>)',
        go: { DEFAULT: '#15803d', soft: '#dcfce7', ink: '#14532d' },
        nogo: { DEFAULT: '#b91c1c', soft: '#fee2e2', ink: '#7f1d1d' },
        cond: { DEFAULT: '#b45309', soft: '#fef3c7', ink: '#78350f' },
        indef: { DEFAULT: '#475569', soft: '#e2e8f0', ink: '#1e293b' },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgb(15 23 42 / 0.06), 0 1px 3px rgb(15 23 42 / 0.1)',
        pop: '0 10px 30px -10px rgb(15 23 42 / 0.25)',
      },
      borderRadius: { xl2: '1rem' },
    },
  },
  plugins: [],
};
