const githubUsername = require('github-username')
const nameCache = new Map()
const emailCache = new Map()
const execa = require('execa')

/**
 * @mixin
 * @alias actions/user
 */
const user = module.exports

user.git = {}
user.github = {}

/**
 * Retrieves user's name from Git in the global scope or the project scope
 * (it'll take what Git will use in the current context)
 */
user.git.name = () => {
  let name = nameCache.get(process.cwd())

  if (name) {
    return name
  }

  name = execa.shellSync('git config --get user.name').stdout.trim()
  nameCache.set(process.cwd(), name)

  return name
}

/**
 * Retrieves user's email from Git in the global scope or the project scope
 * (it'll take what Git will use in the current context)
 */
user.git.email = () => {
  let email = emailCache.get(process.cwd())

  if (email) {
    return email
  }

  email = execa.shellSync('git config --get user.email').stdout.trim()
  emailCache.set(process.cwd(), email)

  return email
}

/**
 * Retrieves GitHub's username from the GitHub API
 */
user.github.username = cb => {
  const promise = githubUsername(user.git.email())

  if (cb) {
    promise.then(val => cb(null, val), err => cb(err))
  }

  return promise
}

const gituser = {
  name: execa.shellSync('git config --get user.name').stdout.trim(),
  email: execa.shellSync('git config --get user.email').stdout.trim(),
}
user.github.username(username => {
  gituser.username = username
})

module.exports = gituser
