import * as path from 'node:path';
import { Locals, Shell } from '@deot/dev-shared';
import * as Tester from '@deot/dev-tester';

// @vitest-environment node
describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Tester.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'test', `-- --package-name '*'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		// console.log(stdout);
		expect(stdout).toMatch('6 passed');

		// coverage
		expect(stdout).toMatch(' index/src         |');
		expect(stdout).toMatch(' shared/src        |');
		expect(stdout).toMatch(' components        |');
		expect(stdout).toMatch(' components/button |');
	}, 60000);

	it('monorepo, subpackages, *', async () => {
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'test', `-- --package-name '@demo/helper-components'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		// console.log(stdout);
		expect(stdout).toMatch('2 passed');

		// coverage
		expect(stdout).toMatch(' components        |');
		expect(stdout).toMatch(' components/button |');
	}, 60000);

	it('monorepo, subpackages, button', async () => {
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'test', `-- --package-name '@demo/helper-components' --subpackage 'button'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		// console.log(stdout);
		expect(stdout).toMatch(`1 passed`);
		expect(stdout).toMatch(' index.m.ts |');
	}, 60000);

	it('singlerepo', async () => {
		expect.hasAssertions();
		const response = await Shell.spawn(`npm`, ['run', 'test', `-- --package-name '*'`], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);
});
