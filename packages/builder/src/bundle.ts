import * as path from 'node:path';
import type { InlineConfig, Plugin } from 'vite';
import type { Build } from './build';
import * as Script from './script';
import * as Eval from './eval';

export const create = (external = ''): InlineConfig => {
	let nodeEnv: string | undefined;
	const plugin: Plugin = {
		name: 'builder-bundle',
		enforce: 'post',
		config(config) {
			config.define = {
				'process.env.NODE_ENV': JSON.stringify('production'),
				...config.define
			};
			config.build ??= {};
			config.build.rolldownOptions ??= {};
			config.build.rolldownOptions.external ??= external.split(',')
				.map(name => name.trim())
				.filter(Boolean)
				.map(name => new RegExp(`^${name}$`));
		},
		configResolved(config) {
			const value = config.define?.['process.env.NODE_ENV'];
			nodeEnv = typeof value === 'string' ? value : JSON.stringify(value);
		},
		options(input) {
			// Vite initializes this define again after merging user transform options.
			if (nodeEnv === undefined) return;
			input.transform = {
				...input.transform,
				define: {
					...input.transform?.define,
					'process.env.NODE_ENV': nodeEnv
				}
			};
			return input;
		}
	};
	return { plugins: [plugin] };
};

export const run = async (options: Build) => {
	const sourceDir = path.join(options.packageOutDir, 'bundle');
	const targetDir = path.join(options.packageOutDir, 'eval');
	const results = await Script.run(options, {
		variant: 'bundle',
		formats: ['es'],
		outDir: sourceDir,
		config: create(options.commandOptions.bundleExternal)
	});
	if (options.eval) {
		for (const result of results) {
			const stats = await Eval.run(result.outputs, {
				enabled: true,
				format: 'es',
				filepath: result.filepath,
				sourceDir,
				targetDir
			});
			result.stats.push(...stats.map(stat => ({ ...stat, file: path.join('eval', stat.file) })));
		}
	}
	return results;
};
