import * as path from 'node:path';
import * as childProcess from 'node:child_process';
import * as fs from 'node:fs';

interface IPromise<T = any, K = any> {
	then: (resolve: (a: T) => void, reject: (b: K) => void) => Promise<any>;
	catch: (callback?: (b: K) => void) => Promise<any>;
	finally: (callback?: () => void) => Promise<any>;
}

const SPACE = ' ';
const binDirectory = path.resolve(process.cwd(), './node_modules/.bin');

const toPromise = <T extends {}, K = any>(target: T, promise: Promise<K>): T & IPromise<K> => {
	let instance = target as (T & IPromise<K>);
	
	instance.then = (resolve, reject) => promise.then(resolve, reject);
	instance.catch = (callback) => promise.catch(callback);
	instance.finally = (callback) => promise.finally(callback);

	return instance;
};

/* istanbul ignore next -- @preserve */ 
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

export const exec = (command$: string, args?: string[], options?: any) => {
	let command$$ = command(command$, args).join(SPACE);
	let reject: any;
	let resolve: any;

	const promise = new Promise<{ stderr: string; stdout: string }>((resolve$, reject$) => {
		reject = reject$;
		resolve = resolve$;
	});
	const subprocess = childProcess.exec(command$$, options, (error, stdout, stderr) => {
		process.off('beforeExit', handler);
		if (error) {
			reject(error);
			return;
		}
		resolve({
			stderr: stderr.toString(),
			stdout: stdout.toString()
		});
	});

	const handler = /* istanbul ignore next */ () => {
		!subprocess.killed && subprocess.kill('SIGHUP');
	};

	process.on('beforeExit', handler);
	return toPromise(subprocess, promise);
};

// 如果args某个参数中有空格且不要求被分离，需要''或者""包裹
export const spawn = (command$: string, args?: string[], options?: any) => {
	let [command$$, ...args$] = command(command$, args).map((i: string) => LOCAL_COMMAND_MAP[i] || i);
	args$ = args$.map((i: string) => i.replace(/^['"]|['"]$/g, ''));

	const subprocess = childProcess.spawn(
		command$$,
		args$, 
		{ 
			stdio: 'inherit',
			...options
		}
	);
	const promise = new Promise((resolve, reject) => {
		subprocess.on('close', (code) => {
			process.off('beforeExit', handler);
			if (code === 0) {
				resolve(code);
			} else {
				reject(code);
			}
		});
		subprocess.on('error', (error) => {
			process.off('beforeExit', handler);
			!process.exitCode && (process.exitCode = 1);
			reject(error);
		});
	});

	const handler = /* istanbul ignore next */ () => {
		!subprocess.killed && subprocess.kill('SIGHUP');
	};

	process.on('beforeExit', handler);

	return toPromise(subprocess, promise);
};