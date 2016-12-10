var path = require('path');
var webpack = require('webpack');
var ExtractTextPlugin = require('extract-text-webpack-plugin');
var extend = require('lodash/extend')

var devFlagPlugin = new webpack.DefinePlugin({
  __DEV__: JSON.stringify(JSON.parse(process.env.DEBUG || 'false'))
});

baseConfig = require('./webpack.config')

// Phaser webpack config
var phaserModule = path.join(__dirname, '/node_modules/phaser/');
var phaser = path.join(phaserModule, 'build/custom/phaser-arcade-physics.js');
var phaserPlugins = path.join(phaserModule, 'dist/modules');
var pixi = path.join(phaserModule, 'build/custom/pixi.js');

module.exports = {
  entry: [
    './js/index.js'
  ],
  output: {
    path: path.join(__dirname, 'dist'),
    publicPath: '/static/',
    filename: 'bundle.js',
  },
  plugins: [
    new webpack.NoErrorsPlugin(),
    devFlagPlugin,
    new ExtractTextPlugin('app.css')
  ],
  module: {
    loaders: [
      { test: /\.js$/, loaders: ['babel'], exclude: /node_modules/ },
      { test: /\.css$/, loader: ExtractTextPlugin.extract('css-loader?module!cssnext-loader') },
      { test: /pixi\.js/, loader: 'expose?PIXI' },
      { test: /phaser-.*\.js$/, loader: 'expose?Phaser' }
    ]
  },
  resolve: {
    extensions: ['', '.js', '.json'],
    alias: baseConfig.resolve.alias
  }
}
