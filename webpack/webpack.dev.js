const { merge } = require('webpack-merge')
const common = require('./webpack.common')

const dev = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    open: true,
    port: 8080
  }
}

module.exports = merge(common, dev)
