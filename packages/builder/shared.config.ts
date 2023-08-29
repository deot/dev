import { createRequire } from "node:module";
import * as path from 'node:path';
import { defineConfig } from 'vite';
import atImport from "postcss-import";
import atUrl from "postcss-url";
import flexBugs from "postcss-flexbugs-fixes";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";
import type { UserConfig } from "vite";

const cwd = process.cwd();

// options
const buildOptions = JSON.parse(decodeURIComponent(process.env.BUILD_OPTIONS || '{}'));

const { 
	format, 
	workspace,
	files = [], 
	packageName, 
	packageSourceDir, 
	packageOptions = {} 
} = buildOptions;

const external = /(cjs|es)/.test(format)
	? [
		/^node:/,
		/^[a-zA-Z@]/,
		...Object
			.keys({ 
				...packageOptions.dependencies, 
				...packageOptions.peerDependencies 
			})
			.map(i => new RegExp(`^${i}$`))
	]
	: [];

// alias
const replacement = (name: string) => path.resolve(cwd, `./packages/${name}`);
const { name } = createRequire(cwd)(path.resolve(cwd, workspace ? `${workspace}/index` : '', 'package.json'));

const alias = workspace && !(/(cjs|es)/.test(format)) 
	? [
		{
			find: new RegExp(`^${name}$`),
			replacement: replacement('index')
		},
		{

			find: new RegExp(`^${name}-(.*?)$`),
			replacement: replacement('$1')
		}
	]
	: [];


export default defineConfig({
	plugins: [],
	logLevel: 'silent',
	css: {
		postcss: {
			plugins: [
				atImport(),
				atUrl(),
				flexBugs(),
				cssnano(),
				autoprefixer({ remove: false })
			]
		}
	},
	resolve: { alias },
	build: {
		minify: false,
		target: 'esnext',
		lib: {
			entry: files.map((file: string) => path.resolve(packageSourceDir, file)),
			formats: [format],
			name: packageName.replace(/(_|-|^|.*\/)([^-_\/@])/g, (_match: any, _$1: any, $2: string) => $2.toUpperCase())
		},
		rollupOptions: { external }
	}
}) as UserConfig;
