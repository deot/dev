# @deot/dev-builder ChangeLog

## v2.0.4

_2023-06-28_

### Features

- feat: script format filter by `--node-package *` ([a1c1628](https://github.com/deot/dev/commit/a1c16285437549681ab526a632b90088269871b6))

## v2.0.3

_2023-06-14_

### Bugfixes

- fix: entry glob ([ee32c85](https://github.com/deot/dev/commit/ee32c8505e50c2eb8c46ac16d05d0976d5ac9333))

### Features

- feat: allow build with `--script-formats=es,cjs,umd,iife` & custom config alone by format ([693571d](https://github.com/deot/dev/commit/693571dc5f1fd5fb1e6bcd8c2f019646fe71acf7))

## v2.0.2

_2023-06-13_

### Bugfixes

- fix: import sass failed ([c35066a](https://github.com/deot/dev/commit/c35066a266a1540431e94e55978920c36bda7936))

## v2.0.1

_2023-06-13_

### Bugfixes

- fix: export files ([080968f](https://github.com/deot/dev/commit/080968f372c2ad4e538637b733c55d047040380d))

## v2.0.0

_2023-06-13_

### Features

- feat: rollup -> vite & custom config (rollup.config.ts -> test.config.ts) ([87a5917](https://github.com/deot/dev/commit/87a5917a6b8d67e59ea741b3e7c88fc13a457045))
- feat: allow build without any config & extend by `rollup.config.ts` ([0d1edc6](https://github.com/deot/dev/commit/0d1edc67b50d2bc51e4b973190f47721a771459a))
- feat: @rollup/plugin-(typescript -> swc) & use `api-extractor` internally ([05a05af](https://github.com/deot/dev/commit/05a05af67ad9716e76f1cb528350cb0f18d25e49))

### Updates

- chore(shared): force-publish `1.1.1` -> `2.0.0`

## v1.1.2

_2023-05-04_

### Features

- feat: allow build css entry (/^index(.*)\.s?css$/) ([a8cfff1](https://github.com/deot/dev/commit/a8cfff17cdd376cfa333342edb172b1d0e44fc54))
- feat: multiple entry (/^index(.*)\.(t|j)s$/) ([a71cf70](https://github.com/deot/dev/commit/a71cf707aff02f69b3ce99594355185e87c846c6))

## v1.1.1

_2023-04-28_

### Updates

- chore(shared): force-publish `1.1.0` -> `1.1.1`

## v1.1.0

_2023-04-27_

### Updates

- chore(shared): force-publish `1.0.2` -> `1.1.0`
