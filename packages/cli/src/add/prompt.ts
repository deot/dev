import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import { Shared } from '../shared';

const { prompt, registerPrompt, Separator } = inquirer;

export const getOptions = async () => {
	const { packageFolderNames } = Shared.impl();
	const question = [
		{
			type: 'list',
			name: 'mode',
			message: 'Select Mode:',
			choices: [
				new Separator('选择添加的类型：'),
				'dependent',
				'package'
			],
			default: 'package'
		},
		{
			type: 'autocomplete',
			message: 'Select Package To Install:',
			when: (answers: any) => answers.mode === 'dependent',
			name: 'packageFolderName',
			// suggestOnly: true, 开启后可以验证数据且需要使用tab选中
			default: 'index',
			source: (_: any, input: any) => {
				input = input || '';
				return new Promise(($resolve => {
					let filter = input 
						? packageFolderNames.filter(item => item.includes(input))
						: packageFolderNames;
					$resolve(filter);
				}));
			}
		},
		{
			type: 'input',
			name: 'dependentName',
			message: 'Input Dependent Name',
			default: '',
			when: (answers: any) => answers.mode === 'dependent',
			validate: (answer: any) => {
				if (!answer) {
					return '请输入需要添加的模块名';
				}
				return true;
			}
		},
		{
			type: 'list',
			name: 'args',
			when: (answers: any) => answers.mode === 'dependent',
			message: 'Select Install Mode:',
			choices: [
				'-S',
				'-D',
				'-O'
			]
		},
		{
			type: 'input',
			name: 'packageFolderName',
			message: 'Input Package Name',
			default: '',
			when: (answers: any) => answers.mode === 'package',
			validate: (answer: any) => {
				if (!answer) {
					return '请输入需要添加的包名';
				}

				if (packageFolderNames.includes(answer) || answer === 'dev') {
					return '包名已存在';
				}
				return true;
			}
		}
	];

	registerPrompt('autocomplete', autocomplete);
	let result = await prompt(question);

	if (result.mode == 'dependent') {
		result.packageName = Shared.getPackageName(result.packageFolderName);
	}

	if (result.mode == 'package') {
		result.packageName = Shared.getPackageName(result.packageFolderName);
	}

	result.args = [result.args];
	return result;
};