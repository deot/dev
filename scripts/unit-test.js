import { Prompt } from './unit-test/prompt.js';
import { Utils, Logger, Shell } from './shared/index.js';

Utils.autoCatch(async () => {
	const options = await new Prompt().run();
	const { packageName, watch } = options;
	const NODE_ENV = process.env.NODE_ENV || 'test';

	await Shell.spawn(
		`cross-env NODE_ENV=${NODE_ENV} TEST_OPTIONS=${encodeURIComponent(JSON.stringify(options))} jest`,
		[
			'--passWithNoTests',
			'--config',
			`${process.cwd()}/scripts/unit-test/jest.config.cjs`,
			`${watch ? '--watchAll' : ''}`
		]
	);

	if (!watch) return;

	Logger.log(packageName || '', '测试已通过');
}, {
	onError: (e) => {
		if (typeof e === 'number' && e === 1) {
			Logger.error('测试未通过');
		} else {
			Logger.error(e);
		}
	}
});