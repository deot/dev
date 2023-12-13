import { resolve } from 'node:path';
import { Command } from '@deot/dev-test';

describe('build.ts', () => {
	it('command **', async () => {
		expect.hasAssertions();
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'),
				'build',
				'--dry-run'
			]
		);

		await instance.stop();

		expect(instance.code).toBe(0);
		expect(instance.stdout).toMatch(/^shared/);
		expect(instance.stderr).toBe('');
	}, 60000);

	it('command cli', async () => {
		expect.assertions(3);
		const instance = new Command(
			'cross-env NODE_ENV=UNIT tsx',
			[
				resolve(__dirname, '../src/index.ts'),
				'build',
				'--dry-run',
				'--package-name @deot/dev-cli'
			]
		);

		await instance.stop();

		expect(instance.code).toBe(0);
		// 打包cli时会关联当前包的模块 `shared adder builder linker tester releaser updater test cli`
		expect(instance.stdout).toMatch(/^shared[\s\S]+cli/);
		expect(instance.stderr).toBe('');
	}, 60000);
});
