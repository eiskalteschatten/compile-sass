# compile-sass

> A module to compile SASS on-the-fly and/or save it to CSS files using [node-sass](https://github.com/sass/node-sass)

*This module is still in its infancy. More documentation and features will be added as it matures.*

## Requirements

This module is tested with Node.js 8 and 9. It might work with Node.js 6 or 7, but is not tested.

## Install

```
npm install --save compile-sass
```

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
	embedSrcMapInProd: true
}));
```

#### Options

- sassFilePath (default: 'public/scss')
- sassFileExt (default: 'scss')
- embedSrcMapInProd (default: false)


### For compiling and saving as static CSS files

```js
const compileSass = require('compile-sass');
compileSass.compileSassAndSaveMultiple({
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
const compileSass = require('compile-sass');
compileSass.compileSass().then(...).catch(...);
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
}));
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


## Maintainer

This modules is maintained by Alex Seifert ([Website](https://www.alexseifert.com), [Github](https://github.com/eiskalteschatten)).
