import * as path from 'node:path';
import fs from 'fs-extra';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import { createRequire } from "node:module";
import { rollup as rollupBuilder } from 'rollup';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import chalk from 'chalk';
import ora from 'ora';
import { Utils, Logger, Shell } from '@deot/dev-shared';
import { Shared } from './shared';

export const require$ = createRequire(import.meta.url);

class Builder {
	packageDir: string;

	packageName: string;

	packageOptions: any;

	config: any;

	constructor(config: any) {
		const { directory, packageName } = Shared.impl();
		this.packageDir = path.resolve(directory, `./${config.name}`);
		this.packageName = config.name === 'index' ? packageName : `${packageName}-${config.name}`;
		this.packageOptions = require$(`${this.packageDir}/package.json`); // eslint-disable-line
		this.config = config;
	}

	async process() {
		const { packageName, packageDir } = this;
		const spinner = ora(`${packageName} Build ...`);
		try {
			spinner.start();
			await fs.emptyDir(`${packageDir}/dist`);

			const stat = await this.buildSourceAsES();
			await this.buildTypes();

			spinner.stop();
			Logger.log(`${chalk.cyan(`${packageName}`)} ${chalk.green('Success')} ES: ${Utils.formatBytes(stat.size)}`); // eslint-disable-line
		} catch (e) {
			Logger.log('Error!', e);
			throw e;
		}
	}

	async buildSourceAsES() {
		const { name, input, output } = this.config;
		const { packageOptions } = this;
		const external = Object
			.keys({ 
				...packageOptions.dependencies, 
				...packageOptions.peerDependencies 
			})
			.map(i => new RegExp(`^${i}$`));

		const builder = await rollupBuilder({
			input,
			external: [
				/^node:/,
				/^[a-zA-Z@]/,
				...external
			],
			plugins: [
				typescript({
					include: [`packages/${name}/**/*`, 'packages/shims.d.ts'],
					exclude: ['dist'],
					compilerOptions: {
						rootDir: '.',
						outDir: `packages/${name}/dist`,
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
		await builder.write(output);
		const stat = await fs.stat(output.file);

		return stat;
	}

	async buildTypes() {
		const { packageDir } = this;

		// build types
		const config = path.resolve(packageDir, `api-extractor.json`);
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

		await fs.remove(`${packageDir}/dist/packages`);
	}
}

export const run = () => Utils.autoCatch(async () => {
	const { directory } = Shared.impl();
	const files = ['shared', ...fs.readdirSync(directory)]
		.filter((i, index, source) => !['index'].includes(i) && source.indexOf(i) === index);

	if (process.env.NODE_ENV === 'UNIT') return Shell.spawn(`echo ${[...files, 'index'].join(' ')}`);

	// 打包顺序调整
	await [...files, 'index'].reduce((preProcess, file) => {
		const fullpath = path.resolve(directory, file);
		// 获取文件信息
		const stat = fs.statSync(fullpath);
		if (!(/(^_)/.test(file)) && stat.isDirectory()) {
			return preProcess.then(() => {
				const builder = new Builder({
					fullpath,
					name: file,
					input: fullpath + '/src/index.ts',
					output: {
						file: fullpath + '/dist/index.js',
						format: 'es',
						exports: 'named',
						sourcemap: false
					} 
				});
				return builder.process();
			});
		} else {
			return preProcess;
		}
	}, Promise.resolve());
});
