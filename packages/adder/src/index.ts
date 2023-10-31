import { resolve } from 'node:path';
import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger, Locals } from '@deot/dev-shared';
import ora from 'ora';
import fs from 'fs-extra';

import { getOptions } from './prompt';

export const run = (options: Options) => Utils.autoCatch(async () => {
	options = {
		dryRun: false,
		...options
	};
	const locals = Locals.impl();
	const { workspace, packageDir } = locals;
	
	if (!workspace) {
		return Logger.log(`<add> Monorepo Supported Only.`);
	}
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	const { mode, dependentName, args, packageFolderName, packageName } = await getOptions();
	
	let command = mode === 'dependent' 
		? `npx pnpm add --filter ${packageName} ${dependentName} ${args.join(' ')}`
		: `npx pnpm link ./${workspace}/${packageFolderName}`;
	
	if (options.dryRun) return Shell.spawn(`echo "${command}"`);
	const spinner = ora(`${command}\n`).start();

	// 包名修改
	if (mode === 'package') {
		let dir = resolve(packageDir);
		fs.outputFileSync(`${dir}/${packageFolderName}/README.md`, '// TODO');
		fs.outputFileSync(`${dir}/${packageFolderName}/src/index.ts`, '// TODO');
		fs.outputFileSync(`${dir}/${packageFolderName}/__tests__/index.spec.ts`, '// TODO');
		fs.outputFileSync(`${dir}/${packageFolderName}/package.json`, JSON.stringify({
			name: packageName,
			version: '0.0.1',
			type: 'module',
			main: 'dist/index.js',
			types: "dist/index.d.ts",
			exports: {
				".": {
					import: "./dist/index.js",
					require: "./dist/index.cjs",
					types: "./dist/index.d.ts"
				}
			},
			files: [
			  "dist"
			],
			license: 'MIT',
			publishConfig: {
				access: 'public'
			},
			dependencies: {}
		}, null, 2));
	}

	await Shell.spawn(command);
	spinner.stop();
});