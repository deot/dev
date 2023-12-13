import * as path from 'node:path';
import * as fs from 'node:fs';
import type { Options } from '@deot/dev-shared';
import { Utils, Logger, Shell, Locals } from '@deot/dev-shared';
import { build } from './build';

export const run = (options: Options) => Utils.autoCatch(async () => {
	options = {
		scriptFormats: 'es,cjs',
		...options
	};
	const locals = Locals.impl();

	options.packageName = Locals.getRealPackageName(options.packageName);
	options.vuePackage = Locals.getRealPackageName(options.vuePackage);
	options.reactPackage = Locals.getRealPackageName(options.reactPackage);
	options.nodePackage = Locals.getRealPackageName(options.nodePackage);

	const packageFolderName = Locals.getPackageFolderName(options.packageName || '*');

	let inputs: string[] = [];
	if (locals.workspace && packageFolderName === '*') {
		inputs = locals.normalizePackageFolderNames;
	} else {
		inputs = [packageFolderName];
	}

	// 当仅打包一个时，需要寻找关联需要提前打包的模块
	if (options.packageName && options.packageName !== '*') {
		let relations: string[] = [];
		const walk = (packageNames: string[]) => {
			relations = packageNames.concat(relations);
			packageNames.forEach((i) => {
				if (locals.packageRelation[i].length) {
					walk(locals.packageRelation[i]);
				}
			});
		};
		walk(locals.packageRelation[options.packageName]);

		relations = relations
			.filter((i, index, source) => source.indexOf(i) === index)
			.map(i => Locals.getPackageFolderName(i))
			.filter((i) => {
				try {
					return options.dryRun || !fs.existsSync(path.resolve(locals.packageDir, i, 'dist'));
				} catch (e) {
					return false;
				}
			});
		inputs = relations.concat(inputs);
	}

	if (options.dryRun) return Shell.spawn(`echo ${inputs.join(' ')}`);
	await inputs
		.reduce(
			(preProcess: Promise<any>, packageFolderName$: any) => {
				preProcess = preProcess.then(() => build(packageFolderName$, options).process());
				return preProcess;
			},
			Promise.resolve()
		);
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('编译未通过');
		} else {
			Logger.error(e);
		}
		process.exit(1);
	}
});
