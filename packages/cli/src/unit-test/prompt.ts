import { resolve } from 'node:path';
import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import fs from 'fs-extra';
import { Shared } from '../shared';

const ALL_PACKAGE = 'All Packages';

const { prompt, registerPrompt } = inquirer;

export const getOptions = async () => {
	const isDev = process.env.NODE_ENV === 'development';

	const { directory } = Shared.impl();
	const packages$ = [ALL_PACKAGE] as string[];

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
			type: 'autocomplete',
			message: `Select Package To ${isDev ? 'Develop' : 'Test'}:`,
			name: 'packageName',
			default: 'cli',
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
			type: 'confirm',
			message: 'Watch Mode?',
			name: 'watch',
			when: () => !isDev,
			default: (answers: any) => {
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
};
