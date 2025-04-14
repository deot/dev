# @deot/dev ChangeLog

## v2.9.4

_2025-04-14_

### Features

- feat(eslint): add vue plugin ([cdf6fed](https://github.com/deot/dev/commit/cdf6fed6342a8fb9fc2667e803f21ac88f8a8e2b))

## v2.9.3

_2025-04-10_

### Features

- feat(releaser,cli): support test without coverage ([92c2e66](https://github.com/deot/dev/commit/92c2e66573626edb6a0beacaeefb0e6142f4c13b))

## v2.9.2

_2025-04-07_

### Updates

- chore: deps updated ([95d4066](https://github.com/deot/dev/commit/95d40669eccf98339ef228bd6a0e01db24f38bfb))

## v2.9.1

_2025-02-16_

### Features

- feat(stylelint): ignore `@forward` rule ([058f8e2](https://github.com/deot/dev/commit/058f8e2b8f1483e17fa01d2d5ec30f40df406985))

## v2.9.0

_2025-02-14_

### Bugfixes

- fix(updater): should install deps after analyze ([b478179](https://github.com/deot/dev/commit/b478179e88e8437e3ceeb408897d12b8aea55e40))

### Features

- feat(updater): allow ignore log when release (`--no-change-log`) ([5194898](https://github.com/deot/dev/commit/5194898a8274e492b287025a215a36b923ed3052))
- feat(test): `Scheduler` -> `Interrupter` ([037066e](https://github.com/deot/dev/commit/037066e2dc87e4ce7c671130892218f8a41cf39e))
- feat(stylelint): `stylelint-codeguide` -> `@stylistic/stylelint-plugin` ([b9a9c57](https://github.com/deot/dev/commit/b9a9c574760e47b4348b7d8c1b1ec043e9b1b1c6))

### Updates

- chore: deps updated ([c5cd7df](https://github.com/deot/dev/commit/c5cd7dfe49cda379eecaf144086c2ce5e09ba7e1))
- chore: deps updated ([0f81c52](https://github.com/deot/dev/commit/0f81c52382385ff688fe9a55b0e584269e050a49))
- chore: deps updated ([f2d59ed](https://github.com/deot/dev/commit/f2d59edf8c7895fd531330b2ef1ba7d531e3b3bb))
- chore: deps updated ([fb89973](https://github.com/deot/dev/commit/fb89973296802fe8d6c56d6642c573089f7c7da7))
- chore: deps updated ([d25078b](https://github.com/deot/dev/commit/d25078beec43d10add81efa3058e8a480097e6cf))
- chore: deps updated ([51daef7](https://github.com/deot/dev/commit/51daef762188dcb33c00ae851a7cc5afa4bd8226))
- chore: deps updated ([1fd75e5](https://github.com/deot/dev/commit/1fd75e5fec94c1583cdfd0b8d9a5ffb17e8f9e3c))
- types(test): `reject` isn't required ([ec8b490](https://github.com/deot/dev/commit/ec8b4900baac3d4d9df596125384aaeb63ba5c0c))

## v2.8.8

_2023-12-18_

### Features

- feat(test): add `Scheduler` ([eaeb92c](https://github.com/deot/dev/commit/eaeb92c4dc1423bfd3b6b121084a6d59150cfb1a))

## v2.8.7

_2023-12-16_

### Bugfixes

- fix(dever): find fullpath overflow ([b05262d](https://github.com/deot/dev/commit/b05262d584d186d3284f38500181295ae1448c15))

### Features

- feat(eslint): `prefer-const`, only warns if all variables in destructuring can be const ([7a7f92d](https://github.com/deot/dev/commit/7a7f92dfca61f72384ea3372ec5669aa2bc0a5c7))

## v2.8.6

_2023-12-15_

### Bugfixes

- fix(builder): single repo should't collect relations ([dccc259](https://github.com/deot/dev/commit/dccc25916140f25dffe79d50656d30bfba37e9b2))

## v2.8.5

_2023-12-15_

### Features

- feat(stylelint): allow placeholder file & `*pattern` changed to `[a-zA-Z0-9_-]+` ([19ea5b2](https://github.com/deot/dev/commit/19ea5b20bf76e105b4bbd674e67ab095e32e2a9a))

## v2.8.4

_2023-12-15_

### Features

- feat(commitlint): standalone used ([b4e9536](https://github.com/deot/dev/commit/b4e9536d2ef628a1d6f3acbbe38c0e5deab138a0))
- feat(*): multiple entry points supported when output formats include 'iife' & 'umd' ([926bb53](https://github.com/deot/dev/commit/926bb53aea4114f595dba68f203e3bc727fdb4b4))

### Updates

- chore(*): deps updated ([1b75dc0](https://github.com/deot/dev/commit/1b75dc09c65d6ca44d2f169aa18a1449bcf12133))
- chore(*): deps updated ([d38389c](https://github.com/deot/dev/commit/d38389c80413e24288d9530b17c5c605e509c9b8))
- chore(*): deps updated ([ee04bb0](https://github.com/deot/dev/commit/ee04bb022128b206a5e88c541db80b10a7758391))

## v2.8.3

_2023-12-14_

### Features

- feat(builder): allow `default` export ([35b96c1](https://github.com/deot/dev/commit/35b96c15a6a47e1943919eec0b7382a706a31043))
- feat(eslint): support expose default config ([46b6d4b](https://github.com/deot/dev/commit/46b6d4b7154854546479e537b0d8288f4d480699))
- feat(stylelint): allow configure self ([d163259](https://github.com/deot/dev/commit/d1632599cbe774edefd3773206127e90607fdd1a))

## v2.8.2

_2023-12-14_

### Bugfixes

- fix(eslint): migrate to esm ([a498da4](https://github.com/deot/dev/commit/a498da47d0580c6a463783298112ca1c1f3e4a4c))

## v2.8.1

_2023-12-14_

### Features

- feat(eslint): remove deprecated tips ([a754b75](https://github.com/deot/dev/commit/a754b757868dcd5c5f21aac996cf98ecf0df3dfd))
- feat(stylelint): ignore files updated ([8a75630](https://github.com/deot/dev/commit/8a75630b4748b345b9f9f5032762d1437c7caf38))

## v2.8.0

_2023-12-14_

### Features

- feat(eslint): use `@stylistic/eslint-plugin` ([6c511fa](https://github.com/deot/dev/commit/6c511fa37acdddc95628e64b9e523ae7e8d2cd90))
- feat(eslint): deprecated stylistic rules, initial commit ([de31299](https://github.com/deot/dev/commit/de31299a681f40d7e2db494c308eaa34d140155c))
- feat(stylelint): use `stylelint-codeguide` ([0231064](https://github.com/deot/dev/commit/023106433ff2e3b5efdca1647c4d06fcd09cc665))
- feat(stylelint): deprecated stylistic rules ([cb98871](https://github.com/deot/dev/commit/cb98871a805fb8ebb9838020c803b3c68127d957))

### Updates

- chore: deps updated ([1b75dc0](https://github.com/deot/dev/commit/1b75dc09c65d6ca44d2f169aa18a1449bcf12133))

## v2.7.1

_2023-12-07_

### Features

- feat(cli): allow custom option(`--custom`) ([777e3cd](https://github.com/deot/dev/commit/777e3cd7a7dfb155d0cf82d01e08446f6268e20c))

### Updates

- chore(builder): remove warning when build vue's package ([edef676](https://github.com/deot/dev/commit/edef67632b7695dd6066da949ac384a34c520647))

## v2.7.0

_2023-12-06_

### Bugfixes

- fix(tester): type error vitest@1.x.x ([e94d7b3](https://github.com/deot/dev/commit/e94d7b3e43bb88d4b2a6d5eca36d0aa5fa86cb7f))
- fix(updater): cache effect after `pnpm install` ([7e45e96](https://github.com/deot/dev/commit/7e45e96c0aadc2a3b723f97bc5a7b2d6deca1d7d))
- fix(updater): update * without output ([4d976b2](https://github.com/deot/dev/commit/4d976b280d8d193c77fcc47a9fc1e208f09b05d4))
- fix(updater): `*.beta.*` compare ([a4d782a](https://github.com/deot/dev/commit/a4d782a25151457f49ec84b86201cf95aa966ed5))

### Features

- feat(dever): printUrls && bindCLIShortcuts ([3a9522e](https://github.com/deot/dev/commit/3a9522e41b4007d791ef6a06cfcfa315acaef7ab))

### Updates

- chore: deps updated ([d38389c](https://github.com/deot/dev/commit/d38389c80413e24288d9530b17c5c605e509c9b8))

## v2.6.3

_2023-11-17_

### Updates

- style(eslint): jsdoc with recommended-typescript ([426be31](https://github.com/deot/dev/commit/426be314635e3f4303cf734cd65957a841bb460b))

## v2.6.2

_2023-11-11_

### Features

- feat(builder,dever,releaser,shared,tester): allow folder name with packageName ([2226b1d](https://github.com/deot/dev/commit/2226b1d8f6c68d037109d914e981e413af8a569d))
- feat(updater,cli): add `--all` to update * ([eff0cde](https://github.com/deot/dev/commit/eff0cde7b868b55b971530bbde7b70fa091ee754))

### Updates

- chore: deps updated ([ee04bb0](https://github.com/deot/dev/commit/ee04bb022128b206a5e88c541db80b10a7758391))
- chore(vue): remove `lru-cache` as deps ([f4108d4](https://github.com/deot/dev/commit/f4108d42b696868a35b9d78e3af6a16a4782393a))

## v2.6.1

_2023-11-03_

### Bugfixes

- fix(builder): `iife` tag regexp ([28d7eeb](https://github.com/deot/dev/commit/28d7eeba8c18bf9e1d6f26a3737c3e04740e0052))

## v2.6.0

_2023-11-02_

### Bugfixes

- fix(releaser): multiple package commits ([61c30bd](https://github.com/deot/dev/commit/61c30bdaa1bde5e1923d5961df00f86b1e3329b6))

### Features

- feat: multiple entry points supported when output formats include 'iife' & 'umd' ([926bb53](https://github.com/deot/dev/commit/926bb53aea4114f595dba68f203e3bc727fdb4b4))
- feat(releaser): add `*` to update all package ([4de2700](https://github.com/deot/dev/commit/4de2700f1f7a73ec50f08d2e1a628dcadd90a148))

### Updates

- chore(adder,builder,deps,dever,eslint,react,releaser,test,tester,vue): deps updated ([dd4f69b](https://github.com/deot/dev/commit/dd4f69b06f13099605278d79c932efe716e953cc))
- chore(adder,builder,deps,eslint,releaser,test,tester,vue): deps updated ([0cfa334](https://github.com/deot/dev/commit/0cfa3345c61760ae1f0440d850e470affea928aa))
- chore(builder,cli,deps,dever,eslint,react,stylelint,test,vue): deps updated ([0b432f1](https://github.com/deot/dev/commit/0b432f112fa62f3824cd292b138c23a2e935cc3e))

## v2.5.9

_2023-10-11_

### Features

- feat(dever): support root preload & multiple filename ([3221122](https://github.com/deot/dev/commit/322112235bd3931ed8fe06899204da7e006806b6))

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
