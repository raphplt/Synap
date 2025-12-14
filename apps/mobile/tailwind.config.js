/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        dusk: '#1e293b',
        neon: '#22d3ee',
        amber: '#f59e0b',
        sand: '#e2e8f0'
      }
    }
  },
  plugins: []
};
