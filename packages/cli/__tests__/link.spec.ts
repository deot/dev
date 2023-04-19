import { Command } from '@deot/dev-test';
import { resolve } from 'node:path';

describe('link.ts', () => {
	it('command', async () => {
		expect.assertions(3);
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'), 
				'link',
				'--dry-run'
			]
		);

		await instance.stop();
		
		const command = 'npx pnpm link ./packages/';

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(new RegExp(command));
		expect(instance.stderr).toBe('');
	}, 60000);
});
