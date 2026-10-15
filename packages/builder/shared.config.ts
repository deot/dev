import { createRequire } from 'node:module';
import * as path from 'node:path';
import { defineConfig } from 'vite';
import atImport from 'postcss-import';
import atUrl from 'postcss-url';
import flexBugs from 'postcss-flexbugs-fixes';
import cssnano from 'cssnano';
import autoprefixer from 'autoprefixer';
import type { Alias, LibraryFormats, UserConfig } from 'vite';

interface BuildOptions {
	format: LibraryFormats;
	variant?: 'standard' | 'bundle';
	iifeExternal?: string;
	umdExternal?: string;
	globals?: string;
	workspace?: string;
	files?: string[];
	packageName: string;
	packageSourceDir: string;
	packageOptions?: {
		dependencies?: Record<string, string>;
		peerDependencies?: Record<string, string>;
	};
}

const parseList = (value: string) => value.split(',').map(item => item.trim()).filter(Boolean);
const getGlobalName = (name: string) => {
	return name.replace(/(_|-|^|.*\/)([^-_\/@])/g, (_match: string, _prefix: string, character: string) => character.toUpperCase());
};

const cwd = process.cwd();

// options
const buildOptions: BuildOptions = JSON.parse(decodeURIComponent(process.env.BUILD_OPTIONS || '{}'));

const {
	format,
	variant = 'standard',
	iifeExternal = '',
	umdExternal = '',
	globals = '',
	workspace,
	files = [],
	packageName,
	packageSourceDir,
	packageOptions = {}
} = buildOptions;

const isGlobalFormat = format === 'iife' || format === 'umd';
const externalNames = isGlobalFormat ? parseList(format === 'iife' ? iifeExternal : umdExternal) : [];

let external: RegExp[] | undefined;
if (variant === 'standard') {
	external = isGlobalFormat
		? externalNames.map(name => new RegExp(`^${name}$`))
		: [
				/^node:/,
				/^[a-zA-Z@]/,
				...Object.keys({
					...packageOptions.dependencies,
					...packageOptions.peerDependencies
				}).map(name => new RegExp(`^${name}$`))
			];
}

const outputGlobals: Record<string, string> = {};
if (isGlobalFormat) {
	const names = parseList(globals);
	for (const item of names.length ? names : externalNames) {
		const [name, value] = item.split(':').map(part => part.trim());
		if (name) {
			outputGlobals[name] = value || getGlobalName(name);
		}
	}
}

// alias
const alias: Alias[] = [];
if (workspace && isGlobalFormat) {
	const { name }: { name: string } = createRequire(cwd)(path.resolve(cwd, workspace, 'index/package.json'));
	const escapedName = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
	const replacement = (folder: string) => path.resolve(cwd, workspace, folder);
	alias.push(
		{
			find: new RegExp(`^${escapedName}$`),
			replacement: replacement('index')
		},
		{
			find: new RegExp(`^${escapedName}-(.*?)$`),
			replacement: replacement('$1')
		}
	);
}

const config: UserConfig = {
	define: isGlobalFormat
		? {
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}
		: {},
	logLevel: 'silent',
	plugins: [],
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
		cssMinify: false,
		target: 'esnext',
		lib: {
			cssFileName: 'style',
			entry: files.map(file => path.resolve(packageSourceDir, file)),
			formats: [format],
			name: getGlobalName(packageName)
		},
		rolldownOptions: {
			external,
			output: {
				exports: 'named',
				comments: { annotation: true },
				globals: outputGlobals
			}
		}
	}
};

export default defineConfig(config);
