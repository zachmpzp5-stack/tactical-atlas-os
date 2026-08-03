/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'stone-bg': '#0B0D10',
        'stone-panel': '#12161E',
        'stone-card': '#171C26',
        'stone-border': '#222A38',
        'bronze-gold': '#C89B3C',
        'bronze-light': '#E0B55C',
        'bronze-dark': '#6B501B',
        'parchment-gold': '#D4AF37',
        'tactical-green': '#10B981',
        'tactical-glow': '#34D399',
        'tactical-dim': '#064E3B',
        'threat-red': '#EF4444',
        'weathered-steel': '#2A3240',
        'aged-parchment': '#E6D5B8',
        'moss-dark': '#132219',
        'mud-brown': '#3D2D1D',
        'archive-bronze': '#947128',
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        serif: ['"Cinzel"', 'Georgia', 'serif'],
        display: ['"Rajdhani"', '"Orbitron"', 'sans-serif'],
      },
      boxShadow: {
        bronze: '0 0 15px rgba(200, 155, 60, 0.25)',
        tactical: '0 0 15px rgba(16, 185, 129, 0.25)',
        'glow-green': '0 0 20px rgba(16, 185, 129, 0.4)',
        'glow-amber': '0 0 20px rgba(200, 155, 60, 0.4)',
        'inset-panel': 'inset 0 2px 6px rgba(0, 0, 0, 0.7)',
      },
      backgroundImage: {
        'map-texture': 'radial-gradient(circle, rgba(200, 155, 60, 0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
