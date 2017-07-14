const ChainedMap = require('flipchain/ChainedMapExtendable')
const {exists, mkdirp, del} = require('flipfile')
const File = require('file-chain')
const log = require('fliplog')

/**
 * @prop {ChainedMap} files
 * @prop {ChainedMap} folders
 * @prop {Map<*, *>} store
 */
class Folder extends ChainedMap {
  // files: ChainedMap
  // folders: ChainedMap
  // store: Map<*, *>

  /**
   * @since 0.0.1
   * @param {ChainedMap | null} parent
   */
  constructor(parent) {
    super(parent)
    this.files = new ChainedMap(this)
    this.folders = new ChainedMap(this) // nested
    this.extend(['name', 'absPath', 'force'])
  }

  /**
   * @since 0.0.1
   * @param  {File} file for this folder
   * @return {Folder} @chainable
   */
  file(file) {
    file.dir(this.get('absPath'))

    // log.quick(this.get('debug'), this.entries())
    log.magenta('adding file:').data({file}).echo(this.get('debug'))

    this.files.set(file.absPath, file)

    return this
  }

  /**
   * @since 0.0.1
   * @return {Folder} @chainable
   */
  del() {
    // would map folders .toConfig too
    const folders = this.folders.values().concat([this.get('absPath')])
    const files = this.files.values()

    folders.concat(files).forEach(chain => {
      const absPath = chain.absPath || chain
      log.red('deleting').data(absPath).echo(this.get('debug'))
      del(absPath)
    })

    return this
  }

  /**
   * @since 0.0.1
   * @see VFS.absPath
   * @see VFS.force (will use force if set via that fn)
   * @param  {boolean} [forceCreate=false] create even if it exists
   * @return {Folder} @chainable
   */
  create(forceCreate = false) {
    const {absPath, force} = this.entries()

    if (force !== null && force !== undefined) {
      forceCreate = force
    }

    if (exists(absPath) === false || forceCreate === true) {
      log.green('creating folder: ').data(absPath).echo(this.get('debug'))
      mkdirp(absPath)
    }

    this.files.values().filter(f => f).forEach(file => {
      log.red('file...: ').data(file).echo()

      if (forceCreate === true || file.exists() === false) {
        log.green('creating file: ').data(file).echo(this.get('debug'))
        file.write()
      }
      else {
        log
          .yellow('did not create file (already exists): ')
          .data(file)
          .echo(this.get('debug'))
      }
    })

    return this
  }

  /**
   * @since 0.0.1
   * @return {Object} entries
   */
  toConfig() {
    const {absPath} = this.entries()
    const folders = this.folders.entries() || {}
    const files = this.files.entries() || {}

    log.data(this.files).red('files...').echo(this.get('debug'))

    log
      .data({files, absPath, folders})
      .bold('toConfig.files, folders, absPath')
      .echo(this.get('debug'))

    return {[absPath]: {folders, files}}
  }

  /**
   * @since 0.0.1
   * @return {string}
   */
  toString() {
    return this.files.entries()
  }
}

module.exports = Folder
