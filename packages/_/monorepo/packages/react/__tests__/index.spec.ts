import { App } from '../src/index';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof App).toBe('function');
		expect(App().children![0].children).toBe('Hello World');
	});
});
