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
import { Utils, Logger } from '@deot/dev-shared';
import { Shared } from '../shared';

export const require$ = createRequire(import.meta.url);

class Builder {
	packageDir: string;

	packageName: string;

	packageOptions: any;

	config: {
		dir: string;
		name: string;
		input: any;
		output: any;
	};

	constructor(config: any) {
		const { packageDir, packageName } = Shared.impl();

		if (typeof config === 'string') {
			let packageFolderName = config;
			let packageDir$ = path.resolve(packageDir, packageFolderName);

			config = {
				dir: packageDir$,
				name: packageFolderName,
				input: packageDir$ + '/src/index.ts',
				output: {
					file: packageDir$ + '/dist/index.js',
					format: 'es',
					exports: 'named',
					sourcemap: false
				} 
			};
		}

		this.packageDir = path.resolve(packageDir, `./${config.name}`);
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

export const builder = (options: any) => {
	return new Builder(options);
};