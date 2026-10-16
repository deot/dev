const actions = vi.hoisted(() => ({
	build: vi.fn(), release: vi.fn(), test: vi.fn(), add: vi.fn(), link: vi.fn(), dev: vi.fn(), update: vi.fn()
}));
const cli = vi.hoisted(() => ({ program: null as any }));

vi.mock('@deot/dev-builder', () => ({ run: actions.build }));
vi.mock('@deot/dev-releaser', () => ({ run: actions.release }));
vi.mock('@deot/dev-tester', () => ({ run: actions.test }));
vi.mock('@deot/dev-adder', () => ({ run: actions.add }));
vi.mock('@deot/dev-linker', () => ({ run: actions.link }));
vi.mock('@deot/dev-dever', () => ({ run: actions.dev }));
vi.mock('@deot/dev-updater', () => ({ run: actions.update }));
vi.mock('commander', async (original) => {
	const commander = await original<typeof import('commander')>();
	return { ...commander, get program() { return cli.program; } };
});

describe('CLI argument routing', () => {
	const argv = process.argv;
	const invoke = async (args: string[]) => {
		process.argv = [process.execPath, 'ddc', ...args];
		await import('../src/index');
	};

	beforeEach(async () => {
		vi.resetModules();
		vi.clearAllMocks();
		const { Command } = await vi.importActual<typeof import('commander')>('commander');
		cli.program = new Command();
	});

	afterEach(() => {
		process.argv = argv;
	});

	it.each([
		['build', 'b', { esPackage: '*', cjsPackage: '', iifePackage: '', umdPackage: '', bundlePackage: '' }],
		['release', 'r', { tag: true, publish: true, commit: true, push: true, coverage: true }],
		['test', 't', { coverage: true, environment: 'jsdom' }],
		['add', 'a', {}],
		['link', 'l', {}],
		['dev', 'd', { playDir: 'examples' }],
		['update', 'u', { commit: true, push: true, test: true, changeLog: true }]
	] as const)('routes alias %s/%s with its default options', async (name, alias, defaults) => {
		await invoke([alias, '--custom', 'extra']);
		expect(actions[name]).toHaveBeenCalledWith(expect.objectContaining({ ...defaults, custom: 'extra' }), expect.anything());
		for (const [key, action] of Object.entries(actions)) {
			expect(action).toHaveBeenCalledTimes(key === name ? 1 : 0);
		}
	});

	it('parses negative release flags and package selections', async () => {
		await invoke([
			'release', '--no-dry-run', '--no-tag', '--no-publish', '--no-push', '--no-commit', '--no-coverage', '--force-update-package', 'shared'
		]);
		expect(actions.release).toHaveBeenCalledWith(expect.objectContaining({
			dryRun: false, tag: false, publish: false, push: false, commit: false, coverage: false, forceUpdatePackage: 'shared'
		}), expect.anything());
	});

	it('preserves explicit empty format selections, external mappings and type generation flags', async () => {
		await invoke(['build', '--es-package=', '--cjs-package', 'shared', '--bundle-external', 'vue,react', '--globals', 'vue:Vue', '--no-dts']);
		expect(actions.build).toHaveBeenCalledWith(expect.objectContaining({
			esPackage: '', cjsPackage: 'shared', bundleExternal: 'vue,react', globals: 'vue:Vue', dts: false
		}), expect.anything());
	});

	it('passes include, environment and disabled coverage options to the tester', async () => {
		await invoke(['test', '--include', '**/one.spec.ts', '--environment', 'node', '--no-coverage', '--watch']);
		expect(actions.test).toHaveBeenCalledWith(expect.objectContaining({
			include: '**/one.spec.ts', environment: 'node', coverage: false, watch: true
		}), expect.anything());
	});
});
