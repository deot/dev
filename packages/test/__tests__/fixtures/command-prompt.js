import * as childProcess from 'node:child_process';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';

const { prompt, registerPrompt } = inquirer;

const question = [
	{
		type: 'list',
		name: 'mode',
		message: 'Select Mode:',
		choices: [
			'dependent',
			'package'
		],
		default: 'package'
	},
	{
		type: 'autocomplete',
		message: 'Select Package To Install:',
		when: answers => answers.mode === 'dependent',
		name: 'packageName',
		default: 'index',
		source: () => {
			return new Promise((($resolve) => {
				$resolve([
					'index',
					'test'
				]);
			}));
		}
	},
	{
		type: 'input',
		name: 'dependentName',
		message: 'Input Dependent Name',
		default: '',
		when: answers => answers.mode === 'dependent',
		validate(answer) {
			if (!answer) {
				return '请输入需要添加的模块名';
			}
			return true;
		}
	},
	{
		type: 'checkbox',
		name: 'args',
		when: answers => answers.mode === 'dependent',
		message: 'Select modules:',
		choices: [
			'--dev',
			'--peer',
			'--exact',
			'--no-bootstrap'
		],
		validate(answer) {
			if (answer.length < 1) {
				return '至少选择一个模块, 使用Space键选中';
			}
			return true;
		}
	},
	{
		type: 'input',
		name: 'packageName',
		message: 'Input Package Name',
		default: '',
		when: answers => answers.mode === 'package',
		validate(answer) {
			if (!answer) {
				return '请输入需要添加的包名';
			}
			return true;
		}
	}
];

(async () => {
	registerPrompt('autocomplete', autocomplete);
	const { mode, dependentName, args, packageName } = await prompt(question);
	let command = mode === 'dependent'
		? `add ${dependentName} ${args.join(' ')} --scope=${packageName}`
		: `create ${packageName}`;

	childProcess.spawn(`echo`, command.split(' '), { stdio: 'inherit' });
})();
