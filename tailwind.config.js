/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        espresso: 'rgb(56 37 31 / <alpha-value>)',
        ivory: 'rgb(243 235 216 / <alpha-value>)',
        brown: 'rgb(56 37 31 / <alpha-value>)',
        olive: 'rgb(133 134 77 / <alpha-value>)',
        burgundy: 'rgb(139 52 73 / <alpha-value>)',
        gold: {
          DEFAULT: 'rgb(197 166 106 / <alpha-value>)',
          soft: 'rgb(228 210 174 / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Outfit', 'system-ui', 'sans-serif'],
        script: ['"Great Vibes"', 'cursive'],
      },
      maxWidth: {
        invitation: '40rem',
      },
    },
  },
  plugins: [],
}
