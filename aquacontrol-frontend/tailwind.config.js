/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        agua: {
          50:  '#e8f4fd',
          100: '#c3e2f9',
          200: '#9bcef5',
          300: '#6cb8ef',
          400: '#3fa6eb',
          500: '#1a8fd1',
          600: '#1370a3',
          700: '#0d5278',
          800: '#07364f',
          900: '#031c29',
        },
        exito:   '#16a34a',
        alerta:  '#d97706',
        peligro: '#dc2626',
        moroso:  '#9333ea',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
