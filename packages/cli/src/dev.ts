import { Utils, Shell } from '@deot/dev-shared';
import * as Test from './unit-test';

export const run = () => Utils.autoCatch(async () => {
	if (process.env.NODE_ENV === 'UNIT') return Shell.spawn(`echo development`);
	process.env.NODE_ENV = process.env.NODE_ENV || 'development';
	await Test.run({});
});
