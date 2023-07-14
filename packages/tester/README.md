# @deot/dev-tester

测试

- 优先执行`scripts`下的`test`

## 自定义配置

提供环境变量`TEST_OPTIONS`

```ts
interface TEST_OPTIONS {
	packageFolderName?: string;
	workspace?: string;
	watch: boolean;
	coverage: boolean;
}
```

根目录创建`test.config.ts`, 可以选择`configShared`合并或单独基于`TEST_OPTIONS`配置
> 也可以是`z.test.config.ts`, 前缀主要是置底

```ts
import { mergeConfig, defineConfig } from 'vitest/config';
import type { UserConfig } from 'vite';
import configShared from './node_modules/@deot/dev-tester/shared.config'; // 这样调用时才会被编译

export default mergeConfig(
	configShared,
	defineConfig({
		test: {
			coverage: {
				provider: 'istanbul',
				exclude: [
					`packages/cli/src/**/*.ts`,
					`packages/*er/src/**/*.ts`
				]
			}
		}
	}) as UserConfig
);
```
取`test.config.ts`, 是为了方便从`vitest`转其他测试工具时，可以不改变文件名

## 其它

- 已从`jest` -> `vitest`

## 测试日志

#### Jest(29.5.0) 

> MacBook Pro (15-inch, 2016) - i7-6820HQ & 16GB

```shell
➜  dev git:(main) ✗ npm run test -- --package-name '*'

> test
> tsx ./packages/cli/src/index.ts test --package-name *

 PASS  packages/shared/__tests__/locals.spec.ts (10.698 s)

 PASS  packages/shared/__tests__/shell.spec.ts (10.732 s)
 PASS  packages/test/__tests__/command.spec.ts (16.028 s)
 PASS  packages/cli/__tests__/test.spec.ts (25.399 s)
 PASS  packages/releaser/__tests__/index.spec.ts (25.624 s)
 PASS  packages/cli/__tests__/build.spec.ts (37.999 s)
 PASS  packages/cli/__tests__/add.spec.ts (39.3 s)
 PASS  packages/shared/__tests__/utils.spec.ts
 PASS  packages/stylelint/__tests__/index.spec.ts (18.35 s)
 PASS  packages/cli/__tests__/release.spec.ts (19.994 s)
 PASS  packages/cli/__tests__/link.spec.ts (14.567 s)
 PASS  packages/cli/__tests__/dev.spec.ts (15.482 s)
 PASS  packages/linker/__tests__/index.spec.ts
 PASS  packages/dever/__tests__/index.spec.ts
 PASS  packages/tester/__tests__/index.spec.ts (69.246 s)
 PASS  packages/shared/__tests__/global.spec.ts
 PASS  packages/adder/__tests__/index.spec.ts (5.537 s)
 PASS  packages/cli/__tests__/singlerepo.spec.ts (74.416 s)
 PASS  packages/cli/__tests__/monorepo.spec.ts (81.316 s)
 PASS  packages/eslint/__tests__/index.spec.ts (81.453 s)
 PASS  packages/index/__tests__/index.spec.ts (46.985 s)
 PASS  packages/builder/__tests__/index.spec.ts (132.796 s)
-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------|---------|----------|---------|---------|-------------------
All files    |     100 |      100 |     100 |     100 |
 index/src   |     100 |      100 |     100 |     100 |
  index.ts   |     100 |      100 |     100 |     100 |
 shared/src  |     100 |      100 |     100 |     100 |
  index.ts   |     100 |      100 |     100 |     100 |
  locals.ts  |     100 |      100 |     100 |     100 |
  logger.ts  |     100 |      100 |     100 |     100 |
  shell.ts   |     100 |      100 |     100 |     100 |
  utils.ts   |     100 |      100 |     100 |     100 |
 test/src    |     100 |      100 |     100 |     100 |
  command.ts |     100 |      100 |     100 |     100 |
  index.ts   |     100 |      100 |     100 |     100 |
-------------|---------|----------|---------|---------|-------------------

Test Suites: 22 passed, 22 total
Tests:       50 passed, 50 total
Snapshots:   0 total
Time:        147.764 s
Ran all test suites.
```

#### Vitest(0.32.0)
```
➜  dev git:(main) ✗ npm run test -- --package-name '*'

> test
> tsx ./packages/cli/src/index.ts test --package-name *


 RUN  v0.32.0 /Users/deot/Desktop/workspace/dev
	  Coverage enabled with istanbul

 · packages/test/__tests__/command.spec.ts (3)
 ✓ packages/test/__tests__/command.spec.ts (3) 5011ms
 ✓ packages/cli/__tests__/add.spec.ts (2) 32338ms
 ✓ packages/shared/__tests__/locals.spec.ts (3)
 ✓ packages/shared/__tests__/shell.spec.ts (5)
 ✓ packages/cli/__tests__/build.spec.ts (2) 30757ms
 ✓ packages/cli/__tests__/test.spec.ts (1) 14478ms
 ✓ packages/releaser/__tests__/index.spec.ts (2) 4553ms
 ✓ packages/tester/__tests__/index.spec.ts (4) 42230ms
 ✓ packages/builder/__tests__/index.spec.ts (4) 65721ms
 ✓ packages/cli/__tests__/singlerepo.spec.ts (3) 61712ms
 ✓ packages/cli/__tests__/monorepo.spec.ts (3) 66319ms
 ✓ packages/eslint/__tests__/index.spec.ts (2) 1487ms
 ✓ packages/stylelint/__tests__/index.spec.ts (2) 1192ms
 ✓ packages/shared/__tests__/utils.spec.ts (3)
 ✓ packages/cli/__tests__/release.spec.ts (1) 16392ms
 ✓ packages/cli/__tests__/link.spec.ts (1) 13863ms
 ✓ packages/cli/__tests__/dev.spec.ts (1) 12761ms
 ✓ packages/index/__tests__/index.spec.ts (1)
 ✓ packages/linker/__tests__/index.spec.ts (2)
 ✓ packages/adder/__tests__/index.spec.ts (2)
 ✓ packages/dever/__tests__/index.spec.ts (2)
 ✓ packages/shared/__tests__/global.spec.ts (1)

 Test Files  22 passed (22)
	  Tests  50 passed (50)
   Start at  10:47:12
   Duration  74.17s (transform 520ms, setup 2ms, collect 18.69s, tests 368.93s, environment 6ms, prepare 5.60s)

 % Coverage report from istanbul
-------------|---------|----------|---------|---------|-------------------
File         | % Stmts | % Branch | % Funcs | % Lines | Uncovered Line #s
-------------|---------|----------|---------|---------|-------------------
All files    |   98.93 |    95.12 |     100 |     100 |
 shared/src  |   98.56 |     94.2 |     100 |     100 |
  locals.ts  |   97.59 |    95.23 |     100 |     100 | 72,104
  logger.ts  |     100 |      100 |     100 |     100 |
  shell.ts   |     100 |    85.71 |     100 |     100 | 9-16
  utils.ts   |     100 |      100 |     100 |     100 |
 test/src    |     100 |      100 |     100 |     100 |
  command.ts |     100 |      100 |     100 |     100 |
-------------|---------|----------|---------|---------|-------------------
```