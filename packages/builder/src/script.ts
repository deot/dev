import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Locals } from '@deot/dev-shared';
import { build as createViteBuild } from 'vite';
import type { InlineConfig } from 'vite';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const locals = Locals.impl();
	const { cwd, workspace } = locals;

	const { packageName, packageDir, packageOptions, commandOptions } = options || {};
	const { scriptFormats, nodePackage } = commandOptions;

	const stats: Array<{ format?: string; size: number; file: string }> = [];
	const srcDir = path.resolve(packageDir, './src');
	const outDir = path.resolve(packageDir, './dist');
	let files = fs.existsSync(srcDir)
		? fs
			.readdirSync(srcDir)
			.filter((i: string) => /^index\.(.*)\.?(t|j)s$/.test(i))
		: [];


	if (!files.length) return stats;

	const build = async (format: string) => {
		process.env.BUILD_OPTIONS = encodeURIComponent(JSON.stringify({
			files,
			format,
			workspace,
			packageName,
			packageDir,
			packageOptions,
		}));

		// vite每次执行是会清空outDir，这里由自己写入
		let options$: InlineConfig = {
			build: {
				write: false
			}
		};
		if (fs.existsSync(`${cwd}/z.build.config.ts`)) {
			options$.configFile = path.relative(cwd, path.resolve(cwd, './z.build.config.ts'));
		} else if (fs.existsSync(`${cwd}/build.config.ts`)) {
			options$.configFile = path.relative(cwd, path.resolve(cwd, './build.config.ts'));
		} else {
			options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
		}

		let viteBuild = await createViteBuild(options$);

		return viteBuild;
	};

	const needFilter = typeof nodePackage === 'string' && (nodePackage === '*' || (nodePackage.split(',')).includes(packageName));
	const formats = scriptFormats
		.split(',')
		.filter((i: string) => {
			return !needFilter || ['es', 'cjs'].includes(i);
		});
	await formats
		.reduce(
			(preProcess: Promise<any>, format: any) => {
				preProcess = preProcess
					.then(() => build(format))
					.then((outputs: any) => {
						outputs.forEach((i: any) => {
							i.output.forEach((j: any) => {
								// AssetOutput, // css
								if (j.type === 'asset') {
									fs.outputFileSync(`${outDir}/${j.fileName}`, j.source);
									return;
								} 

								// ChunkOutput // js
								if (j.type === 'chunk') { 
									fs.outputFileSync(`${outDir}/${j.name}.${format}.js`, j.code);
									return;
								}
							});
						});
					});
				return preProcess;
			}, 
			Promise.resolve()
		);

	let outputs = fs
		.readdirSync(outDir)
		.filter((i: string) => /^index(.*)(?!=\.d)\.js$/.test(i));

	outputs.forEach((file: string) => {
		let stat = fs.statSync(path.resolve(outDir, file));
		stats.push({
			file: file.replace(/^(.*)(\..*\.js)/, '$1.ts'),
			format: file.replace(/.*\.(.*)\.js/, '$1'),
			size: stat.size
		});
	});
	return stats;
};