import * as path from 'node:path';
import fs from 'fs-extra';
import chalk from 'chalk';
import ora from 'ora';
import { Shell, Logger, Locals } from '@deot/dev-shared';
import { fitVersion } from './fit-version';

export class Update {
	packageOptionsMap: {
		[key: string]: {
			[key: string]: any;
			dependencies?: object;
			devDependencies?: object;
		};
	};

	commandOptions: {
		[key: string]: any;
		dryRun: boolean;
		major: boolean;
		minor: boolean;
		patch: boolean;
		commit: boolean;
		push: boolean;
		test: boolean;
	};

	constructor(commandOptions: Update['commandOptions']) {
		const locals = Locals.impl();
		const { rootPackageOptions, packageDir, cwd } = locals;

		const packageOptionsMap = {
			[cwd]: rootPackageOptions,
			...Object.keys(locals.packageOptionsMap).reduce((result: any, key: any) => {
				result[path.resolve(packageDir, key)] = locals.packageOptionsMap[key];
				return result;
			}, {}),
		};

		this.packageOptionsMap = packageOptionsMap;
		this.commandOptions = commandOptions;
	}

	async getPackageChanged() {
		const { packageOptionsMap, commandOptions } = this;
		const packageNames = {};
		Object.keys(packageOptionsMap).forEach((key) => {
			const { dependencies = {}, devDependencies = {} } = packageOptionsMap[key];
			const deps = { ...dependencies, ...devDependencies };
			Object.keys(deps).forEach((packageName) => {
				let version = deps[packageName];
				packageNames[packageName] = packageNames[packageName] || {};

				if (typeof packageNames[packageName][version] !== 'string') {
					packageNames[packageName][version] = '';
				}
			});
		});

		await Promise.all(Object.keys(packageNames).map((packageName) => {
			// eslint-disable-next-line no-async-promise-executor
			return new Promise<void>(async (resolve) => {
				try {
					const { stdout: stdout1 } = await Shell.exec('npm', ['view', packageName, 'versions', '--json']);
					const { stdout: stdout2 } = await Shell.exec('npm', ['view', packageName, 'version', '--json']);

					const versions = JSON.parse(stdout1);
					const lastVersion = JSON.parse(stdout2);

					const lastIndex = versions.indexOf(lastVersion);
					const versions$ = versions.slice(0, lastIndex == -1 ? versions.length : lastIndex + 1);

					Object.keys(packageNames[packageName]).forEach(version => {
						let newVersion = fitVersion(versions$, version, commandOptions);
						if (newVersion === version) {
							delete packageNames[packageName][version];
						} else {
							packageNames[packageName][version] = newVersion;
						}
					});

					if (!Object.keys(packageNames[packageName]).length) {
						delete packageNames[packageName];
					}
					
					resolve();
				} catch (e) {
					delete packageNames[packageName];
					resolve();
				}
			});
		}));

		return packageNames;
	}

	async updatePackageOptions(changed: any) {
		const { packageOptionsMap, commandOptions } = this;

		let packageFolderNames: string[] = [];
		Object.keys(packageOptionsMap).forEach(packageDir => {
			const packageOptions = packageOptionsMap[packageDir];
			const { devDependencies = {}, dependencies = {} } = packageOptions;

			let isChanged = false;
			[devDependencies, dependencies].forEach(target => {
				Object.keys(target).forEach(packageName => {
					let version = target[packageName];
					if (changed[packageName]?.[version]) {
						isChanged = true;
						target[packageName] = changed[packageName][version];
					}
				});
			});
			if (isChanged) {
				const locals = Locals.impl();
				const { cwd } = locals;
				if (packageDir !== cwd) {
					packageFolderNames.push(packageDir.split('/').pop()!);
				}
				
				if (commandOptions.dryRun) {
					Logger.log(chalk.magenta(`CHANGED: `) + chalk.yellow(`Skipping ${path.relative(cwd, packageDir)} Update`));	
				} else {
					fs.outputFileSync(`${packageDir}/package.json`, JSON.stringify(packageOptions, null, 2));
				}
			} 
		});

		return packageFolderNames;
	}

	async updateLock() {
		if (this.commandOptions.dryRun) {
			Logger.log(chalk.yellow(`Skipping pnpm-lock.yaml Update`));	
		} else {
			Logger.log(chalk.magenta(`CHANGED: `) + `pnpm-lock.yaml`);
			await Shell.spawn('npx', ['pnpm', 'install', '--lockfile-only']);
		}
	}

	async commit(message: string) {
		const { commit, dryRun } = this.commandOptions;
		if (!commit) {
			Logger.log(chalk.magenta(`COMMIT: `) + 'Disabled.');	
		} else if (dryRun) {
			Logger.log(chalk.magenta(`COMMIT: `) + chalk.yellow(`Skipping Git Commit`) + `\n${message}`);	
		} else {
			Logger.log(chalk.magenta(`COMMIT: `) + `package.json, pnpm-lock.yaml`);
			await Shell.spawn('git', ['add', process.cwd()]);
			await Shell.spawn('git', ['commit', '--m', `'${message}'`]);
		}
	}

	async push() {
		const { push, dryRun } = this.commandOptions;
		if (!push) {
			Logger.log(chalk.magenta(`PUSH: `) + 'Disabled.');	
		} else if (dryRun) {
			Logger.log(chalk.magenta(`PUSH: `) + chalk.yellow(`Skipping Git PUSH`));	
		} else {
			Logger.log(chalk.yellow('Git Fetch...'));
			await Shell.spawn('git', ['fetch', '--prune', '--prune-tags']);
			await Shell.spawn('git', ['pull', '--rebase']);
			await Shell.spawn('git', ['push']);
		}
	}

	async test() {
		const { test, dryRun } = this.commandOptions;

		if (!test) {
			Logger.log(chalk.magenta(`Test: `) + 'Disabled.');	
		} else if (dryRun) {
			Logger.log(chalk.yellow('Skipping Test'));	
			return;
		} else {
			Logger.log(chalk.yellow('Test...'));
		}
		
		const { rootPackageOptions } = Locals.impl();
		if (rootPackageOptions?.scripts?.test) {
			await Shell.exec(`npm run test -- --package-name '*'`);
		}
	}

	async process() {
		const spinner = ora(`Analyze ...`);
		spinner.start();

		let changed = await this.getPackageChanged();
		spinner.stop();

		let message = `deps updated \n\n`;
		let keys = Object.keys(changed);
		if (!keys.length) {
			Logger.log(chalk.red(`No Package Update Found.`));
			return;
		}
		Logger.log(chalk.magenta(`ANALYZE: `));
		keys.forEach((key) => {
			Object.keys(changed[key]).forEach((version => {
				message += `${key}: ${version} -> ${changed[key][version]}\n`;
				Logger.log(`${chalk.cyan(key)}: ${chalk.yellow(version)} -> ${chalk.green(changed[key][version])}`);
			}));
		});

		const packageFolderNames = await this.updatePackageOptions(changed);
		message = `chore${packageFolderNames.length ? '(' : ''}${packageFolderNames.join(',')}${packageFolderNames.length ? ')' : ''}: ${message}`;
		
		await this.updateLock();
		await this.test();
		await this.commit(message);
		await this.push();

		Logger.log(chalk.magenta(`FINISH: `) + chalk.green(`Update Successed.`));
		if (this.commandOptions.dryRun) {
			Logger.log(
				chalk.green('NO DRY RUN WAY: ')
				+ chalk.grey(`npm run update -- --no-dry-run\n`)
			);
		}
	}
}
export const update = (commandOptions?: any) => {
	return new Update(commandOptions);
};