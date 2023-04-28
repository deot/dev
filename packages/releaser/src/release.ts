import * as path from 'node:path';
import fs from 'fs-extra';
import { createRequire } from 'node:module';
import parser from 'conventional-commits-parser';
import chalk from 'chalk';
import semver from 'semver';
import inquirer from 'inquirer';
import { Shell, Logger, Locals } from '@deot/dev-shared';

const cwd = process.cwd();
const require$ = createRequire(cwd);
const { prompt } = inquirer;

const HASH = '-hash-';
const SUFFIX = '🐒💨🙊';

const parserOptions = {
	noteKeywords: ['BREAKING CHANGE', 'Breaking Change']
};
const reBreaking = new RegExp(`(${parserOptions.noteKeywords.join(')|(')})`);

interface Notes {
	breaking: string[];
	features: string[];
	fixes: string[];
	updates: string[];
}

export class Release {
	packageDir: string;

	packageName: string;

	packageFolderName: string;

	packageOptions: {
		[key: string]: any;
		name: string;
		version: string;
	};

	packageRelation: string[];

	config: any;

	changeLog: string;

	version: string;

	commits: Array<{
		effect: boolean; // 由其他包引起的修改
		custom: boolean;
		breaking: boolean;
		hash: string;
		type: string;
		header: string;
	}>;

	commandOptions: {
		dryRun: boolean;
		tag: boolean;
		commit: boolean;
		publish: boolean;
		push: boolean;
		forceUpdatePackage: string | boolean;
		skipUpdatePackage: string | boolean;
		customVersion: string;
		patch: boolean;
		major: boolean;
		minor: boolean;
		keepLastTag: boolean;
	};

	constructor(config: any, commandOptions: Release['commandOptions']) {
		const { packageDir, packageRelation } = Locals.impl();

		if (typeof config === 'string') {
			let packageFolderName = config;
			let packageDir$ = path.resolve(packageDir, packageFolderName);

			config = {
				dir: packageDir$,
				name: packageFolderName
			};
		}
		
		this.packageDir = config.dir;
		this.packageName = Locals.getPackageName(config.name);
		this.packageFolderName = config.name;
		this.packageOptions = require$(`${this.packageDir}/package.json`); // eslint-disable-line
		this.packageRelation = packageRelation[this.packageName] || [];
		this.config = config;

		this.commits = [];
		this.changeLog = '';
		this.version = '';

		this.commandOptions = commandOptions;
	}

