import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger, Locals } from '@deot/dev-shared';
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
	const { packageName, watch, dryRun } = options;

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

	const command = `cross-env NODE_ENV=${process.env.NODE_ENV || 'TEST'} TEST_OPTIONS=${encodeURIComponent(JSON.stringify(options))} jest ` 
		+ ([
			'--passWithNoTests',
			`${watch ? '--watchAll' : ''}`
		].join(' '));

	if (dryRun) return Shell.spawn(`echo ${command}`);
	await Shell.spawn(command);

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