const log = require('fliplog')
const Script = require('script-chain')
const {AppCLI, pkg, VFS} = require('./disted')

// https:// github.com/sindresorhus/awesome-nodejs#documentation

log.registerCatch()

// pkgname: appbuild
class CLI extends AppCLI {
  constructor() {
    super()
    // this.dir = process.cwd()
    this.dir = __dirname
  }

  /**
   * @param {any} names
   * @return {CLI} @chainable
   */
  create() {
    const vfs = new VFS()

    vfs
      .folder(this.dir)
      .file('.gitignore')
      .folder('src')
      // test
      .folder('tests')
      .file('.travis.yml')
      // bench
      .folder('bench')
      .file('first.js', 'bench')
      // cli
      .file('cli.js')
      .folder('bin')
      .file('bin')
      // readme
      .file('README.md')
      .folder('docs')
      // schema
      .folder('schemas')
      .file('schema.js', 'schemas')
      // os
      .file('.editorconfig')
      // types
      .file('.flowconfig')
      // lint
      .file('.eslintrc.js')

    // setup deps depending on config,
    // a lot like fliplog,
    // also the npm scripts right
    //
    // ---
    //
    // set default content here
    // set up the cli.js file
    //
    // ---
    //
    // more presets like precommit
    // cleaning scripts
    // bin preset
    // backend and frontend preset
    // docs, benchmark, flow, ts
    // tests, ava, jest
    // exports: easy-npm, likeaboss...
    // monorepo preset

    vfs.create()

    return this
  }

  /**
   * could also use this style to do do readme badges, eslint configs, gitignore
   * @return {CLI} @chainable
   */
  pkg() {
    pkg
      .extend(['jest'])
      .version('0.0.1')
      .name('fluent-skeleton')
      .description('cli')
      .script('test', 'jest --verbose')
      .script(
        'strip',
        'flow-remove-types src/ --pretty --all --out-dir disted/'
      )
      .main('disted/index.js')
      .deps([
        'dot-prop@*',
        'file-chain@*',
        'fliplog@*',
        'flipcli@*',
        'to-arr@*',
        'flipscript@*',
        'flipchain@*',
        'flipfile@*',
        'globby@^6.1.0',
        'likeaboss@*',
        'obj-chain@*',
        'prettier@*',
        'globby@*',
      ])
      .devDeps(['funwithflags@1.2.0', 'doxdox@2.0.2'])
      .keywords(['eh', 'canada'])
      .author('James <aretecode@gmail.com>')
      .license('MIT')
      .repo('aretecode/eh')
      .jest({
        globals: {
          __DEV__: true,
        },
        rootDir: '.',
        testRegex: '(tests\/)(.*).js$',
      })
      .dir(__dirname)
      .save()

    return this
  }

  /**
   * @param {any} names
   * @return {CLI} @chainable
   */
  script(names = null) {
    const scripts = new Script().debug(false).cwd(this.dir)
    scripts.add().npm('strip')
    scripts.run()

    return this
  }
}

new CLI().handle()
