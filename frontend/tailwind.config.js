/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        heading: ['"TeX Gyre Adventor"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        hero: '3rem',
        section: '1.5rem',
        card: '1.25rem',
        inner: '1rem',
        // legacy aliases (no borrar — evitan romper código existente)
        xl: '1.25rem',
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem',
      },
      boxShadow: {
        cta: '0 8px 24px rgba(255, 140, 90, 0.35)',
        card: '0 2px 8px rgba(31, 26, 23, 0.06)',
        modal: '0 20px 40px rgba(27, 28, 23, 0.06)',
      },
      backgroundImage: {
        'cta-gradient': 'linear-gradient(to bottom, #9E4216, #FF8C5A)',
      },
      colors: {
        surface: '#faf7f4',
        surfaceLow: '#f2ede8',
        surfaceHighest: '#e6dfd7',
        surfaceDark: '#1B1C17',
        primary: '#cc5b0a',
        primaryLight: '#fae8dc',
        primaryDim: '#a3470a',
        primaryBright: '#FF8C5A',
        secondary: '#2e2825',
        success: '#1c7327',
        successBg: '#96f39e',
        onSurface: '#1e1a16',
        onSurfaceVariant: '#7a706b',
        outlineVariant: '#d9d0c8',
        outlineVariantGhost: 'rgba(217, 208, 200, 0.5)'
      }
    }
  },
  plugins: [],
}
