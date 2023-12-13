import inquirer from 'inquirer';
import autocomplete from 'inquirer-autocomplete-prompt';
import { Locals } from '@deot/dev-shared';

const ALL_PACKAGE = 'All Packages';

const { prompt, registerPrompt } = inquirer;

export const getOptions = async () => {
	const isDev = process.env.NODE_ENV === 'development';

	const { packageFolderNames, subpackagesMap } = Locals.impl();
	const packages$ = [ALL_PACKAGE, ...packageFolderNames] as string[];
	const question = [
		{
			type: 'autocomplete',
			message: `Select Package To ${isDev ? 'Develop' : 'Test'}:`,
			name: 'packageFolderName',
			default: 'cli',
			source: (_: any, input: any) => {
				input = input || '';
				return new Promise((($resolve) => {
					const filter = input
						? packages$.filter(item => item.includes(input))
						: packages$;
					$resolve(filter);
				}));
			}
		},
		{
			type: 'autocomplete',
			message: `Select Subpackage To ${isDev ? 'Develop' : 'Test'}:`,
			name: 'subpackageFolderName',
			default: '',
			when: (answers: any) => {
				return !!subpackagesMap[answers.packageFolderName]?.length;
			},
			source: (answers: any, input: any) => {
				const subpackages = [ALL_PACKAGE, ...subpackagesMap[answers.packageFolderName]];
				input = input || '';
				return new Promise((($resolve) => {
					const filter = input
						? subpackages.filter(item => item.includes(input))
						: subpackages;
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
				return answers.packageFolderName !== ALL_PACKAGE;
			}
		},
		{
			type: 'confirm',
			message: 'Coverage Analyze?',
			name: 'coverage',
			default: true
		}
	];

	registerPrompt('autocomplete', autocomplete);
	const result = await prompt(question);

	result.packageFolderName = result.packageFolderName == ALL_PACKAGE
		? undefined
		: result.packageFolderName;

	result.subpackageFolderName = result.subpackageFolderName == ALL_PACKAGE
		? undefined
		: result.subpackageFolderName;

	result.watch = result.watch || isDev;
	return result;
};
