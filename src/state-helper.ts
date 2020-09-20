import * as core from '@actions/core';

export const IsPost = !!process.env['STATE_isPost'];
export const logfile = process.env['STATE_logfile'] || '';

export function setLogfile(logfile: string) {
  core.saveState('logfile', logfile);
}

if (!IsPost) {
  core.saveState('isPost', 'true');
}
