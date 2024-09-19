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
		await instance.press('enter');
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
		await instance.press('enter');

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
		await instance.stop();
		instance.press('enter'); // 无效
		// NodeJS@22.x.x: ExitPromptError: User force closed the prompt with 0 null; 强制退出也是0
		// https://github.com/SBoudrias/Inquirer.js/issues/1454
		expect(instance.code).toBe(0);
	}, 10000);
});
