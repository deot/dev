import type { Options } from '@deot/dev-shared';
import chalk from 'chalk';
import { Utils, Logger, Shell } from '@deot/dev-shared';

import { releaser, Releaser } from './release/releaser';
import { Shared } from './shared';

export const run = (options: Options) => Utils.autoCatch(async () => {
	if (options.dryRun) {
		Logger.log(
			chalk.magenta(`DRY RUN: `) 
			+ 'No files will be modified.' 
		);
	}

	const { normalizePackageFolderNames } = Shared.impl();
	const instances: { [key: string]: Releaser } = {};

	await normalizePackageFolderNames
		.reduce(
			(preProcess, packageFolderName) => {
				preProcess = preProcess
					.then(() => releaser(packageFolderName, options).process())
					.then((instance) => {
						instances[packageFolderName] = instance;
					});
				return preProcess;
			}, 
			Promise.resolve()
		);

	Logger.log(chalk.blue(`---------------------\n`));

	let message = `chore(release): publish\n\n`;
	let relationVerisons = {};
	// 如果仅shared更新了, index因为引用了此包，也需要更新，且需要重新打包. 确保相互间关联的包都是最新的;
	await normalizePackageFolderNames.reduce(
		(preProcess, packageFolderName) => {
			const instance = instances[packageFolderName];
			instance.packageRelation.forEach(i => {
				let packageFolderName$ = Shared.getPackageFolderName(i);
				let instance$ = instances[packageFolderName$];

				if (instance$.commits.length > 0) {
					instance.updateCommits(instance$.commits, instance$.packageName);
				}
			});

			if (instance.commits.length) {
				preProcess = preProcess
					.then(() => Logger.log(chalk.magenta(`CHANGED: `) + instance.packageName))
					.then(() => instance.test())
					.then(() => instance.build())
					.then(() => instance.updatePackageOptions(relationVerisons))
					.then(() => instance.updateChangelog())
					.then(() => {
						message += `- ${instance.packageName}@${instance.packageOptions.version}\n`;
						relationVerisons[instance.packageName] = `^${instance.packageOptions.version}`;
					});
			}
			return preProcess;
		}, 
		Promise.resolve()
	);

	Logger.log(chalk.blue(`\n---------------------\n`));

	const isChanged = Object.keys(relationVerisons).length;

	if (!isChanged) {
		Logger.log(chalk.magenta(`COMMIT: `) + 'Nothing Chanaged Found.');
	} else if (options.dryRun || !options.commit) {
		Logger.log(chalk.magenta(`COMMIT: `) + chalk.yellow(`Skipping Git Commit`) + `\n${message}`);	
	} else {
		Logger.log(chalk.magenta(`COMMIT: `) + `CHANGELOG.md, package.json`);
		await Shell.spawn('git', ['add', process.cwd()]);
		await Shell.spawn('git', ['commit', '--m', `'${message}'`]);
	}

	// 发包和tag
	await normalizePackageFolderNames
		.reduce(
			(preProcess, packageFolderName) => {
				const instance = instances[packageFolderName];
				preProcess = preProcess
					.then(() => instance.publish())
					.then(() => instance.tag());
				return preProcess;
			}, 
			Promise.resolve()
		);

	Logger.log(chalk.blue(`\n---------------------\n`));

	if (options.dryRun || !options.push) {
		Logger.log(chalk.magenta(`FINISH: `) + 'Skipping Git Push');	
	} else if (!isChanged) {
		Logger.log(chalk.magenta(`FINISH: `) + 'Nothing Chanaged.');	
	} else {
		// 提交到远程仓库或自行提交
		await Shell.spawn('git', ['push']);
	}

	if (options.dryRun) {
		Logger.log(
			chalk.green('NO DRY RUN WAY: ')
			+ chalk.grey(`npm run release -- --no-dry-run\n`)
		);
	}
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('发布失败');
		} else {
			Logger.error(e);
		}
		process.exit(1);
	}
});