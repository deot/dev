# @deot/dev-builder

构建包的脚本、样式和 TypeScript 声明。通常通过 `ddc build` 使用。

## 使用

```bash
ddc build --package-name '*'
ddc build --package-name '*' --cjs-package '*'
```

构建入口匹配包源码目录中的 `index*.ts`、`index*.js`、`index*.css`、`index*.scss`。组件式包没有 `src/` 时从包根查找入口。

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `packageName` | `*` | 一个包、逗号分隔的多个包或全部包。 |
| `esPackage` | `*` | 为命中包在 dist 根目录生成 ES。 |
| `cjsPackage` | 空 | 为命中包在 dist 根目录生成 CJS。 |
| `iifePackage` | 空 | 为命中包在 dist 根目录生成 IIFE。 |
| `umdPackage` | 空 | 为命中包在 dist 根目录生成 UMD。 |
| `bundlePackage` | 空 | 为命中包额外生成 `dist/bundle/` ES。 |
| `dts` | `true` | 是否生成并整理声明文件。 |
| `bundleExternal` | 空 | Bundle 外置依赖，逗号分隔。 |
| `iifeExternal` | 空 | 普通 IIFE 外置依赖，逗号分隔。 |
| `umdExternal` | 空 | 普通 UMD 外置依赖，逗号分隔。 |
| `globals` | 空 | IIFE/UMD 共用的全局变量映射，可写为 `package:Global`；未指定时从当前格式的 external 名单推导。 |
| `minifyPackage` | 未指定 | 设置哪些包开启 JS 压缩，对应 CLI `--minify-package <names>`。 |
| `evalPackage` | 未指定 | 设置哪些包从 Bundle 额外生成内嵌 gzip 并通过 eval 执行的版本，对应 CLI `--eval-package <names>`。 |
| `nodePackage` | 空 | 标记 Node 包。 |
| `vuePackage` | 空 | 标记 Vue 包。 |
| `reactPackage` | 空 | 标记 React 包。 |

格式与 Bundle 包名单支持整值 `'*'`、逗号分隔的目录名或完整包名，名单项两侧空格会去除。默认 CLI 和程序调用都只生成普通 ES；`esPackage: ''`（CLI `--es-package ''`）可关闭它。四份格式名单只控制 dist 根目录，Bundle 独立输出 ES，不要求同时开启普通 ES。名单不扩大 `packageName` 选择的范围，也不向依赖传播。CJS 产物运行时需要的内部依赖，应在对应名单中同步开启 CJS。`nodePackage` 仍排除普通 IIFE/UMD。

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

共享配置的默认导出保持为 Vite 配置对象，可以通过 `mergeConfig`、对象展开或直接赋值扩展。`mergeConfig` 会追加 external 数组，因此 `external: []` 不会清空已有规则；数组与回调合并还会产生包含函数的非法数组。需要替换 external 时，在合并后直接赋值或用对象展开替换该属性，例如：

```ts
const config = mergeConfig(configShared, { build: { sourcemap: true } });

config.build = {
	...config.build,
	rolldownOptions: {
		...config.build?.rolldownOptions,
		external: () => false
	}
};

export default config;
```

每个脚本格式构建时都会把 URL 编码的 JSON 写入 `BUILD_OPTIONS`。`variant` 为 `standard` 或 `bundle`，`outDir` 为当前版本的实际输出目录。配置可读取 `format`、`workspace`、`files`、`packageName`、`packageSourceDir`、`packageOptions`、`variant`、`outDir`、`bundleExternal`、`iifeExternal`、`umdExternal`、`globals`、`minify` 和 `eval`。

IIFE/UMD 的 external 和 globals 名单会去除逗号项两侧的空白，globals 还会去除映射键和值两侧的空白，例如 `globals: ' vue : Vue , react : React '`。显式 globals 名单规范化后非空时只使用该名单，不与 external 推导结果合并；为空时从当前格式的 external 推导。`vue:` 的空映射值仍自动推导为 `Vue`，重复键由后项覆盖。

CLI 未传 `--minify-package`（程序调用未传 `minifyPackage`）时不注入 `build.minify`；共享配置默认关闭，自定义配置由 Vite 自行处理。传入名单后，命中的包设置 `build.minify: true`，未命中的包设置 `false`。仅覆盖 `build.minify`，自定义 `build.rolldownOptions.output.minify`、`output.comments` 和 `build.cssMinify` 保留优先级，实际输出由这些设置共同决定。`BUILD_OPTIONS.minify` 和 `BUILD_OPTIONS.eval` 是当前包按名单解析后的布尔值，未指定名单时为 `false`。

