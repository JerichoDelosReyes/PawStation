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
        periwinkle: {
          DEFAULT: '#4A72B8',
          hover: '#3C5F9C',
          light: '#608BD6',
          glow: 'rgba(74, 114, 184, 0.25)',
        },
        blush: '#F4B8B8',
        navy: {
          DEFAULT: '#1C2942',
          muted: '#637594',
          lightMuted: '#8EA0BC',
          card: '#131C2D',
          dark: '#0B111B',
          deep: '#0D1524',
        },
        canvas: {
          light: '#F4F1EA',
          dark: '#0E0E10',
          cream: '#F4F1EA',
          obsidian: '#0E0E10',
        },
        card: {
          light: '#FFFFFF',
          dark: '#141417',
        },
        accent: {
          amber: '#4A72B8',
          blue: '#4A72B8',
          azure: '#0284C7',
          blueAccent: '#2563EB',
          crimson: '#DC2626',
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
