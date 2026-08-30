# @deot/dev-react

供 Vite 开发、构建和测试流程复用的 React 配置，使用 `@vitejs/plugin-react-swc`。

## 使用

```bash
pnpm add -D @deot/dev-react vite react react-dom
```

```ts
import { defineConfig, mergeConfig } from 'vite';
import reactConfig from '@deot/dev-react';

export default mergeConfig(reactConfig, defineConfig({
	server: { port: 5174 }
}));
```

包只提供默认 Vite 配置导出。与 `@deot/dev-vue` 同时使用时，工具链会限制 Vue JSX 的文件匹配范围。
