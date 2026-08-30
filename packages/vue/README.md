# @deot/dev-vue

供 Vite 开发、构建和测试流程复用的 Vue 3 配置，默认加载 `@vitejs/plugin-vue` 与 `@vitejs/plugin-vue-jsx`。

## 使用

```bash
pnpm add -D @deot/dev-vue vite vue
```

```ts
import { defineConfig, mergeConfig } from 'vite';
import vueConfig from '@deot/dev-vue';

export default mergeConfig(vueConfig, defineConfig({
	server: { port: 5174 }
}));
```

当环境变量 `USE_REACT` 存在时，Vue JSX 只匹配 `*.vue.jsx` 和 `*.vue.tsx`，避免与 React JSX 冲突；否则匹配所有 JSX/TSX。

包只提供默认 Vite 配置导出。
