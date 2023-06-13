# @deot/dev-dever

开发

- 优先执行`scripts`下的`dev`

## 自定义配置

提供环境变量`DEV_OPTIONS`

```ts
interface DEV_OPTIONS {
	packageFolderName?: string;
	workspace?: string;
	entries: string[];
	html: string;
}
```

根目录创建`dev.config.ts`, 可以选择`configShared`合并或单独基于`DEV_OPTIONS`配置
> 也可以是`z.dev.config.ts`, 前缀主要是置底

```ts
import { mergeConfig, defineConfig } from 'vite';
import configShared from '@deot/dever/shared.config';

export default mergeConfig(
	configShared,
	defineConfig({
		plugins: [
			vue(),
			react()
		]
	})
);
```

取`dev.config.ts`, 是为了方便从`vite`转其他开发工具时，可以不改变文件名