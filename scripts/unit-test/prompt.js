import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import fs from 'fs-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));

const { prompt, registerPrompt } = inquirer;
const directory = resolve(__dirname, '../../packages/');
const ALL_PACKAGE = 'All Packages';
const packages = [ALL_PACKAGE];

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
		const isDev = process.env.NODE_ENV === 'development';
		const question = [
			{
				type: 'autocomplete',
				message: `Select Package To ${isDev ? 'Develop' : 'Test'}:`,
				name: 'packageName',
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
				type: 'confirm',
				message: 'Watch Mode?',
				name: 'watch',
				when: () => !isDev,
				default: (answers) => {
					return answers.packageName !== ALL_PACKAGE;
				}
			}
		];

		registerPrompt('autocomplete', autocomplete);
		let result = await prompt(question);

		result.packageName = result.packageName == ALL_PACKAGE 
			? undefined 
			: result.packageName;

		result.watch = result.watch || isDev;
		return result;
	}
}