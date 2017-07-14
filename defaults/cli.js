const log = require('fliplog')
const {pkg, AppCLI} = require('fluent-skeleton')

class CLI extends AppCLI {
  constructor() {
    super()
    this.dir = __dirname
  }

  /**
   * @desc writes pkg json
   * @return {CLI} @chainable
   */
  pkg() {
    /* ${{pkg}} */
    return this
  }
}

/**
 * @desc parses cli arguments to call methods
 * @example
 *  `node cli --pkg --docs --npm=build,test`
 */
new CLI().handle()
