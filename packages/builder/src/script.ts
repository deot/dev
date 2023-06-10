import fs from 'fs-extra';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Shell, Locals } from '@deot/dev-shared';

import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const locals = Locals.impl();
	const { cwd } = locals;

	const { packageName, packageDir, packageOptions } = options || {};

	const stats: Array<{ format?: string; size: number; file: string }> = [];
	const srcDir = path.resolve(packageDir, './src');
	let files = fs.existsSync(srcDir)
		? fs
			.readdirSync(srcDir)
			.filter((i: string) => /^index(.*)\.(t|j)s$/.test(i))
		: [];


	if (!files.length) return stats;

	process.env.BUILD_OPTIONS = encodeURIComponent(JSON.stringify({
		files,
		packageName,
		packageDir,
		packageOptions,
	}));

	let params = ['--configPlugin swc -c'];
	// 当没有配置项时，使用当前暴露的配置项
	if (!fs.existsSync(`${cwd}/rollup.config.ts`)) {
		params.push(path.relative(cwd, path.resolve(dirname, '../rollup.shared.ts')));
	} else {
		params.push(path.relative(cwd, `${cwd}/rollup.config.ts`));
	}

	await Shell.exec('rollup', params);

	let distDir = path.resolve(packageDir, './dist');
	let outputs = fs
		.readdirSync(distDir)
		.filter((i: string) => /^index(.*)(?!=\.d)\.js$/.test(i));

	outputs.forEach((file: string) => {
		let stat = fs.statSync(path.resolve(distDir, file));
		stats.push({
			file: file.replace(/^(.*)(\..*\.js)/, '$1.ts'),
			format: file.replace(/.*\.(.*)\.js/, '$1'),
			size: stat.size
		});
	});
	return stats;
};