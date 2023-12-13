import pluginMarkdown from 'eslint-plugin-markdown';
import { Options, FlatConfig } from '../types';
import { pickOptions } from './_helper';

export const markdown = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('markdown', options$);
	if (!options.enable) {
		return [];
	}

	const config = pluginMarkdown.configs.recommended.overrides[1];
	return [
		{
			plugins: {
				markdown: pluginMarkdown
			}
		},
		{
			files: ['**/*.md'],
			processor: 'markdown/markdown'
		},
		{
			files: ['**/*.md/*.ts'],
			rules: {
				'@typescript-eslint/no-unused-vars': 0
			}
		},
		{
			files: ['**/*.md/**'],
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						impliedStrict: true
					}
				}
			},
			rules: {
				...config.rules,
				'no-console': 1,
				...options.overrides,
			}
		}
	];
};
