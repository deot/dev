# @deot/dev-updater

检查根包和全部子包的 dependencies、devDependencies，在 semver 约束内选择可用版本，并可测试、提交和推送更新。通常通过 `ddc update` 使用。

## Dry run

默认只显示计划：

```bash
ddc update
```

执行真实更新：

```bash
ddc update --no-dry-run
```

## 选项

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `dryRun` | `true` | 不写入依赖和锁文件。 |
| `commit` / `push` | `true` | 是否提交和推送。 |
| `test` | `true` | 是否测试受影响包。 |
| `changeLog` | `true` | 是否更新 Changelog。 |
| `patch` / `minor` / `major` | `false` | 限制允许更新的版本级别。 |
| `all` | `false` | 允许更新到全部可用版本。 |

CLI 中使用 `--no-commit`、`--no-push`、`--no-test`、`--no-change-log`、`--patch`、`--minor`、`--major` 和 `--all`。

真实执行会重建锁文件；若 Puppeteer 发生变化，还会重新安装对应 Chrome。网络中无法读取版本的包会被跳过。

## 公共入口

```ts
import { run } from '@deot/dev-updater';

await run({ dryRun: true, patch: true });
```

包的公共入口只导出 `run`；版本匹配和写入步骤属于内部实现。
