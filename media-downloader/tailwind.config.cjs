/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['../media-downloader.html', '../js/media-downloader.js'],
  theme: {
    extend: {
      colors: {
        skitdra: { bg: '#0B0914', card: '#151226', border: '#2A244D' },
      },
      fontFamily: { sans: ['Heebo', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'] },
      animation: { 'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
    },
  },
};
