import * as path from 'node:path';
import { Message, FilePath } from '@deot/dev-commitlint';

describe('index.ts', () => {
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
