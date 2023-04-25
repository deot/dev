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
		const { workspace, packageDir, packageName } = Shared.impl();

		if (typeof config === 'string') {
			let packageFolderName = config;
			let packageDir$ = path.resolve(packageDir, packageFolderName);

			config = {
				dir: packageDir$,
				name: packageFolderName || 'index',
				input: packageDir$ + '/src/index.ts',
				output: {
					file: packageDir$ + '/dist/index.es.js',
					format: 'es',
					exports: 'named',
					sourcemap: false
				} 
			};
		}

		this.packageDir = path.resolve(packageDir, workspace ? `./${config.name}` : '');
		this.packageName = config.name === 'index' 
			? packageName 
			: `${packageName}-${config.name}`;
		this.packageOptions = require$(`${this.packageDir}/package.json`); // eslint-disable-line
		this.config = config;
	}

	async process() {
		const { workspace } = Shared.impl();
		const { packageOptions, packageName, packageDir } = this;

		// 子包含有自己的build则自行执行
		if (workspace && packageOptions?.scripts?.build) {
			await Shell.spawn(`npm`, ['run', 'build'], {
				cwd: packageDir
			});
			return;
		}

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
		const { workspace } = Shared.impl();
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
		await builder.write(output);
		const stat = await fs.stat(output.file);

		return stat;
	}

	async buildTypes() {
		const { workspace } = Shared.impl();
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

export const builder = (options: any) => {
	return new Builder(options);
};