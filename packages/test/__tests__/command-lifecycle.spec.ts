import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';
import { Command } from '@deot/dev-test';

describe('command lifecycle', () => {
	let directory: string;
	const exitCode = process.exitCode;

	beforeEach(async () => {
		directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dev-command-test-'));
	});

	afterEach(async () => {
		process.exitCode = exitCode;
		await fs.remove(directory);
	});

	it('captures both streams, forwards input and stops idempotently', async () => {
		const file = path.join(directory, 'input.cjs');
		await fs.writeFile(file, `
process.stdout.write('ready;');
process.stderr.write('diagnostic;');
process.stdin.on('data', data => process.stdout.write('input:' + data));
process.stdin.on('end', () => process.stdout.write(';ended'));`);
		const instance = new Command(process.execPath, [file]);
		await instance.press('hello', 0);
		const result = await instance.stop();
		expect(result).toMatchObject({ code: 0, stdout: 'ready;input:hello;ended', stderr: 'diagnostic;' });
		expect(instance.isClose).toBe(true);
		expect(instance.code).toBe(0);
		expect(await instance.stop()).toBe(result);
		await instance.press('ignored', 0);
		expect(instance.stdout).toBe(result.stdout);
	});

	it('rejects with the nonzero exit code and captured output', async () => {
		const file = path.join(directory, 'fail.cjs');
		await fs.writeFile(file, 'process.stdout.write("partial"); process.stderr.write("failure"); process.exit(7);');
		const instance = new Command(process.execPath, [file]);
		await expect(instance.stop()).rejects.toMatchObject({ code: 7, stdout: 'partial', stderr: 'failure' });
		expect(instance.code).toBe(7);
		expect(instance.isClose).toBe(true);
	});

	it('reports spawn errors and allows the test to restore the process exit code', async () => {
		const instance = new Command(path.join(directory, 'missing-command'), []);
		await expect(instance.stop()).rejects.toMatchObject({ code: 1, error: expect.objectContaining({ code: 'ENOENT' }) });
		expect(instance.isClose).toBe(true);
	});
});
