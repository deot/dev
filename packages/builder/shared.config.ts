import * as path from 'node:path';
import { defineConfig } from 'vite';
import atImport from "postcss-import";
import atUrl from "postcss-url";
import flexBugs from "postcss-flexbugs-fixes";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";

// options
const buildOptions = JSON.parse(decodeURIComponent(process.env.BUILD_OPTIONS || '{}'));

const { files = [], packageName, packageDir, packageOptions = {} } = buildOptions;

const external = Object
	.keys({ 
		...packageOptions.dependencies, 
		...packageOptions.peerDependencies 
	})
	.map(i => new RegExp(`^${i}$`));

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
	build: {
		minify: false,
		target: 'esnext',
		outDir: path.resolve(packageDir, './dist'),
		lib: {
			entry: files.map((file: string) => path.resolve(packageDir, './src', file)),
			formats: ['es', 'cjs'], // iife需要控制单独控制external，目前还做不到
			name: packageName,
			fileName: (format, entryName) => {
				return `${entryName}.${format}.js`;
			}
		},
		rollupOptions: {
			external: [
				/^node:/,
				/^[a-zA-Z@]/,
				...external
			]
		}
	}
});
