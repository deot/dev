[ci-image]: https://github.com/deot/dev/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/dev/actions/workflows/ci.yml

[![build status][ci-image]][ci-url]

# deot/dev

用于第三方仓库统一环境

所有的相关的开发环境，统一更新，升级时如果有多仓库，仅更新此仓库即可，无需同时更新太多依赖性，以追求最新且稳定的开发环境

> 需要依赖当前的`tsconfig.json`, `.eslintrc.cjs`等，这些配置项可以用`extends`导出
> 如果执行`dev`, `test`, `build`需要扩展，可以配置`*.config.ts`来进行扩展
> 具体可以参考以下`demo`


- [demo by @deot/dev](https://github.com/deot/dev-demo)
- [demo by self](https://github.com/deot/dev-self-demo)：这个最终演变成`@deot/dev`，方便`@deot/dev`了解具体运作

目前基于`@deot/dev`的库
- [@deot/helper](https://github.com/deot/helper)
- [@deot/http](https://github.com/deot/http)

## Monorepo

[npm-cli-image]: https://img.shields.io/npm/v/@deot/dev-cli.svg
[npm-cli-url]: https://www.npmjs.com/package/@deot/dev-cli

[npm-test-image]: https://img.shields.io/npm/v/@deot/dev-test.svg
[npm-test-url]: https://www.npmjs.com/package/@deot/dev-test

[npm-shared-image]: https://img.shields.io/npm/v/@deot/dev-shared.svg
[npm-shared-url]: https://www.npmjs.com/package/@deot/dev-shared

[npm-dever-image]: https://img.shields.io/npm/v/@deot/dev-dever.svg
[npm-dever-url]: https://www.npmjs.com/package/@deot/dev-dever

[npm-adder-image]: https://img.shields.io/npm/v/@deot/dev-adder.svg
[npm-adder-url]: https://www.npmjs.com/package/@deot/dev-adder

[npm-linker-image]: https://img.shields.io/npm/v/@deot/dev-linker.svg
[npm-linker-url]: https://www.npmjs.com/package/@deot/dev-linker

[npm-builder-image]: https://img.shields.io/npm/v/@deot/dev-builder.svg
[npm-builder-url]: https://www.npmjs.com/package/@deot/dev-builder

[npm-tester-image]: https://img.shields.io/npm/v/@deot/dev-tester.svg
[npm-tester-url]: https://www.npmjs.com/package/@deot/dev-tester

[npm-releaser-image]: https://img.shields.io/npm/v/@deot/dev-releaser.svg
[npm-releaser-url]: https://www.npmjs.com/package/@deot/dev-releaser

[npm-eslint-image]: https://img.shields.io/npm/v/@deot/dev-eslint.svg
[npm-eslint-url]: https://www.npmjs.com/package/@deot/dev-eslint

[npm-stylelint-image]: https://img.shields.io/npm/v/@deot/dev-stylelint.svg
[npm-stylelint-url]: https://www.npmjs.com/package/@deot/dev-stylelint

[npm-deps-image]: https://img.shields.io/npm/v/@deot/dev-deps.svg
[npm-deps-url]: https://www.npmjs.com/package/@deot/dev-deps

[npm-image]: https://img.shields.io/npm/v/@deot/dev.svg
[npm-url]: https://www.npmjs.com/package/@deot/dev

| 包名                              | 版本                                               | 说明                                     |
| ------------------------------- | ------------------------------------------------ | -------------------------------------- |
| [cli](packages/cli)             | [![npm][npm-cli-image]][npm-cli-url]             | 开发指令集`dev`、`build`、`test`、`link`、`add` |
| [test](packages/test)           | [![npm][npm-test-image]][npm-test-url]           | 测试工具                                   |
| [shared](packages/shared)       | [![npm][npm-shared-image]][npm-shared-url]       | 公共方法                                   |
| [dever](packages/dever)         | [![npm][npm-dever-image]][npm-dever-url]         | 开发服务集成                                 |
| [adder](packages/adder)         | [![npm][npm-adder-image]][npm-adder-url]         | 添加依赖/包集成                               |
| [linker](packages/linker)       | [![npm][npm-linker-image]][npm-linker-url]       | 软链接集成                                  |
| [builder](packages/builder)     | [![npm][npm-builder-image]][npm-builder-url]     | 打包集成(`ts/js/scss/css`)                 |
| [tester](packages/tester)       | [![npm][npm-tester-image]][npm-tester-url]       | 测试集成                                   |
| [releaser](packages/releaser)   | [![npm][npm-releaser-image]][npm-releaser-url]   | 发布集成                                   |
| [eslint](packages/eslint)       | [![npm][npm-eslint-image]][npm-eslint-url]       | ESLint配置项                              |
| [stylelint](packages/stylelint) | [![npm][npm-stylelint-image]][npm-stylelint-url] | Stylelint配置项                           |
| [deps](packages/deps)           | [![npm][npm-deps-image]][npm-deps-url]           | 额外依赖提取                                 |
| [index](packages/index)         | [![npm][npm-image]][npm-url]                     | 当前所有包的合集                               |

## Contributing

这是一个 [monorepo](https://en.wikipedia.org/wiki/Monorepo) 仓库 ，使用 [pnpm](https://pnpm.io/) 管理

#### 安装环境

```console
$ npm run init 

$ 或
$ pnpm install
```

#### 添加依赖或添加新的包

```console
$ npm run add
```

#### 关联

```console
$ npm run link
```

#### 测试

```console
$ npm run test

# 或者 直接添加参数
$ npm run test -- --package-name '*' --watch
```

#### 开发

```console
$ npm run dev

# 或者 直接添加参数
$ npm run dev -- --package-name '*'
```

#### 打包

```console
$ npm run build

# 或者 直接添加参数
$ npm run build -- --package-name '*'
```

#### 代码检查

```console
$ npm run lint
```

#### 发布/自动生成 ChangeLog

```console
$ npm run release
```

##### 可选参数

| 参数                        | 备注                                                      |
| ------------------------- | ------------------------------------------------------- |
| `--no-dry-run`            | 默认`dry run`不输出任何文件                                      |
| `--no-tag`                | 默认输出`tag`                                               |
| `--no-publish`            | 默认发布到`npm`                                              |
| `--no-commit`             | 默认提交到`git commit`                                       |
| `--no-push`               | 默认执行`git push`                                          |
| `--force-update-package`  | 即时没找到commit也会强制更新, 如`@xxx/xxx,@xxx/xxx`或`**`，不输入会弹出确认框` |
| `--skip-update-package`   | 跳过要更新的包，如`@xxx/xxx,@xxx/xxx`或`**`，不输入会弹出确认框             |
| `--custom-version`        | 指定更新版本号，如`x.x.x`，不输入会弹出输入框                              |
| `--patch,--major,--minor` | 自动更新版本号的格式                                              |
| `--keep-last-tag`         | 清理tags，仅保留最后一个版本的tag                                    |

##### `Commit`收录的格式

- `break change`
- `feat`
- `fix`
- `style`
- `perf`
- `types`
- `refactor`
- `chore`

> 自动增加`PR`和`issue`的地址, `commit`内含`Breaking Change`会自动把版本改为`major`

```shell
refactor(index): remove deprecated \n BREAKING CHANGE: any

fix(index): ci tag (#2)

fix(shared): error (close #1)
```

##### `Commit`无影响的格式

```shell
fix: invaild commit
```

## 关联

[CONTRIBUTING](./.github/CONTRIBUTING.md)

[LICENSE (MIT)](./LICENSE)