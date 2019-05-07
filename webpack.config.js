var path = require('path')
var libraryName = 'websocket-connector'
var outputFile = libraryName + '.js'
var src = path.resolve(__dirname, 'src')

module.exports = {
  context: src,
  mode: 'production',
  entry: {
    'websocket-connector': './index.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: outputFile,
    library: libraryName,
    libraryTarget: 'umd',
    umdNamedDefine: true
  },
  resolve: {
    alias: {
      'websocket-connector': path.resolve(__dirname, 'src')
    }
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'eslint-loader',
        exclude: /node_modules/
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  }
}
