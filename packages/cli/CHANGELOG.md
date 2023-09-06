# @deot/dev-cli ChangeLog

## v2.5.0

_2023-09-06_

### Bugfixes

- fix(updater): emitter memory leak detected ([c7b7b65](https://github.com/deot/dev/commit/c7b7b65c59fef885bfa3e539f33909d3a7146c84))

### Features

- feat: support react/vue package ([5f9e6ef](https://github.com/deot/dev/commit/5f9e6ef65237e4e477933080b921d6c9fcd8fb84))
- feat(shared): [shell] subprocess exit auto ([5300480](https://github.com/deot/dev/commit/5300480003064d27afcdcc18b373589e5e36253b))
- feat(shared): [shell] expose instance ([ac07184](https://github.com/deot/dev/commit/ac07184b6b88ce9226baa157b6ef95fdcb339822))
- feat(shared): add `isSubPackageMode` ([7b38608](https://github.com/deot/dev/commit/7b38608dd43bb7fcc69c691e5550b2e7873a96e8))
- feat(builder): support subpackage mode ([89c2cd9](https://github.com/deot/dev/commit/89c2cd9fbafd4d203989d0c40fac6b510b175bc4))
- feat(react): react integration ([2828c25](https://github.com/deot/dev/commit/2828c25fa9a338ad91e95bc191d40f6cb830665e))
- feat(vue): vue integration ([82accda](https://github.com/deot/dev/commit/82accda7bf50de8b2733ecbde3f3d35ae2d1d978))
- feat(tester): support subpackage mode ([638b369](https://github.com/deot/dev/commit/638b369114c40ff3aaa9da3ff46a09343d1421f4))
- feat(test): allow avoid page log ([84f61cb](https://github.com/deot/dev/commit/84f61cbdefc01ff3ecd4ffe898a90232ff5371f3))

### Updates

- chore(builder,deps,eslint,releaser,test,tester): deps updated ([682330c](https://github.com/deot/dev/commit/682330cfee48df6ba39c6a2b6b6f3a9bd80fd0f3))

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

- feat: support `ddc update` from `packages/updater` ([98851c4](https://github.com/deot/dev/commit/98851c4bd1f5ad4ab2045aeb6b3cdcb3147a4acb))
- feat(shared): [locals] `rootPackageOptions` expose ([c8376fe](https://github.com/deot/dev/commit/c8376fe27d12e86a612c8e83c4901568f8b4e257))
- feat(updater): support update npm version ([80d91f7](https://github.com/deot/dev/commit/80d91f737b9bd9ac59831e1c81ab416c89554a26))

## v2.1.0

_2023-07-08_

### Bugfixes

- fix(test): coverage & types ([0a4cc0a](https://github.com/deot/dev/commit/0a4cc0a1d3afc21f2bbc2faecc513b8a59bbd475))

## v2.0.7

_2023-07-07_

### Bugfixes

- fix(test): release error ([0b19f34](https://github.com/deot/dev/commit/0b19f34be418b6574838be63420d4484d7ac2e41))

### Features

- feat(test): [Utils] add `def` ([5ea3b21](https://github.com/deot/dev/commit/5ea3b2140d18d1dc553b6d090a1b303623a47b00))

## v2.0.6

_2023-06-28_

### Features

- feat: extract same option ([f251b86](https://github.com/deot/dev/commit/f251b8661dd98f5ab3367f3d6edfc071cce9ef26))
- feat(builder): script format filter by `--node-package *` ([a1c1628](https://github.com/deot/dev/commit/a1c16285437549681ab526a632b90088269871b6))
- feat(test): add puppeteer ([5860819](https://github.com/deot/dev/commit/58608191788d289451262787111b0866ab2edf7d))

## v2.0.5

_2023-06-14_

### Bugfixes

- fix: `--coverage` -> `--no-coverage` ([6661338](https://github.com/deot/dev/commit/66613387f70e6acc6f8ddfafb33d8d6544fb7725))
- fix(builder): entry glob ([ee32c85](https://github.com/deot/dev/commit/ee32c8505e50c2eb8c46ac16d05d0976d5ac9333))

### Features

- feat(builder): allow build with `--script-formats=es,cjs,umd,iife` & custom config alone by format ([693571d](https://github.com/deot/dev/commit/693571dc5f1fd5fb1e6bcd8c2f019646fe71acf7))

## v2.0.4

_2023-06-14_

### Features

- feat(tester): set environment `jsdom` default ([2450020](https://github.com/deot/dev/commit/245002004a238a8d5e14daf1b917c92924308cf7))

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

- feat(builder): rollup -> vite & custom config (rollup.config.ts -> test.config.ts) ([87a5917](https://github.com/deot/dev/commit/87a5917a6b8d67e59ea741b3e7c88fc13a457045))
- feat(builder): allow build without any config & extend by `rollup.config.ts` ([0d1edc6](https://github.com/deot/dev/commit/0d1edc67b50d2bc51e4b973190f47721a771459a))
- feat(builder): @rollup/plugin-(typescript -> swc) & use `api-extractor` internally ([05a05af](https://github.com/deot/dev/commit/05a05af67ad9716e76f1cb528350cb0f18d25e49))
- feat(tester): custom config (vitest.config.ts -> test.config.ts) ([5a97131](https://github.com/deot/dev/commit/5a9713138f600af11bdce40e7c99395a54251f19))
- feat(tester): allow test without any config & extend by `vitest.config.ts` ([401d9bf](https://github.com/deot/dev/commit/401d9bf9277d4af2361cfae343901a20df9f9c56))
- feat(tester): command api -> node api ([360b42a](https://github.com/deot/dev/commit/360b42a3bea652d270df4c39d9bcd0ad41ba669e))
- feat(tester): extract resolve.alias ([a9a9211](https://github.com/deot/dev/commit/a9a9211703c76e7be18cd6dc37cf57403ab8472d))
- feat(tester): jest -> vitest ([d2722af](https://github.com/deot/dev/commit/d2722af015f116801ce776515c72ab7bb023b0c7))

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

### Features

- feat(releaser): pull before push ([0ca842f](https://github.com/deot/dev/commit/0ca842ff741aad2c6014ad97a52786a6b9cf3c60))
- feat(releaser): allow clean tags & keep last ([91f9a4a](https://github.com/deot/dev/commit/91f9a4a3c9477761d763c76aca769ccdb8ae30af))

### Updates

- chore(shared): force-publish `1.1.0` -> `1.1.1`

## v1.1.0

_2023-04-27_

### Updates

- chore(shared): force-publish `1.0.2` -> `1.1.0`

## v1.0.8

_2023-04-25_

### Features

- feat: avoid command loop ([d2eb332](https://github.com/deot/dev/commit/d2eb3320bf167c3b7ea0dfc7700dcf7bdb57f65c))
- feat: build by output arg(es,cjs,iife) ([7c19187](https://github.com/deot/dev/commit/7c191879317a407199da071888c211c5748c1610))
- feat: use command script when subpackage exist ([8f1efc6](https://github.com/deot/dev/commit/8f1efc62d743c03f56fc38bc5e2e13121dcaec23))

## v1.0.7

_2023-04-23_

### Features

- feat: changeLog collect limit ([81acbe0](https://github.com/deot/dev/commit/81acbe0852feb0539dbedba777cc33ff7f1afd65))

## v1.0.6

_2023-04-22_

### Features

- feat: support single package ([47c1cb3](https://github.com/deot/dev/commit/47c1cb3fab07f5728776009c764a95ce9bcd171d))

## v1.0.5

_2023-04-20_

### Bugfixes

- fix: `conventional-commits-parser` to dependencies ([b5fc605](https://github.com/deot/dev/commit/b5fc605ad0d966bc0dd979947ff02e7c3962f75b))

## v1.0.4

_2023-04-20_

### Bugfixes

- fix: commit repeats when run release again ([17e7af0](https://github.com/deot/dev/commit/17e7af03f4b216799b875a9576823a88ae9421c1))

## v1.0.3

_2023-04-19_

### Bugfixes

- fix: pnpm-lock will changed by run release ([f4a3a00](https://github.com/deot/dev/commit/f4a3a0036d9123e14f41a2559715ffcc55801394))
- fix: tags isn't pushed ([971033c](https://github.com/deot/dev/commit/971033cae0d77e112878858fff473b7ca26436a8))

## v1.0.2

_2023-04-19_

### Bugfixes

- fix(test): ignore test syntax ([df21230](https://github.com/deot/dev/commit/df212302a8071c314ddeb079040637326dc9ba9c))

### Features

- feat: lerna -> pnpm & release mode & cmd option with `--dry-run` ([d9e9bbe](https://github.com/deot/dev/commit/d9e9bbec3d5a3cd1915f7b4eb80110ed0c609957))
- feat(shared): add command method to validate ([22e4940](https://github.com/deot/dev/commit/22e4940efcc8439ca4e41ca54f2e9d4616206755))
- feat(shared): support spawn options & exec args ([c1b5699](https://github.com/deot/dev/commit/c1b56990828841177dc6828d708d058cae4f3c02))

### Updates

- docs: update desc ([fea25a7](https://github.com/deot/dev/commit/fea25a72d07de366610bd49f6955760b653bb5b8))
