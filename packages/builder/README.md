# @deot/dev-builder

打包

- 优先执行`scripts`下的`build`和`build:types`，如果声明`build`，打包由用户管理，`build:types`，类型编译由用户管理
- 可被打包的文件匹配：`src/index\.(.*)\.?(j|t|s?cs)s`

## 自定义配置

提供环境变量`BUILD_OPTIONS`

```ts
interface BUILD_OPTIONS {
	packageFolderName?: string;
	workspace?: string;
	watch: boolean;
	coverage: boolean;
}
```

根目录创建`build.config.ts`, 可以选择`configShared`合并或单独基于`BUILD_OPTIONS`配置
> 也可以是`z.build.config.ts`, 前缀主要是置底

```ts
import { mergeConfig, defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import configShared from './node_modules/@deot/dev-builder/shared.config'; // 这样调用时才会被编译

export default mergeConfig(
	configShared,
	defineConfig({
		// custom config
		plugins: [
			vue(),
			react()
		]
	}) as UserConfig
);
```
取`build.config.ts`, 是为了方便从`build`转其他测试工具时，可以不改变文件名
