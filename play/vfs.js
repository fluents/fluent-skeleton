/* prettier-ignore */
this.vfs
      .cwd(__dirname)
      .folder('bin')
        .file('cli.js', 'cwd')
          .prepend(`const {pkg, AppCLI} = require('../../packages/skeleton')\n`)
          .content(prettified)
          .force(true)
      .cwd('../')
      .folder('a-new-package')
        .file('wut.js')
        .file('ye.js')
      .save()
