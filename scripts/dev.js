import { Utils, Shell } from './shared/index.js';

Utils.autoCatch(async () => {
	await Shell.spawn('cross-env NODE_ENV=development node ./scripts/unit-test.js');
});