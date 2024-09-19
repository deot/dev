import * as childProcess from 'node:child_process';
import { input, select, search, checkbox } from '@inquirer/prompts';

(async () => {
	const mode = await select({
		message: 'Select Mode:',
		choices: [
			{
				value: 'dependent',
			},
			{
				value: 'package',
			}
		],
		default: 'package'
	});

	let packageName;
	let dependentName;
	let args;

	if (mode === 'dependent') {
		packageName = await search({
			message: 'Select Package To Install:',
			source: () => {
				return new Promise((($resolve) => {
					$resolve(['index', 'test']);
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
		args = await checkbox({
			message: 'Select modules:',
			default: '',
			choices: [
				{ value: '--dev' },
				{ value: '--peer' },
				{ value: '--exact' },
				{ value: '--no-bootstrap' }
			],
			validate: (answer) => {
				if (answer.length < 1) {
					return '至少选择一个模块, 使用Space键选中';
				}
				return true;
			}
		});
	} else {
		packageName = await input({
			message: 'Input Package Name',
			default: '',
			validate: (answer) => {
				if (!answer) {
					return '请输入需要添加的包名';
				}
				return true;
			}
		});
	}

	const command = mode === 'dependent'
		? `add ${dependentName} ${args.join(' ')} --scope=${packageName}`
		: `create ${packageName}`;

	childProcess.spawn(`echo`, command.split(' '), { stdio: 'inherit' });
})();
