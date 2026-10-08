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
| `minifyPackage` | 未指定 | 设置哪些包开启 JS 压缩，对应 CLI `--minify-package <names>`。 |
| `evalPackage` | 未指定 | 设置哪些包额外生成内嵌 gzip 并通过 eval 执行的版本，对应 CLI `--eval-package <names>`。 |
| `nodePackage` | 空 | 标记 Node 包。 |
| `vuePackage` | 空 | 标记 Vue 包。 |
| `reactPackage` | 空 | 标记 React 包。 |

两个压缩名单支持整值 `'*'` 或逗号分隔的包名；Monorepo 可使用包目录名或完整包名，名单项两侧空格会去除。名单仅控制实际参与构建的包，不扩大 `packageName` 选定的范围。未指定名单时，共享配置的 JS 压缩和 eval 均关闭。

在 Monorepo 中，构建指定包前会先补构建尚无 `dist/` 的内部依赖，每个包分别匹配压缩名单。若子包声明自己的 `scripts.build`，则进入该包执行脚本并跳过共享构建；命中压缩名单时会提示由自定义脚本控制，不向脚本转发名单。

## 自定义配置

优先读取 `z.build.config.ts`，其次读取 `build.config.ts`。共享配置可从随包发布的文件导入：

```ts
import { defineConfig, mergeConfig } from 'vite';
import configShared from './node_modules/@deot/dev-builder/shared.config';

export default mergeConfig(configShared, defineConfig({
	build: { sourcemap: true }
}));
```

每个脚本格式构建时都会把 URL 编码的 JSON 写入 `BUILD_OPTIONS`。配置可读取 `format`、`workspace`、`files`、`packageName`、`packageSourceDir`、`packageOptions`、`external`、`globals`、`minify` 和 `eval`。

CLI 未传 `--minify-package`（程序调用未传 `minifyPackage`）时不注入 `build.minify`；共享配置默认关闭，自定义配置由 Vite 自行处理。传入名单后，命中的包设置 `build.minify: true`，未命中的包设置 `false`。仅覆盖 `build.minify`，自定义 `build.rolldownOptions.output.minify`、`output.comments` 和 `build.cssMinify` 保留优先级，实际输出由这些设置共同决定。`BUILD_OPTIONS.minify` 和 `BUILD_OPTIONS.eval` 是当前包按名单解析后的布尔值，未指定名单时为 `false`。

共享配置保留优化注释，ES 沿用 [Vite 库模式的压缩策略](https://vite.dev/config/build-options#build-minify)，保留下游 tree-shaking 所需信息。共享配置固定 `cssMinify: false` 并保留现有 cssnano 压缩，避免 JS 开关联带开启 Vite CSS 压缩。声明生成和普通产物文件名沿用原有行为。

## 可选 eval 版本

两个名单独立使用：`--minify-package` 控制普通产物；`--eval-package` 对 eval 副本执行完整 JS 压缩，不要求同时传入 minify 名单：

```bash
ddc build --minify-package '*'
ddc build --eval-package 'shared,components'
ddc build --minify-package '*' --eval-package 'shared,components'
```

`--eval-package` 以极限压缩为目标，为命中的包在普通产物之外生成 `dist/eval/`，沿用入口、分块及资源命名。eval 副本先执行 compress、mangle 和紧凑代码生成，去掉全部 JS 注释（含版权和优化注释），正文再以 gzip level 9 压缩并用 base64 内嵌；浏览器同步解压，再通过 eval 执行。ES 先整体压缩以同步更新 import 绑定及引用，再分离 import/export；直接 eval 读取压缩后的 import 绑定，目录内共享解压模块。浏览器 IIFE/UMD 保留全局导出名称，内嵌解压器并在全局环境执行脚本。解压器及不支持 gzip 封装的配套 JS 分块同样压缩并去注释。普通产物仍按原配置及 minify 名单处理，保留共享配置的优化注释。解压代码由 builder 独立打包，消费端无需安装 fflate 或 jsPDF。

这与 HTTP gzip 不同：HTTP gzip 使用 `Content-Encoding: gzip`，由浏览器在传输层自动解压；eval 版本仍是普通 JavaScript 文件，不生成额外 `.gz`，也无需服务器提供 gzip 支持。命中名单且至少一个分块能安全封装时一定生成，即使体积增加。控制台显示分块和整组的原体积、新体积及差值，增大时提示“体积增加，按用户选择仍生成”。整组比较使用未经过 HTTP 压缩的运行时产物大小，排除 sourcemap 文件及映射注释，并计入 base64、外壳、资源与解压器；全部分块均不支持时提示原因，不写入对应版本。

首版支持受限浏览器 ES、IIFE/UMD，跳过 CJS。存在图外依赖、无法确定的动态 import 路径时整组跳过；可变或非本地导出、循环依赖、顶层 await、`import.meta`、已有直接 eval、匿名默认函数或类等分块保持直接执行代码，压缩后的副本仍会写入完整依赖图。含顶层严格模式指令的 IIFE/UMD 跳过，以保护全局导出。eval 版本不提供 sourcemap。

使用环境需允许 eval，例如 CSP 的 `script-src` 必须允许 `unsafe-eval`。同步解压及重新解析脚本会增加初始化耗时，适合测量后确认有收益的浏览器直接加载场景。正文对后续打包工具不可见，不适合依赖下游 tree-shaking；再次打包、重命名绑定或改变分块路径可能破坏直接 eval 对 import 的引用，应使用普通产物重新构建。

## release 共用 build 脚本

在 package.json 的 `scripts.build` 中配置名单即可：

```json
{
  "scripts": {
    "build": "ddc build --minify-package '*' --eval-package 'shared,components'",
    "release": "ddc release"
  }
}
```

release 沿用 `npm run build -- --package-name 当前包`，因此构建时会自动使用上述名单，并按当前包匹配。release 无需额外的压缩参数。

## 公共入口

```ts
import { run } from '@deot/dev-builder';

await run({ packageName: 'shared', scriptFormats: 'es,cjs', dryRun: true });
```

包的公共入口只导出 `run`；内部 `Build` 实例不是该入口的稳定导出。
