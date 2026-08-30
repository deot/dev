# @deot/dev-builder

构建包的脚本、样式和 TypeScript 声明。通常通过 `ddc build` 使用。

## 使用

```bash
ddc build --package-name '*' --script-formats es,cjs
```

构建入口匹配包源码目录中的 `index*.ts`、`index*.js`、`index*.css`、`index*.scss`。组件式包没有 `src/` 时从包根查找入口。

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `packageName` | `*` | 一个包、逗号分隔的多个包或全部包。 |
| `scriptFormats` | `es,cjs` | Vite library 输出格式。 |
| `dts` | `true` | 是否生成并整理声明文件。 |
| `external` | 空 | IIFE/UMD 外部依赖。 |
| `globals` | 空 | 浏览器格式全局变量映射，可写为 `package:Global`。 |
| `nodePackage` | 空 | 标记 Node 包。 |
| `vuePackage` | 空 | 标记 Vue 包。 |
| `reactPackage` | 空 | 标记 React 包。 |

在 Monorepo 中，构建指定包前会先补构建尚无 `dist/` 的内部依赖。若子包声明自己的 `scripts.build`，则进入该包执行脚本并跳过共享构建。

## 自定义配置

优先读取 `z.build.config.ts`，其次读取 `build.config.ts`。共享配置可从随包发布的文件导入：

```ts
import { defineConfig, mergeConfig } from 'vite';
import configShared from './node_modules/@deot/dev-builder/shared.config';

export default mergeConfig(configShared, defineConfig({
	build: { sourcemap: true }
}));
```

每个脚本格式构建时都会把 URL 编码的 JSON 写入 `BUILD_OPTIONS`。配置可读取 `format`、`workspace`、`files`、`packageName`、`packageSourceDir`、`packageOptions`、`external` 和 `globals`。

## 公共入口

```ts
import { run } from '@deot/dev-builder';

await run({ packageName: 'shared', scriptFormats: 'es,cjs', dryRun: true });
```

包的公共入口只导出 `run`；内部 `Build` 实例不是该入口的稳定导出。
