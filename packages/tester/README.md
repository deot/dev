# @deot/dev-tester

使用 Vitest 执行 Single Repo、Monorepo 和组件式子包测试，并提供统一覆盖率与框架插件配置。通常通过 `ddc test` 使用。

## 使用

```bash
ddc test --package-name shared --no-coverage
```

没有传 `packageName` 或 `include` 时，Monorepo 会交互选择包。

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `packageName` | 交互选择 | 包文件夹名、完整包名或 `*`。 |
| `subpackage` | 空 | 组件式包中的子包名。 |
| `include` | 自动发现 | 直接指定测试 Glob。 |
| `environment` | `jsdom` | Vitest environment。 |
| `coverage` | `true` | 是否收集 Istanbul 覆盖率；CLI 用 `--no-coverage` 关闭。 |
| `watch` | `false` | 是否监听。开发环境会自动监听。 |
| `vuePackage` | 空 | 为所选包启用 Vue 插件。 |
| `reactPackage` | 空 | 为所选包启用 React 插件。 |

若目标包声明自己的 `scripts.test`，工具会进入该包执行 `npm run test`。

## 文件发现

- Single Repo：`__tests__/**/*.{test,spec}.[jt]s?(x)`。
- Monorepo：`packages/<package>/__tests__/**`，并收集相应 `src/` 覆盖率。
- 组件式包：同时覆盖包根入口和带 `__tests__` 的子目录。
- `include` 存在时仅执行给定 Glob。

共享配置默认启用 Istanbul，并要求 branches 85%、statements 95%、functions 95%、lines 95%。

## 自定义配置

优先读取 `z.test.config.ts`，其次读取 `test.config.ts`；Setup 文件同样优先 `z.test.setup.ts`，其次 `test.setup.ts`。

```ts
import { defineConfig, mergeConfig } from 'vitest/config';
import configShared from './node_modules/@deot/dev-tester/shared.config';

export default mergeConfig(configShared, defineConfig({
	test: {
		coverage: {
			exclude: ['packages/cli/src/**']
		}
	}
}));
```

执行期间会把 URL 编码的选择结果写入 `TEST_OPTIONS`，供配置读取。

## 公共入口

```ts
import { run } from '@deot/dev-tester';

await run({ packageName: 'shared', coverage: false });
```
