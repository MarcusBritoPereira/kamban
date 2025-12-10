/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          black: '#09090b', // Deep Black
          dark: '#18181b',  // Dark Gray
          yellow: '#f8c535', // User specific Yellow
          white: '#FAFAFA', // Off-white
        }
      }
    },
  },
  plugins: [],
}
