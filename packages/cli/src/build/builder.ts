import * as path from 'node:path';
import fs from 'fs-extra';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
// import terser from '@rollup/plugin-terser';
import { createRequire } from "node:module";
import type { OutputOptions } from 'rollup';
import { rollup as rollupBuilder } from 'rollup';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import chalk from 'chalk';
import ora from 'ora';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';

export const require$ = createRequire(import.meta.url);

class Builder {
	packageDir: string;

	packageName: string;

	packageOptions: any;

	config: {
		dir: string;
		name: string;
		input: string;
		output: OutputOptions[];
	};

	commandOptions: {
		dryRun: boolean;
		output: string;
	};

	constructor(config: any, commandOptions: Builder['commandOptions']) {
		const { workspace, packageDir, packageName } = Locals.impl();

		if (typeof config === 'string') {
			let packageFolderName = config;
			let packageDir$ = path.resolve(packageDir, packageFolderName);
			let input = fs.existsSync(packageDir$ + '/src/index.ts') 
				? packageDir$ + '/src/index.ts'
				: fs.existsSync(packageDir$ + '/src/index.js')
					? packageDir$ + '/src/index.js'
					: '';

			config = {
				dir: packageDir$,
				name: packageFolderName || 'index',
				input,
				output: [
					{
						file: packageDir$ + '/dist/index.es.js',
						format: 'es',
						exports: 'named',
						sourcemap: false
					},
					// TODO: 这个需要解决依赖问题
					{
						file: packageDir$ + '/dist/index.iife.js',
						format: 'iife',
						name: packageName,
						// plugins: [terser()]
					},
					{
						file: packageDir$ + '/dist/index.cjs.js',
						format: 'cjs'
					} 
				].filter(i => {
					return commandOptions.output.includes(i.format);
				})
			};
		}

		this.packageDir = path.resolve(packageDir, workspace ? `./${config.name}` : '');
		this.packageName = config.name === 'index' 
			? packageName 
			: `${packageName}-${config.name}`;
		this.packageOptions = require$(`${this.packageDir}/package.json`); // eslint-disable-line
		this.config = config;

		this.commandOptions = commandOptions;
	}

	async process() {
		const { cwd, workspace } = Locals.impl();
		const { config, packageOptions, packageName, packageDir } = this;

		// 子包含有自己的build则自行执行
		if (
			workspace
			&& packageOptions?.scripts?.build
			&& packageDir !== cwd
		) {
			await Shell.spawn(`npm`, ['run', 'build'], {
				cwd: packageDir
			});
			return;
		}

		if (!config.input) return;

		const spinner = ora(`${packageName} Build ...`);
		try {
			spinner.start();
			await fs.emptyDir(`${packageDir}/dist`);

			const stats = await this.buildSources();
			await this.buildTypes();

			spinner.stop();
			Logger.log(`${chalk.cyan(`${packageName}`)}: ${chalk.green('Success')}`);

			stats.forEach((stat) => {
				Logger.log(`${chalk.green(stat.format.toUpperCase())}: ${Utils.formatBytes(stat.size)}`);
			});
		} catch (e) {
			Logger.log('Error!', e);
			throw e;
		}
	}

	async buildSources() {
		const { workspace } = Locals.impl();
		const { name, input, output } = this.config;
		const { packageOptions } = this;
		const external = Object
			.keys({ 
				...packageOptions.dependencies, 
				...packageOptions.peerDependencies 
			})
			.map(i => new RegExp(`^${i}$`));

		const source = workspace ? `${workspace}/${name}/**/*` : 'src/**/*';
		const shims = workspace ? `${workspace}/shims.d.ts` : 'shims.d.ts';
		const outDir = workspace ? `${workspace}/${name}/dist` : 'dist';
		const builder = await rollupBuilder({
			input,
			external: [
				/^node:/,
				/^[a-zA-Z@]/,
				...external
			],
			plugins: [
				typescript({
					include: [source, shims],
					exclude: ['dist'],
					compilerOptions: {
						rootDir: '.',
						outDir,
						declaration: true
					}
				}),
				commonjs({ extensions: ['.js', '.ts'] }),
				nodeResolve(),
				replace({
					__VERSION__: `'${packageOptions.version}'`,
					__TEST__: 'false',
					preventAssignment: true
				})
			]
		});
		await Promise.all(output.map(builder.write));
		const stats: Array<{ format: string; size: number }> = [];
		await output.reduce((pre: Promise<any>, cur: OutputOptions, index: number) => {
			pre
				.then(() => fs.stat(cur.file))
				.then((stat: any) => {
					stats[index] = {
						format: cur.format as string,
						size: stat.size
					};
				});
			return pre;
		}, Promise.resolve());

		return stats;
	}

	async buildTypes() {
		const { workspace } = Locals.impl();
		const { packageDir, packageOptions } = this;

		// 子包含有自己的build:types则自行执行
		if (workspace && packageOptions?.scripts?.['build:types']) {
			await Shell.spawn(`npm`, ['run', 'build:types'], {
				cwd: packageDir
			});
			return;
		}

		// build types
		const config = path.resolve(packageDir, `api-extractor.json`);
		if (fs.existsSync(config)) {
			const result = Extractor.invoke(
				ExtractorConfig.loadFileAndPrepare(config), 
				{
					localBuild: true,
					showVerboseMessages: false
				}
			);

			if (!result.succeeded) {
				Logger.error(
					`API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
				);
				process.exitCode = 1;
			}			
		}

		await fs.remove(`${packageDir}/dist/${workspace || 'src'}`);
	}
}

export const builder = (options: any, commandOptions?: any) => {
	return new Builder(options, commandOptions);
};