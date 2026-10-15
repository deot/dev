import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Locals } from '@deot/dev-shared';
import { build as createViteBuild, mergeConfig } from 'vite';
import type { InlineConfig, Rolldown } from 'vite';
import sharedVueConfig from '@deot/dev-vue';
import sharedReactConfig from '@deot/dev-react';
import type { Build } from './build';
import * as Minify from './minify';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export interface Stat {
	format?: string;
	size: number;
	file: string;
}

export interface Result {
	variant: 'standard' | 'bundle';
	format: string;
	filepath: string;
	outDir: string;
	outputs: Rolldown.RolldownOutput[];
	stats: Stat[];
}

interface Context {
	variant: Result['variant'];
	formats: string[];
	outDir: string;
	config?: InlineConfig;
}

export const run = async (options: Build, context: Context = {
	variant: 'standard',
	formats: options.formats,
	outDir: options.packageOutDir
}) => {
	const locals = Locals.impl();
	const { cwd, workspace } = locals;

	const {
		packageSourceDir: srcDir,
		packageName,
		packageDir,
		packageOptions,
		commandOptions,
		isVuePackage,
		isReactPackage,
		minify,
		eval: evalEnabled
	} = options || {};
	const { bundleExternal, iifeExternal, umdExternal, globals } = commandOptions;
	const { variant, formats, outDir, config = {} } = context;
	const results: Result[] = [];
	const files = fs.existsSync(srcDir)
		? fs
				.readdirSync(srcDir)
				.filter((i: string) => /^index\.(.*)\.?(t|j)s$/.test(i))
		: [];

	if (!files.length) return results;

	const build = async (format: string, filepath: string) => {
		const buildOptions = {
			files: [filepath],
			format,
			variant,
			outDir,
			bundleExternal,
			iifeExternal,
			umdExternal,
			globals,
			minify: minify ?? false,
			eval: evalEnabled,
			workspace,
			packageName,
			packageDir,
			packageSourceDir: srcDir,
			packageOptions,

			// 这个是给外部调用(z.)?build.config.ts用的
			useVue: false,
			useReact: false
		};
		// vite每次执行是会清空outDir，这里由自己写入
		let options$: InlineConfig = mergeConfig({
			build: {
				write: false
			}
		}, mergeConfig(Minify.create(minify), config));

		buildOptions.useVue = !!isVuePackage;
		buildOptions.useReact = !!isReactPackage;

		if (fs.existsSync(`${cwd}/z.build.config.ts`)) {
			options$.configFile = path.relative(cwd, path.resolve(cwd, './z.build.config.ts'));
		} else if (fs.existsSync(`${cwd}/build.config.ts`)) {
			options$.configFile = path.relative(cwd, path.resolve(cwd, './build.config.ts'));
		} else {
			process.env.USE_VUE = isVuePackage ? '1' : '';
			process.env.USE_REACT = isReactPackage ? '1' : '';
			options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
			// 只有使用默认配置时才有效，否则就自行配置（这样可以配置单独Plugin的参数）
			options$ = isVuePackage
				? mergeConfig(sharedVueConfig, options$)
				: isReactPackage
					? mergeConfig(sharedReactConfig, options$)
					: options$;
		}

		process.env.BUILD_OPTIONS = encodeURIComponent(JSON.stringify(buildOptions));

		const outputs = await createViteBuild(options$) as Rolldown.RolldownOutput[];
		const stats: Stat[] = [];
		outputs.forEach((output) => {
			output.output.forEach((item) => {
				const fileName = item.type === 'asset'
					? filepath.replace(/^(.*)((\..*\.js)|\.cjs|\.ts)/, `$1.${item.fileName}`)
					: item.fileName;
				const target = path.resolve(outDir, fileName);
				const source = item.type === 'asset' ? item.source : item.code;
				fs.outputFileSync(target, source);
				const file = path.relative(options.packageOutDir, target);
				stats.push({
					file: item.type === 'chunk' && item.isEntry
						? file.replace(/(\.umd\.cjs|\.iife\.js|\.cjs|\.js)$/, '.ts')
						: file,
					format: item.type === 'asset' ? fileName.endsWith('.css') ? 'css' : undefined : format,
					size: fs.statSync(target).size
				});
			});
		});
		results.push({ variant, format, filepath, outDir, outputs, stats });
	};

	// Each entry is built separately because IIFE/UMD do not support multiple entries.
	for (const format of formats) {
		for (const filepath of files) {
			await build(format, filepath);
		}
	}
	return results;
};
