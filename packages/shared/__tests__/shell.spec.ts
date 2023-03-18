import { Shell } from '@deot/dev-shared';

describe('shell.ts', () => {
	it('exec', async () => {
		expect.assertions(2);
		const response = await Shell.exec(`echo`);
		
		expect(response.stdout).toBe('\n');
		expect(response.stderr).toBe('');
	});

	it('spawn', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`echo`);
		expect(response).toBe(0);
	});

	it('spawn', async () => {
		expect.assertions(1);

		try {
			await Shell.spawn(`NOCOMMAND`);
		} catch (response) {
			expect(typeof response).toBe('object');
		}
	});
});

