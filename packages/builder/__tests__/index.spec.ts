import { Locals, Shell } from '@deot/dev-shared';
import * as Builder from '@deot/dev-builder';
import * as path from 'node:path';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Builder.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/builder/__tests__/fixtures/monorepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('singlerepo', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/builder/__tests__/fixtures/singlerepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);
});
