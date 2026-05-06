/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
      },
      colors: {
        primary: {
          DEFAULT: '#3182f6',
          hover: '#1b64da',
          light: '#e8f3ff',
        },
        success: {
          DEFAULT: '#34c759',
          light: '#e3f9e5',
        },
        warning: {
          DEFAULT: '#ff9500',
          light: '#fff3e0',
        },
        bg: {
          base: '#f9fafb',
          surface: '#ffffff',
          'surface-hover': '#f3f4f6',
        },
      }
    },
  },
  plugins: [],
}
