import { Shell } from '@deot/dev-shared';

describe('shell.ts', () => {
	it('exec', async () => {
		expect.hasAssertions();
		const response = await Shell.exec(`echo`);
		
		expect(response.stdout).toBe('\n');
		expect(response.stderr).toBe('');
	});

	it('exec/catch', async () => {
		expect.hasAssertions();
		try {
			await Shell.exec(`NOCOMMAND`, ['any']);
		} catch (response) {
			expect(typeof response).toBe('object');
		}
	});

	it('spawn', async () => {
		expect.hasAssertions();
		const response = await Shell.spawn(`echo`);
		expect(response).toBe(0);
	});

	it('spawn', async () => {
		expect.hasAssertions();

		try {
			await Shell.spawn(`NOCOMMAND`, ['any']);
		} catch (response) {
			expect(typeof response).toBe('object');
		}
	});

	it('spawn/catch', async () => {
		expect.hasAssertions();

		await Shell.spawn(`NOCOMMAND`, ['any']).catch(response => {
			expect(typeof response).toBe('object');
		});
	});

	it('spawn/finally', async () => {
		expect.hasAssertions();

		await Shell.spawn(`echo`).finally(() => {
			expect(1).toBe(1);
		});
	});

	it('command', async () => {
		const command = Shell.command(`cmd 'a b' "c d"`, ['--a b', '-c d']);

		expect(command.length).toBe(7);
		expect(command[0]).toBe('cmd');
		expect(command[1]).toBe("'a b'");
		expect(command[2]).toBe('"c d"');
		expect(command[3]).toBe('--a');
		expect(command[4]).toBe('b');
		expect(command[5]).toBe('-c');
		expect(command[6]).toBe('d');
	});

	it('command empty', async () => {
		const command = Shell.command(``);

		expect(command.length).toBe(0);
	});
});

