import pluginTs from '@typescript-eslint/eslint-plugin';
import * as parserTs from '@typescript-eslint/parser';
import { Options, FlatConfig } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const typescript = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('typescript', options$);
	if (!options.enable) {
		return [];
	}

	const recommendedRules = (pluginTs.configs['eslint-recommended'] as any).overrides[0].rules;
	const allRules = (pluginTs.configs['all'] as any).rules;

	const rules = {
		...recommendedRules,
		'@typescript-eslint/no-shadow': 2, // https://github.com/typescript-eslint/typescript-eslint/issues/2483
		'@typescript-eslint/no-unused-vars': 1,
		// ignore duplicate rules
		'no-unused-vars': 0
	};

	return [
		// 单独安装plugins, 方便扩展
		{
			plugins: {
				'@typescript-eslint': pluginTs as any
			}
		},
		{
			files: ['*.ts', '*.tsx', '*.mts', '*.cts'].map((i: string) => '**/' + i),
			languageOptions: {
				parser: parserTs as any,
				parserOptions: {
					sourceType: 'module'
				}
			},
			rules: {
				...cleanRules(
					'typescript',
					{ ...allRules, ...recommendedRules }, // all使用了extends, 但这里使用flat config
					recommendedRules,
					rules
				),
				...options.overrides
			}
		}
	];
};
