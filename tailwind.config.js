/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        border: "rgb(var(--border) / <alpha-value>)",
        input: "rgb(var(--border) / <alpha-value>)",
        ring: "rgb(var(--primary) / <alpha-value>)",
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
        },
        secondary: {
          DEFAULT: 'rgb(var(--secondary) / <alpha-value>)',
          foreground: 'rgb(var(--brand-800) / <alpha-value>)',
        },
        ternary: {
          DEFAULT: 'rgb(var(--ternary) / <alpha-value>)',
          foreground: '#ffffff',
        },
        destructive: {
          DEFAULT: 'rgb(239 68 68 / <alpha-value>)',
          foreground: '#ffffff',
        },
        muted: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          foreground: "rgb(100 116 139 / <alpha-value>)",
        },
        accent: {
          DEFAULT: "rgb(var(--secondary) / <alpha-value>)",
          foreground: "rgb(var(--brand-800) / <alpha-value>)",
        },
        popover: {
          DEFAULT: "rgb(var(--card-bg) / <alpha-value>)",
          foreground: "rgb(var(--brand-800) / <alpha-value>)",
        },
        card: {
          DEFAULT: "rgb(var(--card-bg) / <alpha-value>)",
          foreground: "rgb(var(--brand-800) / <alpha-value>)",
        },
      },
      borderRadius: {
        lg: 'var(--radius-lg)',
        md: 'var(--radius-md)',
        sm: 'var(--radius-sm)',
      },
    },
  },
  plugins: [],
};
