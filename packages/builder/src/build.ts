import * as path from 'node:path';
import { createRequire } from "node:module";
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';
import * as Script from './script';
import * as Style from './style';
import * as Type from './type';

const require$ = createRequire(process.cwd());

export class Build {
	packageDir: string;

	packageFolderName: string;

	packageSourceDir: string;

	packageName: string;

	packageOptions: any;

	commandOptions: {
		dryRun: boolean;
		scriptFormats: string;
	};

	constructor(packageFolderName: string, commandOptions: Build['commandOptions']) {
		const { workspace, packageDir, packageName, packageFolderName: packageFolderName$ } = Locals.impl();

		this.packageFolderName = packageFolderName || '';
		this.packageDir = path.resolve(packageDir, workspace ? `./${packageFolderName}` : '');
		this.packageSourceDir = path.resolve(packageDir, './src');
		this.packageName = packageFolderName === packageFolderName$ 
			? packageName 
			: `${packageName}-${packageFolderName}`;
		this.packageOptions = require$(`${this.packageDir}/package.json`); // eslint-disable-line
		this.commandOptions = commandOptions;
	}

	async process() {
		let start = Date.now();
		const { cwd, workspace } = Locals.impl();
		const { packageOptions, packageName, packageDir } = this;

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

		const srcDir = path.resolve(packageDir, './src');
		let files = fs.existsSync(srcDir)
			? fs
				.readdirSync(srcDir)
				.filter((i: string) => /^index(.*)\.(ts|js|s?css)$/.test(i))
			: [];

		if (!files.length) return;

		const spinner = ora(`${packageName} Build ...`);
		try {
			spinner.start();
			await fs.emptyDir(`${packageDir}/dist`);

			const styleStats = await Style.run(this);
			const styleDuration = Date.now() - start;

			const scriptStats = await Script.run(this);
			const scriptDuration = Date.now() - start - styleDuration;

			const typeStats = await Type.run(this);
			const typeDuration = Date.now() - start - styleDuration - scriptDuration;

			spinner.stop();

			let message = '';
			message += `${chalk.cyan(`${packageName}`)}: ${chalk.green('Success')} ${chalk.blue(`${Date.now() - start}ms`)}(`;
			message += styleStats.length ? `css: ${chalk.yellow(styleDuration)}ms; ` : '';
			message += scriptStats.length ? `js: ${chalk.yellow(scriptDuration)}ms; ` : '';
			message += typeStats.length ? `dts: ${chalk.yellow(typeDuration)}ms` : '';
			message += ')';
			Logger.log(message);
			
			scriptStats
				.concat(styleStats)
				.concat(typeStats)
				.forEach((stat) => {
					let message$ = '';
					message$ += `${chalk.magenta(stat.file)}: `;
					message$ += stat.format ? `${chalk.green(stat.format!.toUpperCase())} - ` : '';
					message$ += `${Utils.formatBytes(stat.size)}`;

					Logger.log(message$);
				});
		} catch (e) {
			Logger.log('Error!', e);
			throw e;
		}
	}
}

export const build = (options: any, commandOptions?: any) => {
	return new Build(options, commandOptions);
};