# @deot/dev-eslint

面向 JavaScript、TypeScript、Markdown 和 Vue 的 ESLint Flat Config。默认组合基础规则、导入检查、JSDoc 和统一代码风格。

## 使用

```bash
pnpm add -D @deot/dev-eslint eslint
```

```js
// eslint.config.js
export { default } from '@deot/dev-eslint';
```

默认导出是 `configure()` 返回的 Flat Config Promise。

## 自定义

```js
import { configure } from '@deot/dev-eslint';

export default configure(
	{
		ignores: ['public/**'],
		jsdoc: false,
		vue: {
			overrides: {
				'vue/html-indent': ['error', 2]
			}
		},
		overrides: {
			javascript: {
				'no-console': 'warn'
			}
		}
	},
	{
		files: ['scripts/**'],
		rules: { 'no-console': 'off' }
	}
);
```

每个模块可设为 `false`，或传 `{ enable, overrides }`。`overrides` 顶层映射会与模块自己的 overrides 合并。

| 模块键 | 作用 |
| --- | --- |
| `javascript` | ESLint recommended、Browser/Node globals 与常用规则。 |
| `typescript` | TypeScript parser 和 `@typescript-eslint` 规则。 |
| `jsdoc` | TypeScript JSDoc recommended。 |
| `markdown` | Markdown processor 与代码块规则。 |
| `import` | `eslint-plugin-import-x`。 |
| `stylistic` | Tab、单引号、分号与最长 150 字符。 |
| `vue` | Vue parser、essential rules 和 Tab 模板缩进。 |

默认忽略 `node_modules`、`dist`、临时目录、coverage 和常见锁文件。向 `ignores` 传默认项的反向形式，例如 `!**/dist`，可以移除该默认忽略项。

## 导出

- 默认导出：完整配置 Promise。
- `configure(options, ...userConfigs)`：生成并追加用户 Flat Config。
- `Options`、`FlatConfig`、`Rules`、`Plugin` 等类型。
