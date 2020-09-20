import * as os from 'os'
import {getInputs, Inputs} from "./context"
import * as execm from './exec'
import * as containerd from './containerd'
import * as stateHelper from './state-helper'
import * as core from '@actions/core'

async function run(): Promise<void> {
  try {
    if (os.platform() !== 'linux') {
      core.setFailed('Only supported on linux platform')
      return
    }

    let inputs: Inputs = await getInputs()
    await containerd.install(inputs.version)
    const config: string = await containerd.getConfig(inputs.config)

    core.startGroup('Dump config')
    await execm.exec('containerd', ['config', 'dump'], true).then(res => {
      if (res.stderr != '' && !res.success) {
        throw new Error(res.stderr)
      }
      core.info(res.stdout)
    });
    core.endGroup()

    // TODO: Launch daemon
  } catch (error) {
    core.setFailed(error.message)
  }
}

async function logs(): Promise<void> {
  if (stateHelper.logfile.length == 0) {
    return;
  }
  core.startGroup('containerd logs')
  // TODO: Display logs
  core.endGroup()
}

if (!stateHelper.IsPost) {
  run()
} else {
  logs()
}
