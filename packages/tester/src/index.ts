import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Options } from '@deot/dev-shared';
import { Utils, Shell, Logger, Locals } from '@deot/dev-shared';
import { startVitest } from 'vitest/node';
import type { CliOptions } from 'vitest/node';
import fs from 'fs-extra';
import { getOptions } from './prompt';

const dirname = path.dirname(fileURLToPath(import.meta.url));
export const run = (options: Options) => Utils.autoCatch(async () => {
	options = { ...options };
	const locals = Locals.impl();

	options.packageName = Locals.getRealPackageName(options.packageName);
	options.vuePackage = Locals.getRealPackageName(options.vuePackage);
	options.reactPackage = Locals.getRealPackageName(options.reactPackage);

	if (typeof options.dryRun === 'undefined') {
		options.dryRun = process.env.NODE_ENV === 'UNIT';
	}

	if (locals.workspace && !options.packageName) {
		const promptOptions = await getOptions();
		options = {
			...options,
			...promptOptions
		};
	}

	const { cwd, workspace, packageOptionsMap, packageDirsMap, subpackagesMap } = locals;
	const { environment, coverage, watch, dryRun } = options;

	options.packageFolderName = Locals.getPackageFolderName(options.packageName) || options.packageFolderName;
	options.workspace = workspace;

	options.subpackageFolderName = options.subpackageFolderName || options.subpackage;
	options.subpackagesMap = subpackagesMap;

	const packageOptions = packageOptionsMap[options.packageFolderName];
	const packageDir = packageDirsMap[options.packageFolderName];

	if (
		workspace
		&& cwd !== packageDir
		&& packageOptions?.scripts?.['test']
	) {
		await Shell.spawn(`npm`, ['run', 'test'], { cwd: packageDir });
		return;
	}

	if (!options.packageFolderName) delete options.packageFolderName;
	if (!options.workspace) delete options.workspace;
	delete options.packageName;
	delete options.subpackage;

	const isDev = process.env.NODE_ENV === 'development';
	const NODE_ENV = process.env.NODE_ENV || 'TEST';

	if (dryRun) {
		const command = `cross-env NODE_ENV=${NODE_ENV} TEST_OPTIONS=${encodeURIComponent(JSON.stringify(options))} vitest `
			+ ([
				'--passWithNoTests',
				`${!(watch || isDev) ? '--watch=false' : ''}`
			].join(' '));
		Shell.spawn(`echo ${command}`);
		return;
	}

	const { vuePackage, reactPackage } = options;
	const packageName = Locals.getPackageName(options.packageFolderName);
	const isVuePackage = typeof vuePackage === 'string' && (
		packageName === locals.packageName
		|| packageName === `${locals.packageName}-*`
		|| vuePackage === '*'
		|| (vuePackage.split(',')).includes(packageName)
	);

	const isReactPackage = typeof reactPackage === 'string' && (
		packageName === locals.packageName
		|| packageName === `${locals.packageName}-*`
		|| reactPackage === '*'
		|| (reactPackage.split(',')).includes(packageName)
	);

	// 这个是给外部调用(z.)?test.config.ts用的
	options.useVue = !!isVuePackage;
	options.useReact = !!isReactPackage;

	const options$: CliOptions = {
		environment,
		coverage: {
			enabled: !!coverage,
		},
		passWithNoTests: true,
		watch: !!(watch || isDev)
	};

	if (fs.existsSync(`${cwd}/z.test.config.ts`)) {
		options$.config = path.relative(cwd, path.resolve(cwd, './z.test.config.ts'));
	} else if (fs.existsSync(`${cwd}/test.config.ts`)) {
		options$.config = path.relative(cwd, path.resolve(cwd, './test.config.ts'));
	} else {
		// 只有当使用默认配置时，才有的值
		process.env.USE_VUE = isVuePackage ? '1' : '';
		process.env.USE_REACT = isReactPackage ? '1' : '';
		/**
		 * 和build保持一致, 仅当默认时，才启用vue
		 * startVitest第四个参数设置plugins的话;
		 * .vue就无法搜集覆盖率了, 这里需要在shared.config.ts直接配置
		 * 引入只是为了去除tsx执行的hack
		 */

		options$.config = path.relative(cwd, path.resolve(dirname, '../shared.config.ts'));
	}

	process.env.NODE_ENV = NODE_ENV;
	process.env.TEST_OPTIONS = encodeURIComponent(JSON.stringify(options));

	await startVitest('test', [], options$);
}, {
	onError: (e: any) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('测试未通过');
		} else {
			Logger.error(e);
		}

		process.exit(1);
	}
});
