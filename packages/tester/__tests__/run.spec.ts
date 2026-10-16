import fs from 'fs-extra';
import { startVitest } from 'vitest/node';
import { Locals, Shell } from '@deot/dev-shared';
import { run } from '../src/index';
import { getOptions } from '../src/prompt';

vi.mock('vitest/node', () => ({ startVitest: vi.fn() }));
vi.mock('../src/prompt', () => ({ getOptions: vi.fn() }));

describe('test runner options', () => {
	const locals = Locals.impl();
	const exists = fs.existsSync;
	const optionsFromEnv = () => JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS!));

	beforeEach(() => {
		vi.stubEnv('NODE_ENV', 'TEST');
		vi.stubEnv('TEST_OPTIONS', process.env.TEST_OPTIONS);
		vi.spyOn(Locals, 'impl').mockReturnValue({ ...locals, packageOptionsMap: {}, packageDirsMap: {} });
		vi.spyOn(fs, 'existsSync').mockImplementation(file => /test\.(config|setup)\.ts$/.test(String(file)) ? false : exists(file));
		vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
		vi.mocked(startVitest).mockResolvedValue(undefined as never);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('normalizes package and subpackage options without mutating caller options', async () => {
		const options = { packageName: 'shared', subpackage: 'nested', coverage: false, environment: 'node' };
		await run(options);
		expect(options).toEqual({ packageName: 'shared', subpackage: 'nested', coverage: false, environment: 'node' });
		expect(optionsFromEnv()).toMatchObject({
			packageFolderName: 'shared', subpackageFolderName: 'nested', workspace: 'packages', useVue: false, useReact: false
		});
		expect(optionsFromEnv()).not.toHaveProperty('packageName');
		expect(optionsFromEnv()).not.toHaveProperty('subpackage');
		expect(startVitest).toHaveBeenCalledWith('test', [], expect.objectContaining({
			environment: 'node', coverage: { enabled: false }, watch: false, passWithNoTests: true
		}));
	});

	it('uses interactive selections only when neither a package nor include was supplied', async () => {
		vi.mocked(getOptions).mockResolvedValue({ packageFolderName: 'shared', subpackageFolderName: undefined, watch: true, coverage: true });
		await run({});
		expect(getOptions).toHaveBeenCalledOnce();
		expect(startVitest).toHaveBeenCalledWith('test', [], expect.objectContaining({ coverage: { enabled: true }, watch: true }));
	});

	it('a file include bypasses the package prompt', async () => {
		await run({ include: '**/one.spec.ts' });
		expect(getOptions).not.toHaveBeenCalled();
		expect(optionsFromEnv().include).toBe('**/one.spec.ts');
	});

	it('delegates to a selected package test script', async () => {
		const directory = `${locals.packageDir}/shared`;
		vi.mocked(Locals.impl).mockReturnValue({
			...locals,
			packageOptionsMap: { shared: { name: '@deot/dev-shared', version: '1.0.0', scripts: { test: 'custom' } } },
			packageDirsMap: { shared: directory } as any
		});
		await run({ packageName: 'shared' });
		expect(Shell.spawn).toHaveBeenCalledExactlyOnceWith('npm', ['run', 'test'], { cwd: directory });
		expect(startVitest).not.toHaveBeenCalled();
	});

	it('prefers z.test config and setup files when both naming conventions exist', async () => {
		vi.mocked(fs.existsSync).mockImplementation(file => /test\.(config|setup)\.ts$/.test(String(file)) || exists(file));
		await run({ packageName: '*' });
		expect(startVitest).toHaveBeenCalledWith('test', [], expect.objectContaining({
			config: 'z.test.config.ts', setupFiles: ['z.test.setup.ts']
		}));
	});

	it('falls back to test.config and test.setup files', async () => {
		vi.mocked(fs.existsSync).mockImplementation((file) => {
			return /\/test\.(config|setup)\.ts$/.test(String(file)) || (!/z\.test\./.test(String(file)) && exists(file));
		});
		await run({ packageName: '*' });
		expect(startVitest).toHaveBeenCalledWith('test', [], expect.objectContaining({ config: 'test.config.ts', setupFiles: ['test.setup.ts'] }));
	});

	it('enables both framework transforms and watch mode in development with default config', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.stubEnv('USE_VUE', '');
		vi.stubEnv('USE_REACT', '');
		await run({ packageName: '*', vuePackage: '*', reactPackage: '*' });
		expect(process.env.USE_VUE).toBe('1');
		expect(process.env.USE_REACT).toBe('1');
		expect(optionsFromEnv()).toMatchObject({ useVue: true, useReact: true });
		expect(startVitest).toHaveBeenCalledWith('test', [], expect.objectContaining({ watch: true }));
	});

	it('UNIT dry run only prints the vitest invocation', async () => {
		vi.stubEnv('NODE_ENV', 'UNIT');
		await run({ packageName: '*', watch: false });
		expect(Shell.spawn).toHaveBeenCalledWith(expect.stringContaining('--watch=false'));
		expect(startVitest).not.toHaveBeenCalled();
	});
});
