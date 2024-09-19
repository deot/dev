import { input, select, search, Separator } from '@inquirer/prompts';

import { Locals } from '@deot/dev-shared';

export const getOptions = async () => {
	const { packageFolderNames } = Locals.impl();
	const mode = await select({
		message: 'Select Mode:',
		choices: [
			new Separator('选择添加的类型：'),
			{
				value: 'dependent',
			},
			{
				value: 'package',
			}
		],
		default: 'package'
	});

	let packageName = '';
	let packageFolderName = '';
	let dependentName = '';
	let args = '';
	if (mode == 'dependent') {
		packageFolderName = await search({
			message: 'Select Package To Install:',
			source: (term) => {
				const v = typeof term === 'undefined' ? 'index' : term;
				return new Promise<string[]>((($resolve) => {
					const filter = v
						? packageFolderNames.filter(item => item.includes(v))
						: packageFolderNames;

					$resolve(filter);
				}));
			}
		});
		dependentName = await input({
			message: 'Input Dependent Name',
			default: '',
			validate: (answer) => {
				if (!answer) {
					return '请输入需要添加的模块名';
				}
				return true;
			}
		});
		args = await select({
			message: 'Select Mode:',
			choices: [
				{
					value: '-S',
				},
				{
					value: '-D',
				},
				{
					value: '-O',
				}
			],
			default: 'package'
		});

		packageName = Locals.getPackageName(packageFolderName);
	}

	if (mode == 'package') {
		packageFolderName = await input({
			message: 'Input Package Name',
			default: '',
			validate: (answer) => {
				if (!answer) {
					return '请输入需要添加的包名';
				}

				if (packageFolderNames.includes(answer) || answer === 'dev') {
					return '包名已存在';
				}
				return true;
			}
		});
		packageName = Locals.getPackageName(packageFolderName);
	}

	return {
		mode,
		packageName,
		packageFolderName,
		dependentName,
		args: [args]
	};
};
