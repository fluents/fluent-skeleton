const webpack = require('webpack')
const devMiddleware = require('webpack-dev-middleware')
const express = require('express')
const historyAPIFallback = require('connect-history-api-fallback')
const HtmlPlugin = require('webpack-html-plugin')
const webpackHotMiddleware = require('webpack-hot-middleware')

// --- config ---
// const config = require('./webpack.config.js')
const {resolve} = require('path')
const config = {
  entry: {
    main: resolve(__dirname, './src/index.js'),
  },
  output: {
    path: resolve(__dirname, './built'),
    filename: '[name].js',
    publicPath: '/',
  },
  plugins: [new HtmlPlugin()],
}

const compiler = webpack(config)
const webpackMiddleware = devMiddleware(compiler, {
  // It suppress error shown in console, so it has to be set to false.
  quiet: false,
  // It suppress everything except error, so it has to be set to false as well
  // to see success build.
  noInfo: false,
  stats: {
    // Config for minimal console.log mess.
    assets: true,
    color: true,
    colors: true,
    version: true,
    hash: true,
    timings: true,
    chunks: true,
    chunkModules: false,
  },
  publicPath: config.output.publicPath,
})

const app = express()
app.set('port', 8080)
app.use(historyAPIFallback())
app.use(webpackMiddleware)
app.use(webpackHotMiddleware)

app.listen(app.get('port'), error => {
  if (error) throw error
  console.log(`http://localhost:${app.get('port')}/`)
})
