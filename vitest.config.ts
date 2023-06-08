import { mergeConfig, defineConfig } from 'vitest/config';
import configShared from './packages/tester/vitest.shared';

export default mergeConfig(
	configShared,
	defineConfig({
		test: {
			coverage: {
				provider: 'istanbul',
				exclude: [
					`packages/cli/src/**/*.ts`,
					`packages/*er/src/**/*.ts`
				]
			}
		}
	})
);