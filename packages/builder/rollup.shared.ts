import * as path from 'node:path';
import swc from '@rollup/plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import type { RollupOptions } from 'rollup';

// options
const buildOptions = JSON.parse(decodeURIComponent(process.env.BUILD_OPTIONS || '{}'));

const { files = [], packageDir, packageOptions = {} } = buildOptions;

const external = Object
	.keys({ 
		...packageOptions.dependencies, 
		...packageOptions.peerDependencies 
	})
	.map(i => new RegExp(`^${i}$`));

const createCommonOptions = (file: string): RollupOptions => {
	return {
		input: path.resolve(packageDir, './src', file),
		external: [
			/^node:/,
			/^[a-zA-Z@]/,
			...external
		],
		plugins: [
			swc(),
			commonjs({ extensions: ['.js', '.ts'] }),
			nodeResolve(),
			replace({
				__TEST__: 'false',
				preventAssignment: true
			})
		]
	};
};

const createESOptions = (file: string): RollupOptions => {
	return {
		...createCommonOptions(file),
		output: {
			file: path.resolve(packageDir, './dist', file.replace(/(\.(j|t)s)$/, '.es.js')),
			format: 'es',
			exports: 'named',
			sourcemap: false
		}
	};
};

const createCJSOptions = (file: string): RollupOptions => {
	return {
		...createCommonOptions(file),
		output: {
			file: path.resolve(packageDir, './dist', file.replace(/(\.(j|t)s)$/, '.cjs.js')),
			format: 'cjs'
		}
	};
};

const rollupOptions: RollupOptions = files.reduce((pre: any[], file: string) => {
	pre.push(createESOptions(file));
	pre.push(createCJSOptions(file));
	return pre;
}, []);

export default rollupOptions;