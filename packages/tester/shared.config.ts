import * as path from 'node:path';
import { createRequire } from 'node:module';
import { defineConfig, configDefaults, mergeConfig } from 'vitest/config';
import type { UserConfig } from 'vite';

import vue from '@vitejs/plugin-vue';
import vueJSX from '@vitejs/plugin-vue-jsx';
import react from '@vitejs/plugin-react-swc';

/**
 * https://github.com/vuejs/core/issues/8303
 * to fix error: ReferenceError: __name is not defined
 */
const __defProp = Object.defineProperty;
const __name = (target: any, value: any) => __defProp(target, 'name', { value, configurable: true });
globalThis.__name = globalThis.__name || __name;

// 当库里同时含有vue和react，vue的jsx要含前缀vue
const getViteConfig = () => {
	const useVue = process.env.USE_VUE;
	const useReact = process.env.USE_REACT;
	if (useVue && useReact) {
		return defineConfig({ plugins: [vue(), vueJSX({ include: /\.vue\.[jt]sx$/ }), react()] });
	}
	return useVue
		? defineConfig({ plugins: [vue(), vueJSX()] })
		: useReact
			? defineConfig({ plugins: [react()] })
			: {};
};
const cwd = process.cwd();

// options
const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { include, workspace, packageFolderName = '*', subpackageFolderName, subpackagesMap } = options;

let tests: string[] = [];
let collects: string[] = [];

const TEST_PATTEN = `**/*.{test,spec}.[jt]s?(x)`;
const COLLECT_PATTEN = `**/*.{[jt]s?(x),vue}`;

if (include) {
	tests.push(include);
} else {
	if (workspace) {
		const prefixDir = `${workspace}/${packageFolderName || '*'}`;
		tests.push(`${prefixDir}/__tests__/${TEST_PATTEN}`);
		collects.push(`${prefixDir}/src/${COLLECT_PATTEN}`);

		if (packageFolderName === '*') {
			Object.keys(subpackagesMap).forEach((packageFolderName$: string) => {
				const subpackages = subpackagesMap[packageFolderName$];
				if (subpackages.length) {
					const prefixDir$ = `${workspace}/${packageFolderName$}`;
					const subpackagesPatten = `{${subpackages.join(',')},}`;

					tests.push(`${prefixDir$}/${subpackagesPatten}/__tests__/${TEST_PATTEN}`);
					collects.push(`${prefixDir$}/${subpackagesPatten}/${COLLECT_PATTEN}`);
					collects.push(`${prefixDir$}/index*.ts`);
				}
			});
		} else if (subpackagesMap[packageFolderName]?.length) {
			if (subpackageFolderName) {
				tests = [];
				collects = [];

				tests.push(`${prefixDir}/${subpackageFolderName}/__tests__/${TEST_PATTEN}`);
				collects.push(`${prefixDir}/${subpackageFolderName}/${COLLECT_PATTEN}`);
			} else {
				const subpackages = subpackagesMap[packageFolderName];
				const subpackagesPatten = `{${subpackages.join(',')},}`;
				tests.push(`${prefixDir}/${subpackagesPatten}/__tests__/${TEST_PATTEN}`);
				collects.push(`${prefixDir}/${subpackagesPatten}/${COLLECT_PATTEN}`);
				collects.push(`${prefixDir}/index*.ts`);
			}
		}
	} else {
		tests.push(`__tests__/${TEST_PATTEN}`);
		collects.push(`src/${COLLECT_PATTEN}`);
	}
}

// alias
const require$ = createRequire(cwd);
const getPackageName = (name: string) => (require$(path.resolve(cwd, workspace ? `${workspace}/${name}` : '', 'package.json'))).name;
const replacement = (name: string, isSubpackage?: boolean) => path.resolve(cwd, `./packages/${name}`, isSubpackage ? 'index.ts' : './src');
const name = getPackageName('index');

export default mergeConfig(getViteConfig(), defineConfig({
	resolve: workspace
		? {
				alias: [
					{
						find: new RegExp(`^${name}$`),
						replacement: replacement('index')
					},
					...Object.keys(subpackagesMap).reduce((pre, cur: string) => {
						if (subpackagesMap[cur].length) {
							pre.push({
								find: new RegExp(`^${getPackageName(cur)}$`),
								replacement: replacement(cur, true)
							});
						}
						return pre;
					}, [] as any),
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
			thresholds: {
				branches: 85,
				statements: 95,
				functions: 95,
				lines: 95
			},
			include: collects,
			exclude: [
				`**/examples/**`,
				...configDefaults.coverage.exclude!
			]
		}
	}
}) as UserConfig);
