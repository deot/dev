import pluginImport from 'eslint-plugin-import-x';
import { Options, FlatConfig, Rules } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const imports = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('import', options$);
	if (!options.enable) {
		return [];
	}

	const recommendedRules = pluginImport.configs.recommended.rules;

	const rules: Rules = {
		...recommendedRules,
		'import-x/newline-after-import': 1,
		'import-x/no-unresolved': 0,
		'import-x/namespace': 0,
		'import-x/default': 0,
		'import-x/no-named-as-default': 0,
		'import-x/no-named-as-default-member': 0
	};

	return [
		// 单独安装plugins,
		{
			plugins: {
				'import-x': pluginImport as any
			},
			settings: {
				'import/parsers': {
					espree: ['.js', '.cjs', '.mjs', '.jsx'],
				}
			}
		},
		{
			rules: {
				...cleanRules(
					'import',
					Object.keys(pluginImport.rules).reduce((pre, key) => {
						pre[`import-x/${key}`] = 2;
						return pre;
					}, {}),
					recommendedRules,
					rules
				),
				...options.overrides
			}
		}
	];
};
