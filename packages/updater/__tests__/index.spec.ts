import * as path from 'node:path';
import { Shell } from '@deot/dev-shared';
import * as Updater from '@deot/dev-updater';

describe('index.ts', () => {
	it('run', async () => {
		expect(typeof Updater.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.hasAssertions();
		const response = await Shell.spawn(`npm`, ['run', 'update'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 60000);

	it('singlerepo', async () => {
		expect.hasAssertions();
		const response = await Shell.spawn(`npm`, ['run', 'update'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		expect(response).toBe(0);
	}, 60000);
});
