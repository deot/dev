import { TEST } from '../src/index';
import { MTEST } from '../src/index.m';

describe('index.ts', () => {
	it('any', () => {
		expect(TEST).toBe(1);
		expect(MTEST).toBe(1);
	});
});
