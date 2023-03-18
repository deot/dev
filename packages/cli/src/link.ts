import { Utils, Shell } from '@deot/dev-shared';

export const run = () => Utils.autoCatch(async () => {
	const command = 'lerna link --force-local';
	if (process.env.NODE_ENV === 'UNIT') return Shell.spawn(`echo ${command}`);
	await Shell.spawn(command);	
});
