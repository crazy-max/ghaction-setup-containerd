import fs from 'fs';
import * as os from 'os';
import path from 'path';
import * as core from '@actions/core';

let _tmpDir: string;

export function tmpDir(): string {
  if (!_tmpDir) {
    _tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'setup-containerd-')).split(path.sep).join(path.posix.sep);
  }
  return _tmpDir;
}

export interface Inputs {
  version: string;
  config: string;
  configInline: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    version: core.getInput('containerd-version') || 'latest',
    config: core.getInput('config'),
    configInline: core.getInput('config-inline')
  };
}
