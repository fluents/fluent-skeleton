//
// /**
//  * could also use this style to do do readme badges, eslint configs, gitignore
//  * @return {CLI} @chainable
//  */
// pkg() {
//   pkg
//     .extend(['jest'])
//     .version('0.0.1')
//     .name('fluent-skeleton')
//     .description('cli')
//     .script('test', 'jest --verbose')
//     .script(
//       'strip',
//       'flow-remove-types src/ --pretty --all --out-dir disted/'
//     )
//     .main('disted/index.js')
//     .deps([
//       'dot-prop@*',
//       'file-chain@*',
//       'fliplog@*',
//       'to-arr@*',
//       'flipscript@*',
//       'flipchain@*',
//       'flipfile@*',
//       'globby@^6.1.0',
//     ])
//     .devDeps(['minimist@1.2.0', 'doxdox@2.0.2'])
//     .keywords(['eh', 'canada'])
//     .author('James <aretecode@gmail.com>')
//     .license('MIT')
//     .repo('aretecode/eh')
//     .jest({
//       globals: {
//         __DEV__: true,
//       },
//       rootDir: '.',
//       testRegex: '(tests\/)(.*).js$',
//     })
//     .dir(__dirname)
//     .save()
//
//   return this
// }
