  "babel": {
    "presets": [
      "es2015"
    ],
    "plugins": [
      "transform-async-to-generator",
      "istanbul"
    ],
    "sourceMaps": "inline"
  },
  "ava": {
    "require": [
      "babel-register"
    ],
    "files": [
      "tests/**/*.js"
    ],
    "babel": "inherit"
  },
  "nyc": {
    "all": true,
    "cache": true,
    "instrument": false,
    "include": "src/**/*.js",
    "require": [
      "babel-register"
    ],
    "sourceMap": false
  }
