/**
 * @module fluent-skeleton/cli
 * @exports AppCLI
 *
 * @requires flipchain/ChainedMap
 * @requires fluent-cli
 * @requires script-chain
 * @requires to-arr
 * @requires execa
 * @requires globby
 * @requires funwithflags
 * @requires fliplog
 * @requires flipfile
 */

const {resolve} = require('path')
const ChainedMap = require('flipchain/ChainedMapExtendable')
const CLI = require('fluent-cli')
const Script = require('script-chain')
const toarr = require('to-arr')
const execa = require('execa')
const globby = require('globby')
const File = require('file-chain')
const fwf = require('funwithflags')
const log = require('fliplog')
const {exists, read} = require('flipfile')
const pkg = require('./pkg')

const argvs = fwf(process.argv.slice(2))

/**
 * http://blog.millermedeiros.com/inline-docs/
 * http://dailyjs.com/post/framework-part-46
 * https://documentjs.com/docs/index.html (too old)
 *
 * @see https://github.com/yeoman/generator/blob/master/jsdoc.json
 * @desc takes in argv, calls method on CLI
 * @param  {AppCli} cli
 * @return {void}
 * @type {Function}
 */
function handle(cli) {
  log.registerCatch()

  delete argvs._

  const argv = Object.values(argvs)
  const argk = Object.keys(argvs)

  log.emoji('flag').cyan('argv/flags:').data(argvs).echo()

  argk.forEach((method, i) => {
    const val = argv[i]
    log.emoji('phone').blue('cli: ' + method).data(val).echo(true)

    if (cli[method]) {
      cli[method](val, argvs)
    }
    else {
      log.emoji('find').blue('no method for: ' + method).data(val).echo(true)
    }
  })
}

/**
 * @prop {string} dir directory to resolve everything to
 * @type {ChainedMap}
 */
class AppCLI extends ChainedMap {

  /**
   * @since 0.0.1
   * @param  {ChainedMap | *} parent
   */
  constructor(parent) {
    super(parent)

    this.scriptChain = () => new Script()
  }

  /**
   * @since 0.0.1
   * @desc requires pkgjson using this.dir
   * @return {AppCLI} @chainable
   */
  setup() {
    const pkgPath = resolve(this.dir, './package.json')

    log.green('pkg: ').data({pkgPath, dir: this.dir}).echo(this.get('debug'))

    // eslint-disable-next-line
    this.pkgjson = require(pkgPath)

    return this
  }

  /**
   * @protected
   * @since 0.0.1
   * @see this.setup
   * @desc regenerate interactively
   * @return {AppCLI} @chainable
   */
  getPkg() {
    if (!this.pkgjson) this.setup()

    // defaults
    if (!this.pkgjson) this.pkgjson.folders = {}

    return this.pkgjson
  }

  /**
   * @since 0.0.1
   * @desc regenerate interactively
   * @return {AppCLI} @chainable
   */
  skeleton() {
    const gen = require('../interactive/interactive')
    gen(this.dir)
    return this
  }

  /**
   * @since 0.0.1
   * @param {string} dir
   * @return {AppCLI} @chainable
   */
  static init(dir) {
    return new AppCLI(dir)
  }

  /**
   * @since 0.0.1
   * @tutorial https://github.com/nolanlawson/optimize-js
   * @param  {string} input
   * @return {string} optimized output
   */
  optimize(input) {
    const optimizeJs = require('optimize-js')
    return optimizeJs(input, {
      sourceMap: true,
    })
  }

  /**
   * @since 0.0.1
   * @tutorial https://github.com/babel
   * @param  {string} string code source
   * @param  {Object} [config=null] babel options
   * @return {string} transformed babel output
   */
  babel(string, config = null) {
    const babel = require('babel-core')
    // result = babel.transform(str, {allowReturnOutsideFunction: true});
    const parsedAst = babel.parse(string, {allowReturnOutsideFunction: true})
    const {code, map, ast} = babel.transformFromAst(parsedAst, string, config)
    return code
  }

