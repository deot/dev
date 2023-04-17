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
		const response = await Shell.spawn(`echo`, ['any']);
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

