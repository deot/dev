import { resolve } from 'node:path';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import fs from 'fs-extra';
import { Shared } from '../shared';

const { prompt, registerPrompt, Separator } = inquirer;

export const getOptions = async () => {
	const { directory, packageName } = Shared.impl();
	const packages$ = [] as string[];

	fs.readdirSync(directory).forEach((file: string) => {
		const fullpath = resolve(directory, file);
		// 获取文件信息
		const stat = fs.statSync(fullpath);
		if (!(/(^_|tpl)/.test(file)) 
			&& stat.isDirectory()
		) {
			packages$.push(file);
		}
	});
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
			name: 'packageName',
			// suggestOnly: true, 开启后可以验证数据且需要使用tab选中
			default: 'index',
			source: (_: any, input: any) => {
				input = input || '';
				return new Promise(($resolve => {
					let filter = input 
						? packages$.filter(item => item.includes(input))
						: packages$;
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
			type: 'checkbox',
			name: 'args',
			when: (answers: any) => answers.mode === 'dependent',
			message: 'Select modules:',
			choices: [
				'--dev',
				'--peer',
				'--exact',
				'--no-bootstrap'
			],
			validate(answer: any) {
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
			when: (answers: any) => answers.mode === 'package',
			validate: (answer: any) => {
				if (!answer) {
					return '请输入需要添加的包名';
				}

				if (packages$.includes(answer) || answer === 'dev') {
					return '包名已存在';
				}
				return true;
			}
		}
	];

	registerPrompt('autocomplete', autocomplete);
	let result = await prompt(question);

	if (result.mode == 'dependent') {
		if (result.packageName === 'index') {
			result.$packageName = `${packageName}`;
		} else {
			result.$packageName = `${packageName}-${result.packageName}`;
		}
	}

	if (result.mode == 'package') {
		result.$packageName = `${packageName}-${result.packageName}`;
	}

	return result;
};