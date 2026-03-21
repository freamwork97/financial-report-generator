/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#0f3460',
        secondary: '#16213e',
        accent: '#e94560',
        surface: '#f0f4ff',
      }
    }
  },
  plugins: []
}
