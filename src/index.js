// require('source-map-support').install();
// const Boss = require('likaboss')
const Boss = require('likeaboss')
const gen = require('./interactive')
const {VFS, VFSFolder} = require('./vfs')
const {handle, AppCLI, pkg} = require('./lib')

module.exports = Boss.module(module)
  .main(AppCLI)
  .props({
    VFS,
    pkg,
    handle,
    AppCLI,
    gen,
  })
  .end()
