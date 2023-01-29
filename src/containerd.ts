import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as semver from 'semver';
import * as util from 'util';
import * as context from './context';
import * as core from '@actions/core';
import * as exec from '@actions/exec';
import * as httpm from '@actions/http-client';
import * as tc from '@actions/tool-cache';

const osPlat: string = os.platform();
const osArch: string = os.arch();

export interface InstallResult {
  version: string;
  cachePath: string;
}

export interface GitHubRelease {
  id: number;
  tag_name: string;
  html_url: string;
  assets: Array<string>;
}

export const getRelease = async (version: string): Promise<GitHubRelease> => {
  const url = `https://raw.githubusercontent.com/crazy-max/ghaction-setup-containerd/master/.github/containerd-releases.json`;
  const http: httpm.HttpClient = new httpm.HttpClient('ghaction-setup-containerd');
  const resp: httpm.HttpClientResponse = await http.get(url);
  const body = await resp.readBody();
  const statusCode = resp.message.statusCode || 500;
  if (statusCode >= 400) {
    throw new Error(`Failed to get containerd release ${version} from ${url} with status code ${statusCode}: ${body}`);
  }
  const releases = <Record<string, GitHubRelease>>JSON.parse(body);
  if (!releases[version]) {
    throw new Error(`Cannot find containerd release ${version} in ${url}`);
  }
  return releases[version];
};

export async function install(inputVersion: string): Promise<InstallResult> {
  const release: GitHubRelease = await getRelease(inputVersion);
  core.debug(`Release found: ${release.tag_name}`);

  const version = release.tag_name.replace(/^v+|v+$/g, '');
  const filename = getFilename(version);
  const downloadUrl = util.format(
    'https://github.com/containerd/containerd/releases/download/%s/%s',
    release.tag_name,
    filename
  );

  core.info(`Downloading ${downloadUrl}`);
  const downloadPath: string = await tc.downloadTool(downloadUrl);
  core.debug(`Downloaded to ${downloadPath}`);

  const extPath: string = await tc.extractTar(downloadPath);
  core.debug(`Extracted to ${extPath}`);

  const cachePath: string = await tc.cacheDir(extPath, 'ghaction-setup-containerd', version);
  core.debug(`Cached to ${cachePath}`);

  core.addPath(path.join(cachePath, 'bin'));
  core.info(`${path.join(cachePath, 'bin')} added to the PATH`);

  core.info('Fixing perms');
  fs.readdir(path.join(cachePath, 'bin'), function (err, files) {
    if (err) {
      throw err;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    files.forEach(function (file, index) {
      fs.chmodSync(path.join(cachePath, 'bin', file), '0755');
    });
  });

  return {
    cachePath: cachePath,
    version: version
  };
}

export async function getConfigInline(s: string): Promise<[string, string]> {
  return getConfig(s, false);
}

export async function getConfigFile(s: string): Promise<[string, string]> {
  return getConfig(s, true);
}

export async function getConfigDefault(): Promise<[string, string]> {
  return getConfig(await generateConfig(), false);
}

async function getConfig(s: string, file: boolean): Promise<[string, string]> {
  if (file) {
    if (!fs.existsSync(s)) {
      throw new Error(`config file ${s} not found`);
    }
    s = fs.readFileSync(s, {encoding: 'utf-8'});
  }

  const configDir: string = path.join(context.tmpDir(), 'containerd');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, {recursive: true});
  }

  const configFile: string = path.join(configDir, 'config.toml');
  fs.writeFileSync(configFile, s);
  return [configFile, s];
}

async function generateConfig(): Promise<string> {
  return await exec
    .getExecOutput('containerd', ['config', 'default'], {
      ignoreReturnCode: true,
      silent: true
    })
    .then(res => {
      if (res.stderr.length > 0 && res.exitCode != 0) {
        throw new Error(res.stderr.trim());
      }
      return res.stdout.trim();
    });
}

const getFilename = (version: string): string => {
  const platform: string = osPlat == 'win32' ? 'windows' : 'linux';
  const arch: string = osArch == 'x64' ? 'amd64' : 'i386';
  if (semver.satisfies(version, '<=1.3.4')) {
    return util.format('containerd-%s.%s-%s.tar.gz', version, platform, arch);
  }
  return util.format('containerd-%s-%s-%s.tar.gz', version, platform, arch);
};
