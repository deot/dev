import type { Linter, ESLint } from 'eslint';

export type FlatConfig = Linter.FlatConfig;
export type Rules = Linter.RulesRecord;
export type Plugin = ESLint.Plugin;

export type Modules = 'stylistic' | 'javascript' | 'typescript' | 'markdown' | 'jsdoc' | 'vue' | 'react' | 'import';

export interface ConfigOptions {
	enable?: boolean;
	overrides?: Rules;
}

export type Options = {
	ignores?: string[];
	overrides?: {
		[key in Modules]?: Rules
	};
} & {
	[key in Modules]?: boolean | ConfigOptions
};
