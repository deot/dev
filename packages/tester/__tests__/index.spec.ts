import { Locals, Shell } from '@deot/dev-shared';
import * as Tester from '@deot/dev-tester';
import * as path from 'node:path';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Tester.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'test'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('singlerepo', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'test'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);
});
