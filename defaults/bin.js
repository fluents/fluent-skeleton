#!/usr/bin/env node

const argv = require('funwithflags')(process.argv.slice(2), {
  default: {
    debug: false,
    dir: '',
    port: 0,
  },
  boolean: ['debug'],
  number: ['port'],
  string: ['dir'],
})
