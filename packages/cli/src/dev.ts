import type { Options } from '@deot/dev-shared';

import { Utils, Shell } from '@deot/dev-shared';
import * as Test from './unit-test';

export const run = (options: Options) => Utils.autoCatch(async () => {
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	
	if (options.dryRun) return Shell.spawn(`echo development`);
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';

	options.watch = true;
	await Test.run(options);
});
