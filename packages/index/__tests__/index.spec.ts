import { Utils, Logger, Shell } from '../src';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof Utils).toBe('function');
		expect(typeof Logger).toBe('object');
		expect(typeof Shell).toBe('function');
	});
});
