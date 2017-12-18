'use strict';

const path  = require('path');
const fs = require('fs');
const mkdirp = require('mkdirp');
const sass = require('node-sass');
const exec = require('child_process').exec;

const nodeEnv = process.env.NODE_ENV;

module.exports = setup;
module.exports.compileSass = compileSass;
module.exports.compileSassAndSave = compileSassAndSave;
module.exports.compileSassAndSaveMultiple = compileSassAndSaveMultiple;
module.exports.setupCleanupOnExit = setupCleanupOnExit;

/*
  OPTIONS: {
    sassFilePath (default: 'public/scss'),
    sassFileExt (default: 'scss'),
    embedSrcMapInProd (default: false)
  }
*/

function setup(options) {
  const sassFilePath = options.sassFilePath || path.join(__dirname, '../public/scss/');
  const sassFileExt = options.sassFileExt || 'scss';
  const embedSrcMapInProd = options.embedSrcMapInProd || false;

  return function(req, res) {
    const cssName = req.params.cssName.replace(/\.css/, '');
    const sassFile = path.join(sassFilePath, cssName + '.' + sassFileExt);
    const sassOptions = {
      file: sassFile
    };

    if (!embedSrcMapInProd || nodeEnv !== 'production') {
      sassOptions.sourceMapEmbed = true;
    }

    sass.render(sassOptions, (error, result) => {
      if (error) {
        throw new Error(error);
      }

      if (nodeEnv === 'production') {
        // Set Cache-Control header to one day
        res.header('Cache-Control', 'public, max-age=86400');
      }

      res.contentType('text/css').send(result.css.toString());
    });
  };
}


function compileSass(fullSassPath) {
  const sassOptions = {
    file: fullSassPath
  };

  if (nodeEnv !== 'production') {
    sassOptions.sourceMapEmbed = true;
  }
  else {
    sassOptions.outputStyle = 'compressed';
  }

  return new Promise((resolve, reject) => {
    sass.render(sassOptions, (error, result) => {
      if (error) {
        return reject(error);
      }

      resolve(result.css.toString());
    });
  }).catch(console.error);
}


function compileSassAndSave(fullSassPath, cssPath) {
  const sassFile = fullSassPath.match(/[ \w-]+[.]+[\w]+$/)[0];
  const sassFileExt = sassFile.match(/\.[0-9a-z]+$/i)[0];
  const cssFile = sassFile.replace(sassFileExt, '.css');
  const fullCssPath = path.join(cssPath, cssFile);

  return compileSass(fullSassPath).then(css => {
    return new Promise((resolve, reject) => {
      mkdirp(cssPath, error => {
        if (error) {
          return reject(error);
        }

        resolve();
      });
    }).then(() => {
      return new Promise((resolve, reject) => {
        fs.writeFile(fullCssPath, css, error => {
          if (error) {
            return reject(error);
          }

          resolve(cssFile);
        });
      });
    }).catch(console.error);
  });
}


/*
OPTIONS: {
    sassPath,
    cssPath,
    files
  }
*/

function compileSassAndSaveMultiple(options) {
  const sassPath = options.sassPath;
  const cssPath = options.cssPath;

  options.files.forEach(sassFile => {
    compileSassAndSave(path.join(sassPath, sassFile), cssPath).then(cssFile => {
      console.log('Created', cssFile);
    }).catch(console.error);
  });
}


function setupCleanupOnExit(cssPath) {
  console.log('Exiting, running CSS cleanup');

  exec(`rm -r ${cssPath}`, function(error) {
    if (error) {
      throw new Error(error);
    }

    console.log('Deleted CSS files');
  });
}
