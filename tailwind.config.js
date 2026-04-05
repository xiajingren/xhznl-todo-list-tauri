/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-transparent': 'rgba(17, 24, 39, 0.9)',
      },
      backdropBlur: {
        'xs': '2px',
      },
    },
  },
  plugins: [],
}