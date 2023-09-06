import { App } from '@demo/helper-react';

describe('index.ts', () => {
	it('any', () => {
		expect(typeof App).toBe('function');
		expect(App().children![0].children).toBe('Hello World');
	});
});
