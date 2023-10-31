import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Locals } from '@deot/dev-shared';
import { build as createViteBuild, mergeConfig } from 'vite';
import type { InlineConfig } from 'vite';
import sharedVueConfig from '@deot/dev-vue';
import sharedReactConfig from '@deot/dev-react';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const locals = Locals.impl();
	const { cwd, workspace } = locals;

	const { 
		packageSourceDir: srcDir,
		packageOutDir: outDir,
		packageName,
		packageDir,
		packageOptions,
		commandOptions,
		isNodePackage,
		isVuePackage,
		isReactPackage
	} = options || {};
	const { scriptFormats, external, globals } = commandOptions;

	const stats: Array<{ format?: string; size: number; file: string }> = [];
	let files = fs.existsSync(srcDir)
		? fs
			.readdirSync(srcDir)
			.filter((i: string) => /^index\.(.*)\.?(t|j)s$/.test(i))
		: [];

	if (!files.length) return stats;

	const build = async (format: string, filepath: string) => {
		const buildOptions = {
			files: [filepath],
			format,
			external, 
			globals,
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
		let options$: InlineConfig = {
			build: {
				write: false
			}
		};

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

		let outputs: any = await createViteBuild(options$);

		outputs.forEach((i: any) => {
			i.output.forEach((j: any) => {
				// AssetOutput, // css
				if (j.type === 'asset') {
					let fileName = filepath.replace(/^(.*)((\..*\.js)|\.cjs|\.ts)/, `$1.${j.fileName}`);
					fs.outputFileSync(`${outDir}/${fileName}`, j.source);
					return;
				} 

				// ChunkOutput // js
				if (j.type === 'chunk') { 
					fs.outputFileSync(`${outDir}/${j.fileName}`, j.code);
					return;
				}
			});
		});
		return outputs;
	};

	const formats = scriptFormats
		.split(',')
		.filter((i: string) => {
			return !isNodePackage || ['es', 'cjs'].includes(i);
		});

	let serial: Promise<any> = Promise.resolve();

	// 当格式umd和iife的时候，不支持多文件; 多文件也会导致css文件名重复（默认style.css, 单文件下可以修改）
	formats.forEach((format) => {
		files.forEach((filepath: string) => {
			serial = serial.then(() => build(format, filepath));
		});
	});

	await serial;

	let outputs = fs
		.readdirSync(outDir)
		.filter((i: string) => /^index(.*)(?!=(\.d))\.(cjs|js|style\.css)$/.test(i));

	// 	'index.cjs' => 'index.ts', cjs
	// 	'index.js' => 'index.ts', es
	// 	'index.iife.js' => 'index.ts', iife
	// 	'index.umd.cjs' => 'index.ts', umd
	// 	'index.m.cjs' => 'index.m.ts', cjs
	// 	'index.m.js' => 'index.m.ts', es
	// 	'index.m.iife.js' => 'index.m.ts', iife
	// 	'index.m.umd.cjs' => 'index.m.ts', umd
	// 	
	outputs.forEach((file: string) => {
		let stat = fs.statSync(path.resolve(outDir, file));

		stats.push({
			file: file
				.replace(/^(.*)((\..*\.js)|\.umd\.cjs)/, '$1.ts')
				.replace(/^(.*)(\.js|\.cjs)/, '$1.ts'),
			format: /\.style\.css$/.test(file) 
				? 'css' 
				: /\.umd\.cjs$/.test(file)
					? 'umd'
					: /\.cjs$/.test(file)
						? 'cjs'
						: /\.iife\.cjs$/.test(file)
							? 'iife'
							: 'es',
			size: stat.size
		});

	});
	return stats;
};