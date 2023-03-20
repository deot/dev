import * as childProcess from 'child_process';

global.Command = class Command {
	constructor(command, args) {
		this.target = new Promise((resolve, reject) => {
			this.resolve = this._handleEnd(resolve);
			this.reject = this._handleEnd(reject);
		});

		this.code = null;
		this.error = null;
		this.stdout = '';
		this.stderr = '';

		this.KEY_MAP = {
			DOWN: '\x1b\x5b\x42',
			UP: '\x1b\x5b\x41',

			ENTER: '\x0d', // return;
			SPACE: '\x7f'
		};

		this.emitter = this.start(command, args);
		this.isClose = false;

		this.schedule = {
			target: Promise.resolve(),
			complete: () => {}
		};
	}

	_handleEnd(fn) {
		return (e) => {
			if (!this.isClose) return;
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

	start(command, args) {
		const SPACE = ' ';
		const [command$, ...args$] = (command + SPACE + args.join(SPACE))
			.replace(/\s+/g, SPACE)
			.split(SPACE)
			.filter(i => !!i);

		const emitter = childProcess.spawn(command$, args$, { 
			stdio: ['pipe', 'pipe', 'pipe'] 
		});
		emitter.stdin.setEncoding('utf8');
		emitter.on('close', (code) => {
			if (code !== 0) {
				this.reject({ code });
			} else {
				this.resolve({ code });
			}
		});

		emitter.on('error', (error) => {
			!process.exitCode && (process.exitCode = 1);
			this.reject({ code: process.exitCode, error });
		});

		emitter.stdout.on('data', e => {
			this.stdout += e.toString();
			this.schedule.complete(); // 主要node其他子任务执行时，这个回调会延迟，导致下一个按钮直接键入
		});

		emitter.stderr.on('data', e => this.stderr += e.toString());

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

	async press(key, timeout = 200) {
		if (!key || this.isClose) return;

		await this.schedule.target;
		this.schedule.target = new Promise(resolve => {
			this.schedule.complete = resolve;
		});

		await new Promise(resolve => {
			this.emitter.stdin.write(
				this.KEY_MAP[key.toUpperCase()] || key,
				'utf8',
				resolve
			);
		});

		await new Promise(_ => setTimeout(_, timeout)); // eslint-disable-line
	}
};


