/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: '#84cc16',
          orange: '#f97316',
        },
      },
    },
  },
  plugins: [],
};
