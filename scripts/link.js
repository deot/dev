import { Utils, Shell } from './shared/index.js';

Utils.autoCatch(async () => {
	await Shell.spawn('lerna link --force-local');
});