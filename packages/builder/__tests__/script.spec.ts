// @vitest-environment node
import * as path from 'node:path';
import * as os from 'node:os';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import { compileFunction, constants, runInNewContext } from 'node:vm';
import fs from 'fs-extra';
import { build } from 'vite';
import type { Rolldown } from 'vite';

const root = path.resolve(__dirname, '../../..');
const execute = promisify(execFile);
const tsx = createRequire(import.meta.url).resolve('tsx');
const importFile = compileFunction('return import(file)', ['file'], {
	importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
}) as (file: string) => Promise<any>;

describe('build compression options', () => {
	let directory: string;
	const invoke = async (args: string[] = [], options?: Record<string, any>) => {
		const entry = pathToFileURL(path.join(root, 'packages/builder/src/index.ts')).href;
		const command = options
			? ['--input-type=module', '-e', `import { run } from ${JSON.stringify(entry)};
await run(${JSON.stringify({ scriptFormats: 'es', dts: false, ...options })});`]
			: [path.join(root, 'packages/cli/src/index.ts'), 'build', '--script-formats', 'es', '--no-dts', ...args];
		return execute(process.execPath, ['--import', tsx, ...command], {
			cwd: directory,
			env: { ...process.env, TSX_TSCONFIG_PATH: path.join(root, 'tsconfig.json') }
		});
	};
	const configure = async (buildOptions: Record<string, any> = {}) => {
		await fs.writeFile(path.join(directory, 'z.build.config.ts'), `
import fs from 'node:fs';
import shared from ${JSON.stringify(path.join(root, 'packages/builder/shared.config.ts'))};
const custom=${JSON.stringify(buildOptions)};
export default {
	...shared,
	build:{...shared.build,...custom,rolldownOptions:{...shared.build.rolldownOptions,...custom.rolldownOptions}},
	plugins:[{name:'observe-options',configResolved(config){
		const command=JSON.parse(decodeURIComponent(process.env.BUILD_OPTIONS));
		fs.writeFileSync(command.packageDir+'/observed.json',JSON.stringify({
			minify:config.build.minify,cssMinify:config.build.cssMinify,output:config.build.rolldownOptions.output,
			command
		}));
	}}]
};`);
	};
	const read = (file = 'index.js') => fs.readFile(path.join(directory, 'dist', file), 'utf8');
	const workspace = async () => {
		await fs.outputJson(path.join(directory, 'package.json'), {
			private: true, type: 'module',
			scripts: {
				cli: `node --import "${tsx}" "${path.join(root, 'packages/cli/src/index.ts')}"`,
				build: 'npm run cli -- build --script-formats es,iife --no-dts --minify-package \'*\' --eval-package beta'
			}
		});
		for (const folder of ['index', 'alpha', 'beta', 'custom']) {
			const packageDir = path.join(directory, 'packages', folder);
			await fs.outputJson(path.join(packageDir, 'package.json'), {
				name: `@test/builder${folder === 'index' ? '' : `-${folder}`}`, version: '1.0.0', type: 'module',
				dependencies: folder === 'beta' ? { '@test/builder-alpha': '1.0.0' } : {},
				scripts: folder === 'custom'
					? { build: `node -e "require('node:fs').writeFileSync('arguments.json',JSON.stringify(process.argv.slice(1)))"` }
					: {}
			});
			await fs.outputFile(path.join(packageDir, 'src/index.ts'), `export function read(longParameterName=1){
	const unnecessaryValue=123;
	return longParameterName+1;
}`);
		}
	};
	const observedPackage = (folder: string) => fs.readJson(path.join(directory, 'packages', folder, 'observed.json'));
	const packageArtifact = (folder: string, file: string) => path.join(directory, 'packages', folder, 'dist', file);

	beforeEach(async () => {
		directory = await fs.mkdtemp(path.join(os.tmpdir(), 'builder-options-'));
		await fs.outputJson(path.join(directory, 'package.json'), { name: '@test/builder', version: '1.0.0', type: 'module' });
		await fs.outputFile(path.join(directory, 'src/index.ts'), `import './style.css';
const longDescriptiveContent=${JSON.stringify('compressible content '.repeat(4000))};
class UnusedClass { constructor(){this.message='UNUSED_TREE_SHAKING_MARKER';} }
export const unused=/*#__PURE__*/new UnusedClass();
export function content(){return longDescriptiveContent;}
export function read(longParameterName=1){
	const unnecessaryValue=123;
	return longDescriptiveContent.length+longParameterName+1;
}`);
		await fs.outputFile(path.join(directory, 'src/style.css'), '.example { color: red; padding: 0px 0px 0px 0px; }');
		await configure();
	});

	afterEach(async () => {
		await fs.remove(directory);
	});

	it.each([
		[false, false, []],
		[true, false, ['--minify-package', '*']],
		[false, true, ['--eval-package', '*']],
		[true, true, ['--minify-package', '*', '--eval-package', '*']]
	])('CLI supports independent minify=%s and eval=%s', async (minify, evalEnabled, args) => {
		await invoke(args as string[]);
		const observed = await fs.readJson(path.join(directory, 'observed.json'));
		expect(!!observed.minify).toBe(minify);
		expect(observed.command.minify).toBe(minify);
		expect(observed.command.eval).toBe(evalEnabled);
		expect((await read()).includes('longParameterName')).toBe(!minify);
		expect(await read()).toMatch(/[@#]__PURE__/u);
		expect(await fs.pathExists(path.join(directory, 'dist/eval/index.js'))).toBe(evalEnabled);
		expect((await read('index.style.css')).startsWith('.example{color:red;padding:0}')).toBe(true);
		const ordinary = await importFile(pathToFileURL(path.join(directory, 'dist/index.js')).href);
		expect(ordinary.read()).toBe(84002);
		if (evalEnabled) {
			const packed = await importFile(pathToFileURL(path.join(directory, 'dist/eval/index.js')).href);
			expect(packed.read()).toBe(ordinary.read());
			expect(packed.content()).toBe(ordinary.content());
		}
	}, 30000);

	it('keeps custom minification when CLI flags are omitted', async () => {
		await configure({ minify: true });
		await invoke();
		expect((await fs.readJson(path.join(directory, 'observed.json'))).minify).toBe('oxc');
		expect(await read()).not.toContain('unnecessaryValue');
		expect(await fs.pathExists(path.join(directory, 'dist/eval'))).toBe(false);
	}, 30000);

	it('delegates implicit defaults in custom configurations to Vite', async () => {
		const config = path.join(directory, 'z.build.config.ts');
		const source = (await fs.readFile(config, 'utf8')).replace(
			'build:{...shared.build,', 'build:{...shared.build,minify:undefined,cssMinify:undefined,'
		);
		await fs.writeFile(config, source);
		await invoke();
		const observed = await fs.readJson(path.join(directory, 'observed.json'));
		expect(observed.minify).toBe('oxc');
		expect(observed.cssMinify).toBe(true);
	}, 30000);

	it('a non-matching API selector disables custom build.minify', async () => {
		await configure({ minify: true });
		await invoke([], { minifyPackage: '@test/other', evalPackage: '@test/other' });
		const observed = await fs.readJson(path.join(directory, 'observed.json'));
		expect(observed.minify).toBe(false);
		expect(observed.cssMinify).toBe(false);
		expect(observed.command.minify).toBe(false);
		expect((await read()).includes('longParameterName')).toBe(true);
		expect(await fs.pathExists(path.join(directory, 'dist/eval'))).toBe(false);
	}, 30000);

	it.each([true, false])('preserves advanced output and CSS settings with API minify=%s', async (minify) => {
		const settings = { minify: !minify, comments: false };
		const output = minify ? [settings] : settings;
		await configure({ minify: !minify, cssMinify: true, rolldownOptions: { output } });
		await invoke([], { minifyPackage: minify ? '*' : '@test/other' });
		const observed = await fs.readJson(path.join(directory, 'observed.json'));
		expect(observed.minify).toBe(minify ? 'oxc' : false);
		expect(observed.cssMinify).toBe(true);
		expect(observed.output).toMatchObject(output);
		expect((await read()).includes('longParameterName')).toBe(minify);
	}, 30000);

	it('minifies JS, retains optimization annotations and allows downstream ES tree-shaking', async () => {
		await invoke(['--script-formats', 'es,iife']);
		const baseline = await read();
		const baselineIIFE = await read('index.iife.js');
		const css = await read('index.style.css');
		await invoke(['--script-formats', 'es,iife', '--minify-package', '@test/builder']);
		const minified = await read();
		const minifiedIIFE = await read('index.iife.js');
		expect(Buffer.byteLength(minified)).toBeLessThan(Buffer.byteLength(baseline));
		expect(Buffer.byteLength(minifiedIIFE)).toBeLessThan(Buffer.byteLength(baselineIIFE));
		const sandbox = {} as { Builder: { read: () => number } };
		runInNewContext(minifiedIIFE, sandbox);
		expect(sandbox.Builder.read()).toBe(84002);
		expect(minified).toMatch(/[@#]__PURE__/u);
		expect(minified).not.toContain('unnecessaryValue');
		expect(minified.includes('longParameterName')).toBe(false);
		expect(await read('index.style.css')).toBe(css);
		await fs.writeFile(path.join(directory, 'consumer.js'), 'export {read} from \'./dist/index.js\';');
		const result = await build({
			configFile: false, logLevel: 'silent',
			build: { write: false, minify: true, lib: { entry: path.join(directory, 'consumer.js'), formats: ['es'] } }
		}) as Rolldown.RolldownOutput[];
		const code = result[0].output.find(i => i.type === 'chunk')!.code;
		expect(code).not.toContain('UNUSED_TREE_SHAKING_MARKER');
	}, 30000);

	it('matches trimmed folder and full names independently for every package', async () => {
		await workspace();
		await configure({ minify: true });
		await invoke([], { minifyPackage: ' alpha, @test/builder ', evalPackage: ' @test/builder-beta, beta ' });
		for (const folder of ['index', 'alpha', 'beta']) {
			const observed = await observedPackage(folder);
			expect(observed.minify).toBe(folder === 'beta' ? false : 'oxc');
			expect(observed.command.minify).toBe(folder !== 'beta');
			expect(observed.command.eval).toBe(folder === 'beta');
			expect(await fs.pathExists(packageArtifact(folder, 'eval/index.js'))).toBe(folder === 'beta');
		}
	}, 30000);

	it('wildcards match the selected package without expanding the build scope', async () => {
		await workspace();
		await invoke(['--package-name', 'index', '--minify-package', '*', '--eval-package', '*']);
		const observed = await observedPackage('index');
		expect(observed.command.minify).toBe(true);
		expect(observed.command.eval).toBe(true);
		expect(await fs.pathExists(packageArtifact('index', 'eval/index.js'))).toBe(true);
		expect(await fs.pathExists(packageArtifact('alpha', 'index.js'))).toBe(false);
		expect(await fs.pathExists(packageArtifact('beta', 'index.js'))).toBe(false);
		expect(await fs.pathExists(path.join(directory, 'packages/custom/arguments.json'))).toBe(false);
	}, 30000);

	it('matches automatically built dependencies separately from the requested package', async () => {
		await workspace();
		await configure({ minify: true });
		await invoke(['--package-name', 'beta', '--minify-package', 'beta', '--eval-package', 'alpha']);
		const dependency = await observedPackage('alpha');
		const requested = await observedPackage('beta');
		expect(dependency.minify).toBe(false);
		expect(dependency.command.eval).toBe(true);
		expect(requested.minify).toBe('oxc');
		expect(requested.command.eval).toBe(false);
		expect(await fs.pathExists(packageArtifact('alpha', 'eval/index.js'))).toBe(true);
		expect(await fs.pathExists(packageArtifact('beta', 'eval/index.js'))).toBe(false);
		expect(await fs.pathExists(packageArtifact('index', 'index.js'))).toBe(false);
	}, 30000);

	it('uses build script selectors with the per-package npm invocation used by release', async () => {
		await workspace();
		const { stdout } = await execute('npm', ['run', 'build', '--', '--package-name', '@test/builder-beta'], {
			cwd: directory,
			env: { ...process.env, TSX_TSCONFIG_PATH: path.join(root, 'tsconfig.json') }
		});
		expect((await observedPackage('alpha')).command.minify).toBe(true);
		expect((await observedPackage('alpha')).command.eval).toBe(false);
		expect((await observedPackage('beta')).command.minify).toBe(true);
		expect((await observedPackage('beta')).command.eval).toBe(true);
		const sandbox = { atob, Uint8Array } as any;
		runInNewContext(await fs.readFile(packageArtifact('beta', 'eval/index.iife.js'), 'utf8'), sandbox);
		expect(sandbox.BuilderBeta.read()).toBe(2);
		expect((await importFile(pathToFileURL(packageArtifact('beta', 'eval/index.js')).href)).read()).toBe(2);
		expect(await fs.pathExists(packageArtifact('alpha', 'eval'))).toBe(false);
		expect(await fs.pathExists(packageArtifact('index', 'index.js'))).toBe(false);
		expect(stdout).toContain('体积增加，按用户选择仍生成');
	}, 30000);

	it('leaves custom build scripts in control and reports selected compression', async () => {
		await workspace();
		const { stdout } = await invoke(['--package-name', 'custom', '--minify-package', '*', '--eval-package', 'custom']);
		expect(await fs.readJson(path.join(directory, 'packages/custom/arguments.json'))).toEqual([]);
		expect(stdout).toContain('@test/builder-custom: 压缩由自定义 scripts.build 控制');
		expect(await fs.pathExists(packageArtifact('custom', 'eval'))).toBe(false);
	}, 30000);
});
