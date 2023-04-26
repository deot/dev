import type { Options } from '@deot/dev-shared';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';
import { builder } from './build/builder';

export const run = (options: Options) => Utils.autoCatch(async () => {
	const locals = Locals.impl();
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	
	const { normalizePackageFolderNames } = Locals.impl(); 
	let packageFolderName = Locals.getPackageFolderName(options.packageName || '**');

	let inputs: string[] = [];
	if (locals.workspace && packageFolderName === '**') {
		inputs = normalizePackageFolderNames;
	} else {
		inputs = [packageFolderName];
	}

	if (options.dryRun) return Shell.spawn(`echo ${inputs.join(' ')}`);
	await inputs
		.reduce(
			(preProcess: Promise<any>, packageFolderName$: any) => {
				preProcess = preProcess.then(() => builder(packageFolderName$, options).process());
				return preProcess;
			}, 
			Promise.resolve()
		);
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('编译未通过');
		} else {
			Logger.error(e);
		}
		process.exit(1);
	}
});