import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8ee',
          100: '#faefd0',
          200: '#f4dc9d',
          300: '#edc163',
          400: '#e8a839',
          500: '#e0901e',
          600: '#c76e15',
          700: '#a55115',
          800: '#864018',
          900: '#6e3517',
          950: '#3e1b08',
        },
      },
      backgroundImage: {
        'hero-gradient': 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      },
    },
  },
  plugins: [],
}
export default config
