import { FlatConfig } from '../types';

export const ignores = async (ignores$: string[] = []): Promise<FlatConfig[]> => {
	let defaults = [
		'**/node_modules',
		'**/dist',
		'**/tmp',
		'**/temp',
		'**/coverage',
		'**/package-lock.json',
		'**/yarn.lock',
		'**/pnpm-lock.yaml'
	];

	if (ignores$ && ignores$.length) {
		defaults = defaults.filter((i) => {
			if (ignores$!.includes(i)) {
				return false;
			}
			const reverse = '!' + i;
			if (ignores$!.includes(reverse)) {
				ignores$ = ignores$?.filter(j => j !== reverse);
				return false;
			}
			return true;
		});
	}

	return [
		{
			ignores: [
				...defaults,
				...ignores$
			]
		}
	];
};
