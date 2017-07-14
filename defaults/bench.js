Bench.init(__dirname, 'configstore.example-bench')
  .add('one', () => {
    const one = 1
  })
  .add('two', () => {
    const two = 1 + 1 === 2
  })
  .run()
