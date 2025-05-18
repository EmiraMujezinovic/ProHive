/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        text: '#0e0c01',
        background: '#fefbec',
        primary: '#eed114',
        secondary: '#ffec72',
        accent: '#96b382',
      },
    },
  },
  plugins: [],
};
