import { resolve } from 'node:path';

describe('add.ts', () => {
	it('ddc add / package', async () => {
		expect.assertions(3);
		const instance = new global.Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'add'
			]
		);

		await instance.press('enter');
		await instance.press('enter');
		await instance.press('package');
		await instance.stop();

		const command = 'lerna create @deot/dev-package';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 60000);

	it('ddc add / dependent', async () => {
		// expect.assertions(3);
		const instance = new global.Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'add'
			]
		);

		await instance.press('down');
		await instance.press('enter');
		await instance.press('enter');
		await instance.press('dependent');
		await instance.press('enter');
		await instance.press('a');

		await instance.stop();

		const command = 'lerna add dependent --dev --peer --exact --no-bootstrap --scope=@deot/dev';
		
		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 60000);
});
