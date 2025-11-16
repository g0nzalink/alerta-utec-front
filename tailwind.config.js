/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.css"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Colores oficiales de UTEC (Tema Claro)
        utec: {
          cyan: '#00A9E0',
          'cyan-light': '#33BFEA',
          'cyan-dark': '#0088B8',
          black: '#1A1A1A',
          gray: '#4A4A4A',
          'gray-light': '#7A7A7A',
          'bg-light': '#F8FAFC',    // Fondo claro
          'card-light': '#FFFFFF',  // Tarjetas blancas
        },
        primary: {
          50: '#e6f7fc',
          100: '#cceff9',
          200: '#99dff3',
          300: '#66cfed',
          400: '#33bfea',
          500: '#00A9E0', // Cyan UTEC
          600: '#0088B8',
          700: '#006690',
          800: '#004460',
          900: '#002230',
        },
        gray: {
          750: '#374151',
          850: '#1f2937',
          950: '#1A1A1A', // Negro UTEC
        }
      }
    },
  },
  plugins: [],
}
