import md from "eslint-plugin-markdown";
import { Options, FlatConfig } from '../types';
import { pickOptions } from './_helper';

export const markdown = async (options$?: Options): Promise<FlatConfig[]> => {
	const options = await pickOptions('markdown', options$);
	if (!options.enable) {
		return [];
	}

	const config = md.configs.recommended.overrides[1];
	return [
		{
			plugins: {
				markdown: md
			}
		},
		{
			files: ["**/*.md"],
			processor: "markdown/markdown"
		},
		{
			files: ["**/*.md/*.ts"],
			rules: {
				"@typescript-eslint/no-unused-vars": 0
			}
		},
		{
			files: ["**/*.md/**"],
			languageOptions: {
				parserOptions: {
					ecmaFeatures: {
						impliedStrict: true
					}
				}
			},
			rules: {
				...config.rules,
				"no-console": 1,
				...options.overrides,
			}
		}
	];
};