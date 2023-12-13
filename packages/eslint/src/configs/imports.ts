import pluginImport from 'eslint-plugin-import';
import { Options, FlatConfig } from '../types';
import { pickOptions, cleanRules } from './_helper';

export const imports = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('import', options$);
	if (!options.enable) {
		return [];
	}

	const recommendedRules = pluginImport.configs.recommended.rules;

	const rules = {
		...recommendedRules,
		'import/newline-after-import': 1,
		'import/no-unresolved': 0
	};

	return [
		// 单独安装plugins,
		{
			plugins: {
				import: pluginImport
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
						pre[`import/${key}`] = 2;
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
