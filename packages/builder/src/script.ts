import fs from 'fs-extra';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Locals } from '@deot/dev-shared';
import { build as createViteBuild } from 'vite';
import type { InlineConfig } from 'vite';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const locals = Locals.impl();
	const { cwd } = locals;

	const { packageName, packageDir, packageOptions } = options || {};

	const stats: Array<{ format?: string; size: number; file: string }> = [];
	const srcDir = path.resolve(packageDir, './src');
	const outDir = path.resolve(packageDir, './dist');
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

	let options$: InlineConfig = {};
	if (fs.existsSync(`${cwd}/build.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './build.config.ts'));
	} else if (fs.existsSync(`${cwd}/z.build.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './z.build.config.ts'));
	} else {
		options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
	}

	await createViteBuild(options$);

	let outputs = fs
		.readdirSync(outDir)
		.filter((i: string) => /^index(.*)(?!=\.d)\.js$/.test(i));

	outputs.forEach((file: string) => {
		let stat = fs.statSync(path.resolve(outDir, file));
		stats.push({
			file: file.replace(/^(.*)(\..*\.js)/, '$1.ts'),
			format: file.replace(/.*\.(.*)\.js/, '$1'),
			size: stat.size
		});
	});
	return stats;
};