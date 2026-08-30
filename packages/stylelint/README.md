# @deot/dev-stylelint

面向 SCSS、Vue SFC 和普通 CSS 的共享 Stylelint 配置，包含标准规则、属性排序和统一的 Tab 风格。

## 使用

```bash
pnpm add -D @deot/dev-stylelint stylelint
```

```js
// stylelint.config.js
export { default } from '@deot/dev-stylelint';
```

默认导出是 `configure()` 返回的配置 Promise，也可以显式扩展：

```js
import { configure } from '@deot/dev-stylelint';

const base = await configure();

export default {
	...base,
	rules: {
		...base.rules,
		'color-named': 'never'
	}
};
```

## 规则范围

- 扩展 `stylelint-config-standard-scss` 和 `stylelint-config-recommended-vue/scss`。
- 加载 `stylelint-order` 与 `@stylistic/stylelint-plugin`。
- 允许 Sass 控制指令、Vue `:global`、`rpx` 和常见嵌套写法。
- 使用 Tab 缩进、声明分号及固定属性顺序。

公共入口导出 `configure` 和默认配置 Promise。
