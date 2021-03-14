const dotenv = require('dotenv');

dotenv.config();

const prod = process.env['ENV'] === 'production';

module.exports = {
  purge: {
    enabled: prod,
    content: ['./src/index.html', './src/**/*.{tsx,ts}'],
  },
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {},
  },
  variants: {
    extend: {},
  },
  plugins: [],
};
