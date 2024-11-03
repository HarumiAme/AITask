/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      screens: {
        'custom': '500px', // Custom breakpoint at 600px
        xs: '400px', // New breakpoint at 480px
      },
    },
  },
  plugins: [],
};