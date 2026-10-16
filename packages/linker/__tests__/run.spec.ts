import { Locals, Shell, Logger } from '@deot/dev-shared';
import { run } from '../src/index';

describe('link workflow', () => {
	const locals = Locals.impl();

	beforeEach(() => {
		vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
		vi.spyOn(Logger, 'log').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllEnvs();
	});

	it('does not link a single-package repository', async () => {
		vi.spyOn(Locals, 'impl').mockReturnValue({ ...locals, workspace: '' });
		await run({});
		expect(Shell.spawn).not.toHaveBeenCalled();
		expect(Logger.log).toHaveBeenCalledWith('<link> Monorepo Supported Only.');
	});

	it('defaults to a dry run in UNIT mode', async () => {
		vi.stubEnv('NODE_ENV', 'UNIT');
		await run({});
		expect(Shell.spawn).toHaveBeenCalledExactlyOnceWith('echo npx pnpm link ./packages/');
	});

	it('explicit dryRun=false links every discovered package even in UNIT mode', async () => {
		vi.stubEnv('NODE_ENV', 'UNIT');
		vi.spyOn(Locals, 'impl').mockReturnValue({ ...locals, packageFolderNames: ['index', 'shared'] });
		await run({ dryRun: false });
		expect(vi.mocked(Shell.spawn).mock.calls).toEqual([
			['npx pnpm link ./packages/index'], ['npx pnpm link ./packages/shared']
		]);
		expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('Links Success'));
	});
});
