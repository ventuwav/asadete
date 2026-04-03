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
        heading: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        brand: ['"TeX Gyre Adventor"', '"Josefin Sans"', 'sans-serif'],
      },
      borderRadius: {
        hero: '2rem',
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
        cta: '0 8px 24px rgba(204, 91, 10, 0.28)',
        card: '0 2px 8px rgba(31, 26, 23, 0.06)',
      },
      colors: {
        surface: '#faf7f4',
        surfaceLow: '#f2ede8',
        surfaceHighest: '#e6dfd7',
        primary: '#cc5b0a',
        primaryLight: '#fae8dc',
        primaryDim: '#a3470a',
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
