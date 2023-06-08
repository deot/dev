import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger, Locals } from '@deot/dev-shared';
import { createVitest } from 'vitest/node';
import { getOptions } from './prompt';

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
		await Shell.spawn(`npm`, ['run', 'test']);
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
	
	const vitest = await createVitest('test', {
		coverage: {
			enabled: !!coverage
		},
		passWithNoTests: true,
		watch: !!(watch || isDev)
	});

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