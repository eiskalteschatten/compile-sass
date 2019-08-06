import * as path from 'path';
import * as fs from 'fs';

import { 
  default as setup,
  compileSass,
  compileSassAndSave,
  CompileMultipleOptions,
  compileSassAndSaveMultiple,
  setupCleanupOnExit
} from './index';

describe('Compile SASS', () => {
  const sassPath = path.resolve(__dirname, '..', 'test-data');
  const fullSassPath = path.join(sassPath, 'test.scss');
  const cssPath = path.resolve(__dirname, '..', 'test-data', 'css');
  const fullCssPath = path.join(cssPath, 'test.css');

  it('compileSassAndSave', async () => {
    const cssFile = await compileSassAndSave(fullSassPath, cssPath);
    expect(cssFile).toEqual('test.css');
  });

  it('compileSass', async () => {
    const css = fs.readFileSync(fullCssPath, 'utf8');
    const compiledSass = await compileSass(fullSassPath);
    expect(compiledSass).toEqual(css);
  });

  it('compileSassAndSaveMultiple', async () => {
    const options: CompileMultipleOptions = {
      sassPath,
      cssPath,
      files: ['test.scss', 'test2.scss']
    };

    await compileSassAndSaveMultiple(options);
    const test2File = path.join(cssPath, 'test2.css');
    expect(fs.existsSync(test2File)).toBeTruthy();
  });
});