import { Shell } from '@deot/dev-shared';

describe('shell.ts', () => {
	const exitCode = process.exitCode;
	afterEach(() => {
		process.exitCode = exitCode;
	});

	it.each([
		['  cmd\t first\nsecond ', [], ['cmd', 'first', 'second']],
		['cmd', ['"two words"', '\'three words\''], ['cmd', '"two words"', '\'three words\'']],
		['cmd ""', [], ['cmd', '""']]
	])('tokenizes %s and preserves quoted arguments', (command, args, expected) => {
		expect(Shell.command(command, args)).toEqual(expected);
	});

	it('exec preserves stdout, stderr and exit status on failure', async () => {
		await expect(Shell.exec(`${process.execPath} -e 'process.stdout.write("out");process.stderr.write("err");process.exit(7)'`))
			.rejects.toMatchObject({ code: 7, stdout: 'out', stderr: 'err' });
	});

	it('spawn passes quoted values as single arguments and removes its lifecycle listener', async () => {
		const listeners = process.listenerCount('beforeExit');
		const task = Shell.spawn(process.execPath, [
			'-e', '\'process.exit(process.argv[1] === "two words" ? 0 : 3)\'', '"two words"'
		], { stdio: 'pipe' });
		expect(typeof task.kill).toBe('function');
		await expect(task).resolves.toBe(0);
		expect(process.listenerCount('beforeExit')).toBe(listeners);
	});

	it.each([1, 7, 127])('spawn rejects unsuccessful exit code %s', async (code) => {
		await expect(Shell.spawn(process.execPath, ['-e', `'process.exit(${code})'`], { stdio: 'pipe' })).rejects.toBe(code);
	});

	it('spawn accepts a conventional signal exit code', async () => {
		await expect(Shell.spawn(process.execPath, ['-e', '\'process.exit(130)\''], { stdio: 'pipe' })).resolves.toBe(130);
	});

	it('exec finally preserves the resolved result and cleans up its lifecycle listener', async () => {
		const listeners = process.listenerCount('beforeExit');
		const complete = vi.fn();
		const result = await Shell.exec(`${process.execPath} -e 'process.stdout.write("done")'`).finally(complete);
		expect(result).toEqual({ stdout: 'done', stderr: '' });
		expect(complete).toHaveBeenCalledOnce();
		expect(process.listenerCount('beforeExit')).toBe(listeners);
	});

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

		await Shell.spawn(`NOCOMMAND`, ['any']).catch((response) => {
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
		expect(command[1]).toBe('\'a b\'');
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
