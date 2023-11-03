import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('command.ts', () => {
	it('package', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'node',
			[
				resolve(__dirname, './fixtures/command-prompt.js') 
			]
		);

		await instance.press('enter');
		await instance.press('enter');
		await instance.press('package');
		await instance.stop();

		const command = 'create package';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');

		// for coverage
		await instance.stop();
	}, 10000);

	it('dependent', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'node',
			[
				resolve(__dirname, './fixtures/command-prompt.js') 
			]
		);

		await instance.press('down');
		await instance.press('enter');
		await instance.press('enter');
		await instance.press('dependent');
		await instance.press('enter');
		await instance.press('a');

		await instance.stop();

		const command = 'add dependent --dev --peer --exact --no-bootstrap --scope=index';
		
		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 10000);

	it('close', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'node',
			[
				resolve(__dirname, './fixtures/command-prompt.js') 
			]
		);

		await instance.press('enter');
		await instance.press('enter');
		await instance.press('enter');
		try {
			await instance.stop();
		} catch (e) {
			instance.press('enter'); // 无效
			expect(instance.code).toBe(null);
			expect(instance.stderr).toBe('');
		}
	}, 10000);
});

