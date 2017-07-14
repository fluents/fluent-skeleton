// would be cool to update dependencies from package json auto into here...
// meta-programming
const log = require('fliplog')
const ObjChain = require('obj-chain-core')

// const camelCase = require('camel-case')

console.log('\n\n\n\n\n\n\n\n\n\n')
const pkg = new ObjChain([
  // 'MapPlugin',
  'LodashPlugin',
  'FilePlugin',
  'JSONPlugin',
  'KebabPlugin',
  'PkgPlugin',
])

// pkg.store.set('debug', true)
pkg.store.set('debug', false)
pkg.setup()

// pkg.set('ehhh', true)
// pkg.dep('eh@*')
// pkg.devDep('eh', '*')
// // pkg.write()
// log.quick(pkg)
// log.quick(pkg.get('dependencies'))
// log.quick(pkg)

module.exports = pkg
