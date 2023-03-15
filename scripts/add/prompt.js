import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import fs from 'fs-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { prompt, registerPrompt, Separator } = inquirer;
const directory = resolve(__dirname, '../../packages/');
const packages = [];

fs.readdirSync(directory).forEach((file) => {
	const fullpath = resolve(directory, file);
	// 获取文件信息
	const stat = fs.statSync(fullpath);
	if (!(/(^_|tpl)/.test(file)) 
		&& stat.isDirectory()
	) {
		packages.push(file);
	}
});

export class Prompt {
	async run() {
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
				when: (answers) => answers.mode === 'dependent',
				name: 'packageName',
				// suggestOnly: true, 开启后可以验证数据且需要使用tab选中
				default: 'index',
				source: (answers, input) => {
					input = input || '';
					return new Promise(($resolve => {
						let filter = input 
							? packages.filter(item => item.includes(input))
							: packages;
						$resolve(filter);
					}));
				}
			},
			{
				type: 'input',
				name: 'dependentName',
				message: 'Input Dependent Name',
				default: '',
				when: (answers) => answers.mode === 'dependent',
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
				when: (answers) => answers.mode === 'dependent',
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
				when: (answers) => answers.mode === 'package',
				validate(answer) {
					if (!answer) {
						return '请输入需要添加的包名';
					}

					if (packages.includes(answer) || answer === 'dev') {
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
				result.$packageName = `@deot/dev`;
			} else {
				result.$packageName = `@deot/dev-${result.packageName}`;
			}
		}

		if (result.mode == 'package') {
			result.$packageName = `@deot/dev-${result.packageName}`;
		}

		return result;
	}
}