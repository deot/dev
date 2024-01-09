/**
 * @file (TODO: 从@deot/helper中导入)
 */
type Func<T> = (_?: T) => void;

export interface InterrupterOptions {
	timeout?: number; // TODO
}

/**
 * 实现的目的：
 * 这是一段代码使用`await interrupter`调度器
 * 永远等待它，直到它上面有任何代码执行了`interrupter.next()`
 * 不论它是同步，微任务，异步执行，之后才会执行它后面的代码
 */
export class Interrupter<T = any> {
	static of(options?: InterrupterOptions) {
		return new Interrupter(options);
	}

	options = {} as InterrupterOptions;

	_success?: Func<any>;

	_fail?: Func<any>;

	_task!: Promise<any>;

	_finish = false;

	constructor(options?: InterrupterOptions) {
		if (options) {
			this.options = options;
		}
		this._generateTask();
	}

	_generateTask = () => {
		this._task = new Promise<T>((resolve, reject) => {
			this._success = (value?: any) => {
				this._fail = undefined;
				resolve(value);
			};
			this._fail = (value?: any) => {
				this._success = undefined;
				reject(value);
			};
		});
	};

	next = async (v?: T) => {
		if (!this._finish) {
			this._success?.(v);
			await this._task; // index.spec.ts(next, microtask, async/await)
			await Promise.resolve(); // index.spec.ts(next, invoke, preTask)
			this._generateTask();
		} else {
			await this._task;
		}
	};

	nextWithError = async (v?: any) => {
		if (!this._finish) {
			this._fail?.(v);
			try {
				await this._task;
			} catch {
				await Promise.resolve();
				this._generateTask();
			}
		} else {
			await this._task;
		}
	};

	finish = (v?: T) => {
		this._success?.(v);
		this._finish = true;

		return this;
	};

	finishWithError = (v?: T) => {
		this._fail?.(v);
		this._finish = true;

		return this;
	};

	then(resolve: Func<T>, reject?: Func<T>) {
		return this._task.then(resolve, reject);
	}

	catch(callback?: Func<T>) {
		return this._task.catch(callback);
	}

	finally(callback?: Func<void>) {
		return this._task.finally(callback);
	}
}
