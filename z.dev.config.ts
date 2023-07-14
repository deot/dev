import { mergeConfig, defineConfig } from 'vite';
import type { UserConfig } from 'vite';
import configShared from './packages/dever/shared.config';

export default mergeConfig(
	configShared,
	defineConfig({
		// custom config
	}) as UserConfig
);