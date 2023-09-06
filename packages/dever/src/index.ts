import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Locals, Logger } from '@deot/dev-shared';
import fs from 'fs-extra';
import type { InlineConfig } from 'vite';
import { createServer, mergeConfig } from 'vite';
import chalk from 'chalk';
import sharedVueConfig from '@deot/dev-vue';
import sharedReactConfig from '@deot/dev-react';
import * as Entries from './entries';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = (options: Options) => Utils.autoCatch(async () => {
	const locals = Locals.impl();
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	
	if (options.dryRun) return Shell.spawn(`echo development`);

	const { cwd, workspace, packageOptionsMap, packageDirsMap, subpackagesMap } = locals;

	const packageFolderName = Locals.getPackageFolderName(options.packageName);
	const packageOptions = packageOptionsMap[packageFolderName];
	const packageDir = packageDirsMap[packageFolderName];
	options.watch = true;

	if (
		workspace 
		&& cwd !== packageDir
		&& packageOptions?.scripts?.['dev']
	) {
		await Shell.spawn(`npm`, ['run', 'dev'], { cwd: packageDir });
		return;
	}

	if (!options.packageFolderName) delete options.packageFolderName; 
	if (!options.workspace) delete options.workspace; 
	delete options.packageName;

	let { entries, html } = Entries.get();
	if (!entries.length) return Shell.spawn(`echo no entry file found!`);
	
	let options$: InlineConfig = {
		server: {
			host: true
		}
	};
	
	if (fs.existsSync(`${cwd}/z.dev.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './z.dev.config.ts'));
	} else if (fs.existsSync(`${cwd}/dev.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './dev.config.ts'));	
	} else {
		options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
		const { vuePackage, reactPackage } = options;

		if (vuePackage) {
			options$ = mergeConfig(sharedVueConfig, options$);
		}

		if (reactPackage) {
			options$ = mergeConfig(sharedReactConfig, options$);
		}
	}

	process.env.DEV_OPTIONS = encodeURIComponent(JSON.stringify({
		...options,
		workspace,
		entries,
		html,
		subpackagesMap
	}));
	
	const server = await createServer(options$);
	const $server = await server.listen();
	const { local = [], network = [] } = $server.resolvedUrls || {};
	const url = network[0] || local[0] || `http://localhost:${$server.config.server.port}`;

	entries.forEach((item: string) => Logger.log(`  > ${item}: ${chalk.cyan(`${url}${item}.html`)}`));
});
