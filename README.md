[ci-image]: https://github.com/deot/dev/actions/workflows/ci.yml/badge.svg?branch=main
[ci-url]: https://github.com/deot/dev/actions/workflows/ci.yml
[npm-image]: https://img.shields.io/npm/v/@deot/dev.svg
[npm-url]: https://www.npmjs.com/package/@deot/dev

[![build status][ci-image]][ci-url]
[![npm][npm-image]][npm-url]

# @deot/dev

`@deot/dev` 是面向 JavaScript / TypeScript 库的统一开发工具链。它把开发、测试、构建、依赖管理和发布流程拆成独立包，并通过 `ddc` CLI 和聚合包提供一致入口，适用于 Monorepo 与 Single Repo。

## 特性

- **统一命令**：`dev`、`build`、`test`、`link`、`add`、`update`、`release` 共用一套包发现和参数约定。
- **仓库感知**：自动识别 `packages/`、聚合包、包间依赖及组件式子包。
- **可扩展配置**：支持 `z.dev.config.ts`、`z.build.config.ts`、`z.test.config.ts` 等项目级覆盖。
- **框架集成**：内置 Vue、Vue JSX、React SWC、ESLint、Stylelint 与 Vitest 配置。
- **独立安装**：工作流、配置和测试能力均可按需安装，也可通过 `@deot/dev` 一次引入。

## 基于本工具链的项目

- [`@deot/helper`](https://github.com/deot/helper)：JavaScript / TypeScript 工具集。
- [`@deot/http`](https://github.com/deot/http)：多端 HTTP 请求工具。
- [`@deot/style`](https://github.com/deot/style)：Sass / CSS 基础样式与工具类。
- [`@deot/vc`](https://github.com/deot/vc)：Vue 3 桌面端与移动端组件库。
- [`@deot/env`](https://github.com/deot/env)：Vue / Vite 项目的统一开发环境。

## 安装

```bash
pnpm add -D @deot/dev
```

聚合包会安装 `ddc` CLI 及各工作流依赖。只使用某项能力时，也可以直接安装对应子包。

## 快速开始

在项目根 `package.json` 中声明需要的命令：

```json
{
	"scripts": {
		"link": "ddc link",
		"dev": "ddc dev",
		"build": "ddc build",
		"test": "ddc test",
		"add": "ddc add",
		"update": "ddc update",
		"release": "ddc release"
	},
	"devDependencies": {
		"@deot/dev": "^2.9.15"
	}
}
```

常用命令：

```bash
# 选择包并启动示例
npm run dev

# 构建全部包
npm run build -- --package-name '*'

# 测试全部包，不收集覆盖率
npm run test -- --package-name '*' --no-coverage
```

完整命令和选项见 [`@deot/dev-cli`](./packages/cli/README.md)。

## 项目约定

Monorepo 默认使用 `packages/`，其中 `packages/index` 是聚合包：

```text
project/
├── packages/
│   ├── index/
│   │   ├── src/index.ts
│   │   ├── __tests__/index.spec.ts
│   │   └── package.json
│   └── shared/
│       ├── src/index.ts
│       ├── __tests__/index.spec.ts
│       └── package.json
├── pnpm-workspace.yaml
├── tsconfig.json
├── z.dev.config.ts
├── z.build.config.ts
├── z.test.config.ts
└── package.json
```

Single Repo 不需要 `packages/`，源码和测试分别位于根 `src/`、`__tests__/`。开发、构建和测试配置文件名保持一致。

### 配置扩展

| 流程 | 优先读取 | 默认配置 |
| --- | --- | --- |
| 开发 | `z.dev.config.ts`、`dev.config.ts` | `@deot/dev-dever/shared.config.ts` |
| 构建 | `z.build.config.ts`、`build.config.ts` | `@deot/dev-builder/shared.config.ts` |
| 测试 | `z.test.config.ts`、`test.config.ts` | `@deot/dev-tester/shared.config.ts` |
| 测试预加载 | `z.test.setup.ts`、`test.setup.ts` | 无 |

`z.` 前缀用于让共享配置文件在目录排序中靠后，不改变其功能。

### TypeScript 与 Lint

```json
{
	"extends": "@deot/dev/tsconfig.shared.json"
}
```

```js
// eslint.config.js
export { default } from '@deot/dev-eslint';
```

```js
// stylelint.config.js
export { default } from '@deot/dev-stylelint';
```

## 包结构

| 包 | 职责 |
| --- | --- |
| [`@deot/dev`](./packages/index/README.md) | 聚合工作流与公共工具，并导出共享 tsconfig。 |
| [`@deot/dev-cli`](./packages/cli/README.md) | `ddc` 命令行入口。 |
| [`@deot/dev-adder`](./packages/adder/README.md) | 在 Monorepo 中创建包或添加依赖。 |
| [`@deot/dev-linker`](./packages/linker/README.md) | 链接 Monorepo 内的本地包。 |
| [`@deot/dev-dever`](./packages/dever/README.md) | Vite 开发服务与示例入口发现。 |
| [`@deot/dev-builder`](./packages/builder/README.md) | JS、类型和样式构建。 |
| [`@deot/dev-tester`](./packages/tester/README.md) | Vitest 执行、包选择和覆盖率配置。 |
| [`@deot/dev-releaser`](./packages/releaser/README.md) | 测试、构建、版本、Changelog、发布与 Git 流程。 |
| [`@deot/dev-updater`](./packages/updater/README.md) | 依赖版本检查和批量更新。 |
| [`@deot/dev-eslint`](./packages/eslint/README.md) | 可组合的 ESLint Flat Config。 |
| [`@deot/dev-stylelint`](./packages/stylelint/README.md) | Sass、Vue 与样式顺序配置。 |
| [`@deot/dev-vue`](./packages/vue/README.md) | Vue 和 Vue JSX 的 Vite 插件配置。 |
| [`@deot/dev-react`](./packages/react/README.md) | React SWC 的 Vite 插件配置。 |
| [`@deot/dev-commitlint`](./packages/commitlint/README.md) | Commit message 和文件路径校验。 |
| [`@deot/dev-deps`](./packages/deps/README.md) | 集中安装工具链的公共开发依赖。 |
| [`@deot/dev-shared`](./packages/shared/README.md) | 仓库发现、Shell、日志和通用类型。 |
| [`@deot/dev-test`](./packages/test/README.md) | 命令交互、Puppeteer 和异步测试辅助。 |

## 本仓库开发

```bash
pnpm install

npm run lint
npm run typecheck
npm run test -- --package-name '*' --no-coverage
npm run build -- --package-name '*'
```

### 文档站

文档站由 [`@deot/docs`](https://github.com/deot/docs) 提供，直接聚合本 README 与各包 README：

```bash
npm run docs:dev
```

根 `index.html` 可直接部署；GitHub Pages 深链同时依赖根 `404.html`。

### 发布

`release` 默认为 dry run，不修改文件：

```bash
npm run release
npm run release -- --no-dry-run
```

版本、发布和 Git 选项见 [`@deot/dev-releaser`](./packages/releaser/README.md)。依赖更新见 [`@deot/dev-updater`](./packages/updater/README.md)。

## 相关链接

- [贡献指南](./.github/CONTRIBUTING.md)
- [示例项目：@deot/dev](https://github.com/deot/dev-demo)
- [示例项目：自行配置](https://github.com/deot/dev-self-demo)
- [MIT License](./LICENSE)
