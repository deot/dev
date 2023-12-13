import * as C from './configs';
import type { FlatConfig, Options } from './types';

export const configuire = async (options?: Options, ...userConfigs: FlatConfig[]): Promise<FlatConfig[]> => {
	const configs: FlatConfig[] = [
		...(await C.ignores(options?.ignores)),
		...(await C.jsdoc(options)),
		...(await C.javascript(options)),
		...(await C.typescript(options)),
		...(await C.markdown(options)),
		...(await C.imports(options))
	];

	return configs.concat(userConfigs);
}