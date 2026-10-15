// @vitest-environment node
import * as path from 'node:path';
import * as os from 'node:os';
import * as http from 'node:http';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { compileFunction, constants, runInNewContext } from 'node:vm';
import fs from 'fs-extra';
import { Launch } from '@deot/dev-test';

const root = path.resolve(__dirname, '../../..');
const execute = promisify(execFile);
const tsx = createRequire(import.meta.url).resolve('tsx');
const vite = createRequire(import.meta.url).resolve('vite');
const importFile = compileFunction('return import(file)', ['file'], {
	importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
}) as (file: string) => Promise<any>;

describe('bundle artifacts and output formats', () => {
	let directory: string;
	const artifact = (file: string) => path.join(directory, 'dist', file);
	const read = (file = 'index.js') => fs.readFile(artifact(file), 'utf8');
	const invoke = async (args: string[] = [], options?: Record<string, any>) => {
		const entry = pathToFileURL(path.join(root, 'packages/builder/src/index.ts')).href;
		const command = options
			? ['--input-type=module', '-e', `import {run} from ${JSON.stringify(entry)};await run(${JSON.stringify({ dts: false, ...options })});`]
			: [path.join(root, 'packages/cli/src/index.ts'), 'build', '--no-dts', ...args];
		return execute(process.execPath, ['--import', tsx, ...command], {
			cwd: directory,
			env: { ...process.env, TSX_TSCONFIG_PATH: path.join(root, 'tsconfig.json') }
		});
	};
	const configure = (custom: string) => fs.writeFile(path.join(directory, 'z.build.config.ts'), `
import {mergeConfig} from ${JSON.stringify(vite)};
import shared from ${JSON.stringify(path.join(root, 'packages/builder/shared.config.ts'))};
export default ${custom};`);

	beforeEach(async () => {
		directory = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'builder-bundle-')));
		await fs.outputJson(path.join(directory, 'package.json'), {
			name: '@test/bundle', version: '1.0.0', type: 'module', dependencies: { '@fixture/dependency': '1.0.0' }
		});
		await fs.outputJson(path.join(directory, 'node_modules/@fixture/dependency/package.json'), {
			name: '@fixture/dependency', type: 'module', exports: './index.js'
		});
		await fs.outputFile(path.join(directory, 'node_modules/@fixture/dependency/index.js'), `
export const value=${JSON.stringify('bundled dependency '.repeat(3000))};
export const env=process.env.NODE_ENV;`);
		await fs.outputFile(path.join(directory, 'src/index.ts'), `
import {value,env} from '@fixture/dependency';
import './style.css';
export function read(){return value;}
export function mode(){return process.env.NODE_ENV;}
export function dependencyMode(){return env;}
export function lazy(){return import('./lazy');}`);
		await fs.outputFile(path.join(directory, 'src/lazy.ts'), `import {value} from '@fixture/dependency';export function read(){return value;}`);
		await fs.outputFile(path.join(directory, 'src/style.css'), '.example { color: rgb(255, 0, 0); }');
	});

	afterEach(async () => {
		await fs.remove(directory);
	});

	it('defaults CLI and API to ordinary ES without changing it when bundle is enabled', async () => {
		await invoke();
		const ordinary = await read();
		expect(ordinary).toContain('@fixture/dependency');
		expect(ordinary).toContain('process.env.NODE_ENV');
		expect(await fs.pathExists(artifact('index.cjs'))).toBe(false);
		expect(await fs.pathExists(artifact('bundle'))).toBe(false);
		const { stdout } = await invoke([], { bundlePackage: '*' });
		expect(await read()).toBe(ordinary);
		expect(stdout).toContain('bundle/index.ts');
		const bundled = await read('bundle/index.js');
		expect(bundled).not.toContain('@fixture/dependency');
		expect(bundled).not.toContain('process.env.NODE_ENV');
		const module = await importFile(pathToFileURL(artifact('bundle/index.js')).href);
		expect(module.mode()).toBe('production');
		expect(module.dependencyMode()).toBe('production');
		expect((await module.lazy()).read()).toBe(module.read());
		expect(await read('bundle/index.style.css')).toBe(await read('index.style.css'));
	}, 30000);

	it.each(['cjs', 'iife', 'umd'])('can disable ordinary ES and enable only %s', async (format) => {
		await invoke(['--es-package', '', `--${format}-package`, '*']);
		expect(await fs.pathExists(artifact('index.js'))).toBe(false);
		const filename = format === 'cjs' ? 'index.cjs' : format === 'iife' ? 'index.iife.js' : 'index.umd.cjs';
		expect(await fs.pathExists(artifact(filename))).toBe(true);
		expect(await fs.pathExists(artifact('bundle'))).toBe(false);
	}, 30000);

	it('keeps bundle independent of ordinary formats and cleans disabled variants', async () => {
		await invoke(['--es-package', '', '--bundle-package', '*', '--eval-package', '*']);
		expect(await fs.pathExists(artifact('index.js'))).toBe(false);
		expect(await fs.pathExists(artifact('bundle/index.js'))).toBe(true);
		expect(await fs.pathExists(artifact('eval/index.js'))).toBe(true);
		await invoke();
		expect(await fs.pathExists(artifact('bundle'))).toBe(false);
		expect(await fs.pathExists(artifact('eval'))).toBe(false);
	}, 30000);

	it('leaves standalone styles available with all script formats disabled', async () => {
		await fs.outputFile(path.join(directory, 'src/index.scss'), '.standalone { color: red; }');
		await invoke([], { esPackage: '' });
		expect(await fs.readdir(artifact(''))).toEqual(['index.css']);
		expect(await read('index.css')).toContain('.standalone');
	}, 30000);

	it('keeps node package restrictions on ordinary global formats', async () => {
		await invoke(['--node-package', '*', '--cjs-package', '*', '--iife-package', '*', '--umd-package', '*']);
		expect(await fs.pathExists(artifact('index.js'))).toBe(true);
		expect(await fs.pathExists(artifact('index.cjs'))).toBe(true);
		expect(await fs.pathExists(artifact('index.iife.js'))).toBe(false);
		expect(await fs.pathExists(artifact('index.umd.cjs'))).toBe(false);
	}, 30000);

	it('isolates bundle externals and skips eval with unresolved bare dependencies', async () => {
		await invoke(['--bundle-package', '*', '--iife-external', '@fixture/dependency', '--umd-external', '@fixture/dependency']);
		expect(await read('bundle/index.js')).not.toContain('@fixture/dependency');
		const { stdout } = await invoke(['--bundle-package', '*', '--bundle-external', '@fixture/dependency', '--eval-package', '*']);
		expect(await read('bundle/index.js')).toContain('@fixture/dependency');
		expect(await fs.pathExists(artifact('eval'))).toBe(false);
		expect(stdout).toContain('unverifiable module dependencies');
	}, 30000);

	it('uses independent global-format externals and shared globals mappings', async () => {
		await invoke([
			'--iife-package', '*', '--umd-package', '*', '--iife-external', '@fixture/dependency',
			'--globals', '@fixture/dependency:FixtureDependency'
		]);
		const sandbox = { FixtureDependency: { value: 'external', env: 'external-mode' } } as any;
		runInNewContext(await read('index.iife.js'), sandbox);
		expect(sandbox.Bundle.read()).toBe('external');
		const umd = {} as any;
		runInNewContext(await read('index.umd.cjs'), umd);
		expect(umd.Bundle.read()).toBe('bundled dependency '.repeat(3000));
		await invoke(['--umd-package', '*', '--umd-external', '@fixture/dependency', '--globals', '@fixture/dependency:FixtureDependency']);
		const external = { FixtureDependency: { value: 'umd-external', env: 'external-mode' } } as any;
		runInNewContext(await read('index.umd.cjs'), external);
		expect(external.Bundle.read()).toBe('umd-external');
	}, 30000);

	it('respects project external callbacks and environment overrides', async () => {
		await configure(`mergeConfig(shared, {
	define:{'process.env.NODE_ENV':JSON.stringify('development')},
	build:{rolldownOptions:{external:()=>false}}
})`);
		await invoke(['--es-package', '', '--bundle-package', '*', '--bundle-external', '@fixture/dependency']);
		const module = await importFile(pathToFileURL(artifact('bundle/index.js')).href);
		expect(module.mode()).toBe('development');
		expect(module.dependencyMode()).toBe('development');
		await configure(`mergeConfig(shared, {build:{rolldownOptions:{external:['@fixture/dependency']}}})`);
		await invoke(['--bundle-package', '*']);
		expect(await read('bundle/index.js')).toContain('@fixture/dependency');
	}, 30000);

	it('applies bundle defaults when the project supplies its own build config', async () => {
		await fs.writeFile(path.join(directory, 'z.build.config.ts'), `export default {
	logLevel:'silent',
	build:{minify:false,lib:{entry:${JSON.stringify(path.join(directory, 'src/index.ts'))},formats:['es'],fileName:'index'}}
};`);
		await invoke(['--es-package', '', '--bundle-package', '*']);
		expect(await read('bundle/index.js')).not.toContain('@fixture/dependency');
		const module = await importFile(pathToFileURL(artifact('bundle/index.js')).href);
		expect(module.mode()).toBe('production');
		expect(module.dependencyMode()).toBe('production');
	}, 30000);

	it('does not infer bundle from eval alone', async () => {
		const { stdout } = await invoke(['--eval-package', '*']);
		expect(stdout).toContain('eval skipped (requires bundlePackage)');
		expect(await fs.pathExists(artifact('bundle'))).toBe(false);
		expect(await fs.pathExists(artifact('eval'))).toBe(false);
	}, 30000);

	it('executes bundled and eval ES with lazy chunks and CSS in a browser', async () => {
		await invoke(['--bundle-package', '*', '--eval-package', '*']);
		const launch = new Launch();
		const server = http.createServer(async (request, response) => {
			const pathname = new URL(request.url!, 'http://localhost').pathname;
			if (pathname === '/') {
				response.setHeader('Content-Type', 'text/html');
				response.end('<link rel="stylesheet" href="/bundle/index.style.css"><div class="example">test</div>');
				return;
			}
			const filename = artifact(pathname.slice(1));
			if (!await fs.pathExists(filename)) { response.writeHead(404).end(); return; }
			response.setHeader('Content-Type', filename.endsWith('.css') ? 'text/css' : 'text/javascript');
			response.end(await fs.readFile(filename));
		});
		let browser: Launch['browser'] | undefined;
		try {
			browser = await launch.createBrowser();
			await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
			const base = `http://127.0.0.1:${(server.address() as import('node:net').AddressInfo).port}`;
			const page = await launch.createPage();
			await page.goto(base);
			const result = await page.evaluate(async () => {
				const load = new Function('url', 'return import(url)');
				const normal = await load('/bundle/index.js');
				const packed = await load('/eval/index.js');
				return {
					mode: packed.mode(),
					dependencyMode: packed.dependencyMode(),
					same: normal.read() === packed.read(),
					lazy: (await packed.lazy()).read() === packed.read(),
					process: typeof (globalThis as any).process,
					color: getComputedStyle(document.querySelector('.example')!).color
				};
			});
			expect(result).toEqual({
				mode: 'production', dependencyMode: 'production', same: true, lazy: true, process: 'undefined', color: 'rgb(255, 0, 0)'
			});
		} finally {
			await browser?.close();
			if (server.listening) await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
		}
	}, 30000);
});
