import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0f',
        'bg-card': '#111118',
        'bg-elevated': '#1a1a24',
        amber: '#f5a623',
        'amber-dim': '#b87d1a',
        snow: '#f0f0f0',
        muted: '#888888',
        danger: '#e84545',
        border: '#2a2a38',
      },
      fontFamily: {
        display: ['"Barlow Condensed"', 'sans-serif'],
        body: ['"DM Sans"', 'sans-serif'],
      },
      fontSize: {
        'stadium': ['clamp(4rem, 12vw, 9rem)', { lineHeight: '0.9', letterSpacing: '-0.02em' }],
        'hero': ['clamp(2.5rem, 6vw, 5rem)', { lineHeight: '0.95', letterSpacing: '-0.01em' }],
      },
    },
  },
  plugins: [],
}
export default config
