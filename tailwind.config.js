/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Core semantic tokens (CSS variable–driven) ──────────────────────
        primary: {
          DEFAULT: 'rgb(var(--primary) / <alpha-value>)',
          foreground: 'rgb(var(--primary-foreground) / <alpha-value>)',
          // Gold for small TEXT: darker in light mode so it passes 4.5:1.
          text: 'rgb(var(--primary-text) / <alpha-value>)',
        },
        background: {
          DEFAULT: 'rgb(var(--background) / <alpha-value>)',
        },
        surface: {
          DEFAULT: 'rgb(var(--surface) / <alpha-value>)',
          highlight: 'rgb(var(--surface-highlight) / <alpha-value>)',
        },
        text: {
          DEFAULT: 'rgb(var(--text) / <alpha-value>)',
          muted: 'rgb(var(--text-muted) / <alpha-value>)',
        },
        border: 'rgb(var(--border) / <alpha-value>)',

        // ── Rebuilt Village Brand Palette ────────────────────────────────────
        // Extracted directly from the logo tree & wordmark
        brand: {
          // Wordmark gold — primary identity color
          gold:    '#C9A84C',
          'gold-light': '#E0C06E',
          'gold-dark':  '#A07830',

          // Art-form accent colors (each maps to a tree branch)
          teal:    '#2DBFA0', // community growth / left leaves
          'teal-text': 'rgb(var(--accent-teal-text) / <alpha-value>)', // teal for small text
          green:   '#4A9E52', // film reel / education
          crimson: '#C0392B', // theater masks / drama
          purple:  '#7B2FBE', // creative expression
          blue:    '#1B4FBE', // trust / visual arts / right branches
          amber:   '#E07B00', // energy / crown / workshops
          pink:    '#DC267F', // music / performance

          // Foundation
          black:   '#0A0A0A',
          'off-black': '#141414',
        },
      },
      fontFamily: {
        // Cinzel — matches the logo wordmark exactly (Roman-inspired all-caps serif)
        display: ['Cinzel', 'Georgia', 'serif'],
        // Cormorant Garamond — elegant editorial serif for headings & pull quotes
        serif: ['Cormorant Garamond', 'Georgia', 'serif'],
        // Inter — clean sans for body copy and UI labels
        sans: ['Inter', 'system-ui', 'sans-serif'],
        // Fira Code — monospace for code, tags, and metadata labels
        mono: ['Fira Code', 'Monaco', 'monospace'],
      },
      animation: {
        'fade-in':     'fadeIn 0.5s ease-in-out',
        'slide-up':    'slideUp 0.5s ease-out',
        'pulse-slow':  'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'marquee':     'marquee 28s linear infinite',
        'shimmer':     'shimmer 2.5s linear infinite',
        'glow-pulse':  'glowPulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%':   { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)',    opacity: '1' },
        },
        marquee: {
          '0%':   { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% center' },
          '100%': { backgroundPosition: '200% center' },
        },
        glowPulse: {
          '0%, 100%': { boxShadow: '0 0 12px 2px rgba(201,168,76,0.15)' },
          '50%':      { boxShadow: '0 0 28px 6px rgba(201,168,76,0.35)' },
        },
      },
      boxShadow: {
        'gold':       '0 0 20px rgba(201,168,76,0.25)',
        'gold-lg':    '0 0 40px rgba(201,168,76,0.35)',
        'gold-inset': 'inset 0 0 20px rgba(201,168,76,0.1)',
      },
      backgroundImage: {
        'gold-shimmer': 'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.15) 50%, transparent 100%)',
        'brand-gradient': 'linear-gradient(135deg, #C9A84C 0%, #E0C06E 50%, #C9A84C 100%)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms')({ strategy: 'class' }),
  ],
};
