// front/kaonti/webpack.config.js
const path = require('path');

module.exports = {
  entry: './src/index.js', // ton fichier principal
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader',
      },
    ],
  },
};