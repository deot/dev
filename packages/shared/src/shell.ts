import * as childProcess from 'node:child_process';
import util from 'node:util';

const SPACE = ' ';
export const exec = util.promisify(childProcess.exec);
export const spawn = (command: string, args: string[] = []) => {
	const [command$, ...args$] = (command + SPACE + args.join(SPACE))
		.replace(/\s+/g, SPACE)
		.split(SPACE)
		.filter(i => !!i);
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