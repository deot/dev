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

	options.packageName = Locals.getRealPackageName(options.packageName);
	options.vuePackage = Locals.getRealPackageName(options.vuePackage);
	options.reactPackage = Locals.getRealPackageName(options.reactPackage);

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

	let { entries, html } = Entries.get(options.playDir);
	if (!entries.length) return Shell.spawn(`echo no entry file found!`);
	
	let options$: InlineConfig = {
		server: {
			host: true
		}
	};
	
	const devOptions = {
		...options,
		workspace,
		entries,
		html,
		subpackagesMap,

		// 这个是给外部调用(z.)?dev.config.ts用的
		useVue: false,
		useReact: false
	};

	const { vuePackage: isVuePackage, reactPackage: isReactPackage } = options;
	devOptions.useVue = !!isVuePackage;
	devOptions.useReact = !!isReactPackage;

	if (fs.existsSync(`${cwd}/z.dev.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './z.dev.config.ts'));
	} else if (fs.existsSync(`${cwd}/dev.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './dev.config.ts'));	
	} else {
		// 只有当使用默认配置时，才有的值
		process.env.USE_VUE = isVuePackage ? '1' : '';
		process.env.USE_REACT = isReactPackage ? '1' : '';
		options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
		
		if (isVuePackage) {
			options$ = mergeConfig(sharedVueConfig, options$);
		}

		if (isReactPackage) {
			options$ = mergeConfig(sharedReactConfig, options$);
		}
	}

	process.env.DEV_OPTIONS = encodeURIComponent(JSON.stringify(devOptions));
	
	const server = await createServer(options$);
	await server.listen();

	const { local = [], network = [] } = server.resolvedUrls || {};
	const url = network[0] || local[0] || `http://localhost:${server.config.server.port}`;

	entries.forEach((item: string) => Logger.log(`  > ${item}: ${chalk.cyan(`${url}${item}.html`)}`));

	server.printUrls();
	server.bindCLIShortcuts({ print: true });
});
