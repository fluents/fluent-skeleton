const toarr = require('to-arr')
const log = require('fliplog')
const ChainedMap = require('flipchain/ChainedMapExtendable')
const File = require('file-chain')
const {VFS} = require('../vfs')
const {AppCLI} = require('../lib')
const defaults = require('../../defaults')

// http://doxmate.cool/tj/dox/index.html#index_Usage Examples
// https://www.bithound.io/github/neogeek/parse-cmd-args
// https://snyk.io/test/npm/parse-cmd-args
// .jest({
//   globals: {
//     __DEV__: true,
//   },
//   rootDir: '.',
//   testRegex: '(tests\/)(.*).js$',
// })

// npm install -g jsdoc-to-markdown
log.registerCatch()

/* prettier-ignore */

const stringify = JSON.stringify
const keyVals = obj => {
  return [Object.keys(obj), Object.values(obj)]
}

/**
 * @TODO:
 * - [ ] split into plugins
 * - [ ] add nested configs
 * - [ ] see interactive.todo
 */

/**
 * @prop {Object} pkgs
 * @prop {File} pkg
 * @prop {Object} config
 * @prop {VFS} vfs
 */
class Plugins extends ChainedMap {

  /**
   * @desc translate config
   * @param {Object} config
   * @return {Plugins} @chainable
   */
  config(config) {
    return this.set('config', config)
  }

  /**
   * @desc existing package.json
   * @param {Object} pkgjson
   * @return {Plugins} @chainable
   */
  pkgjson(pkgjson) {
    return this.set('pkgjson', pkgjson)
  }

  /**
   * @desc handle answers
   * @return {Plugins} @chainable
   */
  handle() {
    this.vfs = new VFS()
    const config = this.get('config')

    Object.keys(config).forEach(key => {
      if (Array.isArray(config[key])) {
        config[key] = config[key].map(val => val.replace(key + '.', ''))
      }
      else if (typeof config[key] === 'string') {
        config[key] = config[key].replace(key + '.', '')
      }
    })

    return this.handleConfigStore(config)
      .configConfig(config)
      .handlePkgJson(config)
      .setupFolders(config)
      .superset(config)
      .lint(config)
      .tests(config)
      .scripts(config)
      .features(config)
      .setupFolders(config)
      .callPlugins(config)
      .finish(config)
  }

  configStore(configStore) {
    return this.set('configStore', configStore)
  }
  handleConfigStore(config) {
    const configStore = this.get('configStore')

    const email = config.email
    const username = config.username
    const author = config['author-name']

    if (email) configStore.set('email', email)
    if (username) configStore.set('username', username)
    if (author) configStore.set('author', author)

    return this
  }

  setupFolders(config) {
    this.folders = {
      entry: config['export-entry'],
      module: config['export-module'],
      web: config['export-web'],
      output: config['output-folder'],
      src: config['src-folder'],
    }
    return this
  }

  handlePkgJson(config) {
    const pkgjson = this.get('pkgjson')
    if (!pkgjson) return this

    const devDeps = pkgjson.devDependencies || {}
    const deps = pkgjson.dependencies || {}
    // const [devDepsKeys, devDepsVals] = keyVals(devDeps)
    // const [depsKeys, depsVals] = keyVals(deps)

    Object.keys(devDeps).forEach(devDep => this.addDep(devDep, devDeps[devDep]))
    Object.keys(deps).forEach(dep => this.addDepDep(dep, deps[dep]))

    return this
  }

  folders(config) {
    const folders = {
      docs: config['docs-folder'],
      out: config['output-folder'],
      tests: config['tests-folder'],
      src: config['src-folder'],
      temp: config['temp-folder'],
      entry: config['export-entry'],
      module: config['export-module'],
      web: config['export-web'],
      output: config['output-folder'],
    }

    this.pkg.append(`\n.folders(${stringify(folders)})\n`)

    return this
  }

  // ----
  use(plugins = []) {
    this.plugins = plugins
    return this
  }
  callPlugins(config) {
    if (!this.plugins) return this
    this.plugins.forEach(plugin => {
      plugin.apply(this, [config])
    })
    return this
  }
  // ----

  configConfig(config) {
    this.vfs.chwd(config.dir)

    // to build it with keys in order without escodegen, sort keys, resave
    this.pkgs = {
      scripts: [],
      deps: [],
      devDeps: [],
    }

    this.pkg = new File().src('./package.js', config.dir).append(`pkg`)

    return this
  }

