[![GitHub release](https://img.shields.io/github/release/crazy-max/ghaction-setup-containerd.svg?style=flat-square)](https://github.com/crazy-max/ghaction-setup-containerd/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-setup--containerd-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/setup-containerd)
[![Test workflow](https://img.shields.io/github/workflow/status/crazy-max/ghaction-setup-containerd/test?label=test&logo=github&style=flat-square)](https://github.com/crazy-max/ghaction-setup-containerd/actions?workflow=test)
[![Codecov](https://img.shields.io/codecov/c/github/crazy-max/ghaction-setup-containerd?logo=codecov&style=flat-square)](https://codecov.io/gh/crazy-max/ghaction-setup-containerd)
[![Become a sponsor](https://img.shields.io/badge/sponsor-crazy--max-181717.svg?logo=github&style=flat-square)](https://github.com/sponsors/crazy-max)
[![Paypal Donate](https://img.shields.io/badge/donate-paypal-00457c.svg?logo=paypal&style=flat-square)](https://www.paypal.me/crazyws)

## About

GitHub Action to set up [containerd](https://github.com/containerd/containerd).

If you are interested, [check out](https://git.io/Je09Y) my other :octocat: GitHub Actions!

___

* [Usage](#usage)
  * [Quick start](#quick-start)
* [Customizing](#customizing)
  * [inputs](#inputs)
* [Keep up-to-date with GitHub Dependabot](#keep-up-to-date-with-github-dependabot)
* [Limitation](#limitation)
* [How can I help?](#how-can-i-help)
* [License](#license)

## Usage

### Quick start

```yaml
name: containerd

on:
  push:
    branches: master
    tags:
  pull_request:
    branches: master

jobs:
  containerd:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up containerd
        uses: crazy-max/ghaction-setup-containerd@v1
```

## Customizing

### inputs

Following inputs can be used as `step.with` keys

| Name                 | Type    | Default   | Description                        |
|----------------------|---------|-----------|------------------------------------|
| `containerd-version` | String  | `latest`  | [containerd](https://github.com/containerd/containerd) version. Example: `v1.4.1` |
| `config`             | String  |           | Path to the configuration file |

## Keep up-to-date with GitHub Dependabot

Since [Dependabot](https://docs.github.com/en/github/administering-a-repository/keeping-your-actions-up-to-date-with-github-dependabot)
has [native GitHub Actions support](https://docs.github.com/en/github/administering-a-repository/configuration-options-for-dependency-updates#package-ecosystem),
to enable it on your GitHub repo all you need to do is add the `.github/dependabot.yml` file:

```yaml
version: 2
updates:
  # Maintain dependencies for GitHub Actions
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "daily"
```

## Limitation

This action is only available for Linux [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources).

## How can I help?

All kinds of contributions are welcome :raised_hands:! The most basic way to show your support is to star :star2: the project, or to raise issues :speech_balloon: You can also support this project by [**becoming a sponsor on GitHub**](https://github.com/sponsors/crazy-max) :clap: or by making a [Paypal donation](https://www.paypal.me/crazyws) to ensure this journey continues indefinitely! :rocket:

Thanks again for your support, it is much appreciated! :pray:

## License

MIT. See `LICENSE` for more details.
