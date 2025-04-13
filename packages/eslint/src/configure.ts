import * as C from './configs';
import type { FlatConfig, Options } from './types';

export const configure = async (options?: Options, ...userConfigs: FlatConfig[]): Promise<FlatConfig[]> => {
	const configs: FlatConfig[] = [
		...(await C.ignores(options?.ignores)),
		...(await C.javascript(options)),
		...(await C.typescript(options)),
		...(await C.jsdoc(options)),
		...(await C.markdown(options)),
		...(await C.imports(options)),
		...(await C.stylistic(options)),
		...(await C.vue(options))
	];

	return configs.concat(userConfigs);
};
