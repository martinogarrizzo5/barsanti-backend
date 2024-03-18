/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./layout/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
    "./lib/dropDownDefaultStyle.ts",

    // Or if using `src` directory:
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primaryLightest: "#b4e2f7",
        primaryLighter: "#0EB7C7",
        primaryLight: "#0E9DB7",
        primary: "#07789B",
        primaryDark: "#0A5C6F",
        primaryDarker: "#0A4C5F",
        background: "#FAFCFE",
        controlHoverBackground: "#F5F5F5",
        controlActiveBackground: "#F1F1F1",
        controlForeground: "#5E6F74",
        controlActiveForeground: "#2F3E46",
        grayBorder: "#D0DDE1",
        placeholder: "#B8C0C7",
        error: "#E53E3E",
      },
    },
  },
  plugins: [],
};
