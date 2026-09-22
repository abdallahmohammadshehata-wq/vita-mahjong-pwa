/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vita: {
          bg: '#FAF7F2',
          card: '#FFFFFF',
          sage: '#E8ECE9',
          cream: '#FDFBF7',
          wood: '#3D2817',
          woodDark: '#24140A',
          woodLight: '#5C3E28',
          gold: '#D99B26',
          goldLight: '#F5C253',
          jade: '#2D6A4F',
          jadeLight: '#40916C',
          crimson: '#9E2A2B',
          charcoal: '#1F2421',
          textMuted: '#6B7280'
        }
      },
      boxShadow: {
        'tile': '2px 4px 0px #C8BDB0, 3px 6px 8px rgba(0,0,0,0.18)',
        'tile-selected': '0 0 0 3px #D99B26, 0 8px 16px rgba(217, 155, 38, 0.4)',
        'tile-hint': '0 0 0 3px #2D6A4F, 0 0 15px rgba(45, 106, 79, 0.6)',
        'wood': 'inset 0 2px 4px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.3)',
      },
      fontFamily: {
        chinese: ['"Noto Serif SC"', '"Songti SC"', 'STSong', 'serif'],
        display: ['Outfit', 'Inter', 'system-ui', 'sans-serif']
      }
    },
  },
  plugins: [],
}
