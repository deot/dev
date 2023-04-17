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


export const command = (command$: string, args?: string[]) => {
	const v = (command$ + SPACE + (args || []).join(SPACE))
		.match(/[^\s'"]+|'[^']*'|"[^"]*"/g);

	return v || [];
};

export const exec = (command$: string, args?: string[]) => {
	return util.promisify(childProcess.exec)(command(command$, args).join(SPACE));
};

// 如果args某个参数中有空格且不要求被分离，需要''或者""包裹
export const spawn = (command$: string, args?: string[], options?: any) => {
	let [command$$, ...args$] = command(command$, args).map((i: string) => LOCAL_COMMAND_MAP[i] || i);
	args$ = args$.map((i: string) => i.replace(/^['"]|['"]$/g, ''));

	return new Promise((resolve, reject) => {
		const emit = childProcess.spawn(
			command$$,
			args$, 
			{ 
				stdio: 'inherit',
				...options
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