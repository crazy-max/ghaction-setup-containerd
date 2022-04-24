import execa from 'execa';
import fs from 'fs';
import * as os from 'os';
import path from 'path';
import {getInputs, Inputs} from './context';
import * as containerd from './containerd';
import * as stateHelper from './state-helper';
import * as core from '@actions/core';
import * as exec from '@actions/exec';

async function run(): Promise<void> {
  try {
    if (os.platform() !== 'linux') {
      core.setFailed('Only supported on linux platform');
      return;
    }

    const inputs: Inputs = await getInputs();
    const install = await containerd.install(inputs.version);
    const config: string = await containerd.getConfig(inputs.config);

    core.info(`Starting containerd ${install.version}`);
    const logfile = path.join(fs.mkdtempSync(path.join(os.tmpdir(), 'github-pages-')), 'containerd.log');
    const out = fs.openSync(logfile, 'w');
    stateHelper.setLogfile(logfile);
    await execa(`sudo containerd --config ${config} &> ${logfile}`, {
      detached: true,
      shell: true,
      cleanup: false,
      stdio: ['ignore', out, out]
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function cleanup(): Promise<void> {
  await exec.exec('sudo killall containerd');
  if (stateHelper.logfile.length == 0) {
    return;
  }
  core.startGroup('containerd logs');
  core.info(fs.readFileSync(stateHelper.logfile, {encoding: 'utf8'}));
  core.endGroup();
}

if (!stateHelper.IsPost) {
  run();
} else {
  cleanup();
}
