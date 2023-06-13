import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger, Locals } from '@deot/dev-shared';
import { createVitest } from 'vitest/node';
import fs from 'fs-extra';
import { getOptions } from './prompt';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const run = (options: Options) => Utils.autoCatch(async () => {
	options = { ...options };
	const locals = Locals.impl();
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}

	if (locals.workspace && !options.packageName) {
		const promptOptions = await getOptions();
		options = {
			...options,
			...promptOptions
		};
	}

	const { cwd, workspace, packageOptionsMap, packageDirsMap } = locals;
	const { coverage, packageName, watch, dryRun } = options;

	options.packageFolderName = Locals.getPackageFolderName(options.packageName) || options.packageFolderName;
	options.workspace = workspace;
	
	const packageOptions = packageOptionsMap[options.packageFolderName];
	const packageDir = packageDirsMap[options.packageFolderName];

	if (
		workspace 
		&& cwd !== packageDir
		&& packageOptions?.scripts?.['test']
	) {
		await Shell.spawn(`npm`, ['run', 'test'], { cwd: packageDir });
		return;
	}

	if (!options.packageFolderName) delete options.packageFolderName; 
	if (!options.workspace) delete options.workspace; 
	delete options.packageName;

	const isDev = process.env.NODE_ENV === 'development';
	const NODE_ENV = process.env.NODE_ENV || 'TEST';
	const TEST_OPTIONS = encodeURIComponent(JSON.stringify(options));

	if (dryRun) {
		const command = `cross-env NODE_ENV=${NODE_ENV} TEST_OPTIONS=${TEST_OPTIONS} vitest ` 
			+ ([
				'--passWithNoTests',
				`${!(watch || isDev) ? '--watch=false' : ''}`
			].join(' '));
		Shell.spawn(`echo ${command}`);
		return;
	}

	process.env.NODE_ENV = process.env.NODE_ENV || 'TEST';
	process.env.TEST_OPTIONS = TEST_OPTIONS;
	
	let options$: any = {
		coverage: {
			enabled: !!coverage,
		},
		passWithNoTests: true,
		watch: !!(watch || isDev)
	};

	if (fs.existsSync(`${cwd}/test.config.ts`)) {
		options$.config = path.relative(cwd, path.resolve(cwd, './test.config.ts'));	
	} else if (fs.existsSync(`${cwd}/z.test.config.ts`)) {
		options$.config = path.relative(cwd, path.resolve(cwd, './z.test.config.ts'));	
	} else {
		options$.config = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
	}

	const vitest = await createVitest('test', options$);

	await vitest.start();
	if (!watch) return;

	Logger.log(packageName || '', '测试已通过');
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('测试未通过');
		} else {
			Logger.error(e);
		}

		process.exit(1);
	}
});