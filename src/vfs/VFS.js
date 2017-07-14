const {resolve} = require('path')
const ChainedMap = require('flipchain/ChainedMapExtendable')
const ChainedSet = require('flipchain/ChainedSet')
const File = require('file-chain')
const log = require('fliplog')
const Folder = require('./VFSFolder')
// const ObjChain = require('./ObjChain')

// https://github.com/streamich/nodefs/blob/master/module.js
class VFS extends ChainedMap {
  // history: ChainedSet
  // folders: ChainedMap
  // current: {
  //   folder: null | Folder,
  //   file: null | File,
  // }

  /**
   * @since 0.0.1
   * @param {ChainedMap | null} parent
   */
  constructor(parent) {
    super(parent)

    this.history = new ChainedSet(this)
    this.folders = new ChainedMap(this)
    this.current = {folder: null, file: null}
  }

  /**
   * @since 0.0.1
   * @see File.setContent
   * @param  {string} content
   * @return {VFS} @chainable
   */
  content(content) {
    if (this.current.file !== null) {
      this.current.file.setContent(content)
    }

    return this
  }

  /**
   * @since 0.0.1
   * @see VFS.content
   * @see File.append
   * @param  {string} content
   * @return {VFS} @chainable
   */
  append(content) {
    if (this.current.file !== null) {
      this.current.file.append(content)
    }

    return this
  }

  /**
   * @since 0.0.1
   * @desc forces file creation even if it exists
   * @return {VFS} @chainable
   */
  force() {
    if (this.current.file !== null) {
      this.current.file.write()
    }

    return this
  }

  /**
   * @since 0.0.1
   * @param  {string} name
   * @param  {string} [folder=null]
   * @return {VFS} @chainable
   */
  file(name, folder = null) {
    const f = File.src(name)

    log.data({name, file: f}).blue('adding file').echo()

    if (folder === 'cwd' && this.has('cwd') === true) {
      this.folders.get(this.get('cwd')).file(f)
    }
    else if (folder === null && this.current.folder !== null) {
      this.current.folder.file(f)
    }
    else if (folder === null && this.has('cwd') === true) {
      this.folders.get(this.get('cwd')).file(f)
    }
    else if (folder === null) {
      console.log(name, folder)
      throw new Error('no folder, no current folder')
    }
    else {
      this.folders.get(folder).file(f)
    }

    this.current.file = f

    return this
  }

  /**
   * @since 0.0.1
   * @param  {string} name
   * @param  {string} [folder=null] nested folder
   * @return {VFS} @chainable
   */
  folder(name, folder = null) {
    const cwd = this.get('cwd')
    const absPath = resolve(cwd, name)
    const f = new Folder().absPath(absPath)
    this.folders.set(name, f)
    this.current.folder = f
    log.data({name, folder: f}).cyan('adding folder').echo(this.get('debug'))

    return this
  }

  /**
   * @TODO: needs implementation
   *
   * @since 0.0.1
   * @param {Function} cb
   * @return {VFS} @chainable
   */
  filter(cb) {
    return this
  }

  /**
   * @TODO fix the mystery empty file
   * @since 0.0.1
   * @param  {boolean} [force=false] create even if it exists
   * @return {Folder} @chainable
   */
  create(force = false) {
    this.folders.values().filter(f => f).map(folder => {
      if (folder) {
        folder.create(force)
      }
    })
    return this
  }

  /**
   * @since 0.0.1
   * @return {Folder} @chainable
   */
  del() {
    this.folders.values().map(folder => folder.del())
    return this
  }

  // ---- dir ----

  /**
   * @since 0.0.1
   * cd() {}
   * @desc change current working directory
   * @param  {string} cwd
   * @return {VFS} @chainable
   */
  chwd(cwd) {
    log.yellow('changing cwd: ').data(cwd).echo(this.get('debug'))

    this.history.add(cwd)
    this.folder(cwd)

    return this.set('cwd', cwd)
  }

  /**
   * @since 0.0.1
   * @return {string}
   */
  cwd() {
    return this.get('cwd')
  }

  /**
   * @since 0.0.1
   * @return {string}
   */
  toString() {
    return this.folders.values().map(entry => entry.toConfig()).join('\n')
  }

  /**
   * @since 0.0.1
   * @return {{folders: Array<Folder.toConfig>}}
   */
  toConfig() {
    return {
      folders: this.folders.values().map(entry => entry.toConfig()),
    }
  }
}

module.exports = VFS
