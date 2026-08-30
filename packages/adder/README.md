# @deot/dev-adder

在 Monorepo 中交互式创建新包，或给指定包添加依赖。通常通过 `ddc add` 使用。

## 使用

```bash
ddc add
```

支持两种模式：

| 模式 | 行为 |
| --- | --- |
| `package` | 输入包文件夹名，生成 README、源码入口、测试入口和基础 `package.json`，随后链接本地包。 |
| `dependent` | 选择目标包，输入依赖名，并选择 `-S`、`-D` 或 `-O` 后执行 `pnpm add --filter`。 |

该工作流依赖根 `packages/` 目录；Single Repo 会输出不支持提示而不创建文件。

## 公共入口

```ts
import { run } from '@deot/dev-adder';

await run({ dryRun: true });
```

`run` 仍会发起交互式选择；`dryRun` 仅输出最终命令。
