import { Shell } from '@deot/dev-shared';
import * as path from 'node:path';

const cwd = path.resolve('./packages/_/monorepo');
describe('monorepo', () => {
	it('test', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'test'], {
			cwd,
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('build', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd,
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('release', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'release'], {
			cwd,
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);
});
