/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        border:      "rgb(var(--border) / <alpha-value>)",
        input:       "rgb(var(--border) / <alpha-value>)",
        ring:        "rgb(var(--primary) / <alpha-value>)",
        background:  "rgb(var(--background) / <alpha-value>)",
        foreground:  "rgb(var(--foreground) / <alpha-value>)",
        divider:     "rgb(var(--divider) / <alpha-value>)",
        primary: {
          DEFAULT:   'rgb(var(--primary) / <alpha-value>)',
          foreground:'rgb(var(--primary-foreground) / <alpha-value>)',
          hover:     '#4B5C57',
        },
        secondary: {
          DEFAULT:   'rgb(var(--secondary) / <alpha-value>)',
          foreground:'rgb(var(--secondary-foreground) / <alpha-value>)',
        },
        ternary: {
          DEFAULT:   'rgb(var(--ternary) / <alpha-value>)',
          foreground:'#ffffff',
        },
        success: {
          DEFAULT:   'rgb(var(--success) / <alpha-value>)',
          foreground:'#ffffff',
        },
        warning: {
          DEFAULT:   'rgb(var(--warning) / <alpha-value>)',
          foreground:'#ffffff',
        },
        destructive: {
          DEFAULT:   'rgb(var(--destructive) / <alpha-value>)',
          foreground:'rgb(var(--destructive-foreground) / <alpha-value>)',
        },
        muted: {
          DEFAULT:   'rgb(var(--muted) / <alpha-value>)',
          foreground:'rgb(var(--muted-foreground) / <alpha-value>)',
        },
        accent: {
          DEFAULT:   'rgb(var(--accent) / <alpha-value>)',
          foreground:'rgb(var(--accent-foreground) / <alpha-value>)',
        },
        popover: {
          DEFAULT:   'rgb(var(--popover) / <alpha-value>)',
          foreground:'rgb(var(--popover-foreground) / <alpha-value>)',
        },
        card: {
          DEFAULT:   'rgb(var(--card) / <alpha-value>)',
          foreground:'rgb(var(--card-foreground) / <alpha-value>)',
        },
      },
      borderRadius: {
        lg:    'var(--radius-lg)',    /* 16px — cards */
        md:    'var(--radius-md)',    /* 12px — inputs, buttons */
        sm:    'var(--radius-sm)',    /*  8px — small elements */
        modal: 'var(--radius-modal)',/* 20px — modals */
      },
      boxShadow: {
        'card':       '0 1px 3px rgba(16,24,40,0.06)',
        'card-hover': '0 4px 12px rgba(16,24,40,0.08)',
        'modal':      '0 8px 32px rgba(16,24,40,0.12)',
        'nav':        '0 2px 8px rgba(95,115,109,0.20)',
      },
      fontSize: {
        'display': ['2rem', { lineHeight: '1.2', fontWeight: '700' }],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
