import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0f172a',
        clinical: {
          50: '#eff6ff',
          100: '#dbeafe',
          500: '#2563eb',
          600: '#1d4ed8',
          700: '#1e40af',
        },
        mint: '#10b981',
        coral: '#f97316',
      },
      boxShadow: {
        soft: '0 20px 70px rgba(15, 23, 42, 0.12)',
      },
      backgroundImage: {
        grid: 'linear-gradient(to right, rgba(37,99,235,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.08) 1px, transparent 1px)',
      },
    },
  },
  plugins: [],
};
export default config;
