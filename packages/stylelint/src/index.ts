import type { Config } from 'stylelint';
import { configure } from './configure';

const config: Promise<Config> = configure();

export {
	configure,
	config as default
};
