const dotenv = require('dotenv');

dotenv.config();

module.exports = function(api) {
  api.cache(false);
  const presets = [
    [
      '@babel/preset-env',
      {
        corejs: {
          version: "3",
          proposals: true
        },
        useBuiltIns: 'usage',
        modules: false,
        debug: process.env['ENV'] === 'production' ? false : true
      }
    ]
  ];
  const plugins = [
    ["@babel/transform-runtime"]
  ];
  return {presets, plugins};
}
