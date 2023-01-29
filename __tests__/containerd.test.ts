import {describe, expect, it} from '@jest/globals';
import * as fs from 'fs';
import * as containerd from '../src/containerd';

describe('getRelease', () => {
  it('returns latest containerd GitHub release', async () => {
    const release = await containerd.getRelease('latest');
    expect(release).not.toBeNull();
    expect(release?.tag_name).not.toEqual('');
  });

  it('returns v1.4.1 containerd GitHub release', async () => {
    const release = await containerd.getRelease('v1.4.1');
    expect(release).not.toBeNull();
    expect(release?.id).toEqual(31366723);
    expect(release?.tag_name).toEqual('v1.4.1');
    expect(release?.html_url).toEqual('https://github.com/containerd/containerd/releases/tag/v1.4.1');
  });

  it('unknown release', async () => {
    await expect(containerd.getRelease('foo')).rejects.toThrowError(
      new Error(
        'Cannot find containerd release foo in https://raw.githubusercontent.com/crazy-max/ghaction-setup-containerd/master/.github/containerd-releases.json'
      )
    );
  });
});

describe('installer', () => {
  it('acquires v1.4.1 version of containerd', async () => {
    const install = await containerd.install('v1.4.1');
    expect(fs.existsSync(install.cachePath)).toBe(true);
  }, 100000);

  it('acquires latest version of containerd', async () => {
    const install = await containerd.install('latest');
    expect(fs.existsSync(install.cachePath)).toBe(true);
  }, 100000);
});
