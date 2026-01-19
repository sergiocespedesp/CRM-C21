/** @type {import('tailwindcss').Config} */
export default {
    content: [
      "./index.html",
      "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          input: "hsl(var(--input))",
          ring: "hsl(var(--ring))",
          background: "var(--bg-main)",
          foreground: "var(--text-main)",
          primary: {
            DEFAULT: "var(--color-primary)",
            dark: "var(--color-primary-dark)",
            light: "var(--color-primary-light)",
            foreground: "#ffffff",
          },
          secondary: {
            DEFAULT: "var(--color-secondary)",
            light: "var(--color-secondary-light)",
            foreground: "#ffffff",
          },
          success: "var(--color-success)",
          danger: "var(--color-danger)",
          warning: "var(--color-warning)",
          info: "var(--color-info)",
          
          // Card specific
          card: {
            DEFAULT: "var(--bg-card)",
            foreground: "var(--text-main)",
          },
        },
        fontFamily: {
          sans: ['Outfit', 'Inter', 'sans-serif'],
          heading: ['Outfit', 'sans-serif'],
        },
        boxShadow: {
            'soft': 'var(--shadow-soft)',
            'card': 'var(--shadow-card)',
        }
      },
    },
    plugins: [],
  }