  addDepDep(name, version = '*') {
    this.pkgs.deps.push({name, data: version})
  }
  addDep(name, version = '*') {
    this.pkgs.devDeps.push({name, data: version})
    // .push(`.devDep('${name}', '${version}')`)

    return this
  }
  addScript(name, cmd = '*') {
    const data = '`' + cmd + '`'
    this.pkgs.scripts.push({name, data})
    // .push(`.script('${name}', \`${val}\`)`)

    return this
  }
  // addDevDep
  // addDep(dep, version, type) {}

  // --- superset ---

  superset(config) {
    if (config.superset.includes('babel')) return this.babel(config)
    if (config.superset.includes('typescript')) return this.typescript(config)
    return this
  }
  babel(config) {
    this.addDep('flow-remove-types')
      .addDep('babel-core')
      .addDep('babel-preset-env')
      .addDep('babel-plugin-transform-flow-strip-types')
    // .addDep('babel-preset-babili')

    let babelrc = defaults.nodebabelrc
    if (config.environment && config.environment.includes('web')) {
      babelrc = defaults.webbabelrc
    }

    this.vfs.file('.babelrc').content(babelrc).file('.flowconfig').content('')

    this.addScript(
      'strip',
      'flow-remove-types src/ --pretty --all --out-dir disted/'
    )
    this.addScript('watch', 'babel src/ --out-dir dist/ --watch')

    return this
  }
  typescript(config) {
    this.vfs.file('.tsconfig')

    this.addDep('typescript')
    this.pkg.append(`.script('compile', 'tsc')`)

    return this
  }

  // --- lint ---

  lint(config) {
    if (config.eslint) return this.eslint(config)
    if (config.tslint) return this.tslint(config)

    return this
  }
  eslint(config) {
    this.addDep('eslint').addDep('babel-eslint')

    this.vfs
      .file('.eslintrc.js')
      .append('module.exports = {')
      // .append(`\n  extends: ['` + (config.lint || 'airbnb') + `'],`)
      .append('\n}')

    return this
  }
  tslint(config) {
    this.addDep('tslint')

    this.vfs
      .file('.tslint.ts')
      .append('export {')
      .append('  extends: [tslint:latest]')
      .append('}')

    return this
  }

  // --- tests ---

  tests(config) {
    const test = config.test
    if (test.includes('travis')) this.travis(config)
    if (test.includes('ava')) this.ava(config)
    if (test.includes('jest')) this.jest(config)

    return this
  }
  jest(config) {
    this.addDep('jest')

    // add script
    this.vfs.folder('tests').file('index.js').content(defaults.jest)
    this.addScript('test', 'jest --verbose')

    return this
  }
  ava(config) {
    this.addDep('ava', '^0.19.1')

    // add script
    this.vfs.folder('tests').file('index.js').content(defaults.ava)
    this.addScript('test', 'ava --verbose')

    return this
  }

  karma(config) {
    this.vfs.file('karma.config.js').content(defaults.karma)
    return this
  }

  travis(config) {
    this.vfs.file('.travis.yml').content(defaults.travis)

    return this
  }

  // --- features ---

  features(config) {
    const features = config.features

    this.src(config).cli(config).info(config).docs(config)

    if (features.includes('editorconfig')) {
      this.editorconfig(config)
    }

    if (features.includes('schema')) {
      this.schema(config)
    }
    if (features.includes('benchmarks')) {
      this.bench(config)
    }
    if (features.includes('debugging')) {
      this.debugging(config)
    }

    return this
  }

  debugging(config) {
    this.addDep('fliplog@*')
    return this
  }

  editorconfig(config) {
    this.vfs.file('.editorconfig', 'cwd').content(defaults.editorconfig)
    return this
  }

  git(config) {
    const git = config.git

    const templates = {
      pr: git.includes('pull-request-template'),
      issue: git.includes('issue-template'),
      contributing: git.includes('contributing-doc'),
      prBot: git.includes('pr-bot'),
      gitignore: git.includes('gitignore'),
    }

    if (templates.gitignore) {
      this.vfs.file('.gitignore', 'cwd').content(defaults.gitignore)
    }

    if (config['pre-commit']) {
      this.addScript('pre-commit', config['pre-commit']).addDep('post-commit')
    }

    if (config['post-commit']) {
      this.addScript('post-commit', config['post-commit']).addDep('post-commit')
    }
  }

