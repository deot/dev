import * as path from 'node:path';
import { createRequire } from "node:module";
import { defineConfig, configDefaults, mergeConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJSX from '@vitejs/plugin-vue-jsx';
import react from '@vitejs/plugin-react-swc';

/**
 * https://github.com/vuejs/core/issues/8303
 * to fix error: ReferenceError: __name is not defined
 */
let __defProp = Object.defineProperty;
let __name = (target: any, value: any) => __defProp(target, 'name', { value, configurable: true });
globalThis.__name = globalThis.__name || __name;

const getViteConfig = (options: any) => {
	return options.useVue 
		? defineConfig({ plugins: [vue(), vueJSX()] }) 
		: options.useReact
			? defineConfig({ plugins: [react()] }) 
			: {};
};
const cwd = process.cwd();

// options
const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { workspace, packageFolderName, subpackageFolderName, subpackagesMap } = options;

let tests: string[] = [];
let collects: string[] = [];

const TEST_PATTEN = `**/*.{test,spec}.[jt]s?(x)`;
const COLLECT_PATTEN = `**/*.[jt]s?(x)`;

if (workspace) {
	let prefixDir = `${workspace}/${packageFolderName || '*'}`;
	tests.push(`${prefixDir}/__tests__/${TEST_PATTEN}`);
	collects.push(`${prefixDir}/src/${COLLECT_PATTEN}`);

	if (packageFolderName === '*') {
		Object.keys(subpackagesMap).forEach((packageFolderName$: string) => {
			let subpackages = subpackagesMap[packageFolderName$];
			if (subpackages.length) {
				let prefixDir$ = `${workspace}/${packageFolderName$}`;
				let subpackagesPatten = `{${subpackages.join(',')},}`;

				tests.push(`${prefixDir$}/${subpackagesPatten}/__tests__/${TEST_PATTEN}`);
				collects.push(`${prefixDir$}/${subpackagesPatten}/${COLLECT_PATTEN}`);
				collects.push(`${prefixDir$}/index*.ts`);
			}
		});
	} else if (subpackagesMap[packageFolderName].length) {
		if (subpackageFolderName) {
			tests = [];
			collects = [];

			tests.push(`${prefixDir}/${subpackageFolderName}/__tests__/${TEST_PATTEN}`);
			collects.push(`${prefixDir}/${subpackageFolderName}/${COLLECT_PATTEN}`);
		} else {
			let subpackages = subpackagesMap[packageFolderName];
			let subpackagesPatten = `{${subpackages.join(',')},}`;
			tests.push(`${prefixDir}/${subpackagesPatten}/__tests__/${TEST_PATTEN}`);
			collects.push(`${prefixDir}/${subpackagesPatten}/${COLLECT_PATTEN}`);
			collects.push(`${prefixDir}/index*.ts`);
		}
	}
} else {
	tests.push(`__tests__/${TEST_PATTEN}`);
	collects.push(`src/${COLLECT_PATTEN}`);
}
// alias
const replacement = (name: string) => path.resolve(cwd, `./packages/${name}/src`);
const { name } = createRequire(cwd)(path.resolve(cwd, workspace ? `${workspace}/index` : '', 'package.json'));

export default mergeConfig(getViteConfig(options), defineConfig({
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
		include: tests,
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reporter: ['text', 'html'],
			branches: 85,
			statements: 95,
			functions: 95,
			lines: 95,
			include: collects,
			exclude: [
				`**/examples/**`,
				...configDefaults.coverage.exclude!
			]
		}
	}
}) as UserConfig);

