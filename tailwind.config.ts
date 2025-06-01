export default {
  content: ["./app/**/{**,.client,.server}/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
          "Apple Color Emoji",
          "Segoe UI Emoji",
          "Segoe UI Symbol",
          "Noto Color Emoji",
        ],
        colors:{
          primary: {
            light: '#ff6b6b',
            DEFAULT: '#ff4757', 
            dark: '#ff0000',
          },
          secondary: {
            light: '#ffffff',
            dark: '#1a1a1a',
          },
        }
      },
    },
  },
  plugins: [],
};
