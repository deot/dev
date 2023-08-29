import * as path from 'node:path';
import { createRequire } from "node:module";
import { defineConfig, configDefaults } from 'vitest/config';
import type { UserConfig } from 'vite';

const cwd = process.cwd();

// options
const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { workspace, packageFolderName, subpackageFolderName, subpackages } = options;

const testDirPrefix = workspace 
	? `${workspace}/${packageFolderName || '*'}${subpackages.length ? subpackageFolderName ? `/${subpackageFolderName}` : '/**' : ''}/__tests__` 
	: `__tests__`;

const collectDirPrefix = workspace 
	// eslint-disable-next-line max-len
	? `${workspace}/${packageFolderName || '*'}/${subpackages.length ? subpackageFolderName ? `${subpackageFolderName}` : '' : 'src'}`
	: ``;


// alias
const replacement = (name: string) => path.resolve(cwd, `./packages/${name}/src`);
const { name } = createRequire(cwd)(path.resolve(cwd, workspace ? `${workspace}/index` : '', 'package.json'));

export default defineConfig({
	resolve: workspace
		? {
			alias: [
				{
					find: new RegExp(`^${name}$`),
					replacement: replacement('index')
				},
				{

					find: new RegExp(`^${name}-(.*?)$`),
					replacement: replacement('$1')
				}
			]
		}
		: {},
	test: {
		globals: true,
		include: [
			`${testDirPrefix}/**.(spec|test).[jt]s?(x)`
		],
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reporter: ['text', 'html'],
			branches: 85,
			statements: 95,
			functions: 95,
			lines: 95,
			include: [
				`${collectDirPrefix}/**/*.ts`
			],
			exclude: [
				`__tests__/**/*`,
				`examples/**/*`,
				...configDefaults.coverage.exclude!
			]
		}
	}
}) as UserConfig;