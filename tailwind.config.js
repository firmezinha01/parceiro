/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lala: {
          orange: '#FF6600',
          orangeDark: '#E05500',
          orangeLight: '#FFF2E8',
          charcoal: '#1A1A1A',
          grayDark: '#2C2D2F',
          grayLight: '#F5F6F8',
          border: '#E5E7EB',
          green: '#10B981',
          blue: '#2563EB',
          red: '#EF4444',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
