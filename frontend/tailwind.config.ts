import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        navy:   "#0f1f38",
        purple: "#753991",
        gold: {
          DEFAULT: "#b8963e",
          hover:   "#a07d2e",
          light:   "#fdf8f0",
          rule:    "#e8d9b5",
        },
        surface: "#f2f1ee",
        desk:    "#c8c4bc",
        rule:    "#e5e2dd",
        ink:     "#1a2333",
      },
      fontFamily: {
        sans:  ["var(--font-sans)",  "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia",   "serif"],
      },
      boxShadow: {
        paper: [
          "0 1px 2px rgba(0,0,0,0.06)",
          "0 4px 12px rgba(0,0,0,0.07)",
          "0 12px 32px rgba(0,0,0,0.05)",
        ].join(", "),
      },
    },
  },
  plugins: [],
};

export default config;
