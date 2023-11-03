import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('release.ts', () => {
	it('command', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'release'
			]
		);

		await instance.stop();
		
		const log1 = 'No files will be modified.';
		const log2 = '(Nothing Chanaged.|Skipping Git Push)';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(log1));
		expect(instance.stdout).toMatch(new RegExp(log2));
		expect(instance.stderr).toBe('');
	}, 60000);
});
