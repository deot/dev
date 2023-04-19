import type { Options } from '@deot/dev-shared';

import chalk from 'chalk';
import ora from 'ora';
import { Utils, Shell, Logger } from '@deot/dev-shared';
import { Shared } from './shared';

export const run = (options: Options) => Utils.autoCatch(async () => {
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}

	const command = 'npx pnpm link ./packages/';
	if (options.dryRun) return Shell.spawn(`echo ${command}`);

	const { packageFolderNames } = Shared.impl();
	const spinner = ora(`Links ...\n`);
	spinner.start();
	await Promise.all(packageFolderNames.map(i => {
		return Shell.spawn(`${command}${i}`);	
	}));
	spinner.stop();
	Logger.log(`${chalk.green('Links Success')}`);
});
