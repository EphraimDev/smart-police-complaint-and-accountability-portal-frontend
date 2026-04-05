import type { Config } from 'tailwindcss';
import {
  themeColors,
  fontFamily,
  borderRadius,
  spacing,
  boxShadow,
} from './src/theme/tokens';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: themeColors,
      fontFamily,
      borderRadius,
      spacing,
      boxShadow,
    },
  },
  plugins: [],
} satisfies Config;
