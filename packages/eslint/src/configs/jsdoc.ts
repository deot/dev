import jsd from "eslint-plugin-jsdoc";
import { Options, FlatConfig } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const jsdoc = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('jsdoc', options$);
	if (!options.enable) {
		return [];
	}

	const recommendedRules = jsd.configs['flat/recommended-typescript'].rules;

	const rules = {
		...recommendedRules,
		"jsdoc/check-tag-names": 0
	};

	return [
		// 单独安装plugins, 
		{
			plugins: {
				jsdoc: jsd	
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