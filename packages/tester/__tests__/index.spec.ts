import * as path from 'node:path';
import * as fs from 'node:fs';
import { stripVTControlCharacters } from 'node:util';
import { Locals, Shell } from '@deot/dev-shared';
import * as Tester from '@deot/dev-tester';

// @vitest-environment node
describe('index', () => {
	const coverageFiles = () => fs.readdirSync(path.resolve('./packages/_/monorepo/coverage'), { recursive: true }).map(String);
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toBe(process.cwd());
	});

	it('run', async () => {
		expect(typeof Tester.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.hasAssertions();
		const { stdout: output } = await Shell.exec(`npm`, ['run', 'test', `-- --package-name '*'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe',
			env: { ...process.env, NO_COLOR: undefined, FORCE_COLOR: '1' }
		});
		const stdout = stripVTControlCharacters(output);

		// console.log(stdout);
		expect(stdout).toMatch(/Test Files\s+6 passed/);

		// coverage
		expect(stdout).toContain('Coverage enabled with istanbul');
		expect(coverageFiles()).toEqual(expect.arrayContaining([
			'index/src/index.ts.html', 'shared/src/index.ts.html', 'components/index.ts.html', 'components/button/index.ts.html'
		]));
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
		expect(coverageFiles()).toEqual(expect.arrayContaining([
			'components/index.ts.html', 'components/button/index.ts.html', 'components/button/index.m.ts.html'
		]));
	}, 60000);

	it('monorepo, subpackages, button', async () => {
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'test', `-- --package-name '@demo/helper-components' --subpackage 'button'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		// console.log(stdout);
		expect(stdout).toMatch(`1 passed`);
		expect(coverageFiles()).toEqual(expect.arrayContaining(['index.ts.html', 'index.m.ts.html']));
	}, 60000);

	it('singlerepo', async () => {
		expect.hasAssertions();
		const response = await Shell.spawn(`npm`, ['run', 'test', `-- --package-name '*'`], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('monorepo, single file', async () => {
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'test', `-- --include 'packages/components/__tests__/index.spec.ts'`], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		expect(stdout).toMatch('1 passed');
	}, 60000);
});
