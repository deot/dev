# @deot/dev-cli

`@deot/dev-cli` 提供 `ddc` 命令，将开发、测试、构建、包管理和发布工作流连接到对应子包。

## 安装

安装聚合包即可获得 CLI：

```bash
pnpm add -D @deot/dev
```

也可以单独安装：

```bash
pnpm add -D @deot/dev-cli
```

## 命令

| 命令 | 别名 | 实现 | 说明 |
| --- | --- | --- | --- |
| `ddc link` | `l` | `@deot/dev-linker` | 链接 Monorepo 内全部包。 |
| `ddc add` | `a` | `@deot/dev-adder` | 交互式创建包或添加依赖。 |
| `ddc dev` | `d` | `@deot/dev-dever` | 启动示例开发服务。 |
| `ddc build` | `b` | `@deot/dev-builder` | 构建脚本、样式和类型。 |
| `ddc test` | `t` | `@deot/dev-tester` | 执行 Vitest。 |
| `ddc update` | `u` | `@deot/dev-updater` | 更新依赖版本。 |
| `ddc release` | `r` | `@deot/dev-releaser` | 测试、构建并发布包。 |

所有命令都接受 `--dry-run [boolean]` 和 `--custom <string>`；各工作流会决定是否使用这些值。

## `ddc dev`

| 选项 | 说明 |
| --- | --- |
| `--package-name <string>` | 选择包名；支持文件夹名或完整包名。 |
| `--play-dir <string>` | 示例目录名，默认 `examples`；可传逗号分隔值。 |
| `--vue-package <string>` | 标记需要 Vue 插件的包。 |
| `--react-package <string>` | 标记需要 React 插件的包。 |

## `ddc build`

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--package-name <string>` | 交互选择 | 构建一个、多个或全部包。 |
| `--script-formats <string>` | `es,cjs` | 输出脚本格式。 |
| `--external <string>` | 空 | IIFE/UMD 外部依赖，逗号分隔。 |
| `--globals <string>` | 空 | 浏览器格式的全局变量映射。 |
| `--node-package <string>` | 空 | 标记 Node 包。 |
| `--vue-package <string>` | 空 | 标记 Vue 包。 |
| `--react-package <string>` | 空 | 标记 React 包。 |
| `--no-dts` | 开启声明 | 不生成类型声明。 |

## `ddc test`

| 选项 | 默认值 | 说明 |
| --- | --- | --- |
| `--package-name <string>` | 交互选择 | 选择包。 |
| `--subpackage <string>` | 空 | 选择组件式包中的子包。 |
| `--include <string>` | 自动发现 | 直接指定测试文件 Glob。 |
| `--environment <string>` | `jsdom` | Vitest environment。 |
| `--watch [boolean]` | `false` | 监听测试。 |
| `--no-coverage` | 开启覆盖率 | 禁用覆盖率收集。 |
| `--vue-package <string>` | 空 | 为所选包加载 Vue 插件。 |
| `--react-package <string>` | 空 | 为所选包加载 React 插件。 |

## `ddc release`

默认 dry run；`--no-dry-run` 后才会执行修改、发布和 Git 操作。

| 选项 | 说明 |
| --- | --- |
| `--no-dry-run` | 执行真实发布。 |
| `--no-tag` / `--no-publish` | 禁用 Tag 或 npm publish。 |
| `--no-commit` / `--no-push` | 禁用 Commit 或 Push。 |
| `--no-coverage` | 发布前测试不收集覆盖率。 |
| `--force-update-package [string]` | 强制更新指定包；支持逗号分隔或 `**`。 |
| `--skip-update-package [string]` | 跳过指定包；支持逗号分隔或 `**`。 |
| `--custom-version [string]` | 指定版本号。 |
| `--patch` / `--minor` / `--major` | 指定版本增量。 |
| `--keep-last-tag` | 清理本地 Tag，仅保留最后版本。 |

## `ddc update`

| 选项 | 说明 |
| --- | --- |
| `--no-dry-run` | 写入依赖和锁文件。 |
| `--no-commit` / `--no-push` | 禁用更新后的 Git 操作。 |
| `--no-test` | 跳过受影响包测试。 |
| `--no-change-log` | 不追加 Changelog。 |
| `--patch` / `--minor` / `--major` | 控制允许更新的版本范围。 |
| `--all` | 更新所有可用版本，不受当前 semver 范围限制。 |

配置文件和执行细节见各实现包 README。
