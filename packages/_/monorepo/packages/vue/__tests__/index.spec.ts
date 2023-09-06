import { App } from '@demo/helper-vue';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof App).toBe('object');
	});
});
