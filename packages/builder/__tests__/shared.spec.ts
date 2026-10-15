// @vitest-environment node
import * as path from 'node:path';
import * as os from 'node:os';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import fs from 'fs-extra';

const root = path.resolve(__dirname, '../../..');
const execute = promisify(execFile);
const require$ = createRequire(import.meta.url);
const tsx = require$.resolve('tsx');
const vite = pathToFileURL(require$.resolve('vite')).href;
const shared = pathToFileURL(path.join(root, 'packages/builder/shared.config.ts')).href;
const regex = (value: { source: string; flags: string }) => new RegExp(value.source, value.flags);

describe('shared build config', () => {
	let directory: string;
	const load = async (options: Record<string, unknown> = {}, inspect = 'const {css,...result}=config;') => {
		const command = {
			format: 'es',
			files: ['index.ts', 'index.extra.ts'],
			packageName: '@test/shared-config',
			packageSourceDir: path.join(directory, 'src'),
			...options
		};
		const { stdout } = await execute(process.execPath, ['--import', tsx, '--input-type=module', '-e', `
import {mergeConfig} from ${JSON.stringify(vite)};
import config from ${JSON.stringify(shared)};
${inspect}
console.log(JSON.stringify(result,(_key,value)=>value instanceof RegExp?{source:value.source,flags:value.flags}:value));`], {
			cwd: directory,
			env: {
				...process.env,
				NODE_ENV: 'development',
				TSX_TSCONFIG_PATH: path.join(root, 'tsconfig.json'),
				BUILD_OPTIONS: encodeURIComponent(JSON.stringify(command))
			}
		});
		return JSON.parse(stdout);
	};

	beforeEach(async () => {
		directory = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), 'builder-shared-')));
		await fs.outputJson(path.join(directory, 'package.json'), { name: '@test/project', type: 'module' });
	});

	afterEach(async () => {
		await fs.remove(directory);
	});

	it.each(['es', 'cjs'])('preserves ordinary %s defaults and dependency matching', async (format) => {
		const config = await load({
			format,
			iifeExternal: 'iife-only',
			umdExternal: 'umd-only',
			globals: 'vue:Vue',
			packageOptions: { dependencies: { dependency: '1' }, peerDependencies: { '@scope/peer': '1' } }
		});
		expect(config).toMatchObject({
			define: {},
			logLevel: 'silent',
			plugins: [],
			resolve: { alias: [] },
			build: {
				minify: false,
				cssMinify: false,
				target: 'esnext',
				lib: {
					cssFileName: 'style',
					entry: ['index.ts', 'index.extra.ts'].map(file => path.join(directory, 'src', file)),
					formats: [format],
					name: 'SharedConfig'
				},
				rolldownOptions: { output: { exports: 'named', comments: { annotation: true }, globals: {} } }
			}
		});
		const patterns = config.build.rolldownOptions.external.map(regex) as RegExp[];
		expect(patterns.map(pattern => pattern.source)).toEqual([
			'^node:', '^[a-zA-Z@]', '^dependency$', '^@scope\\/peer$'
		]);
		for (const id of ['node:fs', 'dependency', '@scope/peer', '@scope/peer/subpath', 'unlisted/runtime']) {
			expect(patterns.some(pattern => pattern.test(id))).toBe(true);
		}
		for (const id of ['./relative.js', '../parent.js', '/absolute.js']) {
			expect(patterns.some(pattern => pattern.test(id))).toBe(false);
		}
	});

	it.each(['iife', 'umd'])('uses only the %s external list and preserves exact matching', async (format) => {
		const config = await load({
			format,
			iifeExternal: 'other-format-only',
			umdExternal: 'other-format-only',
			[`${format}External`]: ' vue , @scope/library , vue , , '
		});
		const patterns = config.build.rolldownOptions.external.map(regex) as RegExp[];
		expect(patterns).toHaveLength(3);
		for (const id of ['vue', '@scope/library']) {
			expect(patterns.some(pattern => pattern.test(id))).toBe(true);
		}
		for (const id of ['vue/runtime', '@scope/library/subpath', 'other-format-only']) {
			expect(patterns.some(pattern => pattern.test(id))).toBe(false);
		}
		expect(config.build.rolldownOptions.output.globals).toEqual({ 'vue': 'Vue', '@scope/library': 'Library' });
		expect(config.build.lib.formats).toEqual([format]);
		expect(config.define).toEqual({ 'process.env.NODE_ENV': JSON.stringify('development') });
	});

	it.each(['iife', 'umd'])('normalizes explicit globals for %s without merging inferred names', async (format) => {
		const config = await load({
			format,
			[`${format}External`]: 'unused,vue',
			globals: ' vue : OldVue , vue : Vue , react : , @scope/my-library : Library , : Missing , '
		});
		expect(config.build.rolldownOptions.output.globals).toEqual({
			'vue': 'Vue', 'react': 'React', '@scope/my-library': 'Library'
		});
	});

	it.each(['', ' , \t, '])('infers globals when the normalized explicit list is %j', async (globals) => {
		const config = await load({ format: 'iife', iifeExternal: ' vue , react ', globals });
		expect(config.build.rolldownOptions.output.globals).toEqual({ vue: 'Vue', react: 'React' });
	});

	it.each(['iife', 'umd'])('keeps empty %s external lists and globals empty', async (format) => {
		const config = await load({ format, [`${format}External`]: ' , , ' });
		expect(config.build.rolldownOptions.external).toEqual([]);
		expect(config.build.rolldownOptions.output.globals).toEqual({});
	});

	it('leaves bundle dependency and environment policies to the bundle executor', async () => {
		const config = await load({ variant: 'bundle', bundleExternal: 'vue', iifeExternal: 'vue', globals: 'vue:Vue' });
		expect(config.build.rolldownOptions.external).toBeUndefined();
		expect(config.build.rolldownOptions.output.globals).toEqual({});
		expect(config.define).toEqual({});
		expect(config.plugins).toEqual([]);
	});

	it.each([
		['es', 'packages', 'standard'],
		['cjs', 'packages', 'standard'],
		['es', 'packages', 'bundle'],
		['iife', '', 'standard'],
		['umd', '', 'standard']
	])('avoids reading root manifests for %s with workspace=%j and variant=%s', async (format, workspace, variant) => {
		await fs.remove(path.join(directory, 'package.json'));
		const config = await load({ format, workspace, variant });
		expect(config.resolve.alias).toEqual([]);
	});

	it.each([
		['iife', 'packages'],
		['umd', 'modules']
	])('resolves %s workspace aliases with literal package names in %s', async (format, workspace) => {
		await fs.outputJson(path.join(directory, workspace, 'index/package.json'), { name: '@scope/my.pkg' });
		const config = await load({ format, workspace });
		const aliases = config.resolve.alias as Array<{ find: { source: string; flags: string }; replacement: string }>;
		const resolve = (id: string) => {
			const alias = aliases.find(item => regex(item.find).test(id));
			return alias ? id.replace(regex(alias.find), alias.replacement) : id;
		};
		expect(aliases).toHaveLength(2);
		expect(aliases[0].replacement).toBe(path.join(directory, workspace, 'index'));
		expect(aliases[1].replacement).toBe(path.join(directory, workspace, '$1'));
		expect(resolve('@scope/my.pkg')).toBe(path.join(directory, workspace, 'index'));
		expect(resolve('@scope/my.pkg-client')).toBe(path.join(directory, workspace, 'client'));
		expect(resolve('@scope/myXpkg')).toBe('@scope/myXpkg');
		expect(resolve('@scope/myXpkg-client')).toBe('@scope/myXpkg-client');
	});

	it('supports project merging, plugin extension and direct external callback replacement', async () => {
		const observed = await load({}, `
const originalExternal=config.build.rolldownOptions.external;
const merged=mergeConfig(config,{
	define:{'process.env.NODE_ENV':JSON.stringify('production')},
	plugins:[{name:'project-plugin'}],
	build:{sourcemap:true,rolldownOptions:{output:{intro:'/* project */',chunkFileNames:'project/[name]-[hash].js'}}}
});
merged.plugins=[...merged.plugins,{name:'appended-plugin'}];
merged.build={...merged.build,minify:true,rolldownOptions:{...merged.build.rolldownOptions,external:()=>false}};
const {css,...result}=merged;
result.hasPostcss=merged.css.postcss.plugins.length===5;
result.externalIsCallback=typeof merged.build.rolldownOptions.external==='function';
result.externalValue=merged.build.rolldownOptions.external('vue');
result.originalExternalUnchanged=config.build.rolldownOptions.external===originalExternal;`);
		expect(observed).toMatchObject({
			define: { 'process.env.NODE_ENV': JSON.stringify('production') },
			plugins: [{ name: 'project-plugin' }, { name: 'appended-plugin' }],
			build: {
				minify: true,
				cssMinify: false,
				sourcemap: true,
				target: 'esnext',
				lib: { formats: ['es'], name: 'SharedConfig' },
				rolldownOptions: {
					output: { exports: 'named', comments: { annotation: true }, intro: '/* project */', chunkFileNames: 'project/[name]-[hash].js' }
				}
			},
			hasPostcss: true,
			externalIsCallback: true,
			externalValue: false,
			originalExternalUnchanged: true
		});
	});
});
