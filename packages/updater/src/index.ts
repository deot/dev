import type { Options } from '@deot/dev-shared';
import { Utils, Logger, Shell } from '@deot/dev-shared';
import { update } from './update';

process.setMaxListeners(100);
export const run = (options: Options) => Utils.autoCatch(async () => {
	options = { 
		dryRun: true,
		commit: true,
		push: true,
		test: true,
		major: false,
		minor: false,
		patch: false,
		...options
	};

	if (process.env.NODE_ENV === 'UNIT') return Shell.spawn(`echo update`);

	await update(options).process();
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('更新失败');
		} else {
			Logger.error(e);
		}

		process.exit(1);
	}
});