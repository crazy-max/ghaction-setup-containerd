import * as core from '@actions/core';

export interface Inputs {
  version: string;
  config: string;
}

export async function getInputs(): Promise<Inputs> {
  return {
    version: core.getInput('containerd-version') || 'latest',
    config: core.getInput('config')
  };
}
