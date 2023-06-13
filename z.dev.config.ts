import { mergeConfig, defineConfig } from 'vite';
import configShared from './packages/dever/shared.config';

export default mergeConfig(
	configShared,
	defineConfig({
		// custom config
	})
);