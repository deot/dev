import type { InlineConfig } from 'vite';

export const create = (minify?: boolean): InlineConfig => {
	return typeof minify === 'boolean'
		? { build: { minify } }
		: {};
};
