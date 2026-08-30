# @deot/dev

`@deot/dev` 是工具链聚合包。安装后可使用 `ddc` CLI、工作流命名空间、测试命令辅助和共享工具，并可通过子路径复用 TypeScript 配置。

## 安装

```bash
pnpm add -D @deot/dev
```

## 导出

| 导出 | 来源 | 说明 |
| --- | --- | --- |
| `Builder` | `@deot/dev-builder` | 构建工作流命名空间。 |
| `Releaser` | `@deot/dev-releaser` | 发布工作流命名空间。 |
| `Tester` | `@deot/dev-tester` | 测试工作流命名空间。 |
| `Adder` | `@deot/dev-adder` | 创建包或添加依赖。 |
| `Dever` | `@deot/dev-dever` | 开发服务工作流。 |
| `Linker` | `@deot/dev-linker` | 本地包链接工作流。 |
| `Updater` | `@deot/dev-updater` | 依赖更新工作流。 |
| `Command` | `@deot/dev-test` | 可交互的子进程测试辅助类。 |
| `Logger` | `@deot/dev-shared` | `log`、`info`、`error`。 |
| `Shell` | `@deot/dev-shared` | `command`、`exec`、`spawn`。 |
| `Utils` | `@deot/dev-shared` | Host、字节格式化和异常包装。 |

```ts
import { Builder, Shell, Utils } from '@deot/dev';

const files = Shell.command('npm run build -- --package-name index');
const size = Utils.formatBytes(2048);

await Builder.run({ packageName: 'index', dryRun: true });
```

工作流的主要用户入口是 `ddc` CLI；直接调用命名空间中的 `run` 适合工具链集成，并会使用当前工作目录发现仓库。

## TypeScript 配置

聚合包额外导出 `./tsconfig.shared.json`：

```json
{
	"extends": "@deot/dev/tsconfig.shared.json"
}
```

ESLint、Stylelint、Vue 和 React 配置是独立包，不由聚合入口 re-export；请从相应包直接导入。
