# @deot/dev-dever

基于 Vite 启动示例开发服务，自动发现 HTML、TypeScript、Vue 和 React 示例入口。通常通过 `ddc dev` 使用。

## 使用

```bash
ddc dev --package-name components --play-dir examples
```

| 选项 | 说明 |
| --- | --- |
| `packageName` | 选择包；在 Monorepo 中会标准化为完整包名。 |
| `playDir` | 示例目录名，默认由 CLI 传入 `examples`，支持逗号分隔。 |
| `vuePackage` | 为指定包启用 Vue 与 Vue JSX 插件。 |
| `reactPackage` | 为指定包启用 React SWC 插件。 |
| `dryRun` | 仅输出 `development`。 |

若目标包自己的 `package.json` 声明了 `scripts.dev`，工具会进入该包执行 `npm run dev`，不再使用共享服务。

## 入口发现

- 扫描示例目录中的 `.html`、`.ts`、`.vue`、`.tsx` 入口。
- 没有 HTML 时按入口类型生成虚拟页面。
- 从入口目录向仓库根查找预加载文件，优先级为 `z.dev.preload.ts`、`dev.preload.ts`、`z.preload.ts`、`preload.ts`。
- 服务启动后打印每个入口的访问地址。

## 自定义配置

优先读取 `z.dev.config.ts`，其次读取 `dev.config.ts`；两者都不存在时使用随包发布的 `shared.config.ts`。

```ts
import { defineConfig, mergeConfig } from 'vite';
import configShared from './node_modules/@deot/dev-dever/shared.config';

export default mergeConfig(
	configShared,
	defineConfig({
		server: { port: 5174 }
	})
);
```

执行期间会把 URL 编码的 JSON 写入 `DEV_OPTIONS`，供配置读取。常用字段包括 `workspace`、`entries`、`html`、`subpackagesMap`、`useVue` 和 `useReact`。

## 公共入口

```ts
import { run } from '@deot/dev-dever';

await run({ packageName: 'components', playDir: 'examples' });
```
