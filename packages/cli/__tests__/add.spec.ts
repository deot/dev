import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('add.ts', () => {
	it('ddc add / package', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'),
				'add',
				'--dry-run'
			]
		);

		await instance.press('enter');
		await instance.press('enter');
		await instance.press('package');
		await instance.press('enter');
		await instance.stop();

		const command = 'npx pnpm link ./packages/package';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 60000);

	it('ddc add / dependent', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'),
				'add',
				'--dry-run'
			]
		);

		await instance.press('down');
		await instance.press('enter');
		await instance.press('enter');
		await instance.press('dependent');
		await instance.press('enter');
		await instance.press('enter');

		await instance.stop();

		const command = 'npx pnpm add --filter @deot/dev dependent -S';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 60000);
});
