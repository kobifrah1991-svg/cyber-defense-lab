/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['../media-downloader.html', '../app.html', '../privacy.html', '../terms.html', '../js/media-downloader.js', '../js/app-landing.js', '../android-app/web/*.{html,js}'],
  theme: {
    extend: {
      colors: {
        skitdra: { bg: '#0B0914', card: '#151226', border: '#2A244D' },
      },
      fontFamily: { sans: ['Heebo Variable', 'Heebo', 'Segoe UI', 'Tahoma', 'Arial', 'sans-serif'] },
      animation: { 'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite' },
    },
  },
};