  cli(config) {
    this.vfs.file('cli.js')

    if (!config.bin) return this

    this.vfs.folder('bin').file('bin').content(defaults.bin)

    this.pkg.append(`.bin('bin/bin.js')`)

    return this
  }
  src(config) {
    this.vfs.folder('src')

    return this
  }

  examples(config) {
    this.vfs.folder('examples')
    return this
  }

  // --- ---

  schema() {
    this.addDep('joi')

    this.vfs
      .folder('schemas')
      .file('schema.js', 'schemas')
      .content(defaults.schema)

    return this
  }

  // script
  bench() {
    this.addDep('bench-chain', '*')

    let benchContent = `const Bench = require('bench-chain')\n`
    benchContent += `const Lib = require('../${this.folders.entry}')\n`
    benchContent += defaults.bench

    this.vfs.folder('bench')

    .file('todo.js', 'bench').content(benchContent)

    return this
  }

  // --- bundler ---
  bundler(config) {
    const bundler = config.bundler

    if (bundler.includes('webpack')) return this.webpack(config)
    if (bundler.includes('rollup')) return this.rollup(config)
    if (bundler.includes('fusebox')) return this.fusebox(config)

    return this
  }

  neutrino(config) {
    this.addDep('neutrino')
      .addScript('start', 'neutrino start')
      .addScript('start', 'neutrino build')
      .addScript('start', 'neutrino test')

    this.pkg.append(`.neutrino({
        use: [
          'neutrino-preset-react',
          'neutrino-preset-karma',
        ],
      })`)

    return this
  }
  webpack(config) {
    this.neutrino(config)
      .addDep('webpack')
      .addDep('webpack-dev-middleware')
      .addDep('connect-history-api-fallback')
      .addDep('express')
      .addDep('webpack-html-plugin')
      .addDep('webpack-hot-middleware')

    if (config.superset.includes('babel')) {
      this.addDep('babili-webpack-plugin')
    }
    else if (config.superset.includes('typescript')) {
      this.addDep('ts-loader')
    }

    this.vfs.file('webpack.config.js', 'cwd').content(defaults.webpack)

    return this
  }
  rollup(config) {
    this.addDep('rollup')

    this.vfs.file('rollup.config.js', 'cwd').content(defaults.rollup)
    return this
  }
  fusebox(config) {
    this.addDep('fusebox')

    this.vfs.file('fuse.js', 'cwd').content(defaults.fusebox)
    return this
  }
  makefile(config) {
    this.vfs.file('Makefile', 'cwd').content(defaults.Makefile)
    return this
  }

  // --- docs ---
  docs(config) {
    // const name, description
    if (config.superset.includes('typescript')) {
      this.addDep('tsdoc')

      this.addScript('docs', 'tsdoc')
    }
    else {
      this.addDep('doxdox', '2.0.2')
        .addDep('jsdoc', '3.4.3')
        .addDep('jsdoc-api', '3.0.0')
        .addDep('jsdoc-babel', '0.3.0')

      console.log('ignoring jsdoc config for now, can use cli')
      // if (config.pkgjsonconfigs) {
      //   this.pkg.append(`.jsdocs(${defaults.jsdocs})`)
      // }
      // else {
      //   this.vfs.file('jsdocs.json', 'cwd').content(defaults.jsdocs)
      // }
      this.addScript('docs', `jsdoc ${this.folders.src} --recurse --destination 'docgen'`)
    }

    const content = defaults.README
      .replace(/\$\{name\}/gim, config.name)
      .replace(/\$\{description\}/gim, config.description)

    this.vfs.file('README.md', 'cwd').content(content)

    return this
  }
  badges(config) {
    // travis, npm, codecov, lint, slack, codacy
  }

  types() {
    // "flow-bin": "^0.39.0",
    // "flow-config-parser": "0.3.0",
    // "flow-runtime": "0.2.1",
    // "flow-typed": "^2.0.0",
  }

