import fs from 'fs-extra';
import { createServer } from 'vite';
import { Locals, Shell, Logger } from '@deot/dev-shared';
import { run } from '../src/index';
import * as Entries from '../src/entries';

vi.mock('vite', async original => ({ ...await original<typeof import('vite')>(), createServer: vi.fn() }));
vi.mock('../src/entries', () => ({ get: vi.fn() }));

describe('development server workflow', () => {
	const locals = Locals.impl();
	const exists = fs.existsSync;
	let server: any;

	beforeEach(() => {
		vi.stubEnv('NODE_ENV', 'TEST');
		vi.stubEnv('DEV_OPTIONS', '');
		vi.stubEnv('USE_VUE', '');
		vi.stubEnv('USE_REACT', '');
		vi.spyOn(Locals, 'impl').mockReturnValue({ ...locals, packageOptionsMap: {}, packageDirsMap: {} });
		vi.spyOn(fs, 'existsSync').mockImplementation(file => /dev\.config\.ts$/.test(String(file)) ? false : exists(file));
		vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
		vi.spyOn(Logger, 'log').mockImplementation(() => {});
		vi.mocked(Entries.get).mockReturnValue({ entries: ['demo/index'], html: '<main>demo</main>' });
		server = {
			listen: vi.fn(), printUrls: vi.fn(), bindCLIShortcuts: vi.fn(),
			resolvedUrls: { network: ['http://192.168.1.2:3000/'], local: ['http://localhost:3000/'] },
			config: { server: { port: 3000 } }
		};
		vi.mocked(createServer).mockResolvedValue(server);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('dry run returns before scanning entries or creating a server', async () => {
		await run({ dryRun: true });
		expect(Shell.spawn).toHaveBeenCalledExactlyOnceWith('echo development');
		expect(Entries.get).not.toHaveBeenCalled();
		expect(createServer).not.toHaveBeenCalled();
	});

	it('returns a diagnostic when no examples were found', async () => {
		vi.mocked(Entries.get).mockReturnValue({ entries: [], html: '' });
		await run({ playDir: 'examples' });
		expect(Entries.get).toHaveBeenCalledWith('examples');
		expect(Shell.spawn).toHaveBeenCalledExactlyOnceWith('echo no entry file found!');
		expect(createServer).not.toHaveBeenCalled();
	});

	it('delegates to a selected package dev script', async () => {
		const directory = `${locals.packageDir}/shared`;
		vi.mocked(Locals.impl).mockReturnValue({
			...locals, packageOptionsMap: { shared: { name: '@deot/dev-shared', version: '1.0.0', scripts: { dev: 'custom' } } },
			packageDirsMap: { shared: directory } as any
		});
		await run({ packageName: 'shared' });
		expect(Shell.spawn).toHaveBeenCalledExactlyOnceWith('npm', ['run', 'dev'], { cwd: directory });
		expect(createServer).not.toHaveBeenCalled();
	});

	it.each(['z.dev.config.ts', 'dev.config.ts'])('selects %s and serializes the discovered entries', async (configFile) => {
		vi.mocked(fs.existsSync).mockImplementation((file) => {
			return String(file) === `${locals.cwd}/${configFile}` || (!/dev\.config\.ts$/.test(String(file)) && exists(file));
		});
		await run({ playDir: 'examples', vuePackage: '*', custom: 'retained' });
		expect(createServer).toHaveBeenCalledWith({ server: { host: true }, configFile });
		const options = JSON.parse(decodeURIComponent(process.env.DEV_OPTIONS!));
		expect(options).toMatchObject({
			entries: ['demo/index'], html: '<main>demo</main>', watch: true, useVue: true, useReact: false, custom: 'retained'
		});
		expect(server.listen).toHaveBeenCalledOnce();
		expect(server.printUrls).toHaveBeenCalledOnce();
		expect(server.bindCLIShortcuts).toHaveBeenCalledWith({ print: true });
		expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('http://192.168.1.2:3000/demo/index.html'));
	});

	it('loads the framework defaults and falls back to the configured port without resolved URLs', async () => {
		server.resolvedUrls = undefined;
		await run({ playDir: 'examples', vuePackage: '*', reactPackage: '*' });
		expect(process.env.USE_VUE).toBe('1');
		expect(process.env.USE_REACT).toBe('1');
		expect(createServer).toHaveBeenCalledWith(expect.objectContaining({
			plugins: expect.any(Array), configFile: 'packages/dever/shared.config.ts'
		}));
		expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('http://localhost:3000'));
	});

	it.each([
		[undefined, 'http://localhost:3000/demo/index.html'],
		[{ local: [], network: [] }, 'http://localhost:3000/demo/index.html'],
		[{ local: ['http://localhost:4000/'], network: [] }, 'http://localhost:4000/demo/index.html']
	])('prints a valid entry URL with resolved URLs %j', async (resolvedUrls, url) => {
		server.resolvedUrls = resolvedUrls;
		await run({ playDir: 'examples' });
		expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining(url));
	});
});
