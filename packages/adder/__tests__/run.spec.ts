import { resolve } from 'node:path';
import fs from 'fs-extra';
import { Locals, Shell, Logger } from '@deot/dev-shared';
import { run } from '../src/index';
import { getOptions } from '../src/prompt';

vi.mock('../src/prompt', () => ({ getOptions: vi.fn() }));

describe('add workflow', () => {
	const locals = Locals.impl();
	let spawn: ReturnType<typeof vi.spyOn>;
	let write: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		spawn = vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
		write = vi.spyOn(fs, 'outputFileSync').mockImplementation(() => {});
		vi.spyOn(Logger, 'log').mockImplementation(() => {});
		vi.mocked(getOptions).mockResolvedValue({
			mode: 'package', packageFolderName: 'new-package', packageName: '@deot/dev-new-package', dependentName: '', args: ['']
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it('returns early outside a monorepo without prompting or running a command', async () => {
		vi.spyOn(Locals, 'impl').mockReturnValue({ ...locals, workspace: '' });
		await run({});
		expect(getOptions).not.toHaveBeenCalled();
		expect(write).not.toHaveBeenCalled();
		expect(spawn).not.toHaveBeenCalled();
		expect(Logger.log).toHaveBeenCalledWith('<add> Monorepo Supported Only.');
	});

	it('dry run prints the command without creating package files', async () => {
		await run({ dryRun: true });
		expect(spawn).toHaveBeenCalledExactlyOnceWith('echo "npx pnpm link ./packages/new-package"');
		expect(write).not.toHaveBeenCalled();
	});

	it('creates the package manifest and starter files before linking', async () => {
		await run({ dryRun: false });
		const dir = resolve(locals.packageDir, 'new-package');
		expect(write.mock.calls.map(([file]) => file)).toEqual([
			`${dir}/README.md`, `${dir}/src/index.ts`, `${dir}/__tests__/index.spec.ts`, `${dir}/package.json`
		]);
		const manifest = JSON.parse(write.mock.calls[3][1]);
		expect(manifest).toMatchObject({
			name: '@deot/dev-new-package', version: '0.0.1', type: 'module',
			main: 'dist/index.js', types: 'dist/index.d.ts', files: ['dist'],
			exports: { '.': { import: './dist/index.js', require: './dist/index.cjs', types: './dist/index.d.ts' } },
			publishConfig: { access: 'public' }, dependencies: {}
		});
		expect(spawn).toHaveBeenCalledExactlyOnceWith('npx pnpm link ./packages/new-package');
		expect(write.mock.invocationCallOrder[3]).toBeLessThan(spawn.mock.invocationCallOrder[0]);
	});

	it('adds a dependency to the selected package with the requested installation flags', async () => {
		vi.mocked(getOptions).mockResolvedValue({
			mode: 'dependent', packageFolderName: 'shared', packageName: '@deot/dev-shared', dependentName: 'some-library', args: ['-D']
		});
		await run({ dryRun: false });
		expect(spawn).toHaveBeenCalledExactlyOnceWith('npx pnpm add --filter @deot/dev-shared some-library -D');
		expect(write).not.toHaveBeenCalled();
	});
});