  /**
   * @since 0.0.1
   * @tutorial https://github.com/prettier/prettier
   * @param  {string} code
   * @param  {Object} [config=null] prettier options
   * @return {string} prettified output
   */
  prettier(code, config = null) {
    const prettier = require('prettier')

    return prettier.format(code, {
      // Indent lines with tabs
      useTabs: false,

      // Fit code within this line limit
      printWidth: 80,

      // Number of spaces it should use per tab
      tabWidth: 2,

      // If true, will use single instead of double quotes
      singleQuote: true,

      // Controls the printing of trailing commas wherever possible. Valid options:
      // "none" - No trailing commas
      // "es5"  - Trailing commas where valid in ES5 (objects, arrays, etc)
      // "all"  - Trailing commas wherever possible (function arguments)
      trailingComma: 'es5',

      // Controls the printing of spaces inside object literals
      bracketSpacing: true,

      // If true, puts the `>` of a multi-line jsx element at the end of
      // the last line instead of being alone on the next line
      jsxBracketSameLine: false,

      // Which parser to use. Valid options are "flow" and "babylon"
      parser: 'babylon',

      // Whether to add a semicolon at the end of every line (semi: true),
      // or only at the beginning of lines that may introduce ASI failures (semi: false)
      semi: false,
    })
  }

  // --- docs ---

  /**
   * @since 0.0.1
   * @see https://github.com/nhnent/tui.jsdoc-template
   * @param {Array<string>} files
   * @return {AppCli} @chainable
   */
  jsdocs(files) {
    files = this.docFiles(files)

    const jsdoc = require('jsdoc-api')
    let jsdocOpts = this.getPkg().jsdoc || this.getPkg().jsdocs

    if (!jsdocOpts && exists(resolve(this.dir, './jsdoc.js'))) {
      jsdocOpts = require(resolve(this.dir, './jsdoc.js')) // eslint-disable-line
    }
    if (!jsdocOpts && exists(resolve(this.dir, './jsdoc.json'))) {
      jsdocOpts = require(resolve(this.dir, './jsdoc.json')) // eslint-disable-line
    }

    jsdocOpts.files = files
    log.data({jsdocOpts}).text('jsdoc opts').echo()
    jsdoc.explainSync(jsdocOpts)
    return this
  }

  /**
   * @TODO `typedoc --exclude 'loader/LoaderAPI.ts' --target es6 --excludeExternals --includeDeclarations --out tsdox src`
   * @since 0.0.1
   * @see https://www.npmjs.com/package/tsd-jsdoc
   * @see http://ts2jsdoc.js.org/
   * @param {Array<string>} files
   * @return {AppCli} @chainable
   */
  tsdocs(files) {
    return this
  }

  /**
   * @since 0.0.1
   * https://github.com/Kegsay/flow-jsdoc
   * @desc jsdocs with flow support
   * @param {Array<string>} files
   * @return {AppCli} @chainable
   */
  flowdocs(files) {
    files = this.docFiles(files)

    const babel = require('babel-core')
    files.forEach(file => {
      const {code} = babel.transform('code', {
        plugins: ['jsdoc'],
      })
      const content = code

      log.cyan('writing docs').echo()
      log.white('content: ' + content).data(file).echo()
    })
    return this
  }

  /**
   * @tutorial http://jsdox.org/
   * @param {Array<string>} files
   * @return {AppCli} @chainable
   */
  jsdox(files) {
    const jsdox = require('jsdox')

    files.forEach(file => {
      // , templateDir, cb, fileCb
      jsdox.generateForDir(file, this.getPkg().folders.docs || 'docgen')
    })

    return this
  }

  /**
   * https://github.com/esdoc/esdoc
   * https://github.com/jsdoc3/jsdoc/issues/833
   * http://stackoverflow.com/questions/25314979/documenting-side-effects-of-javascript-methods
   * https://github.com/google/closure-compiler/wiki/Annotating-JavaScript-for-the-Closure-Compiler#nosideeffects-modifies-thisarguments
   */
  esdoc() {}

