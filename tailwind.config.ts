import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      colors: {
        "dark": '#213343', 
        "dark-green": '#27594b', 
        "light-blue": '#bbd5ee', 
        "brown": '#d3a577',
        "light-red": "#d94c51"
      },
      screens: {
        xs: '440px',
        bml: '856px',
      }
    },
  },
  plugins: [],
};
export default config;
