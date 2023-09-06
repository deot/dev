# @deot/dev-builder ChangeLog

## v2.5.3

_2023-09-06_

### Bugfixes

- fix: syntax error ([0182a99](https://github.com/deot/dev/commit/0182a995047ee12bd60ebb044e4e15315289d477))

## v2.5.2

_2023-09-06_

### Bugfixes

- fix(react,releaser): when commit message include `($1,$2)`, `$1` will be ignore ([2c6f68f](https://github.com/deot/dev/commit/2c6f68fd942482f904f074841b08d089f8198289))

## v2.5.1

_2023-09-06_

### Features

- feat(builder,dever,tester,vue): vue's jsx regex changed ([598e9c0](https://github.com/deot/dev/commit/598e9c002b5ef191c829411d3f2ccd2cb24b20f3))
- feat(react,vue,tester): test-utils integration ([a6d1cd1](https://github.com/deot/dev/commit/a6d1cd1537ab6a0f34ff77c014e521ea6614298b))

## v2.5.0

_2023-09-06_

### Features

- feat: support react/vue package ([5f9e6ef](https://github.com/deot/dev/commit/5f9e6ef65237e4e477933080b921d6c9fcd8fb84))
- feat: support subpackage mode ([89c2cd9](https://github.com/deot/dev/commit/89c2cd9fbafd4d203989d0c40fac6b510b175bc4))
- feat(react): react integration ([2828c25](https://github.com/deot/dev/commit/2828c25fa9a338ad91e95bc191d40f6cb830665e))
- feat(shared): [shell] subprocess exit auto ([5300480](https://github.com/deot/dev/commit/5300480003064d27afcdcc18b373589e5e36253b))
- feat(shared): [shell] expose instance ([ac07184](https://github.com/deot/dev/commit/ac07184b6b88ce9226baa157b6ef95fdcb339822))
- feat(shared): add `isSubPackageMode` ([7b38608](https://github.com/deot/dev/commit/7b38608dd43bb7fcc69c691e5550b2e7873a96e8))
- feat(vue): vue integration ([82accda](https://github.com/deot/dev/commit/82accda7bf50de8b2733ecbde3f3d35ae2d1d978))

### Updates

- chore: deps updated ([682330c](https://github.com/deot/dev/commit/682330cfee48df6ba39c6a2b6b6f3a9bd80fd0f3))

## v2.4.0

_2023-08-24_

### Features

- feat: `*.cjs.js` -> `*.cjs` ([e524118](https://github.com/deot/dev/commit/e5241182e9cb40b65c00fecb229ddaa59450ee35))

### Updates

- chore: deps updated ([9a24d31](https://github.com/deot/dev/commit/9a24d31cc9679de29c3aeb956478ebfcc567aed3))
- chore(shared): force-publish `2.3.0` -> `2.4.0`

## v2.3.3

_2023-08-17_

### Bugfixes

- fix: relation need pre-build when run build alone ([891b6af](https://github.com/deot/dev/commit/891b6afd76b975fcab4f405489deab28af188b61))

## v2.3.2

_2023-08-16_

### Bugfixes

- fix: node package filter split by ',' ([b0c5e4c](https://github.com/deot/dev/commit/b0c5e4c4676e81678319bf23e524cb75426cf891))

### Updates

- chore: deps updated ([187282a](https://github.com/deot/dev/commit/187282a8dc3722f7d787fa7558fcf8ee10e02065))

## v2.3.1

_2023-07-27_

### Updates

- chore: deps updated ([a99684e](https://github.com/deot/dev/commit/a99684e11e0fb00b4de54a4518f8ead5038aad92))

## v2.3.0

_2023-07-24_

### Updates

- chore(shared): force-publish `2.2.0` -> `2.3.0`

## v2.2.3

_2023-07-14_

### Updates

- chore: remove ts warn(TS18028) ([d9cfa09](https://github.com/deot/dev/commit/d9cfa092a8c51c1e4cea9416946a6b6292b1701d))

## v2.2.2

_2023-07-13_

### Bugfixes

- fix: import `sass` changed ([f92e774](https://github.com/deot/dev/commit/f92e774e18875aa4f5504b715ffca974315bba41))

## v2.2.1

_2023-07-11_

### Bugfixes

- fix: `UserConfigExport` -> `UserConfig` ([82f1ba9](https://github.com/deot/dev/commit/82f1ba9bd236a5b801439d2d0bed09c2c8fcec68))

## v2.2.0

_2023-07-10_

### Features

- feat(shared): [locals] `rootPackageOptions` expose ([c8376fe](https://github.com/deot/dev/commit/c8376fe27d12e86a612c8e83c4901568f8b4e257))

## v2.1.0

_2023-07-08_

### Updates

- chore(shared): force-publish `2.0.0` -> `2.1.0`

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