  scripts(config) {
    const scripts = config.scripts
    if (!scripts) return this

    const scriptsToUse = {
      easyNpmFiles: scripts.includes('easy-npm-files'),
      clean: scripts.includes('clean'),
      test: scripts.includes('test'),
      pretest: scripts.includes('pretest'),
      posttest: scripts.includes('posttest'),
      prepublish: scripts.includes('prepublish'),
      postpublish: scripts.includes('postpublish'),
      preCommit: config['pre-commit'],
      postCommit: config['post-commit'],
    }

    return this
    // "post-commit": "0.0.1",
    // "pre-commit": "^1.2.2",
    // "frisbee": "^1.1.7",
    // "happypack": "^3.0.2",
    // "inferno": "^1.5.3",
    // "inferno-compat": "^1.5.3",
    // "inferno-component": "^1.5.3",
    // "inferno-create-class": "^1.5.3",
    // "inferno-router": "^1.5.3",
    // "inferno-server": "^1.5.3",
    // "inferno-transition-group": "^1.1.1",
    // "jsdom": "9.9.1",
    // "karma-babel-preprocessor": "6.0.1",
    // "karma-benchmark": "0.6.0",
    // "karma-benchmark-reporter": "0.1.1",
    // "karma-environments": "0.2.16",
    // "karma-jsdom-launcher": "5.0.0",
    // "karma-json-result-reporter": "^1.0.0",
    // "karma-mocha": "^1.2.0",
    // "karma-mocha-reporter": "^2.2.0",
    // "karma-notify-reporter": "^1.0.1",
    // "karma-sinon-chai": "1.2.4",
    // "karma-verbose-reporter": "0.0.3",
    // "sinon": "^1.17.6",
    // "sinon-chai": "^2.8.0",
    // "date-fns": "^1.27.1",
    // "express": "4.14.1",
    // "promise-worker": "^1.1.1",
    // "service-worker-loader": "^0.5.0",
    // "serviceworker-webpack-plugin": "^0.2.0",
    // "worker-loader": "^0.7.0"
  }

  info(config) {
    const {
      version,
      name,
      description,
      keywords,
      author,
      license,
      repo,
      username,
      email,
    } = config

    const pkgjson = this.get('pkgjson') || {}

    const folders = this.folders

    // important
    this.pkg.append(`.version("${version || pkgjson.version || `0.0.1`}")`)
    this.pkg.append(`.name("${name}")`)
    this.pkg.append(`.description("${description || name}")`)

    // exports
    this.pkg.append(`.main("${folders.entry}")`)
    if (folders.module) this.pkg.append(`.module("${folders.module}")`)
    if (folders.web) this.pkg.append(`.web("${folders.web}")`)

    const _keywords = stringify(toarr(keywords || pkgjson.keywords || []))
    this.pkg.append(`.keywords(${_keywords})`)

    // big meta
    this.pkg.append(`.repo("${repo || username + '/' + name}")`)
    this.pkg.append(`.author('${username}', '${email}')`)
    this.pkg.append(`.license("${license || `MIT`}")`)

    return this
  }

  // ---  ---

  renderPkg() {
    // log.quick(defaults.cli.replace('${{pkg}}', this.pkg.contents))
    const prettified = AppCLI.init().prettier(
      defaults.cli
        .replace(/\$\{pkg\}/gim, this.pkg.contents)
        .replace('/* pkg.', 'pkg.')
        .replace('.save() */', '.save()')
    )

    this.vfs.file('cli.js', 'cwd').content(prettified).force(true)

    return this
  }

  mapToShorthand(data, name) {
    this.pkg.append('.' + name + '(' + data + ')')
    return this
  }

  finish(config) {
    // this.pkgs.scripts.map(scriptStr => this.pkg.append(scriptStr))
    // this.pkgs.devDeps.map(depStr => this.pkg.append(depStr))

    this.addDep('fluent-skeleton', '*')

    let scripts = '{'
    this.pkgs.scripts.forEach(
      args => (scripts += `'${args.name}':` + args.data + ',')
    )
    scripts += '}'

    this.mapToShorthand(scripts, 'scripts')
      .mapToShorthand(
        stringify(this.pkgs.devDeps.map(args => `${args.name}@${args.data}`)),
        'devDeps'
      )
      .mapToShorthand(
        stringify(this.pkgs.deps.map(args => `${args.name}@${args.data}`)),
        'deps'
      )

    this.pkg.append(`.dir(__dirname)`).append(`.save()`)

    this.renderPkg()

    this.pkg.prepend(`const {pkg, AppCLI} = require('fluent-skeleton')\n\n`)

    // https://github.com/npm/npm/blob/latest/bin/npm-cli.js#L85
    this.pkg.append('.config({"ham-it-up": true})')

    const prettified = AppCLI.init().prettier(this.pkg.contents)
    // log.quick(prettified, this.pkg.contents)

    this.pkg.setContent(prettified).write()

    this.vfs.create()
    // log.quick(this.vfs, config)

    return this
  }
}

module.exports = Plugins
