import os from 'node:os';
import { Utils } from '@deot/dev-shared';

describe('utils.ts', () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('getHost selects the first external IPv4 address', () => {
		vi.spyOn(os, 'networkInterfaces').mockReturnValue({
			lo: [{ address: '127.0.0.1', family: 'IPv4', internal: true }],
			en0: [
				{ address: 'fe80::1', family: 'IPv6', internal: false },
				{ address: '', family: 'IPv4', internal: false },
				{ address: '192.168.1.2', family: 'IPv4', internal: false }
			],
			en1: [{ address: '10.0.0.2', family: 'IPv4', internal: false }]
		} as unknown as ReturnType<typeof os.networkInterfaces>);
		expect(Utils.getHost()).toBe('192.168.1.2');
	});

	it('getHost returns undefined when there is no external IPv4 interface', () => {
		vi.spyOn(os, 'networkInterfaces').mockReturnValue({});
		expect(Utils.getHost()).toBeUndefined();
	});

	it('formatBytes', () => {
		expect(Utils.formatBytes(0)).toBe('0B');
		expect(Utils.formatBytes(8)).toBe('8B');
		expect(Utils.formatBytes(1024)).toBe('1KB');
		expect(Utils.formatBytes(1024 ** 3)).toBe('1GB');
	});

	it.each([
		[1023, 2, '1023B'],
		[1536, 2, '1.5KB'],
		[1234567, 2, '1.18MB'],
		[1234567, 0, '1MB'],
		[1234567, 3, '1.177MB'],
		[1024 ** 8, 2, '1YB']
	])('formatBytes(%s, %s) returns %s', (size, precision, expected) => {
		expect(Utils.formatBytes(size, precision)).toBe(expected);
	});

	it('autoCatch returns resolved values and invokes a callback once', async () => {
		const value = { ok: true };
		const callback = vi.fn(() => Promise.resolve(value));
		await expect(Utils.autoCatch(callback)).resolves.toBe(value);
		expect(callback).toHaveBeenCalledExactlyOnceWith();
		await expect(Utils.autoCatch(Promise.resolve(value))).resolves.toBe(value);
		await expect(Utils.autoCatch(() => 0)).resolves.toBe(0);
	});

	it.each([false, true])('autoCatch handles a rejected promise (callback=%s)', async (callback) => {
		const error = new Error('failed');
		const onError = vi.fn();
		const promise = Promise.reject(error);
		await expect(Utils.autoCatch(callback ? () => promise : promise, { onError })).resolves.toBeUndefined();
		expect(onError).toHaveBeenCalledExactlyOnceWith(error);
	});

	it('autoCatch reports errors through console.error by default', async () => {
		const error = new Error('default handler');
		const report = vi.spyOn(console, 'error').mockImplementation(() => {});
		await Utils.autoCatch(Promise.reject(error));
		expect(report).toHaveBeenCalledExactlyOnceWith(error);
	});
});
