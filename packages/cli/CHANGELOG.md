# @deot/dev-cli ChangeLog

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
