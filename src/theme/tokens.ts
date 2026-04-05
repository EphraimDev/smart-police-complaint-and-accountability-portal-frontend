/**
 * Design-token primitives consumed by tailwind.config.ts and usable in code.
 *
 * Nigeria Police Force official palette:
 *   primary  → NPF blue  (#0E0E80)
 *   accent   → NPF gold  (#D4AF37)
 *   npgreen  → NPF green (#008753)
 *   danger / warning / success → functional colours
 */

/* ── Colour palette ── */
export const themeColors = {
  primary: {
    50: '#EDEDF8',
    100: '#D4D4F0',
    200: '#ABABDF',
    300: '#7E7ECE',
    400: '#5555BD',
    500: '#3333A6',
    600: '#1E1E93',
    700: '#0E0E80',
    800: '#0B0B66',
    900: '#08084D',
    950: '#050535',
  },
  accent: {
    50: '#FDF8E8',
    100: '#FAEFC8',
    200: '#F3DE8E',
    300: '#ECCC54',
    400: '#D4AF37',
    500: '#BF9D2F',
    600: '#A38526',
    700: '#866D1F',
    800: '#6A5619',
    900: '#524315',
    950: '#352B0D',
  },
  npgreen: {
    50: '#E6F5EE',
    100: '#C0E8D8',
    200: '#80D1B1',
    300: '#40BA8A',
    400: '#1A9E6E',
    500: '#008753',
    600: '#007347',
    700: '#005F3A',
    800: '#004B2E',
    900: '#003822',
    950: '#002416',
  },
  danger: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
  },
  warning: {
    50: '#FFFBEB',
    100: '#FEF3C7',
    200: '#FDE68A',
    300: '#FCD34D',
    400: '#FBBF24',
    500: '#F59E0B',
    600: '#D97706',
    700: '#B45309',
    800: '#92400E',
    900: '#78350F',
  },
  success: {
    50: '#E6F5EE',
    100: '#C0E8D8',
    200: '#80D1B1',
    300: '#40BA8A',
    400: '#1A9E6E',
    500: '#008753',
    600: '#007347',
    700: '#005F3A',
    800: '#004B2E',
    900: '#003822',
  },
} as const;

/* ── Typography ── */
export const fontFamily = {
  sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
  mono: ['Fira Code', 'Menlo', 'monospace'],
} as const;

/* ── Border radius ── */
export const borderRadius = {
  sm: '0.25rem',
  DEFAULT: '0.375rem',
  md: '0.5rem',
  lg: '0.75rem',
  xl: '1rem',
} as const;

/* ── Extra spacing ── */
export const spacing = {
  '18': '4.5rem',
  '88': '22rem',
  '128': '32rem',
} as const;

/* ── Box-shadow tokens ── */
export const boxShadow = {
  card: '0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)',
  dropdown: '0 4px 12px rgb(0 0 0 / 0.08)',
  modal: '0 20px 60px rgb(0 0 0 / 0.15)',
} as const;
