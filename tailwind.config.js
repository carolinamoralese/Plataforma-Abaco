/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    colors: {
      'gris-claro':'#b3b3b3',
      'grisMuyClaro': '#E6E6E6',
      'gris-oscuro':'#4d4d4d',
      'verde-oscuro': '#065624',
      'verde-claro': '#8cc63f',
      'verde':"#095624",
      'amarillo': '#d2de38',
      'naranja': '#f58634',
      'negro': '#272323',
      'blanco':' #FFFFFF',
    },
    extend: {
      screens: {
        'sm': '640px',
        'md': '1080px',
        'lg': '1280px',
        // ...
      },
    },
  },
  plugins: [],
}