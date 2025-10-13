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
      },
      animation: {
        "orbit": "orbit 3s linear infinite",
      },
    },
  },
  plugins: [],
}
