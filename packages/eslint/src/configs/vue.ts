import pluginVue from 'eslint-plugin-vue';
import parserVue from 'vue-eslint-parser';
import * as parserTs from '@typescript-eslint/parser';
import { Options, FlatConfig, Rules } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const vue = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('vue', options$);
	if (!options.enable) {
		return [];
	}
	const typescriptOptions = await pickOptions('typescript', options$);

	const essentialRules = pluginVue.configs['essential'].rules as Rules;
	const rules: Rules = {
		...essentialRules,
		'vue/html-indent': ['error', 'tab'],
		'vue/no-multiple-template-root': 0,
		'vue/multi-word-component-names': 0,
		'vue/no-shared-component-data': 0
	};

	return [
		// 单独安装plugins,
		{
			plugins: {
				vue: pluginVue
			}
		},
		...pluginVue.configs['flat/base'],
		{
			files: ['**/*.vue'],
			languageOptions: {
				parser: parserVue as any,
				parserOptions: {
					sourceType: 'module',
					...(typescriptOptions.enable && {
						parser: parserTs
					})
				}
			},
			rules: {
				...cleanRules('vue', essentialRules, essentialRules, rules),
				...(typescriptOptions.enable && {
					'no-unused-vars': 0,
					'@typescript-eslint/no-unused-vars': 1
				}),
				...options.overrides
			}
		}
	];
};
