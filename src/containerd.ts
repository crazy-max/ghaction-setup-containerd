import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as util from 'util';
import * as execm from './exec';
import * as github from './github';
import * as core from '@actions/core';
import * as tc from '@actions/tool-cache';

const osPlat: string = os.platform();
const osArch: string = os.arch();

export async function install(inputVersion: string): Promise<string> {
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

  const cachePath: string = await tc.cacheDir(extPath, 'ghaction-containerd', version);
  core.debug(`Cached to ${cachePath}`);

  core.addPath(path.join(cachePath, 'bin'));
  core.info(`Added ${path.join(cachePath, 'bin')} to the path`);

  fs.readdir(path.join(cachePath, 'bin'), function (err, files) {
    if (err) {
      throw err;
    }
    core.startGroup('Fixing perms');
    files.forEach(function (file, index) {
      core.info(path.join(cachePath, 'bin', file));
      fs.chmodSync(path.join(cachePath, 'bin', file), '0755');
    });
    core.endGroup();
  });

  return cachePath;
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
  await execm.exec('containerd', ['config', 'default'], true).then(res => {
    if (res.stderr != '' && !res.success) {
      throw new Error(res.stderr);
    }
    core.startGroup(`Generating config to ${configFile}`);
    core.info(res.stdout);
    fs.writeFileSync(configFile, res.stdout);
    core.endGroup();
  });

  return configFile;
}

const getFilename = (version: string): string => {
  const platform: string = osPlat == 'win32' ? 'windows' : 'linux';
  const arch: string = osArch == 'x64' ? 'amd64' : 'i386';
  return util.format('containerd-%s-%s-%s.tar.gz', version, platform, arch);
};
