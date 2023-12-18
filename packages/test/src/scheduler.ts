type Func<T> = (_?: T) => void;

export class Scheduler<T = any> {
	_success?: Func<any>;
	_fail?: Func<any>;
	_task!: Promise<any>;
	_finish = false;
	constructor() {
		this.next();
	}

	next = (v?: T) => {
		if (!this._finish) {
			this._success?.(v);
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
		}
		return this;
	};

	nextWithError = (v?: any) => {
		if (!this._finish) {
			this._fail?.(v);
			this.next();
		}
		return this;
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

	then(resolve: Func<T>, reject: Func<T>) {
		return this._task.then(resolve, reject);
	}

	catch(callback?: Func<T>) {
		return this._task.catch(callback);
	}

	finally(callback?: Func<void>) {
		return this._task.finally(callback);
	}
}
