import { run } from '@deot/dev-commitlint';

describe('index.ts', () => {
	it('allow', async () => {
		expect.hasAssertions();
		expect(run('feat: any')).toBeFalsy();
		expect(run('void: any\n')).toBeFalsy();
		expect(run('revert: feat: any')).toBeFalsy();
		expect(run(`Merge branch 'foo' into 'bar'`)).toBeFalsy();
	});

	it('throw error', async () => {
		expect.hasAssertions();
		expect(run('any')).toBeTruthy();
		expect(run('aaa: any')).toBeTruthy();
	});
});
