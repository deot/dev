import js from '@eslint/js';
import globals from 'globals';
import { pickOptions, cleanRules } from './_helper';
import { Options, Rules, FlatConfig } from '../types';

export const javascript = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('javascript', options$);
	if (!options.enable) {
		return [];
	}

	const allRules = js.configs.all.rules;
	const recommendedRules = js.configs.recommended.rules;

	const rules: Rules = {
		...recommendedRules,
		'no-undef': 1,
		'no-debugger': 1,
		'no-unused-vars': 1,
		'no-useless-escape': 0
	};

	return [
		{
			languageOptions: {
				ecmaVersion: 'latest',
				globals: {
					...globals.browser,
					...globals.es2021,
					...globals.node
				},
				parserOptions: {
					ecmaFeatures: {
						jsx: true,
					},
					ecmaVersion: 2022,
					sourceType: 'module',
				},
				sourceType: 'module',
			},
			rules: {
				...cleanRules('javascript', allRules, recommendedRules, rules),
				...options.overrides
			}
		}
	];
};
