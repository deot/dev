import { configDefaults } from 'vitest/config';
import * as path from 'node:path';

const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { packageFolderName } = options;

const cwd = process.cwd();

export default {
	resolve: {
		alias: [
			{
				find: /^@demo\/helper$/,
				replacement: path.resolve(cwd, './packages/index/src')
			},
			{
				find: /^@demo\/helper-(.*?)$/,
				replacement: path.resolve(cwd, './packages/$1/src')
			}
		]
	},
	test: {
		globals: true,
		include: [
			`packages/${packageFolderName || '*'}/__tests__/**.(spec|test).[jt]s?(x)`
		],
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reporter: ['text', 'html'],
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
			include: [
				`packages/${packageFolderName || '*'}/src/**/*.ts`
			],
			exclude: [
				...configDefaults.coverage.exclude,
				`packages/cli/src/**/*.ts`,
				`packages/*er/src/**/*.ts`
			],
		}
	}
};