[![GitHub release](https://img.shields.io/github/release/crazy-max/ghaction-setup-containerd.svg?style=flat-square)](https://github.com/crazy-max/ghaction-setup-containerd/releases/latest)
[![GitHub marketplace](https://img.shields.io/badge/marketplace-setup--containerd-blue?logo=github&style=flat-square)](https://github.com/marketplace/actions/setup-containerd)
[![Test workflow](https://img.shields.io/github/actions/workflow/status/crazy-max/ghaction-setup-containerd/test.yml?branch=master&label=test&logo=github&style=flat-square)](https://github.com/crazy-max/ghaction-setup-containerd/actions?workflow=test)
[![Codecov](https://img.shields.io/codecov/c/github/crazy-max/ghaction-setup-containerd?logo=codecov&style=flat-square)](https://codecov.io/gh/crazy-max/ghaction-setup-containerd)
[![Become a sponsor](https://img.shields.io/badge/sponsor-crazy--max-181717.svg?logo=github&style=flat-square)](https://github.com/sponsors/crazy-max)
[![Paypal Donate](https://img.shields.io/badge/donate-paypal-00457c.svg?logo=paypal&style=flat-square)](https://www.paypal.me/crazyws)

## ⚠️ Abandoned project

This project is not maintained anymore and is abandoned. Feel free to fork and
make your own changes if needed. 

## About

GitHub Action to set up [containerd](https://github.com/containerd/containerd).

___

* [Usage](#usage)
  * [Quick start](#quick-start)
  * [Pull Docker image](#pull-docker-image)
  * [Build and push Docker image](#build-and-push-docker-image)
* [Customizing](#customizing)
  * [inputs](#inputs)
* [Limitation](#limitation)
* [Contributing](#contributing)
* [License](#license)

## Usage

### Quick start

```yaml
name: containerd

on:
  push:

jobs:
  containerd:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up containerd
        uses: crazy-max/ghaction-setup-containerd@v3
```

### Pull Docker image

```yaml
name: containerd

on:
  push:

jobs:
  containerd:
    runs-on: ubuntu-latest
    steps:
      -
        name: Set up containerd
        uses: crazy-max/ghaction-setup-containerd@v3
      -
        name: Pull Docker image
        run: |
          sudo ctr i pull --all-platforms --all-metadata docker.io/crazymax/diun:latest
```

### Build and push Docker image

```yaml
name: containerd

on:
  push:

jobs:
  containerd:
    runs-on: ubuntu-latest
    steps:
      -
        name: Checkout
        uses: actions/checkout@v4
      -
        name: Set up QEMU
        uses: docker/setup-qemu-action@v2
      -
        name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v2
      -
        name: Set up containerd
        uses: crazy-max/ghaction-setup-containerd@v3
      -
        name: Build Docker image
        uses: docker/build-push-action@v4
        with:
          context: .
          file: ./Dockerfile
          platforms: linux/386,linux/amd64,linux/arm/v6,linux/arm/v7,linux/arm64,linux/ppc64le,linux/s390x
          tags: docker.io/crazymax/diun:latest
          outputs: type=oci,dest=/tmp/image.tar
      -
        name: Import image in containerd
        run: |
          sudo ctr i import --base-name docker.io/crazymax/diun --digests --all-platforms /tmp/image.tar
      -
        name: Push image with containerd
        run: |
          sudo ctr i push --user "${{ secrets.DOCKER_USERNAME }}:${{ secrets.DOCKER_PASSWORD }}" docker.io/crazymax/diun:latest
```

## Customizing

### inputs

The following inputs can be used as `step.with` keys

| Name                 | Type     | Default  | Description                                                                     |
|----------------------|----------|----------|---------------------------------------------------------------------------------|
| `containerd-version` | String   | `latest` | [containerd](https://github.com/containerd/containerd) version (e.g., `v1.4.1`) |
| `config`             | String   |          | Containerd config file                                                          |
| `config-inline`      | String   |          | Same as `config` but inline                                                     |

> `config` and `config-inline` are mutually exclusive.

## Limitation

This action is only available for Linux [virtual environments](https://help.github.com/en/articles/virtual-environments-for-github-actions#supported-virtual-environments-and-hardware-resources).

## Contributing

Want to contribute? Awesome! The most basic way to show your support is to star
the project, or to raise issues. You can also support this project by [**becoming a sponsor on GitHub**](https://github.com/sponsors/crazy-max)
or by making a [PayPal donation](https://www.paypal.me/crazyws) to ensure this
journey continues indefinitely!

Thanks again for your support, it is much appreciated! :pray:

## License

MIT. See `LICENSE` for more details.
