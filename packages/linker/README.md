# @deot/dev-linker

把 Monorepo `packages/` 下的全部发布包链接到当前项目，通常通过 `ddc link` 使用。

## 使用

```bash
ddc link
```

工作流会为每个已发现包执行：

```bash
npx pnpm link ./packages/<folder>
```

所有包并行链接；Single Repo 不执行链接。

## 公共入口

```ts
import { run } from '@deot/dev-linker';

await run({ dryRun: true });
```

`dryRun` 只打印基础链接命令。