共享配置保留优化注释，ES 沿用 [Vite 库模式的压缩策略](https://vite.dev/config/build-options#build-minify)，保留下游 tree-shaking 所需信息。共享配置固定 `cssMinify: false` 并保留现有 cssnano 压缩，避免 JS 开关联带开启 Vite CSS 压缩。声明生成和普通产物文件名沿用原有行为。

## 可选 Bundle 版本

```bash
ddc build --bundle-package client
ddc build --es-package '' --bundle-package '*'
```

`bundlePackage` 为命中包从源码额外构建 ES，写入 `dist/bundle/`，保留普通产物。Bundle 默认将依赖一起打包，仅按 `bundleExternal` 外置；普通 ES/CJS 仍默认外置依赖，普通 IIFE/UMD 分别读取 `iifeExternal`、`umdExternal`，三个名单互不合并。模块 ID 沿用原匹配规则。项目显式设置 `build.rolldownOptions.external` 可以覆盖 Bundle 默认值。

Bundle 默认将 `process.env.NODE_ENV` 替换为 `"production"`，生产环境和 JS 压缩独立。项目顶层 `define` 可以覆盖该值，例如 `define: { 'process.env.NODE_ENV': JSON.stringify('development') }`；构建钩子保护合并后的值，避免被 Vite 的最终转换选项覆盖。普通 ES/CJS 保留原有环境行为，IIFE/UMD 沿用原有策略。不注入 Node `process` 替身、不提供 CDN 回退，依赖仍需适用于当前构建目标。

Bundle 的 JS、动态 chunks、提取的 CSS 和资源写入自身目录，沿用 Vite 或项目的分包及命名设置。独立样式入口与声明仍只在 dist 根目录生成一次。共享配置不自动修改 package.json exports。

```text
dist/
├── index.js          普通 ES
├── index.cjs         显式开启的 CJS
├── index.d.ts        共用声明
├── bundle/
│   └── index.js      Bundle ES
└── eval/
    └── index.js      Bundle 的 eval 副本
```

Bundle 的依赖策略、默认生产环境和 define 保护由 builder 注入，自定义配置不需要导入共享配置即可生效，项目显式设置的 external 和 define 优先。其他构建配置仍由项目自行管理，可读取 `BUILD_OPTIONS.variant` 和其他上下文。

## 可选 eval 版本

```bash
ddc build --bundle-package '*' --eval-package '*'
ddc build --bundle-package client --eval-package client --minify-package client
```

`evalPackage` 仅处理命中包的 Bundle ES 内存构建结果，额外写入 `dist/eval/`，不会改写普通或 Bundle 产物。包必须同时命中 `bundlePackage`、`evalPackage`；仅命中 eval 时提示跳过，不隐式开启 Bundle，也不使用普通或 IIFE/UMD 产物。Eval 继承 Bundle 的环境值。JS 压缩名单与 eval 名单独立：eval 副本始终完整压缩、去掉全部 JS 注释（含版权和优化注释），正文再以 gzip level 9 压缩并用 base64 内嵌。浏览器同步解压，通过 eval 执行；ES 整体压缩后分离 import/export，保留压缩后的 import 绑定及引用，目录内共享解压模块。消费端无需安装 fflate 或 jsPDF。

这与 HTTP gzip 不同：产物仍是普通 JavaScript，不生成额外 `.gz`，无需服务器提供 `Content-Encoding: gzip`。只要至少一个分块可以安全封装就生成，即使体积增加。日志比较 Bundle 与 eval 整组的运行时大小，排除 sourcemap，并计入 base64、外壳、资源和解压器；全部分块均不支持时提示原因，不创建 eval 目录。

保留入口、chunks 和资源命名。变量动态 import 命中本次 Bundle 输出时加载对应 eval 副本，静态和动态引用共用模块实例并保留加载选项、查询参数和 hash；其他相对路径按 `dist/bundle/` 的原模块位置解析，因此应保留 Bundle 目录。HTTP(S)、data、blob URL 保留原加载方式。缺失的本地分块、裸模块依赖或无法验证的 require 导致整组跳过；显式 `bundleExternal` 可能因此阻止 eval 生成。

可变或非本地导出、循环依赖、顶层 await、`import.meta`、直接 eval、匿名默认函数或类等分块保持直接执行代码，压缩后的副本仍写入依赖图。直接 eval 与变量动态 import 同时出现时整组跳过。导出检查按实际词法作用域判断。Eval 不提供 sourcemap，解压器和不支持封装的 JS 副本同样压缩并去注释。

运行环境需允许 eval，例如 CSP 的 `script-src` 允许 `unsafe-eval`。同步解压和脚本解析会增加初始化耗时，适合测量后确认有收益的浏览器直接加载场景。正文对下游打包工具不可见，不适合 tree-shaking 或再次打包；需要再次构建时使用普通产物。

## release 共用 build 脚本

在 package.json 的 `scripts.build` 中配置名单即可：

```json
{
  "scripts": {
    "build": "ddc build --minify-package '*' --bundle-package 'shared,components' --eval-package 'shared,components'",
    "release": "ddc release"
  }
}
```

release 沿用 `npm run build -- --package-name 当前包`，因此构建时会自动使用上述名单，并按当前包匹配。release 无需额外的压缩参数。

## 公共入口

```ts
import { run } from '@deot/dev-builder';

await run({ packageName: 'shared', cjsPackage: '*', dryRun: true });
```

包的公共入口只导出 `run`；内部 `Build` 实例不是该入口的稳定导出。

## 迁移

移除 `scriptFormats` / `--script-formats`：按输出格式分别配置包名单。旧默认 `es,cjs` 对应新默认 ES 加 `--cjs-package '*'`。移除 `external` / `--external`：IIFE 和 UMD 分别使用对应 external 参数。`globals` 继续共用。旧参数不保留别名。

本仓库的 `npm run build` 显式开启 CJS，以保留现有 `require` 发布入口；这不改变 builder 对其他项目默认仅 ES 的行为。
