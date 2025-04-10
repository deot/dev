import { resolve } from 'node:path';
import { Locals } from '@deot/dev-shared';
import { Command } from '@deot/dev-test';
import * as Release from '@deot/dev-releaser';

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

		expect(instance.code).toBe(0);
		expect(instance.stderr).toBe('');

		const v = instance.stdout;
		// logs
		[
			'coverage: true',
			'No files will be modified.',
			// 0
			'feat: all changed by * ([00000](https://github.com/deot/dev/commit/00000))',
			// 1
			'fix: ci tag [#2](https://github.com/deot/dev/pull/2)',
			// 2
			'fix(shared): error [close 1](https://github.com/deot/dev/issues/1) ([22222](https://github.com/deot/dev/commit/22222))',
			'fix: error [close 1](https://github.com/deot/dev/issues/1) ([22222](https://github.com/deot/dev/commit/22222))',
			// 3
			'refactor: remove deprecated ([33333](https://github.com/deot/dev/commit/33333))',
			// 4
			'style(index,shared): mutiple changed ([44444](https://github.com/deot/dev/commit/44444))',
			'style: mutiple changed ([44444](https://github.com/deot/dev/commit/44444))',
			// 5
			'chore(builder,cli,deps,dever,eslint): deps updated ([55555](https://github.com/deot/dev/commit/55555))',
			'chore: deps updated ([55555](https://github.com/deot/dev/commit/55555))'
		].forEach(i => expect(v).toMatch(i));
	}, 60000);
});
