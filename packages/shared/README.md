# @deot/dev-shared

`@deot/dev` 工作流共用的仓库发现、子进程、日志、工具函数和类型。

## 导出

| 导出 | 说明 |
| --- | --- |
| `Locals` | 发现当前仓库、包、依赖关系和组件式子包。 |
| `Shell` | 解析并执行命令。 |
| `Logger` | `log`、`info`、`error` 控制台入口。 |
| `Utils` | Host、字节格式化和异常包装。 |
| 通用类型 | `Indexable`、`Hash`、`Options`、`AnyFunction`、`Nullable`、`Customized`、`TimeoutHandle`。 |

## `Locals`

```ts
import { Locals } from '@deot/dev-shared';

const workspace = Locals.impl();
const { packageName, packageFolderNames } = workspace;
```

| 方法 | 说明 |
| --- | --- |
| `impl(cwd?)` | 读取并缓存仓库结构；存在 `packages/` 时按 Monorepo 处理。 |
| `getPackageName(folder, cwd?)` | 将包文件夹名转换为完整 npm 包名。 |
| `getPackageFolderName(name, cwd?)` | 将完整包名转换为文件夹名。 |
| `getRealPackageName(names, cwd?)` | 标准化逗号分隔的包名并过滤不存在的包。 |
| `getNormalizePackage(map)` | 按内部依赖拓扑排序，依赖优先。 |

`impl()` 返回根包、聚合包、全部包目录和 `package.json`、内部依赖、构建顺序、Homepage 与组件式子包映射。以 `_` 或 `tpl` 开头的目录不会作为发布包。

## `Shell`

```ts
import { Shell } from '@deot/dev-shared';

const { stdout } = await Shell.exec('git', ['status', '--short']);
await Shell.spawn('npm', ['run', 'typecheck']);
```

| 方法/字段 | 说明 |
| --- | --- |
| `command(command, args?)` | 按引号和空白拆分命令。 |
| `exec(command, args?, options?)` | 使用 `child_process.exec`，返回兼具子进程与 Promise 行为的对象。 |
| `spawn(command, args?, options?)` | 继承 stdio 执行命令，同样可 await。 |
| `LOCAL_COMMAND_MAP` | 当前 `node_modules/.bin` 中命令到本地路径的映射。 |

`spawn` 的单个参数包含空格时，需要在参数值外保留单引号或双引号。

## `Utils`

| 方法 | 说明 |
| --- | --- |
| `getHost()` | 返回首个外部 IPv4 地址，找不到时为 `undefined`。 |
| `formatBytes(size, suffix = 2)` | 把字节数格式化为 B–YB。 |
| `autoCatch(target, { onError? })` | 执行 Promise 或函数，并将异常交给回调；默认 `console.error`。 |
