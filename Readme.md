# compile-sass

> A module to compile SASS on-the-fly and/or save it to CSS files using [node-sass](https://github.com/sass/node-sass)

The goal of this project is twofold:
1. To provide a library that can compile SASS files on page load when using `NODE_ENV=development` in order to reduce development time (on-the-fly)
2. To enable compilation and saving of SASS files to CSS files on all other environments when, for example, the application starts or with an npm script


## Table of Contents

- <a href="#requirements">Requirements</a>
- <a href="#install">Install</a>
- <a href="#example-usage">Example Usage</a>
- <a href="#usage">Usage</a>
- <a href="#api">API</a>
- <a href="#release-notes">Release Notes</a>
- <a href="#maintainer">Maintainer</a>


## Requirements

This module is tested with Node.js 10 and 11. It might work with Node.js >= 9, but is not tested.


## Install

```
npm install --save compile-sass
```

## Example Usage

The following are a couple of examples of how you can use it in a real-life application:

- Setup: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/src/lib/booting/compileSass.js) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/src/lib/booting/compileSass.ts)
- Configuration: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/config/default.js#L23) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/config/default.ts#L35)
- Integration into the app: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/src/app.js#L46) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/src/app.ts#L30)


## Usage

### For on-the-fly compiling

```js
const compileSass = require('compile-sass');
app.use('/css/:cssName', compileSass());
```

#### With options

```js
const compileSass = require('compile-sass');
app.use('/css/:cssName', compileSass({
  sassFilePath: path.join(__dirname, 'public/scss/'),
  sassFileExt: 'sass',
  embedSrcMapInProd: true,
  nodeSassOptions: {
    errLogToConsole: true,
    noCache: true,
    force: true
  }
}));
```

#### Options

- sassFilePath (default: 'public/scss')
- sassFileExt (default: 'scss')
- embedSrcMapInProd (default: false)
- nodeSassOptions (default: {})


### For compiling and saving as static CSS files

```js
const compileSass = require('compile-sass');
compileSass.compileSassAndSaveMultiple({
    sassPath: path.join(__dirname, 'public/scss/'),
    cssPath: path.join(__dirname, 'public/css/'),
    files: ['libs.scss']
  });
})).then(...).catch(...);
```


## API

### compileSass()

Returns the compiled SASS as a string.

```js
const compileSass = require('compile-sass');
const cssString = compileSass.compileSass().then(...).catch(...);
```

### compileSassAndSave()

Compiles the given SASS file and saves it in the given directory.

```js
const compileSass = require('compile-sass');
compileSass.compileSassAndSave('full/path/to/sass-file.scss', 'full/path/to/css/').then(...).catch(...);
```


### compileSassAndSaveMultiple()

Compiles multiple SASS files defined in the "files" option. They must all be located in the directory defined in the "sassPath" option. The CSS files will be saved in the directory defined in the "cssPath" option.

```js
const compileSass = require('compile-sass');
compileSass.compileSassAndSaveMultiple({
    sassPath: path.join(__dirname, 'public/scss/'),
    cssPath: path.join(__dirname, 'public/css/'),
    files: ['libs.scss']
  });
}).then(...).catch(...);
```

### setupCleanupOnExit()

Deletes the passed directory when the app is exited. The idea is to pass the directory where your compiled CSS files are, so that they can be deleted when the app is exited and recompiled when the app starts.

```js
const compileSass = require('compile-sass');
process.on('SIGINT', () => {
  try {
    compileSass.setupCleanupOnExit('full/path/to/css');
    process.exit(0);
  }
  catch(error) {
    process.exit(1);
  }
});
```


## Release Notes

### 0.1.2

- Update node-sass

### 0.1.1

- Add more documentation

### 0.1.0

- Add the ability to pass options to `node-sass`
- Add further documentation


## Maintainer

This modules is maintained by Alex Seifert ([Website](https://www.alexseifert.com), [Github](https://github.com/eiskalteschatten)).
