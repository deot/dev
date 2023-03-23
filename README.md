[ci-image]: https://github.com/deot/dev/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/dev/actions/workflows/ci.yml

[![build status][ci-image]][ci-url]

# deot/dev

用于第三方仓库统一环境

所有的相关的开发环境，统一更新，升级时如果有多仓库，仅更新此仓库即可，无需同时更新太多依赖性，以追求最新且稳定的开发环境

> 不完全的`zero-config`, 需要依赖当前的`tsconfig.json`, `jest.config.mjs`, `.eslintrc.cjs`, `api-extractor.json`等
> 相关的[config](packages/cli/config)可以通过`extends`方式引入, 具体可以参考以下`demo`


- [demo by @deot/dev](https://github.com/deot/dev-demo)
- [demo by self](https://github.com/deot/dev-self-demo)：这个最终演变成`@deot/dev`，方便`@deot/dev`了解具体运作

## Monorepo

| 包名                                                 | 说明                                                 |
| --------------------------------------------------- | ---------------------------------------------------- |
| [cli](packages/cli)                                 | 开发指令集`dev`、`build`、`test`、`link`、`add`         |
| [test](packages/test)                               | 测试工具                                              |
| [shared](packages/shared)                           | 公共方法                                              |
| [index](packages/index)                             | 除cli外其他仓库的集成                                   |

## Contributing

这是一个[monorepo](https://en.wikipedia.org/wiki/Monorepo)仓库 ，使用[lerna](https://lerna.js.org/) 管理

- 安装环境

```console
$ npm run init
```

- 添加依赖或添加新的包

```console
$ npm run add
```

- 关联

```console
$ npm run link
```

- 测试

```console
$ npm run test

# 或者 直接添加参数
$ npm run test -- --packageName '**' --watch
```

- 开发

```console
$ npm run dev

# 或者 直接添加参数
$ npm run dev -- --packageName '**'
```

- 打包

```console
$ npm run build
```

- 代码检查

```console
$ npm run lint
```

- 发布

```console
$ npm run pub
```

## 关联

[CONTRIBUTING](./.github/CONTRIBUTING.md)

[LICENSE (MIT)](./LICENSE)