import type { Options, ConfigOptions, Rules, Modules } from '../types';

export const pickOptions = async (key: Modules, options?: Options) => {
	const configOptions: ConfigOptions = {
		enable: typeof options?.[key] === 'boolean' ? (options[key] as boolean) : true,
		overrides: {},
		...(typeof options?.[key] === 'object' ? (options[key] as ConfigOptions) : {})
	};

	const overrides: Rules = options?.overrides?.[key] || {};

	return {
		...configOptions,
		overrides: {
			...configOptions.overrides,
			...overrides
		}
	} as Required<ConfigOptions>;
};

//
export const cleanRules = (
	key: Modules,
	all: Rules,
	recommended: Rules,
	current: Rules
) => {
	current = JSON.parse(JSON.stringify(current));
	const deprecated: string[] = [];
	const removed: string[] = [];
	const invaild: string[] = [];
	const keys = Object.keys(current);

	keys.forEach((i) => {
		/* istanbul ignore next -- @preserve */
		if (all[i] === undefined && recommended[i] === undefined) {
			removed.push(i);
		}
		/* istanbul ignore next -- @preserve */
		if (
			recommended[i] === undefined
			&& (all[i] !== 0 && all[i] !== 'off')
			&& (current[i] === 0 || current[i] === 'off')
		) {
			invaild.push(i);
		}
	});

	// recommended部分还未deprecated，这里过滤一遍
	Object.keys(recommended).forEach((i) => {
		if (all[i] === undefined) {
			deprecated.push(i);
			delete current[i];
		}
	});

	/* istanbul ignore next -- @preserve */
	if (removed.length) {
		console.error(key + ': ' + removed.join(',') + ' has removed!\n');
	}

	/* istanbul ignore next -- @preserve */
	if (invaild.length) {
		console.error(key + ': ' + invaild.join(',') + ' has off default!\n');
	}

	/* istanbul ignore next -- @preserve */
	if (deprecated.length) {
		console.error(key + ': ' + deprecated.join(',') + ' has deprecated!\n');
	}

	return current;
};
