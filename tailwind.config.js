/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        forest: {
          canvas: '#0B0F0B',
          card: '#131A14',
          surface: '#162017',
          border: 'rgba(255, 255, 255, 0.08)',
        },
        lime: {
          DEFAULT: '#D4F66C',
          hover: '#C6EC57',
          glow: 'rgba(212, 246, 108, 0.25)',
        },
        sage: {
          DEFAULT: '#8FA391',
          muted: '#7A8F7D',
          dark: '#2A3B2D',
        },
        canvas: {
          light: '#F4F6F4',
          dark: '#0B0F0B',
        },
        card: {
          light: '#FFFFFF',
          dark: '#131A14',
        },
        accent: {
          amber: '#E67E22',
          azure: '#0284C7',
          forest: '#16A34A',
          crimson: '#DC2626',
          lime: '#D4F66C',
        },
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro Display"',
          '"SF Pro Text"',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"SF Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'Monaco',
          'Consolas',
          '"Liberation Mono"',
          '"Courier New"',
          'monospace',
        ],
      },
      borderRadius: {
        apple: '12px',
        'apple-lg': '16px',
        'apple-2xl': '24px',
        'apple-3xl': '32px',
      },
      keyframes: {
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        ticker: 'ticker 30s linear infinite',
        shimmer: 'shimmer 1.5s ease-in-out infinite',
        'fade-in-up': 'fade-in-up 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
