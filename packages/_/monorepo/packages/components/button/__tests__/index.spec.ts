import { MButton, Button, TEST } from '@demo/helper-components';

describe('index.ts', () => {
	it('any', () => {
		expect(MButton).toBe('Hello World!');
		expect(Button).toBe('Hello World!');
		expect(TEST).toBe(2);
	});
});
