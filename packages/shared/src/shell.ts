import * as path from 'node:path';
import * as childProcess from 'node:child_process';
import * as util from 'node:util';
import * as fs from 'node:fs';

const SPACE = ' ';
const binDirectory = path.resolve(process.cwd(), './node_modules/.bin');
/* istanbul ignore next */
export const LOCAL_COMMAND_MAP = fs.existsSync(binDirectory) 
	? fs
		.readdirSync(binDirectory)
		.reduce((pre: any, file: string) => {
			const fullpath = path.resolve(binDirectory, file);
			// 获取文件信息
			const stat = fs.statSync(fullpath);
			if (stat.isFile()) {
				pre[file] = `./node_modules/.bin/${file}`;
			}
			return pre;
		}, {})
	: {};

export const exec = util.promisify(childProcess.exec);
export const spawn = (command: string, args: string[] = []) => {
	const [command$, ...args$] = (command + SPACE + args.join(SPACE))
		.replace(/\s+/g, SPACE)
		.split(SPACE)
		.filter(i => !!i)
		.map(i => LOCAL_COMMAND_MAP[i] || i);

	return new Promise((resolve, reject) => {
		const emit = childProcess.spawn(
			command$,
			args$, 
			{ 
				stdio: 'inherit'
			}
		);
		emit.on('close', (code) => {
			if (code === 0) {
				resolve(code);
			} else {
				reject(code);
			}
		});
		emit.on('error', (error) => {
			!process.exitCode && (process.exitCode = 1);
			reject(error);
		});
	});
};