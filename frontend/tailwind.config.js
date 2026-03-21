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
      },
      borderRadius: {
        xl: '1.25rem',
        lg: '1rem',
        md: '0.75rem',
        sm: '0.5rem'
      },
      colors: {
        surface: '#fcf8f7',
        surfaceLow: '#f2ece9',
        surfaceHighest: '#e8ded8',
        primary: '#b83a0a',
        primaryLight: '#f5e4df',
        primaryDim: '#8a2905',
        secondary: '#2e2825',
        success: '#1c7327',
        successBg: '#96f39e',
        onSurface: '#1f1a17',
        onSurfaceVariant: '#7a706b',
        outlineVariant: '#d9d2ce',
        outlineVariantGhost: 'rgba(217, 210, 206, 0.5)'
      }
    }
  },
  plugins: [],
}
