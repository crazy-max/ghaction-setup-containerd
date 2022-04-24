import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import * as util from 'util';
import * as github from './github';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as tc from '@actions/tool-cache';

const osPlat: string = os.platform();
const osArch: string = os.arch();

export interface InstallResult {
  version: string;
  cachePath: string;
}

export async function install(inputVersion: string): Promise<InstallResult> {
  const release: github.GitHubRelease | null = await github.getRelease(inputVersion);
  if (!release) {
    throw new Error(`Cannot find containerd ${inputVersion} release`);
  }
  core.debug(`Release found: ${release.tag_name}`);

  const version = release.tag_name.replace(/^v+|v+$/g, '');
  const filename = getFilename(version);
  const downloadUrl = util.format(
    'https://github.com/containerd/containerd/releases/download/%s/%s',
    release.tag_name,
    filename
  );

  core.startGroup(`Downloading ${downloadUrl}...`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);
  core.endGroup();

  core.startGroup('Extracting containerd');
  const extPath: string = await tc.extractTar(downloadPath);
  core.debug(`Extracted to ${extPath}`);
  core.endGroup();

  const cachePath: string = await tc.cacheDir(extPath, 'ghaction-setup-containerd', version);
  core.debug(`Cached to ${cachePath}`);

  core.addPath(path.join(cachePath, 'bin'));
  core.debug(`Added ${path.join(cachePath, 'bin')} to the path`);

  fs.readdir(path.join(cachePath, 'bin'), function (err, files) {
    if (err) {
      throw err;
    }
    core.startGroup('Fixing perms');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files.forEach(function (file, index) {
      core.info(path.join(cachePath, 'bin', file));
      fs.chmodSync(path.join(cachePath, 'bin', file), '0755');
    });
    core.endGroup();
  });

  return {
    cachePath: cachePath,
    version: version
  };
}

export async function getConfig(inputConfig: string): Promise<string> {
  if (inputConfig) {
    return inputConfig;
  }

  const configDir: string = path.join(os.homedir(), 'containerd');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, {recursive: true});
  }

  const configFile: string = path.join(os.homedir(), 'config.toml');
  await exec
    .getExecOutput('containerd', ['config', 'default'], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      core.startGroup(`Generating config to ${configFile}`);
      core.info(res.stdout.trim());
      fs.writeFileSync(configFile, res.stdout.trim());
      core.endGroup();
    });

  return configFile;
}

const getFilename = (version: string): string => {
  const platform: string = osPlat == 'win32' ? 'windows' : 'linux';
  const arch: string = osArch == 'x64' ? 'amd64' : 'i386';
  if (semver.satisfies(version, '<=1.3.4')) {
    return util.format('containerd-%s.%s-%s.tar.gz', version, platform, arch);
  }
  return util.format('containerd-%s-%s-%s.tar.gz', version, platform, arch);
};
