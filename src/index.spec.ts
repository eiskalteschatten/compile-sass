import path from 'path';
import fs from 'fs';

import {
  SetupOptions,
  default as setup,
  compileSass,
  compileSassAndSave,
  CompileMultipleOptions,
  compileSassAndSaveMultiple
} from './index';

describe('Compile SASS', () => {
  const sassPath = path.resolve(__dirname, '..', 'test-data');
  const fullSassPath = path.join(sassPath, 'test.scss');
  const cssPath = path.resolve(__dirname, '..', 'test-data', 'css');
  const fullCssPath = path.join(cssPath, 'test.css');

  it('setup', () => {
    const options: SetupOptions = { sassFilePath: sassPath };
    const thunk = setup(options);
    expect(thunk).toBeInstanceOf(Function);

    const mockReq = {
      params: {
        cssName: 'test.css'
      }
    };

    const mockRes = {
      header: (a, b) => {},
      contentType: (a) => ({
        send: (a) => {}
      })
    };

    thunk(mockReq, mockRes);
  });

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