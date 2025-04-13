import pluginVue from 'eslint-plugin-vue';
import parserVue from 'vue-eslint-parser';
import { Options, FlatConfig, Rules } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const vue = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('vue', options$);
	if (!options.enable) {
		return [];
	}

	const baseRules = pluginVue.configs['base'].rules as Rules;
	const essentialRules = pluginVue.configs['essential'].rules as Rules;
	const recommendedRules = { ...baseRules, ...essentialRules } as Rules;

	const rules: Rules = {
		...recommendedRules,
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
		{
			files: ['**/*.vue'],
			languageOptions: {
				parser: parserVue as any,
				parserOptions: {
					sourceType: 'module'
				}
			},
			rules: {
				...cleanRules('vue', recommendedRules, recommendedRules, rules),
				...options.overrides
			}
		}
	];
};
