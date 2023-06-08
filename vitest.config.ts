import { mergeConfig, defineConfig } from 'vitest/config';
import * as path from 'node:path';
import configShared from './packages/tester/vitest.shared';

const cwd = process.cwd();

export default mergeConfig(
	configShared,
	defineConfig({
		resolve: {
			alias: [
				{
					find: /^@deot\/dev$/,
					replacement: path.resolve(cwd, './packages/index/src')
				},
				{
					find: /^@deot\/dev-(.*?)$/,
					replacement: path.resolve(cwd, './packages/$1/src')
				}
			]
		},
		test: {
			coverage: {
				provider: 'istanbul',
				exclude: [
					`packages/cli/src/**/*.ts`,
					`packages/*er/src/**/*.ts`
				]
			}
		}
	})
);