import { mergeConfig, defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import configShared from './packages/builder/shared.config.ts';

export default mergeConfig(
	configShared,
	defineConfig({
		// custom config
	}) as UserConfig
);
