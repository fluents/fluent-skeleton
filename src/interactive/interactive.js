// const pkg = require('./package.json')
const {resolve} = require('path')
const doesInclude = require('does-include')
const exists = require('flipfile/exists')
const CLI = require('cli-chain')
const log = require('fliplog')
const ObjChain = require('obj-chain-core')
const Plugins = require('../gen/plugins')
const git = require('./git')

// use these for sweet session saving and resuming
// const git = require('git-username')
// const configs = new ObjChain(['Config']).setup()
const ConfigStore = require('configstore')
const configs = new ConfigStore('fluent-skeleton')

const email = configs.get('email')
const author = configs.get('author')
const username = configs.get('username')

// log.quick(configs)
// require('fliplog').quick({CLI, log, flipscript, flipcache, Presets})
log.registerCatch()

// const presets = new Presets()
// const {ScriptFlip} = flipscript

const cli = new CLI()

/**
 * @param {string} dir
 * @return {Object} pkg
 */
function getPkg(dir) {
  const pkgPath = resolve(dir, './package.json')
  if (exists(pkgPath)) {
    return require(pkgPath) // eslint-disable-line
  }
  return {}
}

// const program = cli.program()
// const scripts = new ScriptFlip().debug(true)

/* prettier-ignore */

// loading this from a preset saved to `nodeconfig` would be best
function setup(pkg = {}) {
  log.emoji('todo').yellow('@TODO:', 'persist answers to resume next time').echo()
  log.emoji('todo').yellow('examples folder').echo()
  log.emoji('todo').yellow('do not duplicate pkg and cli?').echo()
  log.emoji('todo').yellow('[x] keywords').echo(false)
  log.emoji('todo').yellow('yeoman extraction').echo()
  log.emoji('todo').yellow('[x] nodeconfig data').echo(false)
  log.emoji('todo').yellow('ask about common packages, exports').echo()
  log.emoji('todo').yellow('fix creating test folder, seems to mkdirp').echo()
  log.emoji('todo').yellow('fix babelrc file').echo()
  log.emoji('todo').yellow('interactive webpack config').echo()
  log.emoji('todo').yellow('interactive eslint config - should be able to be done automatically').echo()
  log.emoji('todo').yellow('add .registerStory').echo()
  log.emoji('todo').yellow('add .goto(story)').echo()
  log.emoji('todo').yellow('store username and all such data in nodeconfig').echo()
  log.emoji('todo').yellow('need to `update` from pkg json...').echo()
  log.emoji('todo').yellow('use camel-case on the answers').echo()
  log.emoji('todo').yellow('improve the vfs, chaining should be better on it').echo()

  let homepage = pkg.homepage
  if (typeof homepage === 'string') {}

  cli
    .step('name', 'input')
      .default(pkg.name)
    .step('description', 'input')
      .default(pkg.description)
    .step('email', 'input')
      .default(email || pkg.author)
    .step('author-name', 'input')
      .default(author || git.username)
    .step('username', 'input')
      .default(git.username || username || pkg.author)
    .step('keywords', 'input')
      .default(pkg.keywords)
    // contributors
    // would load a different whole set of steps
    // .step('monorepo', 'confirm')

    .step('test', 'checkbox')
      // travis hooks, like slack
      .checkbox('travis', true)
      // tests in source, or in test/ folder
      .checkbox('ava', true)
      .checkbox('jest', false)
      .checkbox('karma', false)
      .checkbox('appvoyer', false)
      .checkbox('circle-ci', false)
      .checkbox('codecov', false)

    .step('superset', 'list')
      // babel-preset-env
      .choice('babel')
      // loose, strict
      .choice('typescript')
      .choice('es5')

    // can have presets with inferno, preact, react, vue
    // talk to matt
    .step('environments', 'checkbox')
      .checkbox('node', true)
      .checkbox('web', true)
      .checkbox('electron', false)
      // .whenIncl('babel') // sick, works

    // can have their own interactive preset substeps...
    .step('tslint', 'confirm')
      .whenIncl('superset', 'typescript')
    .step('eslint', 'confirm')
      .whenIncl('superset', 'babel')
    .step('eslint-extends', 'input')
      .whenIncl('eslint')
      // .default('eslint-recommended')
    .step('flow-type', 'confirm')
      .whenIncl('superset', 'babel')

    // these could be checkboxes, and then do .when .includes
    .step('features', 'checkbox')
      .checkbox('benchmarks', true)
      // would set client to yarn in lerna if monorepo
      .checkbox('yarn', false)
      // interactive
      .checkbox('editorconfig', false)
      .checkbox('schemas', false)
      // fliplog, interactive features there help too
      .checkbox('debugging', true)

    .step('docs', 'checkbox')
      .checkbox('jsdocs', true)
      .checkbox('doxdox', false)
      .whenIncl('superset', '!typescript')
    .step('docs', 'checkbox')
      .checkbox('tsdocs', true)
      .whenIncl('superset', 'typescript')

    .step('git', 'checkbox')
      .checkbox('gitignore', true).disabled()
      .checkbox('contributing-doc', false).disabled()
      .checkbox('pull-request-template', false).disabled()
      .checkbox('issue-template', false).disabled()
      .checkbox('pr-bot', false).disabled()
      .checkboxs('pre-commit,post-commit', false)

    .step('cli', 'checkbox')
      .checkbox('package.js', true)
      .checkbox('bin', false)

    .step('pre-commit', 'input', 'pre-commit script')
      .whenIncl('git', 'pre-commit')
    .step('post-commit', 'input', 'post-commit script')
      .whenIncl('git', 'post-commit')


    // interactive on this would be king
    .step('bundler', 'checkbox')
      .whenIncl('superset', ['babel', 'typescript'])
      .checkbox('rollup', false)
      .checkbox('webpack', false)
      .checkbox('fusebox', false)

    .step('scripts', 'checkbox')
      .separator('====')
      .checkboxs('test', true)
      .checkboxs('pretest,posttest,prepublish,postpublish', false)
      .checkboxs('easy-npm-files,watch,clean', false)

      // .checkbox

    // needs to input username and org if org is used
    // description, license, gitter,
    .step('badges', 'checkbox')
      .checkbox('travis', true) // when travis
      .checkbox('lint', true) // when lint
      .checkbox('dependencies', true)

    // disabled
    .step('bundlerconfig', 'checkbox')
      .when(() => false)
      .checkbox('aliases')
      .checkbox('production define')
      .checkbox('production uglify')
      .checkbox('sourcemaps')
      .checkbox('application or module/package')

    .step('pkgjsonconfigs', 'confirm', 'put config files in package json')
      .whenIncl(['superset', 'docs'], ['babel', 'jsdocs'])

    .step('docs-folder', 'input')
      .default('docs')
    .step('output-folder', 'input', 'output-folder')
      .default('disted')
      .whenIncl('superset', ['babel', 'typescript'])
    .step('tests-folder', 'input')
      .default('test')
    .step('src-folder', 'input')
      .default('src')
    .step('temp-folder', 'input')
      .default('.tmp')

    .step('export-entry', 'input')
      .default('disted/index.js')
      .whenIncl('superset', ['babel', 'typescript'])
    .step('export-entry', 'input')
      .default('src/index.js')
      .whenIncl('superset', ['!babel', '!typescript'])

    .step('export-module (for use as raw es6/ts)', 'input', 'export-module')
      .default('src/index.js')
    .step('export-web', 'input', 'export-web')
      .whenIncl('environments', ['web'])

  // should make like the ultimate rollup/webpack/fusebox config
  // that loads environments, allows easy shorthands, not monorepo focused
  //
  // now, I need to take this generated config,
  // call the right plugins
  // assemble the VFS
  // write it out

  // adjust this config so it only shows certain steps
  // when the respective files do not exist
  //
  // list, pick, then go back to the list
  // .step('config', 'checkbox')
  //   .checkbox('src', true)
  //   .checkbox('docs', true)
  //   .checkbox('build-output', true)
  // types, exports
}

module.exports = function interactive(dir = process.cwd()) {
  const pkg = getPkg(dir)
  setup(pkg)

  return cli
    .then(answers => {
      answers.dir = dir
      const plugins = new Plugins()
      plugins.configStore(configs)
      plugins.config(answers).pkgjson(pkg).handle()
    })
    .run()
}