	private async parseCommits() {
		const { workspace } = Locals.impl();
		const { packageFolderName, commandOptions } = this;
		const [latestTag] = await this.getTags();

		Logger.log(chalk.yellow(`Last Release Tag`) + `: ${latestTag || '<none>'}`);
		let params = ['--no-pager', 'log', `${latestTag}..HEAD`, `--format=%B%n${HASH}%n%H${SUFFIX}`];

		let {
			stdout
		} = await Shell.exec('git', params);

		let skipGetLog = false;
		if (latestTag) {
			const log1 = await Shell.exec('git', ['rev-parse', latestTag]);
			const log2 = await Shell.exec('git', ['--no-pager', 'log', '-1', '--format=%H']);
			if (log1.stdout === log2.stdout) {
				skipGetLog = true;
			}
		}
		if (!skipGetLog && !stdout) {
			if (latestTag) {
				params.splice(2, 1, `${latestTag}`); // 该latestTag前所有commit
			} else {
				params.splice(2, 1, 'HEAD'); // 所有commit
			}
			({ stdout } = await Shell.exec('git', params));
		}

		const allowTypes = ['feat', `fix`, `break change`, `style`, `perf`, `types`, `refactor`, `chore`];
		const rePlugin = new RegExp(`^(${allowTypes.join('|')})${workspace ? `\\(${packageFolderName}\\)` : '(\\(.+\\))?'}: .*`, 'i');
		const allCommits = stdout.split(SUFFIX);
		const commits = allCommits
			.filter((commit: string) => {
				const chunk = commit.trim();
				return chunk && rePlugin.test(chunk);
			})
			.map((commit) => {
				const node = parser.sync(commit);
				const body = (node.body || node.footer) as string;
				if (!node.type) node.type = parser.sync(node.header?.replace(/\(.+\)!?:/, ':') || '').type;
				if (!node.hash) node.hash = commit.split(HASH).pop()?.trim();

				node.breaking = reBreaking.test(body) || /!:/.test(node.header as string);
				node.effect = false;
				node.custom = false;
				return node;
			});

		if (!commits.length) {
			Logger.log(chalk.red(`No Commits Found.`));
		} else {
			Logger.log(
				chalk.yellow(`Found `) 
				+ chalk.bold(`${allCommits.length}`) 
				+ ` Commits, ` 
				+ chalk.bold(`${commits.length}`) 
				+ ' Commits Valid'
			);
		}

		const { skipUpdatePackage } = commandOptions;

		// 跳过更新 如 --skip-update-package @demo/helper-shared
		if (commits.length && skipUpdatePackage) {
			let skip = false;
			if (typeof skipUpdatePackage === 'boolean' && skipUpdatePackage) {
				let result = await prompt([
					{
						type: 'confirm',
						name: 'skip',
						message: `Skip Update（${this.packageName}@${this.packageOptions.version}）：`,
						default: true
					}
				]);

				skip = result.skip;
			} else if (
				typeof skipUpdatePackage === 'string' 
				&& (
					skipUpdatePackage === '*' 
					|| skipUpdatePackage.split(',').includes(this.packageName)
				)
			) {
				skip = true;
			} 
			if (skip) {
				Logger.log(chalk.red(`Skipping Update\n`));
				return;
			}
		}
		
		await this.updateVersion();
		await this.updateCommits(commits);

		const { forceUpdatePackage } = commandOptions;
		// 强制更新
		if (!commits.length && forceUpdatePackage) {
			let force = false;
			if (typeof forceUpdatePackage === 'boolean' && forceUpdatePackage) {
				let result = await prompt([
					{
						type: 'confirm',
						name: 'force',
						message: `Force Update（${this.packageName}@${this.packageOptions.version}）：`,
						default: true
					}
				]);

				force = result.force;
			} else if (
				typeof forceUpdatePackage === 'string' 
				&& (
					forceUpdatePackage === '*' 
					|| forceUpdatePackage.split(',').includes(this.packageName)
				)
			) {
				force = true;
			} 
			if (force) {
				const oldVersion = this.packageOptions.version;
				const versionChanged = `\`${oldVersion}\` -> \`${this.version}\``;
				this.commits = [
					{
						type: 'chore',
						header: `chore(${this.packageFolderName || 'release'}): force-publish ${versionChanged}`,
						hash: '',
						effect: false,
						breaking: false,
						custom: true
					}
				];
				
				this.changeLog = `### Force Update Package\n\n- ${versionChanged}`.trim();
			}
		}
	}

	private async getTags() {
		const { packageName } = this;
		const params = ['tag', '--list', `'${packageName}@*'`, '--sort', '-v:refname'];
		const { stdout } = await Shell.exec('git', params);
		return stdout.split('\n');
	}

