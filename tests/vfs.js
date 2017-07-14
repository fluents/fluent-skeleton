// const test = require('ava')
const VFS = require('../disted/VFS')

test('VFS can be created', () => {
  const vfs = new VFS()

  vfs
    .chwd(__dirname)
    .file('.eslintrc.js')
    .file('.editorconfig')
    .file('.flowconfig')
    .file('.gitignore')
    .folder('docs')
    .folder('src')
    .folder('tests')

  require('fliplog').data(vfs).bold('vfs').echo(true)
  require('fliplog').data(vfs.toString()).bold('vfs.toString()').echo(true)
  require('fliplog').data(vfs.toConfig()).bold('vfs.toConfig()').echo(true)

  expect(vfs).toBeInstanceOf(VFS)
})
