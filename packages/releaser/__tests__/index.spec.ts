import { Locals } from '@deot/dev-shared';
import { Command } from '@deot/dev-test';
import * as Release from '@deot/dev-releaser';
import { resolve } from 'node:path';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});
	it('run', async () => {
		expect(typeof Release.run).toBe('function');
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, './fixtures/dry-run.ts')
			]
		);

		await instance.stop();

		const log1 = 'No files will be modified.';
		const log2 = '(Nothing Chanaged.|Skipping Git Push)';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(log1));
		expect(instance.stdout).toMatch(new RegExp(log2));
		expect(instance.stderr).toBe('');
	});
});
