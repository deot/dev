import { createRequire } from "node:module";
import path from 'node:path';

const require$ = createRequire(import.meta.url);

const cwd = process.cwd();
export class Shared {
	static impl() {
		return {
			packageName: require$(`${cwd}/packages/index/package.json`).name,
			directory: path.resolve(cwd, './packages')
		};
	}
}