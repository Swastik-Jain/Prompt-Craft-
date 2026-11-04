/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        linen: {
          50: '#fcfbf9',
          100: '#f8f6f1',
          200: '#f2eee6',
          300: '#e7e1d5',
          400: '#d5ccba',
          500: '#b8ab9a',
        },
        terracotta: {
          50: '#fdf6f3',
          100: '#fcebe5',
          200: '#f9d5c8',
          300: '#f4b29c',
          400: '#eb8667',
          500: '#c85a38',
          600: '#b44a29',
          700: '#963c20',
          800: '#7a331d',
          900: '#652d1c',
        },
        sand: {
          50: '#faf8f5',
          100: '#f4efe8',
          200: '#eae2d5',
          300: '#d9cdbc',
          400: '#bca993',
          500: '#9d8871',
          600: '#7a6752',
          700: '#5c4d3d',
          800: '#43372c',
          900: '#2d241d',
        },
        olive: {
          50: '#f5f7f3',
          100: '#e8ece4',
          200: '#d2dccb',
          300: '#b0c3a6',
          400: '#87a27a',
          500: '#5c7353',
          600: '#46593e',
        },
        amber: {
          50: '#fffbf0',
          100: '#fef5d6',
          200: '#fde69d',
          300: '#fbd15e',
          400: '#f8b628',
          500: '#d9822b',
          600: '#b8661b',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        'warm-sm': '0 1px 3px 0 rgba(100, 80, 60, 0.05), 0 1px 2px 0 rgba(100, 80, 60, 0.03)',
        'warm-md': '0 4px 12px -2px rgba(100, 80, 60, 0.08), 0 2px 6px -2px rgba(100, 80, 60, 0.04)',
        'warm-lg': '0 12px 28px -4px rgba(100, 80, 60, 0.12), 0 4px 10px -2px rgba(100, 80, 60, 0.06)',
        'glow-terracotta': '0 4px 16px -2px rgba(200, 90, 56, 0.35)',
      }
    }
  },
  plugins: [],
}
