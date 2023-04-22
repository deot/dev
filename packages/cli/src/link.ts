import type { Options } from '@deot/dev-shared';

import chalk from 'chalk';
import ora from 'ora';
import { Utils, Shell, Logger } from '@deot/dev-shared';
import { Shared } from './shared';

export const run = (options: Options) => Utils.autoCatch(async () => {
	const locals = Shared.impl();
	const { workspace, packageFolderNames } = locals;
	
	if (!workspace) {
		return Logger.log(`<link> Monorepo Supported Only.`);
	}
	
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}

	const command = `npx pnpm link ./${workspace}/`;
	if (options.dryRun) return Shell.spawn(`echo ${command}`);

	const spinner = ora(`Links ...\n`);
	spinner.start();
	await Promise.all(packageFolderNames.map(i => {
		return Shell.spawn(`${command}${i}`);	
	}));
	spinner.stop();
	Logger.log(`${chalk.green('Links Success')}`);
});
