/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: require('./src/theme/colors.json'),
      borderRadius: {
        sm: '8px',
        md: '16px',
        lg: '28px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(46,43,37,0.14)',
        md: '0 3px 10px rgba(46,43,37,0.16)',
        lg: '0 12px 32px rgba(46,43,37,0.22)',
      },
    },
  },
  plugins: [],
};
