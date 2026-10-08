// @vitest-environment node
import * as path from 'node:path';
import * as os from 'node:os';
import { gunzipSync } from 'node:zlib';
import { pathToFileURL } from 'node:url';
import { compileFunction, constants, runInNewContext } from 'node:vm';
import fs from 'fs-extra';
import { Logger } from '@deot/dev-shared';
import { build, parseSync } from 'vite';
import type { Rolldown } from 'vite';
import * as Eval from '../src/eval';

vi.mock('vite', async (importOriginal) => {
	const original = await importOriginal<typeof import('vite')>();
	return { ...original, build: vi.fn(original.build) };
});

const padding = `const text=${JSON.stringify('压缩🙂'.repeat(12000))};`;
const chunk = (code: string, fileName = 'index.js', imports: string[] = [], dynamicImports: string[] = []) => ({
	type: 'chunk', fileName, code, imports, dynamicImports
}) as Rolldown.OutputChunk;
const output = (...items: Array<Rolldown.OutputChunk | Partial<Rolldown.OutputAsset>>) => [{ output: items }] as Rolldown.RolldownOutput[];
const importFile = compileFunction('return import(file)', ['file'], {
	importModuleDynamically: constants.USE_MAIN_CONTEXT_DEFAULT_LOADER
}) as (file: string) => Promise<any>;
const unpack = (code: string, format = 'es') => {
	const pattern = format === 'es' ? /eval\(__eval\d+\(("[^"]+")\)\)/u : /__EvalDecoder\.decode\(("[^"]+")\)/u;
	return gunzipSync(Buffer.from(JSON.parse(code.match(pattern)![1]), 'base64')).toString();
};

describe('eval artifacts', () => {
	let directory: string;
	let logs: ReturnType<typeof vi.spyOn>;
	const run = (outputs: Rolldown.RolldownOutput[], format = 'es', enabled = true, filepath = 'index.ts') => Eval.run(outputs, {
		enabled, format, filepath, outDir: directory
	});
	const load = (filename = 'index.js') => importFile(pathToFileURL(path.join(directory, 'eval', filename)).href);
	const emitted = () => fs.pathExists(path.join(directory, 'eval'));

	beforeEach(async () => {
		directory = await fs.mkdtemp(path.join(os.tmpdir(), 'builder-eval-'));
		await fs.outputJson(path.join(directory, 'package.json'), { type: 'module' });
		logs = vi.spyOn(Logger, 'info').mockImplementation(() => {});
	});

	afterEach(async () => {
		vi.restoreAllMocks();
		compileFunction('delete globalThis.__evalInitialization; delete globalThis.__evalNames;')();
		await fs.remove(directory);
	});

	it('does no parsing, decoder build or writing when disabled', async () => {
		vi.mocked(build).mockClear();
		await run(output(chunk('invalid JavaScript !')), 'es', false);
		expect(await emitted()).toBe(false);
		expect(build).not.toHaveBeenCalled();
		expect(logs).not.toHaveBeenCalled();
	});

	it('preserves Unicode, stable exports, resources and original outputs without consumer dependencies', async () => {
		const code = `${padding}\nexport const length=text.length; export function read(){return text;}
export default class Example { static read(){return text;} }`;
		const outputs = output(chunk(code), {
			type: 'asset', fileName: 'style.css', source: '.a{color:red}', names: [], originalFileNames: []
		});
		const original = structuredClone(outputs);
		await run(outputs, 'es', true, 'index.m.ts');
		expect(outputs).toEqual(original);
		const module = await load();
		expect(module.read()).toBe('压缩🙂'.repeat(12000));
		expect(module.length).toBe(48000);
		expect(module.default.read()).toBe(module.read());
		expect(await fs.readFile(path.join(directory, 'eval/index.m.style.css'), 'utf8')).toBe('.a{color:red}');
		const files = await fs.readdir(path.join(directory, 'eval/chunks'));
		expect(files).toHaveLength(1);
		const runtime = await fs.readFile(path.join(directory, 'eval/chunks', files[0]), 'utf8');
		expect(runtime).not.toMatch(/from\s*["'](?:fflate|jspdf)/u);
		expect(await fs.pathExists(path.join(directory, 'node_modules'))).toBe(false);
	});

	it('keeps static and dynamic imports in one graph with a single module initialization', async () => {
		const outputs = output(
			chunk(`import { helper } from './chunks/dependency.js'; ${padding}
export function read(){return helper(text.length);}
export async function lazy(){return (await import('./chunks/dependency.js')).helper(1);}
export function initialized(){return globalThis.__evalInitialization;}`,
			'index.js', ['chunks/dependency.js'], ['chunks/dependency.js']),
			chunk(`globalThis.__evalInitialization=(globalThis.__evalInitialization||0)+1;
${padding} export function helper(value){return value+text.length;}`, 'chunks/dependency.js')
		);
		await run(outputs);
		const module = await load();
		expect(module.read()).toBe(96000);
		expect(await module.lazy()).toBe(48001);
		expect(module.initialized()).toBe(1);
		expect((await fs.readdir(path.join(directory, 'eval/chunks'))).filter(i => i.startsWith('eval-runtime-'))).toHaveLength(1);
	});

	it('copies unsupported mutable chunks alongside packed chunks, preserving live imported values', async () => {
		const dependency = '/*! @license PLAIN_COMMENT */ export let count=0; export function increment(){count++;}';
		await run(output(
			chunk(`import { count, increment } from './counter.js'; ${padding}
export function read(){increment(); return count+text.length;}`, 'index.js', ['counter.js']),
			chunk(dependency, 'counter.js')
		));
		const copied = await fs.readFile(path.join(directory, 'eval/counter.js'), 'utf8');
		expect(copied).not.toContain('PLAIN_COMMENT');
		expect(parseSync('counter.js', copied).comments).toHaveLength(0);
		expect((await load()).read()).toBe(48001);
		expect((await load()).read()).toBe(48002);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('mutable or non-local export'));
	});

	it.each(['es', 'iife', 'umd'])('fully minifies %s eval copies and removes all JS comments', async (format) => {
		const body = `/* ORDINARY_COMMENT */ /*! @license LICENSE_COMMENT */ /** @preserve PRESERVE_COMMENT */
class Box { constructor(){this.value=2;} }
const value=/*#__PURE__*/new Box();
const text="/* string content */ // string content";
/*#__NO_SIDE_EFFECTS__*/function read(longParameterName=1){
	// LINE_COMMENT
	const unused='UNUSED_BODY_MARKER';
	const verboseIntermediateValue=longParameterName;
	return text+value.value+verboseIntermediateValue;
}`;
		const code = format === 'es' ? `${body} export {value,read};` : `var Example=(()=>{${body} return {value,read};})();`;
		const outputs = output(chunk(code));
		const original = structuredClone(outputs);
		await run(outputs, format);
		const packed = await fs.readFile(path.join(directory, 'eval/index.js'), 'utf8');
		const decoded = unpack(packed, format);
		expect(outputs).toEqual(original);
		expect(parseSync('payload.js', decoded, { sourceType: 'script' }).comments).toHaveLength(0);
		expect(parseSync('packed.js', packed, { sourceType: format === 'es' ? 'module' : 'script' }).comments).toHaveLength(0);
		expect(decoded).not.toMatch(/COMMENT|UNUSED_BODY_MARKER|longParameterName|verboseIntermediateValue/u);
		expect(Buffer.byteLength(decoded)).toBeLessThan(Buffer.byteLength(code));
		if (format === 'es') {
			const module = await load();
			expect(module.value.value).toBe(2);
			expect(module.read()).toBe('/* string content */ // string content21');
		} else {
			const sandbox = { atob, Uint8Array } as any;
			runInNewContext(packed, sandbox);
			expect(sandbox.Example.value.value).toBe(2);
			expect(sandbox.Example.read()).toBe('/* string content */ // string content21');
		}
	});

	it('preserves imported bindings named like built-in globals during minification', async () => {
		await run(output(
			chunk('import {undefined,NaN,Infinity} from "./dependency.js"; export function read(){return [undefined,NaN,Infinity];}',
				'index.js', ['dependency.js']),
			chunk('const value=7; export {value as undefined,value as NaN,value as Infinity};', 'dependency.js')
		));
		expect((await load()).read()).toEqual([7, 7, 7]);
	});

	it('avoids capture of every referenced helper name, including typeof before initialization', async () => {
		await run(output(chunk(`${padding}
globalThis.__evalNames=[typeof __eval0,typeof __eval1,typeof __eval2];
export function names(){return [typeof __eval0,typeof __eval1,typeof __eval2,text.length];}
export function initialNames(){return globalThis.__evalNames;}`)));
		const module = await load();
		expect(module.initialNames()).toEqual(['undefined', 'undefined', 'undefined']);
		expect(module.names()).toEqual(['undefined', 'undefined', 'undefined', 48000]);
	});

	it.each([
		['outside module that could point back to the ordinary entry', 'import \'./outside.js\';', []],
		['bare external module', 'import \'external\';', ['external']],
		['unresolved dynamic import', 'export function load(name){return import(name);}', []],
		['missing dynamic chunk', 'export function load(){return import(\'./missing.js\');}', []]
	])('skips the whole graph with %s', async (_reason, code, imports) => {
		await run(output(chunk(`${padding}${code}`, 'index.js', imports as string[]), chunk(padding, 'good.js')));
		expect(await emitted()).toBe(false);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('unverifiable module dependencies'));
	});

	it('skips circular chunks', async () => {
		await run(output(
			chunk(`import './b.js'; ${padding}`, 'index.js', ['b.js']),
			chunk(`import './index.js'; ${padding}`, 'b.js', ['index.js'])
		));
		expect(await emitted()).toBe(false);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('circular dependency'));
	});

	it.each([
		['mutable or non-local export', 'export let value=0; value++;'],
		['mutable or non-local export', 'export let value=0; ({value}={value:1});'],
		['mutable or non-local export', 'export let value=0; for(value of [1]){}'],
		['mutable or non-local export', 'export function value(){} value=()=>1;'],
		['top-level await', 'await Promise.resolve();'],
		['import.meta', 'export const url=import.meta.url;'],
		['direct eval', 'eval("1");'],
		['anonymous default declaration', 'export default function(){}']
	])('keeps unsupported code: %s (%s)', async (reason, code) => {
		await run(output(chunk(`${padding}${code}`)));
		expect(await emitted()).toBe(false);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining(reason));
	});

	it('preserves default expression evaluation order and unusual export names', async () => {
		await run(output(chunk(`${padding} let value=1; export default value; value=2;
const safe=3; export {safe as "__proto__",safe as "with space"}; export function read(){return value+text.length;}`)));
		const module = await load();
		expect(module.default).toBe(1);
		expect(module.__proto__).toBe(3);
		expect(module['with space']).toBe(3);
		expect(module.read()).toBe(48002);
		expect((await fs.readFile(path.join(directory, 'eval/index.js'), 'utf8')).includes(' as read}')).toBe(true);
	});

	it('retains imported re-exports without taking a mutable snapshot', async () => {
		await run(output(
			chunk(`export {count,increment} from './counter.js'; ${padding} export function length(){return text.length;}`,
				'index.js', ['counter.js']),
			chunk('export let count=0; export function increment(){count++;}', 'counter.js')
		));
		const module = await load();
		module.increment();
		expect(module.count).toBe(1);
		expect(module.length()).toBe(48000);
	});

	it.each(['iife', 'umd'] as const)('executes %s in the browser global environment with an embedded decoder', async (format) => {
		const entry = path.join(directory, 'source.js');
		await fs.writeFile(entry, `${padding} export function read(){return text;}`);
		const result = await build({
			configFile: false, logLevel: 'silent',
			build: { write: false, minify: false, lib: { entry, name: 'Example', formats: [format] } }
		}) as Rolldown.RolldownOutput[];
		await run(result, format);
		const artifact = result[0].output.find(i => i.type === 'chunk')!;
		const packed = await fs.readFile(path.join(directory, 'eval', artifact.fileName), 'utf8');
		const sandbox = { atob, Uint8Array, TextDecoder, TextEncoder } as any;
		runInNewContext(packed, sandbox);
		expect(sandbox.Example.read()).toBe('压缩🙂'.repeat(12000));
		expect(packed).not.toMatch(/from\s*["'](?:fflate|jspdf)/u);
	});

	it.each(['iife', 'umd'])('skips top-level strict %s to protect global var exports', async (format) => {
		await run(output(chunk(`'use strict'; var Example=(()=>{${padding} return {text};})();`)), format);
		expect(await emitted()).toBe(false);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('top-level strict mode'));
	});

	it('skips CJS', async () => {
		await run(output(chunk(`${padding} exports.text=text;`)), 'cjs');
		expect(await emitted()).toBe(false);
	});

	it.each([
		['tiny', 1],
		['decoder overhead', 'a'.repeat(2000)]
	])('packs small chunks even when the full graph grows (%s)', async (_case, value) => {
		const code = `export const value=${JSON.stringify(value)};`;
		await run(output(chunk(code)));
		expect(await emitted()).toBe(true);
		expect((await load()).value).toBe(value);
		const packed = await fs.readFile(path.join(directory, 'eval/index.js'));
		const [runtimeFile] = await fs.readdir(path.join(directory, 'eval/chunks'));
		const runtime = await fs.readFile(path.join(directory, 'eval/chunks', runtimeFile));
		expect(packed.length + runtime.length).toBeGreaterThan(Buffer.byteLength(code));
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('体积增加，按用户选择仍生成'));
	});

	it('does not count a large inline sourcemap as compression savings', async () => {
		const code = 'export const value=1;\n';
		const mapping = Buffer.from(JSON.stringify({
			version: 3, sources: ['source.ts'], sourcesContent: ['x'.repeat(100000)], names: [], mappings: ''
		})).toString('base64');
		const marker = '//# source' + 'MappingURL=';
		await run(output(chunk(`${code}${marker}data:application/json;base64,${mapping}`)));
		expect((await load()).value).toBe(1);
		expect(logs).toHaveBeenCalledWith(expect.stringContaining(`${Buffer.byteLength(code)} → `));
		expect(logs).toHaveBeenCalledWith(expect.stringContaining('体积增加，按用户选择仍生成'));
		const packed = await fs.readFile(path.join(directory, 'eval/index.js'), 'utf8');
		expect(packed).not.toContain('sourceMappingURL');
		expect(unpack(packed)).not.toContain('sourceMappingURL');
	});

	it('removes sourcemaps from packed and copied code without modifying ordinary artifacts', async () => {
		const outputs = output(
			chunk(`import {value} from './plain.js'; ${padding} export function read(){return value+text.length;}
//# sourceMappingURL=index.js.map`, 'index.js', ['plain.js']),
			chunk('export let value=1; value++;\n//# sourceMappingURL=plain.js.map', 'plain.js'),
			{ type: 'asset', fileName: 'index.js.map', source: '{}', names: [], originalFileNames: [] }
		);
		const original = structuredClone(outputs);
		await run(outputs);
		expect(await fs.pathExists(path.join(directory, 'eval/index.js.map'))).toBe(false);
		expect(await fs.readFile(path.join(directory, 'eval/plain.js'), 'utf8')).not.toContain('sourceMappingURL');
		expect((await load()).read()).toBe(48002);
		expect(outputs).toEqual(original);
	});
});
