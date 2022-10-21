import path from 'path';
import fs from 'fs';
import mkdirp from 'mkdirp';
import sass from 'sass';
import { Request, Response, Application } from 'express';

const nodeEnv = process.env.NODE_ENV;

type SassOptions = sass.Options<'async' | 'sync'>;

let hasSetupCleanupOnExit = false;
let _sassOptions: SassOptions = {};

function resolveTildes(url: string): any {
  if (url[0] === '~') {
    url = path.resolve('node_modules', url.substr(1));
  }

  return { file: url };
}

export interface SetupOptions {
  sassFilePath?: string;
  sassFileExt?: string;
  embedSrcMapInProd?: boolean;
  resolveTildes?: boolean;
  sassOptions?: SassOptions;
}

/*
  OPTIONS: {
    sassFilePath (default: 'public/scss'),
    sassFileExt (default: 'scss'),
    embedSrcMapInProd (default: false),
    resolveTildes (default: false),
    sassOptions (default: {})
  }
*/

export function setup(options: SetupOptions): Application {
  const sassFilePath = options.sassFilePath || path.join(__dirname, '../public/scss/');
  const sassFileExt = options.sassFileExt || 'scss';
  const embedSrcMapInProd = options.embedSrcMapInProd || false;

  _sassOptions = options.sassOptions || {};

  if (options.resolveTildes) {
    const passedImporters = _sassOptions.importers;

    if (passedImporters) {
      _sassOptions.importers = Array.isArray(passedImporters) 
        ? [...passedImporters, resolveTildes]
        : [passedImporters, resolveTildes];
    }
  }

  return async function(req: Request, res: Response) {
    try {
      const cssName = req.params.cssName.replace(/\.css/, '');
      const sassFile = path.join(sassFilePath, cssName + '.' + sassFileExt);

      const sassOptions: SassOptions = {
        ..._sassOptions,
      };

      if (!embedSrcMapInProd || nodeEnv !== 'production') {
        sassOptions.sourceMap = true;
      }

      const result = await sass.compileAsync(sassFile, sassOptions);

      if (nodeEnv === 'production') {
        // Set Cache-Control header to one day
        res.header('Cache-Control', 'public, max-age=86400');
      }

      res.contentType('text/css').send(result.css.toString());
    }
    catch (error) {
      throw error;
    }
  };
}

export default setup;


export function compileSass(fullSassPath: string): Promise<any> {
  const sassOptions: SassOptions = {
    ..._sassOptions,
    file: fullSassPath
  };

  if (nodeEnv !== 'production') {
    sassOptions.sourceMapEmbed = true;
  }
  else {
    sassOptions.outputStyle = 'compressed';
  }

  return new Promise((resolve, reject) => {
    sass.render(sassOptions, (error: sass.SassError, result: sass.Result) => {
      if (error) {
        return reject(error);
      }

      resolve(result.css.toString());
    });
  }).catch(console.error);
}


export function compileSassAndSave(fullSassPath: string, cssPath: string): Promise<any> {
  const sassFile = fullSassPath.match(/[ \w-]+[.]+[\w]+$/)[0];
  const sassFileExt = sassFile.match(/\.[0-9a-z]+$/i)[0];
  const cssFile = sassFile.replace(sassFileExt, '.css');
  const fullCssPath = path.join(cssPath, cssFile);

  setupCleanupOnExit(cssPath);

  return compileSass(fullSassPath).then(css => {
    return new Promise<void>((resolve, reject) => {
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


export interface CompileMultipleOptions {
  sassPath: string;
  cssPath: string;
  files: string[];
}

export function compileSassAndSaveMultiple(options: CompileMultipleOptions): Promise<any> {
  const sassPath = options.sassPath;
  const cssPath = options.cssPath;

  return new Promise<void>(async (resolve, reject) => {
    for (const sassFile of options.files) {
      await compileSassAndSave(path.join(sassPath, sassFile), cssPath).then(cssFile => {
        console.log('Created', cssFile);
      }).catch(error => {
        reject(error);
      });
    }

    resolve();
  }).catch(error => {
    throw new Error(error);
  });
}


export function setupCleanupOnExit(cssPath: string) {
  if (!hasSetupCleanupOnExit){
    process.on('SIGINT', () => {
      console.log('Exiting, running CSS cleanup');

      fs.lstat(cssPath, (error: Error, stats: fs.Stats): void => {
        if (stats.isDirectory) {
          fs.rmdirSync(cssPath, { recursive: true }, (error) => {
            if (error) {
              console.error(error);
              process.exit(1);
            }

            console.log('Deleted CSS files');
          });
        }
        else {
          console.error('Could not delete CSS files because the given path is not a directory:', cssPath);
          process.exit(1);
        }
      });
  
      hasSetupCleanupOnExit = true;        
    });
  }
}
