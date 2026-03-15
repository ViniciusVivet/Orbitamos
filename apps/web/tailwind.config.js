/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Paleta da Orbitamos
        'orbit-black': '#000000',
        'orbit-electric': '#00D4FF',
        'orbit-white': '#FFFFFF',
        'orbit-purple': '#8B5CF6',
      },
      keyframes: {
        "orbit": {
          "0%": { transform: "rotate(0deg) translateX(20px) rotate(0deg)" },
          "100%": { transform: "rotate(360deg) translateX(20px) rotate(-360deg)" },
        },
        "float": {
          "0%, 100%": { transform: "translate(0, 0) scale(1)", opacity: "0.25" },
          "50%": { transform: "translate(8px, -12px) scale(1.1)", opacity: "0.45" },
        },
        "shimmer": {
          "0%":   { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
      animation: {
        "orbit": "orbit 3s linear infinite",
        "float": "float 6s ease-in-out infinite",
        "shimmer": "shimmer 2.2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
}
