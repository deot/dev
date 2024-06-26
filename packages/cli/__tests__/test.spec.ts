import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('test.ts', () => {
	it('ddc test', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'),
				'test',
				'--dry-run',
				'--custom any-custom-info'
			]
		);

		await instance.press('up', 1000);
		await instance.press('enter', 0);
		await instance.press('y', 1000);
		await instance.press('enter', 0);
		await instance.press('enter', 0);
		await instance.stop();

		const command = 'cross-env NODE_ENV=UNIT TEST_OPTIONS=%7B(.*)?%22watch%22%3Atrue(.*)?%7D (./node_modules/.bin/)?vitest';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stdout).toMatch(`custom%22%3A%22any-custom-info`);
		expect(instance.stderr).toBe('');
	}, 60000);
});
