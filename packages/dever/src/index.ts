import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Locals, Logger } from '@deot/dev-shared';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import type { InlineConfig } from 'vite';
import { createServer } from 'vite';
import chalk from 'chalk';
import * as Entries from './entries';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = (options: Options) => Utils.autoCatch(async () => {
	const locals = Locals.impl();
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	
	if (options.dryRun) return Shell.spawn(`echo development`);

	const { cwd, workspace, packageOptionsMap, packageDirsMap } = locals;
	const { packageName } = options;

	const getPackageFolderName = Locals.getPackageFolderName(packageName);
	const packageOptions = packageOptionsMap[getPackageFolderName];
	const packageDir = packageDirsMap[getPackageFolderName];
	options.watch = true;

	if (
		!workspace 
		&& packageName
		&& packageName !== '*'
		&& cwd !== packageDir
		&& packageOptions?.scripts?.['dev']
	) {
		await Shell.spawn(`npm`, ['run', 'dev']);
		return;
	}

	let { entries, html } = Entries.get();

	process.env.DEV_OPTIONS = encodeURIComponent(JSON.stringify({
		...options,
		workspace,
		entries,
		html
	}));

	if (!entries.length) return Shell.spawn(`echo no entry file found!`);
	
	let options$: InlineConfig = {};
	
	if (fs.existsSync(`${cwd}/dev.config.ts`)) {
		options$.configFile = path.relative(cwd, path.resolve(cwd, './dev.config.ts'));
	} else {
		options$.configFile = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
	}

	const server = await createServer(options$);
	const $server = await server.listen();

	const $port = $server.config.server.port;
	const $host = $server.config.server.host || '0.0.0.0';

	entries.forEach((item: string) => Logger.log(`  > ${item}: ${chalk.cyan(`http://${$host}:${$port}/${item}.html`)}`));
});
