# compile-sass

[![Tests](https://github.com/eiskalteschatten/compile-sass/actions/workflows/tests.yml/badge.svg)](https://github.com/eiskalteschatten/compile-sass/actions/workflows/tests.yml)
[![Build](https://github.com/eiskalteschatten/compile-sass/actions/workflows/build.yml/badge.svg)](https://github.com/eiskalteschatten/compile-sass/actions/workflows/build.yml)

> A module to compile SASS on-the-fly and/or save it to CSS files using [node-sass](https://github.com/sass/node-sass)

The goal of this project is twofold:
1. To provide a library that can compile SASS files on page load when using `NODE_ENV=development` in order to reduce development time (on-the-fly)
2. To enable compilation and saving of SASS files to CSS files on all other environments when, for example, the application starts or with an npm script

**Important Note:**

This is the documentation for v2. If you need the documentation for v1, please see the Readme from the last release of v1: https://github.com/eiskalteschatten/compile-sass/tree/v1.1.3


## Table of Contents

- <a href="#requirements">Requirements</a>
- <a href="#install">Install</a>
- <a href="#example-usage">Example Usage</a>
- <a href="#usage">Usage</a>
- <a href="#api">API</a>
- <a href="#migration-guide">Migration Guide</a>
- <a href="#release-notes">Release Notes</a>
- <a href="#maintainer">Maintainer</a>


## Requirements

This module is tested with Node.js >= 14. It might work with Node.js <= 13, but is not tested.

Peer Dependencies:

- [sass](https://www.npmjs.com/package/sass)
- [express](https://www.npmjs.com/package/express)


## Install

```
npm install --save compile-sass sass express
```

## Example Usage

The following are a couple of examples of how you can use it in a real-life application:

*Note: These examples still use v1. This notice will be removed once they have been updated.*

- Setup: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/src/lib/booting/compileSass.js) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/src/lib/booting/compileSass.ts)
- Configuration: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/config/default.js#L23) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/config/default.js#L23)
- Integration into the app: [Node.js](https://github.com/eiskalteschatten/nodejs-webapp/blob/master/src/app.js#L46) / [TypeScript](https://github.com/eiskalteschatten/typescript-webapp/blob/master/src/app.ts#L30)


## Usage

### For on-the-fly compiling

##### TypeScript

```js
import compileSass from 'compile-sass';
app.use('/css/:cssName', compileSass());
```

##### CommonJS

*Pay attention to the `compileSass.setup` which differs from the TypeScript variation!*

```js
const compileSass = require('compile-sass');
app.use('/css/:cssName', compileSass.setup());
```

#### With options

##### TypeScript

```js
import compileSass from 'compile-sass';

app.use('/css/:cssName', compileSass({
  sassFilePath: path.join(__dirname, 'public/scss/'),
  sassFileExt: 'sass',
  embedSrcMapInProd: true,
  resolveTildes: true,
  sassOptions: {
    alertAscii: true,
    verbose: true
  }
}));
```
##### CommonJS

*Pay attention to the `compileSass.setup` which differs from the TypeScript variation!*

```js
const compileSass = require('compile-sass');

app.use('/css/:cssName', compileSass.setup({
  sassFilePath: path.join(__dirname, 'public/scss/'),
  sassFileExt: 'sass',
  embedSrcMapInProd: true,
  resolveTildes: true,
  sassOptions: {
    alertAscii: true,
    verbose: true
  }
}));
```

#### Options

- sassFilePath (default: 'public/scss')
- sassFileExt (default: 'scss')
- embedSrcMapInProd (default: false)
- resolveTildes (default: false)
- sassOptions (default: {}) 
  - See https://sass-lang.com/documentation/js-api/interfaces/Options for more details


### For compiling and saving as static CSS files

```js
import { compileSassAndSaveMultiple } from 'compile-sass'; // TypeScript
const { compileSassAndSaveMultiple } = require('compile-sass'); // CommonJS

await compileSassAndSaveMultiple({
    sassPath: path.join(__dirname, 'public/scss/'),
    cssPath: path.join(__dirname, 'public/css/'),
    files: ['libs.scss']
  });
}));
```


## API

### compileSass()

Returns the compiled SASS as a string.

```js
import { compileSass } from 'compile-sass'; // TypeScript
const { compileSass } = require('compile-sass'); // CommonJS

const cssString = await compileSass();
```

### compileSassAndSave()

Compiles the given SASS file and saves it in the given directory.

```js
import { compileSassAndSave } from 'compile-sass'; // TypeScript
const { compileSassAndSave } = require('compile-sass'); // CommonJS

await compileSassAndSave('full/path/to/sass-file.scss', 'full/path/to/css/');
```


### compileSassAndSaveMultiple()

Compiles multiple SASS files defined in the "files" option. They must all be located in the directory defined in the "sassPath" option. The CSS files will be saved in the directory defined in the "cssPath" option.

```js
import { compileSassAndSaveMultiple } from 'compile-sass'; // TypeScript
const { compileSassAndSaveMultiple } = require('compile-sass'); // CommonJS

await compileSassAndSaveMultiple({
    sassPath: path.join(__dirname, 'public/scss/'),
    cssPath: path.join(__dirname, 'public/css/'),
    files: ['libs.scss']
  });
});
```

### setupCleanupOnExit()

Deletes the passed directory when the app is exited. The idea is to pass the directory where your compiled CSS files are, so that they can be deleted when the app is exited and recompiled when the app starts.

```js
import { setupCleanupOnExit } from 'compile-sass'; // TypeScript
const { setupCleanupOnExit } = require('compile-sass'); // CommonJS

process.on('SIGINT', () => {
  try {
    setupCleanupOnExit('full/path/to/css');
    process.exit(0);
  }
  catch(error) {
    process.exit(1);
  }
});
```


## Migration Guide 

### v1 to v2

The update to v2 includes a couple of breaking changes to be aware of:

- `express` and `sass` are now peer dependencies that need to be installed seperately. `compile-sass` will not work without them.
- The `nodeSassOptions` parameter in the setup is now called `sassOptions` because the new sass compiler uses a different set of options than its predecessor. See https://sass-lang.com/documentation/js-api/interfaces/Options for the options supported by the new compiler.
- `compile-sass` now requires Node >= 14


## Release Notes

### 2.0.0

- Move away from the deprecated `node-sass` package in lieu of the Dart-based `sass` package
  - **Warning: Breaking change! `nodeSassOptions` is now `sassOptions` with different parameters. Check the documentation above.**
  - The `sass` package is now a peer dependency and needs to be managed by the installing project
- Update all npm packages
- Remove `express` as a direct dependency since it's a peer dependency and should be managed by the installing project
- Remove packages that can be replaced with functionality from Node's standard library
- Support for Node >= 16
- Use `bootstrap` to improve testing by compiling real world examples
- Add more asynchronous bahavior to boost performance
- Security updates


### 1.1.3

- Security updates
- Update TypeScript


### 1.1.2

- Security updates


### 1.1.1

- Security updates


### 1.1.0

- Add a feature to resolve paths passed to `@import` that start with `~`
- Security updates
- Fix a bug where the node-sass options passed during setup weren't always used


### 1.0.5

- Fix a critical security vulnerability


### 1.0.4

- Security updates
- Update node-sass
- Update hoek 5 to @hapi/hoek 9


### 1.0.3

- Fix the broken 1.0.2 release


### 1.0.2

- Security updates
- Update node-sass


### 1.0.1

- Optimize what is included when the package is published (no more test files!)
- Fix a couple of broken links in the Readme
- Include LICENSE


### 1.0.0

- Complete re-write with TypeScript
- Include typings for TypeScript
- Include automated testing for better stability

### 0.1.4

- Update dependencies to fix security vulnerabilities

### 0.1.3

- Fix security vulnerabilities

### 0.1.2

- Update node-sass

### 0.1.1

- Add more documentation

### 0.1.0

- Add the ability to pass options to `node-sass`
- Add further documentation


## Maintainer

This modules is maintained by Alex Seifert ([Website](https://www.alexseifert.com), [Github](https://github.com/eiskalteschatten)).