	private rebuildChangeLog(commits: Release["commits"]) {
		const { packageDir } = this;
		const { homepage, workspace } = Locals.impl();
		const logPath = path.resolve(packageDir, './CHANGELOG.md');
		const logFile = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '';
		const notes: Notes = {
			breaking: [],
			features: [],
			fixes: [],
			updates: []
		};

		/**
		 * (close #1) -> issues
		 * close (#1) -> issues
		 * (#1) -> pull request
		 *
		 * JS支持后行断言
		 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_expressions/Assertions
		 */
		const closeRegxp = /\(?(closes? )\(?#((\d+))\)/ig;
		const pullRegxp = /(?<!closes? )\((#(\d+))\)/ig;

		for (const commit of commits) {
			const { effect, breaking, hash, header, type } = commit;
			/**
			 * 确保当log一样时，commit hash判断log是不一致的
			 * close: commit下自行提交（log可能会相同）需添加ref
			 * pr: 由github pr生成一条提交记录（唯一的, 无需添加ref）
			 */
			const ref = !hash || pullRegxp.test(header)
				? '' 
				: ` ([${hash?.substring(0, 7)}](${homepage}/commit/${hash}))`;

			// eslint-disable-next-line no-unsafe-optional-chaining
			let message = header?.trim();
			if (workspace && !effect) {
				message = message.replace(/\(.+\)!?:/, ':');
			}
			message = message
				.replace(pullRegxp, `[$1](${homepage}/pull/$2)`)
				.replace(closeRegxp, `[$1$2](${homepage}/issues/$2)`) + ref;
			if (breaking) {
				notes.breaking.push(message);
			} else if (type === 'fix') {
				notes.fixes.push(message);
			} else if (type === 'feat') {
				notes.features.push(message);
			} else {
				notes.updates.push(message);
			}
		}

		// 过滤已存在的commit
		Object.keys(notes).forEach(i => {
			notes[i] = notes[i].filter((j: string) => {
				return !logFile.includes(j);
			});
		});

		const parts = [
			notes.breaking.length ? `### Breaking Changes\n\n- ${notes.breaking.join('\n- ')}`.trim() : '',
			notes.fixes.length ? `### Bugfixes\n\n- ${notes.fixes.join('\n- ')}`.trim() : '',
			notes.features.length ? `### Features\n\n- ${notes.features.join('\n- ')}`.trim() : '',
			notes.updates.length ? `### Updates\n\n- ${notes.updates.join('\n- ')}`.trim() : ''
		].filter(Boolean);

		const newLog = parts.join('\n\n'); 
		return !parts.length || logFile.includes(newLog)
			? ''
			: newLog;
	}

	private async updateVersion() {
		const { packageOptions, commits, commandOptions } = this;
		const { version } = packageOptions;
		let newVersion = '';
		if (commandOptions.customVersion) {
			newVersion = commandOptions.customVersion;

			if (!(/\d+.\d+.\d+/.test(newVersion)) || version === newVersion) {
				let result = await prompt([
					{
						type: 'input',
						name: 'version',
						message: `Custom Update Version（${this.packageName}@${version}）：`,
						default: '',
						validate: (answer: any) => {
							if (!(/\d+.\d+.\d+/.test(answer))) {
								return 'Version Should Be Like x.x.x';
							}

							if (answer === version) {
								return 'Version Should Be Diff Than Before';
							}
							return true;
						}
					}
				]);
				newVersion = result.version;
			}
		} else {
			const intersection: any[] = [
				commandOptions.major && 'major', 
				commandOptions.minor && 'minor', 
				commandOptions.patch && 'patch'
			].filter(i => !!i);
			if (intersection.length) {
				newVersion = semver.inc(version, intersection[0]) || '';
			} else {
				const types = new Set(commits.map(({
					type
				}) => type));
				const breaking = commits.some((commit) => !!commit.breaking);
				const level = breaking 
					? 'major' 
					: types.has('feat') 
						? 'minor' 
						: 'patch';
				newVersion = semver.inc(version, level) || '';
			}
		}

		this.version = newVersion;
	}

	private isChanged() {
		return !!this.commits.length;
	}

	async updateCommits(commits: Release['commits'], source?: string) {
		if (!commits.length) return;
		const { packageName } = this;
		const olds = this.commits.map(i => JSON.stringify({ ...i, effect: false }));

		const newCommits = commits
			.filter(i => {
				return !olds.includes(JSON.stringify({ ...i, effect: false }));
			})
			.map(j => {
				return {
					...j,
					effect: !!source
				};
			});

		// 去除自定义的，如强制更新commit 
		if (newCommits.length && this.commits.length) {
			this.commits = this.commits.filter(i => !i.custom);
		}

		const commits$ = this.commits.concat(newCommits);

		if (source) {
			Logger.log(
				chalk.magenta(`MERGE COMMITS: `)
				+ chalk.bold(`${commits.length}`) + ` Commits. `
				+ 'merge ' + chalk.yellow(source) + ' into ' + chalk.green(packageName)
			);
		} else {
			Logger.log(``); // = `\n`;
		}

		const changeLog = this.rebuildChangeLog(commits$);
		if (changeLog) {
			this.commits = commits$;
			this.changeLog = changeLog;
		} else if (commits.length) {
			Logger.log(chalk.red(`${commits.length} Commits Already Exists.`));
		}
	}

	async updatePackageOptions(relationVerisons = {}) {
		if (!this.isChanged()) return;

		const { packageDir, packageOptions, commandOptions } = this;
		const { dependencies, devDependencies } = packageOptions;
		const newVersion = this.version; // 这个在解析commit时已经生成了

		Logger.log(chalk.yellow(`New Version: `) + `${newVersion}`);
		packageOptions.version = newVersion;

		if (Object.keys(this.packageRelation).length) {
			for (let packageName$ in relationVerisons) {
				let newVersion$ = relationVerisons[packageName$];
				if (dependencies?.[packageName$]) {
					dependencies[packageName$] = newVersion$;
				}
				if (devDependencies?.[packageName$]) {
					devDependencies[packageName$] = newVersion$;
				}
			}
		}

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow(`Skipping package.json Update`));
			return;
		}
		Logger.log(chalk.yellow(`Updating `) + 'package.json');
		
		fs.outputFileSync(`${packageDir}/package.json`, JSON.stringify(packageOptions, null, 2));
	}

	async updateChangelog() {
		if (!this.isChanged()) return;

		const { packageName, packageDir, packageOptions, commandOptions } = this;
		const title = `# ${packageName} ChangeLog`;
		const [date] = new Date().toISOString().split('T');
		const logPath = path.resolve(packageDir, './CHANGELOG.md');
		const logFile = fs.existsSync(logPath) ? fs.readFileSync(logPath, 'utf-8') : '';
		const oldNotes = logFile.startsWith(title) ? logFile.slice(title.length).trim() : logFile;
		
		const parts = [
			`## v${packageOptions.version}`,
			`_${date}_`,
			this.changeLog
		].filter(Boolean);
		const newLog = parts.join('\n\n');
		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow(`New ChangeLog:`) + `\n${newLog}`);
			return;
		}
		Logger.log(chalk.yellow(`Updating `) + `CHANGELOG.md`);
		let content = [title, newLog, oldNotes].filter(Boolean).join('\n\n');
		if (!content.endsWith('\n')) content += '\n';
		fs.writeFileSync(logPath, content, 'utf-8');
	}

