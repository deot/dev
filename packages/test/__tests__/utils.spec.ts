import { Utils } from '@deot/dev-test';

describe('utils.ts', () => {
	afterEach(() => {
		vi.useRealTimers();
	});

	it('sleep', async () => {
		vi.useFakeTimers();
		const complete = vi.fn();
		const task = Utils.sleep(100).then(complete);
		await vi.advanceTimersByTimeAsync(99);
		expect(complete).not.toHaveBeenCalled();
		await vi.advanceTimersByTimeAsync(1);
		await task;
		expect(complete).toHaveBeenCalledOnce();
	});

	it('expectByPolling', async () => {
		let count = -1;
		await Utils.expectByPolling(() => count++, 28, { interval: 1 });
		await Utils.expectByPolling(() => `${count++}`, '30', { to: 'toMatch' });
		await Utils.expectByPolling(() => count++, 32);
	});

	it('def', async () => {
		const target: any = {};
		Utils.def(target, 'value', 1);

		expect(target.value).toBe(1);
		expect(Object.keys(target)).toEqual([]);
		expect(Object.getOwnPropertyDescriptor(target, 'value')).toEqual({
			value: 1, enumerable: false, writable: true, configurable: true
		});
	});

	it('def supports symbols, descriptor overrides and returns the original object', () => {
		const target = {};
		const key = Symbol('key');
		expect(Utils.def(target, key, 3, { enumerable: true, writable: false })).toBe(target);
		expect(Object.getOwnPropertyDescriptor(target, key)).toEqual({
			value: 3, enumerable: true, writable: false, configurable: true
		});
	});

	it('polling awaits asynchronous values and stops as soon as a substring matches', async () => {
		const poll = vi.fn().mockResolvedValueOnce('loading').mockResolvedValue('ready: complete');
		await Utils.expectByPolling(poll, 'complete', { interval: 1, maxTries: 4 });
		expect(poll).toHaveBeenCalledTimes(2);
	});

	it('polling supports an explicit equality matcher for strings', async () => {
		const poll = vi.fn().mockReturnValueOnce('not ready').mockReturnValue('ready');
		await Utils.expectByPolling(poll, 'ready', { to: 'toBe', interval: 1 });
		expect(poll).toHaveBeenCalledTimes(2);
	});

	it('polling rejects on the last unsuccessful attempt without another delay', async () => {
		vi.useFakeTimers();
		const poll = vi.fn(() => 'loading');
		const task = Utils.expectByPolling(poll, 'ready', { maxTries: 3, interval: 20 });
		const assertion = expect(task).rejects.toThrow();
		await vi.advanceTimersByTimeAsync(40);
		await assertion;
		expect(poll).toHaveBeenCalledTimes(3);
		expect(vi.getTimerCount()).toBe(0);
	});

	it('polling propagates callback errors without retrying', async () => {
		const error = new Error('poll failed');
		const poll = vi.fn().mockRejectedValue(error);
		await expect(Utils.expectByPolling(poll, true)).rejects.toBe(error);
		expect(poll).toHaveBeenCalledOnce();
	});
});
