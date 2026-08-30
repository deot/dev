# @deot/dev-releaser

根据 Git 提交分析受影响包，串行完成测试、构建、版本更新、Changelog、npm 发布、Tag、Commit 和 Push。通常通过 `ddc release` 使用。

## Dry run

默认不会修改文件、发布或提交：

```bash
ddc release
```

确认输出后显式执行：

```bash
ddc release --no-dry-run
```

## 选项

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `dryRun` | `true` | 是否只预演。 |
| `tag` / `publish` | `true` | 是否创建 Tag、发布 npm。 |
| `commit` / `push` | `true` | 是否提交和推送。 |
| `coverage` | `true` | 发布前测试是否收集覆盖率。 |
| `forceUpdatePackage` | 空 | 即使没有直接提交也更新指定包。 |
| `skipUpdatePackage` | 空 | 跳过指定包。 |
| `customVersion` | 空 | 使用指定版本。 |
| `patch` / `minor` / `major` | 自动 | 指定版本增量。 |
| `keepLastTag` | `false` | 清理本地 Tag，仅保留最后版本。 |

CLI 中布尔禁用项使用 `--no-tag`、`--no-publish`、`--no-commit`、`--no-push` 和 `--no-coverage`。

## Commit 归属

Monorepo 只把带包 scope 的提交归入对应包：

```text
feat(shared): add helper
fix(index,shared): correct export
refactor(*): update every package
```

识别的发布类型包括 `feat`、`fix`、`break change`、`style`、`perf`、`types`、`refactor` 和 `chore`。正文含 `BREAKING CHANGE` 或 `Breaking Change` 时按破坏性变更处理。依赖包发生变化时，引用它的包也会被纳入版本和构建流程。

## 公共入口

```ts
import { run } from '@deot/dev-releaser';

await run({ dryRun: true, coverage: false });
```

包的公共入口只导出 `run`；发布过程中的实例与步骤属于内部实现。
