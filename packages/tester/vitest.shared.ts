import { defineConfig, configDefaults } from 'vitest/config';
import type { UserConfig } from 'vite';

const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { workspace, packageFolderName } = options;

const testDirPrefix = workspace 
	? `${workspace}/${packageFolderName || '*'}/__tests__` 
	: `__tests__`;

const collectDirPrefix = workspace 
	? `${workspace}/${packageFolderName || '*'}/src`
	: `src`;


export default defineConfig({
	test: {
		globals: true,
		include: [
			`${testDirPrefix}/**.(spec|test).[jt]s?(x)`
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
				`${collectDirPrefix}/**/*.ts`
			],
			exclude: configDefaults.coverage.exclude
		}
	}
}) as UserConfig;