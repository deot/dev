import * as path from 'node:path';
import { createRequire } from "node:module";
import fs from 'fs-extra';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
// import terser from '@rollup/plugin-terser';
import type { OutputOptions } from 'rollup';
import { rollup as rollupBuilder } from 'rollup';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import chalk from 'chalk';
import ora from 'ora';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';

const require$ = createRequire(process.cwd());

class Build {
	packageDir: string;

	packageName: string;

	packageOptions: any;

	config: {
		dir: string;
		name: string;
		scripts: Array<{
			file: string;
			input: string;
			output: OutputOptions[];
		}>;
	};

	commandOptions: {
		dryRun: boolean;
		scriptFormats: string;
	};

	constructor(config: any, commandOptions: Build['commandOptions']) {
		const { workspace, packageDir, packageName } = Locals.impl();

		if (typeof config === 'string') {
			let packageFolderName = config;
			let packageDir$ = path.resolve(packageDir, packageFolderName);
			let source = path.resolve(packageDir$, './src');
			let files = fs.existsSync(source)
				? fs
					.readdirSync(source)
					.filter((i: string) => /^index(.*)\.(t|j)s$/.test(i))
				: [];

			config = {
				dir: packageDir$,
				name: packageFolderName || 'index',
				scripts: files.map((file: string) => {
					let filepath = path.resolve(source, file);
					return {
						file,
						input: filepath,
						output: [
							{
								file: path.resolve(packageDir$, './dist', file.replace(/(\.(j|t)s)$/, '.es.js')),
								format: 'es',
								exports: 'named',
								sourcemap: false
							},
							// TODO: 这个需要解决依赖问题
							{
								file: path.resolve(packageDir$, './dist', file.replace(/(\.(j|t)s)$/, '.iife.js')),
								format: 'iife',
								name: packageName,
								// plugins: [terser()]
							},
							{
								file: path.resolve(packageDir$, './dist', file.replace(/(\.(j|t)s)$/, '.cjs.js')),
								format: 'cjs'
							} 
						].filter(i => {
							return commandOptions.scriptFormats.includes(i.format);
						})
					};
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

		if (!config.scripts.length) return;

		const spinner = ora(`${packageName} Build ...`);
		try {
			spinner.start();
			await fs.emptyDir(`${packageDir}/dist`);

			const stats = await this.buildSources();
			await this.buildTypes();

			spinner.stop();
			Logger.log(`${chalk.cyan(`${packageName}`)}: ${chalk.green('Success')}`);

			stats.forEach((stat) => {
				Logger.log(`${chalk.magenta(stat.file)}: ${chalk.green(stat.format.toUpperCase())} - ${Utils.formatBytes(stat.size)}`);
			});
		} catch (e) {
			Logger.log('Error!', e);
			throw e;
		}
	}

	async buildSources() {
		const { workspace } = Locals.impl();
		const { name, scripts } = this.config;
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
		const stats: Array<{ format: string; size: number; file: string }> = [];
		await scripts
			.reduce(
				(preProcess: Promise<any>, current: any) => {
					preProcess = preProcess
						.then(() => rollupBuilder({
							input: current.input,
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
										declaration: /^index.ts$/.test(current.file)
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
						}))
						.then((builder) => Promise.all(current.output.map(builder.write)))
						.then(() => Promise.all(current.output.map((i) => fs.stat(i.file))))
						.then((stats$) => {
							stats$.forEach((stat, index) => {
								stats.push({
									file: current.file,
									format: current.output[index].format as string,
									size: stat.size
								});
							});
						});
					return preProcess;
				}, 
				Promise.resolve()
			);
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

export const build = (options: any, commandOptions?: any) => {
	return new Build(options, commandOptions);
};