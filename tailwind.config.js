/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef4ff', 100: '#d9e6ff', 200: '#bcd3ff', 300: '#8eb5ff',
          400: '#598bff', 500: '#3366ff', 600: '#1f4af0', 700: '#1739d4',
          800: '#1933ab', 900: '#1a3286', 950: '#141f4f',
        },
        accent: {
          50: '#fff8ed', 100: '#ffefd4', 200: '#ffdba8', 300: '#ffc070',
          400: '#ff9a37', 500: '#ff7d11', 600: '#f06006', 700: '#c74807',
          800: '#9e3a0e', 900: '#7e3210', 950: '#451705',
        },
        success: { 50:'#ecfdf5',100:'#d1fae5',200:'#a7f3d0',300:'#6ee7b7',400:'#34d399',500:'#10b981',600:'#059669',700:'#047857',800:'#065f46',900:'#064e3b' },
        warning: { 50:'#fffbeb',100:'#fef3c7',200:'#fde68a',300:'#fcd34d',400:'#fbbf24',500:'#f59e0b',600:'#d97706',700:'#b45309',800:'#92400e',900:'#78350f' },
        error: { 50:'#fef2f2',100:'#fee2e2',200:'#fecaca',300:'#fca5a5',400:'#f87171',500:'#ef4444',600:'#dc2626',700:'#b91c1c',800:'#991b1b',900:'#7f1d1d' },
        ink: {
          50:'#f8fafc', 100:'#f1f5f9', 200:'#e2e8f0', 300:'#cbd5e1',
          400:'#94a3b8', 500:'#64748b', 600:'#475569', 700:'#334155',
          800:'#1e293b', 900:'#0f172a', 950:'#020617',
        },
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
        display: ['"Plus Jakarta Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'Cambria', 'Times New Roman', 'serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
      boxShadow: {
        'soft': '0 1px 2px rgba(15,23,42,0.04), 0 4px 12px rgba(15,23,42,0.06)',
        'soft-lg': '0 4px 8px rgba(15,23,42,0.05), 0 12px 32px rgba(15,23,42,0.10)',
        'glow': '0 0 0 1px rgba(51,102,255,0.25), 0 8px 30px rgba(51,102,255,0.25)',
        'card': '0 1px 0 rgba(15,23,42,0.04), 0 1px 3px rgba(15,23,42,0.08)',
      },
      backgroundImage: {
        'grid-light': "linear-gradient(to right, rgba(15,23,42,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,23,42,0.04) 1px, transparent 1px)",
        'radial-fade': 'radial-gradient(60% 60% at 50% 0%, rgba(51,102,255,0.12) 0%, rgba(51,102,255,0) 70%)',
      },
      borderRadius: { '4xl': '2rem' },
      keyframes: {
        'fade-up': { from: { opacity: '0', transform: 'translateY(8px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'shimmer': { '100%': { transform: 'translateX(100%)' } },
        'float': { '0%,100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-6px)' } },
      },
      animation: {
        'fade-up': 'fade-up 0.5s ease-out both',
        'shimmer': 'shimmer 1.6s infinite',
        'float': 'float 6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
