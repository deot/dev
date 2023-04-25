import type { Options } from '@deot/dev-shared';
import { Utils, Shell } from '@deot/dev-shared';
import { Shared } from './shared';

export const run = (options: Options) => Utils.autoCatch(async () => {
	const locals = Shared.impl();
	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}
	
	if (options.dryRun) return Shell.spawn(`echo development`);

	const { workspace, packageOptionsMap } = locals;
	const { packageName } = options;

	const getPackageFolderName = Shared.getPackageFolderName(packageName);
	const packageOptions = packageOptionsMap[getPackageFolderName];
	options.watch = true;

	if (
		!workspace 
		&& packageName
		&& packageName !== '**'
		&& packageOptions?.scripts?.['dev']
	) {
		await Shell.spawn(`npm`, ['run', 'dev']);
		return;
	}
	await Shell.spawn(`cross-env`, [
		'NODE_ENV=development',
		'npm',
		'run',
		'test',
		'--',
		packageName ? `--package-name ${packageName}` : ''
	]);
});
