import { Button, TEST } from '@demo/helper-components';

describe('index.ts', () => {
	it('any', () => {
		expect(Button).toBe('Hello World!');
		expect(TEST).toBe(2);
	});
});
