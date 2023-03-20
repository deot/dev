import { resolve } from 'node:path';

describe('dev.ts', () => {
	it('ddc dev', async () => {
		expect.assertions(3);
		const instance = new global.Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'dev'
			]
		);

		await instance.stop();

		expect(instance.code).toBe(0);
		expect(instance.stdout.includes('development')).toBe(true);
		expect(instance.stderr).toBe('');
	}, 60000);
});
