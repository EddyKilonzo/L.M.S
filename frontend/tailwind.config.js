/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#2563EB', // A modern, accessible blue
        'secondary': '#F1F5F9', // A very light gray for backgrounds
        'accent': '#E11D48', // A vibrant red for accents
        'light': '#F8FAFC', // An even lighter gray
        'dark': '#0F172A', // A deep, dark color for text
        'dark-gray': '#64748B', // A medium gray for secondary text
        'border-color': '#E2E8F0' // A light gray for borders
      },
      fontFamily: {
        'sans': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'modern': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
      }
    },
  },
  plugins: [],
}