	async test() {
		if (!this.isChanged()) return;
		const { commandOptions } = this;

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow('Skipping Test'));	
			return;
		} else {
			Logger.log(chalk.yellow('Test...'));
		}

		await Shell.exec(`npm run test -- --package-name ${this.packageName}`);
	}

	async build() {
		if (!this.isChanged()) return;
		const { commandOptions } = this;

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow('Skipping Build'));	
			return;
		} else {
			Logger.log(chalk.yellow('Build...'));
		}

		await Shell.exec(`npm run build -- --package-name ${this.packageName}`);
	}

	async publish() {
		const { commandOptions } = this;
		if (!this.isChanged() || !commandOptions.publish) return;

		const { packageDir, packageName } = this;
		Logger.log(chalk.magenta(`PUBLISH: `) + packageName);

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow(`Skipping Publish`));
			return;
		}
		Logger.log(chalk.cyan(`\n Publishing to NPM`));
		await Shell.spawn(
			'npm', 
			['publish', '--no-git-checks', '--access', 'public'],
			{
				cwd: packageDir
			}
		);
	}

	async tag() {
		const { commandOptions } = this;
		if (!this.isChanged() || !commandOptions.tag) return;

		const { packageDir, packageName, packageOptions } = this;
		Logger.log(chalk.magenta(`TAG: `) + packageName);

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow(`Skipping Git Tag`));
			return;
		}
		// 用于版本更新搜索
		const tagName = `${packageName}@${packageOptions.version}`;
		Logger.log(chalk.blue(`\n Tagging`) + chalk.grey(`${tagName}`));
		await Shell.spawn(
			'git', 
			['tag', tagName],
			{
				cwd: packageDir
			}
		);
	}

	async clean() {
		await this.cleanTagsAndKeepLastTag();
	}

	// 清理tags，仅保留最后一个tag. 相当于tags仅用于记录commit开始的位置
	async cleanTagsAndKeepLastTag() {
		const { commandOptions } = this;
		if (!commandOptions.keepLastTag) return;

		let tags = await this.getTags();
		tags = tags.slice(1).filter(i => !!i).reverse();

		if (!tags.length) return;

		const { packageName } = this;
		Logger.log(chalk.magenta(`CLEAN TAGS: `) + packageName);

		if (commandOptions.dryRun) {
			Logger.log(chalk.yellow(`Skipping Tags Clean`));
			return;
		}

		// 先删除远程的，再删除本地的
		await tags
			.reduce(
				(preProcess: Promise<any>, tag) => {
					preProcess = preProcess
						.then(() => Shell.spawn('git', ['push', 'origin', '--delete', tag]))
						.then(() => Shell.spawn('git', ['tag', '--delete', tag]));
					return preProcess;
				},
				Promise.resolve()
			);
	}

	async process() {
		const { workspace } = Locals.impl();
		const { packageName, packageDir, packageFolderName } = this;
		if (!packageDir || !fs.pathExists(packageDir)) {
			throw new RangeError(`Could not find directory for package: ${packageFolderName}`);
		}

		Logger.log(chalk.cyan(`Releasing ${packageName}`) + ' from ' + chalk.grey(`${workspace}/${packageFolderName}`));

		await this.parseCommits();
		return this;
	}
}

export const release = (options: any, commandOptions?: any) => {
	return new Release(options, commandOptions);
};