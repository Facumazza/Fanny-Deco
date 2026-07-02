import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brown: { dark: '#5C3A28', DEFAULT: '#6B4029' },
        cream: { bg: '#F5EFE5', card: '#FAF6EF' },
        terracotta: { DEFAULT: '#B04A2C', light: '#C55B2E' },
        ink: '#1A1A1A',
        muted: '#6B6B6B'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      borderRadius: { card: '4px' }
    }
  },
  plugins: []
} satisfies Config;
