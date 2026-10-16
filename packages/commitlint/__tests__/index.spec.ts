import * as path from 'node:path';
import * as os from 'node:os';
import * as fs from 'node:fs';
import { Message, FilePath } from '@deot/dev-commitlint';

describe('index.ts', () => {
	it.each([
		'fix', 'feat', 'docs', 'style', 'perf', 'test', 'types', 'build', 'chore',
		'refactor', 'workflow', 'ci', 'wip', 'release', 'breaking change', 'void'
	])('accepts the %s commit type with and without a scope', (type) => {
		expect(Message.lint(`${type}: change`)).toBe('');
		expect(Message.lint(`${type}(shared): change`)).toBe('');
	});

	it.each(['', 'fix:', 'fix: ', 'fix:change', 'Fix: change', 'unknown(scope): change'])('reports an invalid message: %j', (message) => {
		expect(Message.lint(message)).toContain(`Invalid Commit Message: "${message}"`);
		expect(Message.lint(message)).toContain('Allowed Types:');
	});

	it('run accepts literal messages, skips empty input and supports multiple exclusions', () => {
		expect(Message.run(1, ['--message', 'fix: literal'])).toBe('');
		expect(Message.run(1, ['--message'])).toBeUndefined();
		expect(Message.run(1, ['--message', 'automated update', '--message-exclude', 'merge,automated'])).toBeUndefined();
		expect(Message.run(1, ['--message', 'invalid', '--message-exclude'])).toContain('Invalid Commit Message');
	});

	it.each(['src/button/index.ts', 'src/button-group.ts', 'src/中文.ts'])('accepts a lowercase or non-Latin path: %s', (file) => {
		expect(FilePath.lint(file)).toBeUndefined();
	});

	it.each(['src/Button/index.ts', 'src/buttonGroup.ts', 'Src/index.ts'])('returns the full invalid path: %s', (file) => {
		expect(FilePath.lint(file)).toBe(file);
	});

	it('aggregates existing uppercase paths, skips Markdown and missing files, and applies path exclusions', () => {
		const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'commitlint-test-'));
		try {
			const first = path.join(directory, 'First.ts');
			const second = path.join(directory, 'Second.ts');
			const markdown = path.join(directory, 'README.md');
			for (const file of [first, second, markdown]) {
				fs.writeFileSync(file, '');
			}
			const result = FilePath.run(1, ['--file-path', first, second, markdown, path.join(directory, 'Missing.ts')]);
			expect(result).toContain(path.relative(process.cwd(), first));
			expect(result).toContain(path.relative(process.cwd(), second));
			expect(result).not.toContain('README.md');
			expect(result).not.toContain('Missing.ts');
			expect(FilePath.run(1, ['--file-path', first, second, '--file-path-exclude', 'First,Second'])).toBeUndefined();
		} finally {
			fs.rmSync(directory, { recursive: true, force: true });
		}
	});

	it('message/allow', async () => {
		expect.hasAssertions();
		expect(Message.lint('feat: any')).toBeFalsy();
		expect(Message.lint('void: any\n')).toBeFalsy();
		expect(Message.lint('revert: feat: any')).toBeFalsy();
		expect(Message.lint('Revert "style: any"')).toBeFalsy();
		expect(Message.lint(`Merge remote-tracking branch 'origin/xx' into test`)).toBeFalsy();

		expect(Message.lint(`Merge branch 'foo' into 'bar'`)).toBeFalsy();
	});

	it('message/throw error', async () => {
		expect.hasAssertions();
		expect(Message.lint('any')).toBeTruthy();
		expect(Message.lint('aaa: any')).toBeTruthy();
	});

	it('message/allow/run', async () => {
		const fakePath = path.resolve(__dirname, './fixtures/message');
		expect.hasAssertions();
		expect(Message.run(1, ['--message', fakePath])).toBeTruthy();
		expect(Message.run(1, ['--message', fakePath, '--message-exclude', 'any,any1'])).toBeFalsy();
	});

	it('file-path/allow/run', async () => {
		const fakePath = path.resolve(__dirname, './fixtures/message');
		expect.hasAssertions();
		expect(FilePath.run(1, ['--file-path', fakePath])).toBeFalsy();
		expect(FilePath.run(1, ['--file-path', fakePath, '--file-path-exclude', 'message'])).toBeFalsy();
	});

	it('file-path/throw error', async () => {
		expect.hasAssertions();
		expect(FilePath.lint('Any')).toBeTruthy();
		expect(FilePath.lint('any')).toBeFalsy();
	});
});
