import type { Nullable } from '@deot/dev-shared';
import { Shell } from '@deot/dev-shared';
import * as childProcess from 'child_process';

const { LOCAL_COMMAND_MAP } = Shell;
const KEY_MAP = {
	DOWN: '\x1b\x5b\x42',
	UP: '\x1b\x5b\x41',

	ENTER: '\x0d', // return;
	SPACE: '\x7f'
};

export class Command {
	target: Promise<any>;

	code: Nullable<any>;

	error: any;

	resolve: any;

	reject: any;

	stdout: string;

	stderr: string;

	emitter: childProcess.ChildProcessWithoutNullStreams;

	isClose: boolean;

	schedule: { 
		target: Promise<void>; 
		complete: () => void;
    };

	constructor(command: string, args: string[]) {
		this.target = new Promise((resolve, reject) => {
			this.resolve = this._handleEnd(resolve);
			this.reject = this._handleEnd(reject);
		});

		this.code = null;
		this.error = null;
		this.stdout = '';
		this.stderr = '';

		this.emitter = this.start(command, args);
		this.isClose = false;

		this.schedule = {
			target: Promise.resolve(),
			complete: /* istanbul ignore next */ () => {}
		};
	}

	_handleEnd(fn: any) {
		return (e: any) => {
			this.isClose = true;
			const { code, error } = e;
			this.code = code;
			this.error = error;
			fn({
				...e,
				stdout: this.stdout,
				stderr: this.stderr
			});
		};
	}

	start(command: string, args: string[]) {
		const SPACE = ' ';
		const [command$, ...args$] = (command + SPACE + args.join(SPACE))
			.replace(/\s+/g, SPACE)
			.split(SPACE)
			.filter(i => !!i)
			.map(i => LOCAL_COMMAND_MAP[i] || i);

		const emitter = childProcess.spawn(command$, args$, { 
			stdio: ['pipe', 'pipe', 'pipe'] 
		});

		emitter.on('close', (code) => {
			if (code !== 0) {
				this.reject({ code });
			} else {
				this.resolve({ code });
			}
		});

		emitter.on('error', /* istanbul ignore next */ (error) => {
			!process.exitCode && (process.exitCode = 1);
			this.reject({ code: process.exitCode, error });
		});
		 
		emitter.stdout.on('data', e => {
			this.stdout += e.toString();
			this.schedule.complete(); // 主要node其他子任务执行时，这个回调会延迟，导致下一个按钮直接键入
		});

		emitter.stderr.on('data', /* istanbul ignore next */ e => this.stderr += e.toString());

		return emitter;
	}

	async stop() {
		await this.schedule.target;

		if (!this.isClose) {
			this.emitter.stdin.end();
			this.isClose = true;
		}
		
		const response = await this.target;
		return response;
	}

	async press(key: string, timeout = 200) {
		if (!key || this.isClose) return;

		await this.schedule.target;
		this.schedule.target = new Promise(resolve => {
			this.schedule.complete = resolve;
		});

		await new Promise(resolve => {
			this.emitter.stdin.write(
				KEY_MAP[key.toUpperCase()] || key,
				'utf8',
				resolve
			);
		});

		await new Promise(_ => setTimeout(_, timeout)); // eslint-disable-line
	}
}


