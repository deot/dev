import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Locals } from '@deot/dev-shared';

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
		&& packageName !== '**'
		&& cwd !== packageDir
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
