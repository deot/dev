import fs from 'fs-extra';
import * as path from 'node:path';

import swc from '@rollup/plugin-swc';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
// import terser from '@rollup/plugin-terser';
import { rollup as rollupBuilder } from 'rollup';
import type { Build } from './build';

export const run = async (options: Build) => {
	const { packageName, packageDir, commandOptions, packageOptions } = options || {};

	const srcDir = path.resolve(packageDir, './src');
	let files = fs.existsSync(srcDir)
		? fs
			.readdirSync(srcDir)
			.filter((i: string) => /^index(.*)\.(t|j)s$/.test(i))
		: [];
	const scripts = files.map((file: string) => {
		let filepath = path.resolve(srcDir, file);
		return {
			file,
			input: filepath,
			output: [
				{
					file: path.resolve(packageDir, './dist', file.replace(/(\.(j|t)s)$/, '.es.js')),
					format: 'es',
					exports: 'named',
					sourcemap: false
				},
				// TODO: 这个需要解决依赖问题
				{
					file: path.resolve(packageDir, './dist', file.replace(/(\.(j|t)s)$/, '.iife.js')),
					format: 'iife',
					name: packageName,
					// plugins: [terser()]
				},
				{
					file: path.resolve(packageDir, './dist', file.replace(/(\.(j|t)s)$/, '.cjs.js')),
					format: 'cjs'
				} 
			].filter(i => {
				return commandOptions.scriptFormats.includes(i.format);
			})
		};
	});

	const external = Object
		.keys({ 
			...packageOptions.dependencies, 
			...packageOptions.peerDependencies 
		})
		.map(i => new RegExp(`^${i}$`));

	const stats: Array<{ format?: string; size: number; file: string }> = [];
	await scripts
		.reduce(
			(preProcess: Promise<any>, current: any) => {
				preProcess = preProcess
					.then(() => rollupBuilder({
						input: current.input,
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
								__VERSION__: `'${packageOptions.version}'`,
								__TEST__: 'false',
								preventAssignment: true
							})
						]
					}))
					.then((builder) => Promise.all(current.output.map(builder.write)))
					.then(() => Promise.all(current.output.map((i) => fs.stat(i.file))))
					.then((stats$) => {
						stats$.forEach((stat, index) => {
							stats.push({
								file: current.file,
								format: current.output[index].format as string,
								size: stat.size
							});
						});
					});
				return preProcess;
			}, 
			Promise.resolve()
		);
	return stats;
};