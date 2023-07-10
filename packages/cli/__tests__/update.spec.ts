import { Command } from '@deot/dev-test';
import { resolve } from 'node:path';

describe('update.ts', () => {
	it('ddc update', async () => {
		expect.assertions(3);
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'update',
				'--dry-run'
			]
		);

		await instance.stop();

		expect(instance.code).toBe(0);
		expect(instance.stdout.includes('update')).toBe(true);
		expect(instance.stderr).toBe('');
	}, 60000);
});
