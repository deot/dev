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
import type { UserConfig } from 'vite';
import configShared from './node_modules/@deot/dev-dever/shared.config'; // 这样调用时才会被编译

export default mergeConfig(
	configShared,
	defineConfig({
		plugins: [
			vue(),
			react()
		]
	}) as UserConfig
);
```

取`dev.config.ts`, 是为了方便从`vite`转其他开发工具时，可以不改变文件名

## 预加载配置`preload.ts`

会查找当前文件夹路径下往前查找`preload.ts`文件，直至`process.cwd()`，如果存件，就近添加`preload.ts`

文件查找优先级

- `z.dev.preload.ts`
- `dev.preload.ts`
- `z.preload.ts`
- `preload.ts`