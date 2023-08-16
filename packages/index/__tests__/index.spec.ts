import { Utils, Logger, Shell, Command, Builder, Releaser, Tester } from '@deot/dev';

// @vitest-environment node
describe('index.ts', () => {
	it('any', () => {
		expect(typeof Builder).toBe('object');
		expect(typeof Releaser).toBe('object');
		expect(typeof Tester).toBe('object');
		expect(typeof Utils).toBe('object');
		expect(typeof Logger).toBe('object');
		expect(typeof Shell).toBe('object');
		expect(typeof Command).toBe('function');
	});
});
