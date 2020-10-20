import fs = require('fs');
import * as containerd from '../src/containerd';

describe('installer', () => {
  it('acquires v1.4.1 version of containerd', async () => {
    const install = await containerd.install('v1.4.1');
    console.log(install);
    expect(fs.existsSync(install.cachePath)).toBe(true);
  }, 100000);

  it('acquires latest version of containerd', async () => {
    const install = await containerd.install('latest');
    console.log(install);
    expect(fs.existsSync(install.cachePath)).toBe(true);
  }, 100000);
});
