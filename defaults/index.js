const {resolve} = require('path')
const {read} = require('flipfile')

const reads = dir => read(resolve(__dirname, dir))

const ex = {
  ava: reads('./test-ava.js'),
  jest: reads('./test-jest.js'),
  schema: reads('./schema.js'),
  bin: reads('./bin.js'),
  cli: reads('./cli.js'),
  bench: reads('./bench.js'),
  README: reads('./README.md'),
  gitignore: reads('./.gitignore'),
  travis: reads('./.travis.yml'),
  editorconfig: reads('./.editorconfig'),
  rollup: reads('./rollup.config.js'),
  webpack: reads('./webpack.config.js'),
  fusebox: reads('./fuse.js'),
  jsdocs: reads('./jsdocs.json'),
  Makefile: reads('./Makefile'),
  nodebabel: reads('./.node.babelrc'),
  webbabel: reads('./.web.babelrc'),
}

Object.keys(ex).forEach(key => {
  ex[key] = ex[key].trim()
})

module.exports = ex
