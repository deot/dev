import { Scheduler } from '@deot/dev-test';

describe('scheduler.ts', () => {
	it('next', async () => {
		const scheduler = new Scheduler();
		const next = vi.fn(scheduler.next);
		const fail = vi.fn(scheduler.nextWithError);
		setTimeout(next, 10);
		await scheduler;

		expect(next).toBeCalledTimes(1);
		expect(fail).toBeCalledTimes(0);

		setTimeout(next, 10);
		await scheduler;
		expect(next).toBeCalledTimes(2);
		expect(fail).toBeCalledTimes(0);

		try {
			setTimeout(fail, 10);
			await scheduler;
		} catch {
			expect(next).toBeCalledTimes(2);
			expect(fail).toBeCalledTimes(1);
		}
	});

	it('resolve', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const resolve = vi.fn(scheduler.finish);
		setTimeout(resolve, 10);
		await scheduler;

		await scheduler.next();
		await scheduler.nextWithError();
		await scheduler;
		await scheduler;
		await scheduler;
		await scheduler;

		expect(resolve).toBeCalledTimes(1);
	});

	it('reject', async () => {
		expect.assertions(4);
		const scheduler = new Scheduler();
		const reject = vi.fn(scheduler.finishWithError);
		setTimeout(reject, 10);
		try {
			await scheduler;
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler;
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler.next();
		} catch {
			expect(reject).toBeCalledTimes(1);
		}

		try {
			await scheduler.nextWithError();
		} catch {
			expect(reject).toBeCalledTimes(1);
		}
	});

	it('catch', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const reject = vi.fn(scheduler.finishWithError);
		setTimeout(reject, 10);

		scheduler.catch(() => {
			expect(reject).toBeCalledTimes(1);
		});

		try {
			await scheduler;
		} catch {
			// any
		}
	});

	it('finally', async () => {
		expect.assertions(1);
		const scheduler = new Scheduler();
		const resolve = vi.fn(scheduler.finish);
		setTimeout(resolve, 10);

		scheduler.finally(() => {
			expect(resolve).toBeCalledTimes(1);
		});

		await scheduler;
	});
});
