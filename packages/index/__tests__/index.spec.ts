import { Utils, Logger, Shell, Command } from '@deot/dev';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof Utils).toBe('object');
		expect(typeof Logger).toBe('object');
		expect(typeof Shell).toBe('object');
		expect(typeof Command).toBe('function');
	});
});
