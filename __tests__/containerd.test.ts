import fs = require('fs');
import * as containerd from '../src/containerd';

describe('installer', () => {
  it('acquires v1.4.1 version of containerd', async () => {
    const containerdDir = await containerd.install('v1.4.1');
    console.log(containerdDir);
    expect(fs.existsSync(containerdDir)).toBe(true);
  }, 100000);

  it('acquires latest version of containerd', async () => {
    const containerdDir = await containerd.install('latest');
    console.log(containerdDir);
    expect(fs.existsSync(containerdDir)).toBe(true);
  }, 100000);
});