  /**
   * https://github.com/nhnent/tui.jsdoc-template
   * @param {Array<string>} files
   * @return {AppCli} @chainable
   */
  doxdox(files) {
    console.log(`doxdox 'src/**/*.js' --layout markdown --output docs/doxdox.md`)
    return this
    // jsdoc2md --config=jsdoc.json
    // jsdoc2md --source src --config=jsdoc.json
    // https://github.com/jsdoc3/jsdoc/blob/master/lib/jsdoc/env.js
    // https://github.com/jsdoc3/jsdoc/blob/master/cli.js
    // jsdoc src --recurse --template='node_modules/tui-jsdoc-template' --destination='docgen' --readme='README.md' ENV.conf.plugins="['node_modules/jsdoc-babel', 'plugins/markdown']"
    // jsdoc --include 'src' --recurse --template='node_modules/tui-jsdoc-template' --destination='docgen' --readme='README.md'
    //
    // --template 'node_modules/tui-jsdoc-template'
    // jsdoc src --recurse --destination 'docgen'
    //
    // require('fliplog').trackConsole();
    //
    // * @module jsdoc/opts/args
    // * @requires jsdoc/opts/argparser
    //
    //
    // ./jsdoc/jsdoc src --recurse --destination 'docgen' --plugins "node_modules/jsdoc-babel,plugins/markdown"
    // node ./node_modules/jsdoc/jsdoc src --recurse --destination 'docgen' --plugins "node_modules/jsdoc-babel,node_modules/jsdoc/plugins/markdown.js"

    // const doxdox = require('doxdox')
    const doxdox = require('../../../nofundocs/doxdox')
    files = this.docFiles(files)

    log
      .data({
        files,
        config: {
          // parser: 'dox',
          // layout: 'Markdown',
          pkg: this.pkgjson,
        },
      })
      .echo()

    log.white('files: ').data(files).echo()

    // stupid paths
    doxdox
      .parseInputs(files, {
        // parser: 'dox',
        // layout: 'markdown',
        parser: require.resolve('doxdox-parser-dox').replace(process.cwd(), ''),
        layout: require
          .resolve('doxdox-plugin-markdown')
          .replace(process.cwd(), ''),
        pkg: this.pkgjson,
      })
      .then(content => {
        log.cyan('writing docs').echo()
        log.white('content: ' + content).echo()
        File.src('./docs/docs.md', this.dir).setContent(content).write()
      })

    return this
  }

  /**
   * @since 0.0.1
   * @desc finds docfiles using a glob
   * @param {Array<string>} pattern array of glob patterns
   * @return {Array<string>} file
   */
  docFiles(pattern = ['disted/**/*.js']) {
    if (Array.isArray(pattern) === false) {
      // pattern = ['disted/**/*.js']
      pattern = [pattern]
    }

    log.blue('docs pattern').json({pattern, dir: this.dir}).echo(true)

    const files = globby.sync(pattern, {
      cwd: this.dir,
      absolute: true,
    })

    return files
  }

  /**
   * @since 0.0.1
   * @param {Array<string>} pattern array of glob patterns
   * @return {AppCli} @chainable
   */
  docs(pattern = ['disted/**/*.js']) {
    this.doxdox([pattern])
    // this.docFiles(pattern)
    return this
  }

  /**
   * @since 0.0.1
   * @param {Array<string>} pattern array of glob patterns
   * @return {AppCli} @chainable
   */
  jsdoc2md(pattern = ['disted/**/*.js']) {
    const jsdoc2md = require('jsdoc-to-markdown')
    const docs = jsdoc2md.renderSync({files: pattern})
    log.quick(docs)
    return this
  }

  /**
   * @since 0.0.1
   * @param {Array<string>} pattern array of glob patterns
   * @return {AppCli} @chainable
   */
  dox(pattern = ['disted/**/*.js']) {
    const dox = require('dox')

    const files = this.docFiles(pattern)
    files.forEach(file => {
      const obj = dox.parseComments(read(file))
      log.json({obj}).echo()
    })

    return this
  }

  /**
   * @since 0.0.1
   * @param {any} names npm scripts to run
   * @return {CLI} @chainable
   */
  npm(names = null) {
    const scripts = this.scriptChain().debug(false)

    toarr(names).forEach(name => scripts.add().npm(name))
    scripts.run()

    return this
  }

  // https://github.com/sindresorhus/open-editor
  openFile(files, editor = 'atom') {
    require('open-editor')(files)
  }

  /**
   * @since 0.0.1
   * @return {AppCli} @chainable
   */
  handle() {
    handle(this)
    return this
  }
}

module.exports = {handle, pkg, AppCLI}
