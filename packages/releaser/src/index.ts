import type { Options } from '@deot/dev-shared';
import chalk from 'chalk';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';

import { release, Release } from './release';

export const run = (options: Options) => Utils.autoCatch(async () => {
	options = {
		dryRun: true,
		tag: true,
		publish: true,
		commit: true,
		push: true,
		keepLastTag: false,
		...options
	};
	const locals = Locals.impl();

	options.forceUpdateName = Locals.getRealPackageName(options.forceUpdateName);
	options.skipUpdateName = Locals.getRealPackageName(options.skipUpdateName);

	if (options.dryRun) {
		Logger.log(
			chalk.magenta(`DRY RUN: `)
			+ 'No files will be modified.'
		);
	}

	let inputs: string[] = [];
	if (locals.workspace) {
		inputs = locals.normalizePackageFolderNames;
	} else {
		inputs = [''];
	}

	const instances: { [key: string]: Release } = {};
	await inputs
		.reduce(
			(preProcess, packageFolderName) => {
				preProcess = preProcess
					.then(() => release(packageFolderName, options).process())
					.then((instance) => {
						instances[packageFolderName] = instance;
					});
				return preProcess;
			},
			Promise.resolve()
		);

	Logger.log(chalk.blue(`---------------------\n`));

	let message = `chore(release): publish\n\n`;
	const relationVerisons = {};
	// 如果仅shared更新了, index因为引用了此包，也需要更新，且需要重新打包. 确保相互间关联的包都是最新的;
	await inputs.reduce(
		(preProcess, packageFolderName) => {
			const instance = instances[packageFolderName];
			instance.packageRelation.forEach((i) => {
				const packageFolderName$ = Locals.getPackageFolderName(i);
				const instance$ = instances[packageFolderName$];

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

	// Commit
	Logger.log(chalk.blue(`\n---------------------\n`));

	const isChanged = Object.keys(relationVerisons).length;

	if (!isChanged) {
		Logger.log(chalk.magenta(`COMMIT: `) + 'Nothing Chanaged Found.');
	} else if (!options.commit) {
		Logger.log(chalk.magenta(`COMMIT: `) + 'Disabled.');
	} else if (options.dryRun) {
		Logger.log(chalk.magenta(`COMMIT: `) + chalk.yellow(`Skipping Git Commit`) + `\n${message}`);
	} else {
		Logger.log(chalk.magenta(`CHANGED: `) + `pnpm-lock.yaml`);
		await Shell.spawn('npx', ['pnpm', 'install', '--lockfile-only']);

		Logger.log(chalk.magenta(`COMMIT: `) + `CHANGELOG.md, package.json, pnpm-lock.yaml`);
		await Shell.spawn('git', ['add', process.cwd()]);
		await Shell.spawn('git', ['commit', '--m', `'${message}'`]);
	}

	// 清理本地存在的tags(相对于远程不存在的清理掉, 避免push时提交本地的)
	if ((options.keepLastTag || options.push) && !options.dryRun) {
		Logger.log(chalk.yellow('Git Fetch...'));
		await Shell.spawn('git', ['fetch', '--prune', '--prune-tags']);
	}

	// 发包、tag
	Logger.log(chalk.blue(`\n---------------------\n`));
	await inputs
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

	// Push
	Logger.log(chalk.blue(`\n---------------------\n`));
	if (!isChanged) {
		Logger.log(chalk.magenta(`PUSH: `) + 'Nothing Chanaged.');
	} else if (!options.push) {
		Logger.log(chalk.magenta(`PUSH: `) + 'Push Disabled.');
	} else if (options.dryRun) {
		Logger.log(chalk.magenta(`PUSH: `) + 'Skipping Git Push');
	} else {
		Logger.log(chalk.yellow('Git Pull/Push...'));
		// 提交到远程仓库或自行提交
		await Shell.spawn('git', ['pull', '--rebase']);
		await Shell.spawn('git', ['push']);
		await Shell.spawn('git', ['push', '--tags']);
	}

	// Clean
	Logger.log(chalk.blue(`\n---------------------\n`));
	await inputs
		.reduce(
			(preProcess, packageFolderName) => {
				const instance = instances[packageFolderName];
				preProcess = preProcess
					.then(() => instance.cleanTagsAndKeepLastTag());
				return preProcess;
			},
			Promise.resolve()
		);

	Logger.log(chalk.magenta(`FINISH: `) + chalk.green(`Release Successed.`));
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

		Logger.log(chalk.magenta(`FINISH: `) + chalk.red(`Release Failed.`));
		process.exit(1);
	}
});
