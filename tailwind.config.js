/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        inter: ['var(--font-inter)', 'Inter', 'sans-serif'],
      },
      colors: {
        // Custom CapStation Color Palette
        primary: {
          DEFAULT: "#FF8730", // Orange gelap
          dark: "#E67620",
          light: "#FFB875",
          50: "#FFF5F0",
          100: "#FFEAD9",
          200: "#FFD5B3",
          300: "#FFC08C",
          400: "#FFAB66",
          500: "#FF8730",
          600: "#E67620",
          700: "#CC6510",
          800: "#B35409",
          900: "#991F03",
        },
        secondary: {
          DEFAULT: "#FFE49C", // Kuning terang
          dark: "#F5D270",
          light: "#FFF0C0",
          50: "#FFFAF0",
          100: "#FFF5E0",
          200: "#FFE9C0",
          300: "#FFDEA1",
          400: "#FFD281",
          500: "#FFE49C",
          600: "#FFC966",
          700: "#F5B850",
          800: "#EBAA3A",
          900: "#D99C24",
        },
        accent: {
          DEFAULT: "#B6EB75", // Hijau terang
          dark: "#9DD055",
          light: "#D0F5A0",
          50: "#F8FCF3",
          100: "#F0F8E6",
          200: "#E1F0CC",
          300: "#D0F5A0",
          400: "#C0E87D",
          500: "#B6EB75",
          600: "#9DD055",
          700: "#85B340",
          800: "#6D962B",
          900: "#557816",
        },
        neutral: {
          50: "#F1F7FA", // Abu terang (Putih biru)
          100: "#FFFFFF", // Putih
          200: "#D9D9D9", // Abu tengah
          300: "#B8B8B8",
          400: "#969696",
          500: "#747474",
          600: "#535351", // Abu gelap
          700: "#3A3A38",
          800: "#212120",
          900: "#090B08", // Hitam gelap
        },
        // Shadcn UI Variables
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
