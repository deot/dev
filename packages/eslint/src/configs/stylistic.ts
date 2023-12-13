import pluginStylistic from '@stylistic/eslint-plugin';
import { pickOptions, cleanRules } from './_helper';
import { Options, FlatConfig, Rules } from '../types';

export const stylistic = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('stylistic', options$);
	if (!options.enable) {
		return [];
	}

	const config = pluginStylistic.configs.customize({
		indent: 'tab',
		quotes: 'single',
		semi: true,
		jsx: true,
	});

	const allRules = config.rules as FlatConfig['rules'];

	const rules: Rules = {
		...allRules,
		'@stylistic/comma-dangle': ['warn', {
			arrays: 'never',
			objects: 'ignore',
			imports: 'never',
			exports: 'never',
			functions: 'ignore'
		}],
		'@stylistic/brace-style': ['error', '1tbs', {
			allowSingleLine: true
		}],
		'@stylistic/member-delimiter-style': 1,
		'@stylistic/max-statements-per-line': ['off', { max: 1 }]
	};

	return [
		// 单独安装plugins, 方便扩展
		{
			plugins: {
				'@stylistic': pluginStylistic as any,
			},
		},
		{
			rules: {
				...cleanRules('stylistic', allRules!, allRules!, rules),
				...options.overrides,
			}
		}
	];
};
