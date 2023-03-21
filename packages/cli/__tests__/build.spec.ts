import { Command } from '@deot/dev-test';
import { resolve } from 'node:path';

describe('build.ts', () => {
	it('command', async () => {
		expect.assertions(3);
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'build'
			]
		);

		await instance.stop();

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(/^shared/);
		expect(instance.stderr).toBe('');
	}, 60000);
});
