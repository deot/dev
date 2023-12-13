import pluginJsdoc from 'eslint-plugin-jsdoc';
import { Options, FlatConfig } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const jsdoc = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('jsdoc', options$);
	if (!options.enable) {
		return [];
	}

	const recommendedRules = pluginJsdoc.configs['flat/recommended-typescript'].rules;

	const rules = {
		...recommendedRules,
		'jsdoc/check-tag-names': 0
	};

	return [
		// 单独安装plugins,
		{
			plugins: {
				jsdoc: pluginJsdoc
			}
		},
		{
			rules: {
				...cleanRules('jsdoc', recommendedRules, recommendedRules, rules),
				...options.overrides
			}
		}
	];
};
