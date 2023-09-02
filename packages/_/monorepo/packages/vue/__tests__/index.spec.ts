import { App } from '../src/index';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof App).toBe('object');
	});
});
