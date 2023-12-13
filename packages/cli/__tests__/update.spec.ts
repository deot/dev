import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('update.ts', () => {
	it('ddc update', async () => {
		expect.hasAssertions();
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
