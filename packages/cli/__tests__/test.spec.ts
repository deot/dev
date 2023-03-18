import { resolve } from 'node:path';

describe('test.ts', () => {
	it('ddc test', async () => {
		expect.assertions(3);
		const instance = new global.Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'test'
			]
		);

		await instance.press('up', 1000);
		await instance.press('enter', 0);
		await instance.press('y', 1000);
		await instance.press('enter', 0);
		await instance.stop();

		const command = 'cross-env NODE_ENV=UNIT TEST_OPTIONS=%7B%22watch%22%3Atrue%7D jest --passWithNoTests --watchAll';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');

	}, 10000);
});
