import * as core from '@actions/core';

export const IsPost = !!process.env['STATE_isPost'];
export const logfile = process.env['STATE_logfile'] || '';

export function setLogfile(registry: string) {
  core.saveState('logfile', registry);
}

if (!IsPost) {
  core.saveState('isPost', 'true');
}
