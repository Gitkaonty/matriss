// api/webpack.config.js
const path = require('path');
const nodeExternals = require('webpack-node-externals');

module.exports = {
  entry: './src/index.js', // ton fichier principal
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
  },
  target: 'node', // important pour API Node
  externals: [nodeExternals()], // exclut node_modules du bundle
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: 'babel-loader', // si tu utilises Babel
      },
    ],
  },
};