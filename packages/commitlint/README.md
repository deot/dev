# @deot/dev-commitlint

提供 `dd-commitlint` 命令，并导出 Commit message 与文件路径校验类。

## Commit message

```bash
dd-commitlint --message .git/COMMIT_EDITMSG
```

`--message` 后既可传包含提交内容的文件，也可直接传 message。`--edit` 是兼容旧配置的别名。

允许的类型包括 `void`、`fix`、`feat`、`docs`、`style`、`perf`、`test`、`types`、`build`、`chore`、`refactor`、`workflow`、`ci`、`wip`、`release` 和 `breaking change`。标题正文长度为 1–50 个字符，也允许 Merge 和 Revert 提交。

```text
feat(Button): add loading state
docs: update README
```

使用逗号分隔的正则片段排除提交：

```bash
dd-commitlint --message .git/COMMIT_EDITMSG --message-exclude release,wip
```

## 文件路径

```bash
dd-commitlint --file-path src/foo-bar.ts packages/index/src/index.ts
```

除 Markdown 外，存在的文件路径不能包含大写字母。`--file-path-exclude` 可传逗号分隔的排除正则片段。

## 程序化 API

```ts
import { FilePath, Message } from '@deot/dev-commitlint';

const messageError = Message.lint('invalid');
const pathError = FilePath.lint('src/Foo.ts');
```

`lint` 返回空值表示通过，返回字符串表示错误说明。
