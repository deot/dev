import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger } from '@deot/dev-shared';
import { getOptions } from './unit-test/prompt';
import { Shared } from './shared';

export const run = (options: Options) => Utils.autoCatch(async () => {
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}

	if (!options.packageName) {
		const promptOptions = await getOptions();
		options = {
			...options,
			...promptOptions
		};
	}

	const { packageName, watch, dryRun } = options;

	options.packageFolderName = Shared.getPackageFolderName(options.packageName) || options.packageFolderName;
	if (!options.packageFolderName) delete options.packageFolderName; 
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