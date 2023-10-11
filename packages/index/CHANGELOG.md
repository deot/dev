# @deot/dev ChangeLog

## v2.5.8

_2023-10-11_

### Features

- feat(dever): support preload file (preload.ts) ([0306467](https://github.com/deot/dev/commit/0306467c602cba6176629a91e24081b420170a2f))

## v2.5.7

_2023-09-07_

### Features

- feat(builder,cli): allow build config set external & globals ([f6532ba](https://github.com/deot/dev/commit/f6532badd7bf9eba9d01d4d18069c3764629b9d4))

## v2.5.6

_2023-09-06_

### Bugfixes

- fix(builder): syntax error ([0182a99](https://github.com/deot/dev/commit/0182a995047ee12bd60ebb044e4e15315289d477))

## v2.5.5

_2023-09-06_

### Bugfixes

- fix(react,releaser): when commit message include `($1,$2)`, `$1` will be ignore ([2c6f68f](https://github.com/deot/dev/commit/2c6f68fd942482f904f074841b08d089f8198289))

## v2.5.4

_2023-09-06_

### Features

- feat(builder,dever,tester,vue): vue's jsx regex changed ([598e9c0](https://github.com/deot/dev/commit/598e9c002b5ef191c829411d3f2ccd2cb24b20f3))
- feat(react,vue,tester): test-utils integration ([a6d1cd1](https://github.com/deot/dev/commit/a6d1cd1537ab6a0f34ff77c014e521ea6614298b))
- feat(eslint): allow `no-undef` with `.tsx` ([5c13dbb](https://github.com/deot/dev/commit/5c13dbba0c494b99de028f7e375f4117d6522ad1))

## v2.5.3

_2023-09-06_

### Bugfixes

- fix(tester): '*' as default when test ([83d9387](https://github.com/deot/dev/commit/83d93873c58c45429620b1426014f8980a8f34af))

## v2.5.2

_2023-09-06_

### Bugfixes

- fix(tester): error with prompt mode ([5101efd](https://github.com/deot/dev/commit/5101efde01bc65386edfd52cdf4baab6f58dd92c))

## v2.5.1

_2023-09-06_

### Bugfixes

- fix(dever,tester): subpackage alias ([5a0d5e5](https://github.com/deot/dev/commit/5a0d5e59a78cc45b1be7783e0f54568bf310e946))
- fix(releaser): when commit message include `(*,tester)`, `test` will be publish ([67ec009](https://github.com/deot/dev/commit/67ec009255d78513a9d155caf0f3d0cd1b949418))

## v2.5.0

_2023-09-06_

### Bugfixes

- fix(updater): emitter memory leak detected ([c7b7b65](https://github.com/deot/dev/commit/c7b7b65c59fef885bfa3e539f33909d3a7146c84))

### Features

- feat(shared): [shell] subprocess exit auto ([5300480](https://github.com/deot/dev/commit/5300480003064d27afcdcc18b373589e5e36253b))
- feat(shared): [shell] expose instance ([ac07184](https://github.com/deot/dev/commit/ac07184b6b88ce9226baa157b6ef95fdcb339822))
- feat(shared): add `isSubPackageMode` ([7b38608](https://github.com/deot/dev/commit/7b38608dd43bb7fcc69c691e5550b2e7873a96e8))
- feat(cli,tester,builder): support react/vue package ([5f9e6ef](https://github.com/deot/dev/commit/5f9e6ef65237e4e477933080b921d6c9fcd8fb84))
- feat(builder): support subpackage mode ([89c2cd9](https://github.com/deot/dev/commit/89c2cd9fbafd4d203989d0c40fac6b510b175bc4))
- feat(react): react integration ([2828c25](https://github.com/deot/dev/commit/2828c25fa9a338ad91e95bc191d40f6cb830665e))
- feat(vue): vue integration ([82accda](https://github.com/deot/dev/commit/82accda7bf50de8b2733ecbde3f3d35ae2d1d978))
- feat(tester): support subpackage mode ([638b369](https://github.com/deot/dev/commit/638b369114c40ff3aaa9da3ff46a09343d1421f4))
- feat(test): allow avoid page log ([84f61cb](https://github.com/deot/dev/commit/84f61cbdefc01ff3ecd4ffe898a90232ff5371f3))
- feat(dever): support component preview directly (react - `*.tsx`, vue - '*.vue') ([8f231c5](https://github.com/deot/dev/commit/8f231c5916645844692c2780ee04b4265dd71dd9))

### Updates

- chore(builder,deps,eslint,releaser,test,tester): deps updated ([682330c](https://github.com/deot/dev/commit/682330cfee48df6ba39c6a2b6b6f3a9bd80fd0f3))
- chore(stylelint): force-publish `2.4.0` -> `2.5.0`

## v2.4.1

_2023-08-25_

### Bugfixes

- fix: avoid exports error ([b793b20](https://github.com/deot/dev/commit/b793b20c4ebc804f8cb0875dd030473d1141e021))

## v2.4.0

_2023-08-24_

### Features

- feat(adder,builder): `*.cjs.js` -> `*.cjs` ([e524118](https://github.com/deot/dev/commit/e5241182e9cb40b65c00fecb229ddaa59450ee35))

### Updates

- chore(builder,deps,eslint,stylelint,test,tester): deps updated ([9a24d31](https://github.com/deot/dev/commit/9a24d31cc9679de29c3aeb956478ebfcc567aed3))
- chore(shared): force-publish `2.3.0` -> `2.4.0`

## v2.3.4

_2023-08-24_

### Features

- feat(adder): ES module as default ([1e0ce6f](https://github.com/deot/dev/commit/1e0ce6f1b2d2d4a1db6205d818e02875e8abf1b1))

## v2.3.3

_2023-08-17_

### Bugfixes

- fix(builder): relation need pre-build when run build alone ([891b6af](https://github.com/deot/dev/commit/891b6afd76b975fcab4f405489deab28af188b61))

## v2.3.2

_2023-08-16_

### Bugfixes

- fix(builder): node package filter split by ',' ([b0c5e4c](https://github.com/deot/dev/commit/b0c5e4c4676e81678319bf23e524cb75426cf891))
- fix(tester): throw error by vitest`@0.34.1` ([b68e5d9](https://github.com/deot/dev/commit/b68e5d987ee0647b206d9362b9014f99d13983c9))

### Updates

- chore(adder,builder,deps,dever,eslint,linker,releaser,test,tester,updater): deps updated ([187282a](https://github.com/deot/dev/commit/187282a8dc3722f7d787fa7558fcf8ee10e02065))

## v2.3.1

_2023-07-27_

### Features

- feat(test): puppeteer console print ([93ac34c](https://github.com/deot/dev/commit/93ac34c27fbc04975febd0c631876ef2b1b76239))

### Updates

- chore(builder,deps,dever): deps updated ([a99684e](https://github.com/deot/dev/commit/a99684e11e0fb00b4de54a4518f8ead5038aad92))

## v2.3.0

_2023-07-24_

### Bugfixes

- fix(updater): published accidentally ([6df8566](https://github.com/deot/dev/commit/6df8566b39cda41e29d417f9c677ff0d697168f7))

### Features

- feat(test): [server], find available `port`，`host` ([3ef86bf](https://github.com/deot/dev/commit/3ef86bfab535957ee285e6ecaf76739eda8c57b2))

### Updates

- chore(shared): force-publish `2.2.0` -> `2.3.0`

## v2.2.5

_2023-07-14_

### Updates

- chore(builder): remove ts warn(TS18028) ([d9cfa09](https://github.com/deot/dev/commit/d9cfa092a8c51c1e4cea9416946a6b6292b1701d))

## v2.2.4

_2023-07-13_

### Bugfixes

- fix: stylelint required ([a6126f6](https://github.com/deot/dev/commit/a6126f6e0eb23469b17dddcddeef2d3f517f0189))
- fix(builder): import `sass` changed ([f92e774](https://github.com/deot/dev/commit/f92e774e18875aa4f5504b715ffca974315bba41))

## v2.2.3

_2023-07-11_

### Bugfixes

- fix(builder): `UserConfigExport` -> `UserConfig` ([82f1ba9](https://github.com/deot/dev/commit/82f1ba9bd236a5b801439d2d0bed09c2c8fcec68))

## v2.2.2

_2023-07-10_

### Bugfixes

- fix(releaser): multiple commit msg ([f5e72ce](https://github.com/deot/dev/commit/f5e72cee009843e3965a3fe0158c6e8c9c675aaf))

### Features

- feat(updater): multiple package commit msg for `packages/releaser` ([fbb09e4](https://github.com/deot/dev/commit/fbb09e4644858962bc938fff89ef7ebfcbf42895))

## v2.2.1

_2023-07-10_

### Bugfixes

- fix(updater): remove record when failed ([e3b455d](https://github.com/deot/dev/commit/e3b455d4ec1b350684d443500d8f5a38b0ec4d42))

## v2.2.0

_2023-07-10_

### Features

- feat: add `packages/updater` ([7d4d177](https://github.com/deot/dev/commit/7d4d17790c16969dea81e540b5754c67c1f3d857))
- feat(shared): [locals] `rootPackageOptions` expose ([c8376fe](https://github.com/deot/dev/commit/c8376fe27d12e86a612c8e83c4901568f8b4e257))
- feat(cli): support `ddc update` from `packages/updater` ([98851c4](https://github.com/deot/dev/commit/98851c4bd1f5ad4ab2045aeb6b3cdcb3147a4acb))
- feat(updater): support update npm version ([80d91f7](https://github.com/deot/dev/commit/80d91f737b9bd9ac59831e1c81ab416c89554a26))

## v2.1.0

_2023-07-08_

### Bugfixes

- fix(test): coverage & types ([0a4cc0a](https://github.com/deot/dev/commit/0a4cc0a1d3afc21f2bbc2faecc513b8a59bbd475))

### Updates

- chore(shared): force-publish `2.0.0` -> `2.1.0`

## v2.0.8

_2023-07-07_

### Bugfixes

- fix(test): release error ([0b19f34](https://github.com/deot/dev/commit/0b19f34be418b6574838be63420d4484d7ac2e41))

### Features

- feat(test): [Utils] add `def` ([5ea3b21](https://github.com/deot/dev/commit/5ea3b2140d18d1dc553b6d090a1b303623a47b00))

## v2.0.7

_2023-06-29_

### Updates

- style(dever): virtual html plugin ([a1531c8](https://github.com/deot/dev/commit/a1531c85168fce573ab71c2d9f1e0561c18cbd44))

## v2.0.6

_2023-06-28_

### Bugfixes

- fix(dever): custom workspace ([f10872e](https://github.com/deot/dev/commit/f10872e60b732617b7a2c757691c600ec7900018))

### Features

- feat(builder): script format filter by `--node-package *` ([a1c1628](https://github.com/deot/dev/commit/a1c16285437549681ab526a632b90088269871b6))
- feat(cli): extract same option ([f251b86](https://github.com/deot/dev/commit/f251b8661dd98f5ab3367f3d6edfc071cce9ef26))
- feat(test): add puppeteer ([5860819](https://github.com/deot/dev/commit/58608191788d289451262787111b0866ab2edf7d))

## v2.0.5

_2023-06-14_

### Bugfixes

- fix(builder): entry glob ([ee32c85](https://github.com/deot/dev/commit/ee32c8505e50c2eb8c46ac16d05d0976d5ac9333))
- fix(cli): `--coverage` -> `--no-coverage` ([6661338](https://github.com/deot/dev/commit/66613387f70e6acc6f8ddfafb33d8d6544fb7725))

### Features

- feat(builder): allow build with `--script-formats=es,cjs,umd,iife` & custom config alone by format ([693571d](https://github.com/deot/dev/commit/693571dc5f1fd5fb1e6bcd8c2f019646fe71acf7))

## v2.0.4

_2023-06-14_

### Features

- feat(tester): set environment `jsdom` default ([2450020](https://github.com/deot/dev/commit/245002004a238a8d5e14daf1b917c92924308cf7))
- feat(eslint): pass Invalid JSDoc tag name ([b60d3b3](https://github.com/deot/dev/commit/b60d3b3e15ddd5e7dcbc35072e143f32c732b1f3))

## v2.0.3

_2023-06-13_

### Bugfixes

- fix(tester): can't respond to the terminal input(`createVitest` -> `startVitest`) ([a315940](https://github.com/deot/dev/commit/a3159408d56b2ff553893eee1c928549c7dca574))

## v2.0.2

_2023-06-13_

### Bugfixes

- fix(builder): import sass failed ([c35066a](https://github.com/deot/dev/commit/c35066a266a1540431e94e55978920c36bda7936))

## v2.0.1

_2023-06-13_

### Bugfixes

- fix(builder): export files ([080968f](https://github.com/deot/dev/commit/080968f372c2ad4e538637b733c55d047040380d))
- fix(tester): export files ([17ab1b2](https://github.com/deot/dev/commit/17ab1b2e34ff59356ef95a2468150d07994e5768))

## v2.0.0

_2023-06-13_

### Bugfixes

- fix(tester): watch default when development ([f3bc03c](https://github.com/deot/dev/commit/f3bc03c2345a028dfbc7d05362b01911ef63815d))

### Features

- feat: delete extract package & import deps package ([1471885](https://github.com/deot/dev/commit/1471885ccaf1e473d455cddd74895f8d22af6b47))
- feat(builder): rollup -> vite & custom config (rollup.config.ts -> test.config.ts) ([87a5917](https://github.com/deot/dev/commit/87a5917a6b8d67e59ea741b3e7c88fc13a457045))
- feat(builder): allow build without any config & extend by `rollup.config.ts` ([0d1edc6](https://github.com/deot/dev/commit/0d1edc67b50d2bc51e4b973190f47721a771459a))
- feat(builder): @rollup/plugin-(typescript -> swc) & use `api-extractor` internally ([05a05af](https://github.com/deot/dev/commit/05a05af67ad9716e76f1cb528350cb0f18d25e49))
- feat(tester): custom config (vitest.config.ts -> test.config.ts) ([5a97131](https://github.com/deot/dev/commit/5a9713138f600af11bdce40e7c99395a54251f19))
- feat(tester): allow test without any config & extend by `vitest.config.ts` ([401d9bf](https://github.com/deot/dev/commit/401d9bf9277d4af2361cfae343901a20df9f9c56))
- feat(tester): command api -> node api ([360b42a](https://github.com/deot/dev/commit/360b42a3bea652d270df4c39d9bcd0ad41ba669e))
- feat(tester): extract resolve.alias ([a9a9211](https://github.com/deot/dev/commit/a9a9211703c76e7be18cd6dc37cf57403ab8472d))
- feat(tester): jest -> vitest ([d2722af](https://github.com/deot/dev/commit/d2722af015f116801ce776515c72ab7bb023b0c7))
- feat(dever): use vite dev (packages/*/examples/*.ts) & custom config(dev.config.ts) ([f760055](https://github.com/deot/dev/commit/f7600553c9081cd58fc5c8704668509d3cdc13a2))

### Updates

- chore(shared): force-publish `1.1.1` -> `2.0.0`

## v1.1.3

_2023-05-04_

### Features

- feat(builder): allow build css entry (/^index(.*)\.s?css$/) ([a8cfff1](https://github.com/deot/dev/commit/a8cfff17cdd376cfa333342edb172b1d0e44fc54))
- feat(builder): multiple entry (/^index(.*)\.(t|j)s$/) ([a71cf70](https://github.com/deot/dev/commit/a71cf707aff02f69b3ce99594355185e87c846c6))

## v1.1.2

_2023-04-28_

### Features

- feat(releaser): clean tags after push ([3c168d9](https://github.com/deot/dev/commit/3c168d90de112609f68ef254999d3534e91ad264))

## v1.1.1

_2023-04-28_

### Bugfixes

- fix(extract): export error(tsconfig.js -> tsconfig.json) ([e10f243](https://github.com/deot/dev/commit/e10f2431b1696d2f7e8cddeef5aa643709c1ced0))

### Features

- feat(releaser): pull before push ([0ca842f](https://github.com/deot/dev/commit/0ca842ff741aad2c6014ad97a52786a6b9cf3c60))
- feat(releaser): allow clean tags & keep last ([91f9a4a](https://github.com/deot/dev/commit/91f9a4a3c9477761d763c76aca769ccdb8ae30af))

### Updates

- chore(shared): force-publish `1.1.0` -> `1.1.1`

## v1.1.0

_2023-04-27_

### Updates

- chore(shared): force-publish `1.0.2` -> `1.1.0`

## v1.0.2

_2023-04-19_

### Bugfixes

- fix(test): ignore test syntax ([df21230](https://github.com/deot/dev/commit/df212302a8071c314ddeb079040637326dc9ba9c))

### Features

- feat(shared): add command method to validate ([22e4940](https://github.com/deot/dev/commit/22e4940efcc8439ca4e41ca54f2e9d4616206755))
- feat(shared): support spawn options & exec args ([c1b5699](https://github.com/deot/dev/commit/c1b56990828841177dc6828d708d058cae4f3c02))
