import { Utils } from '@deot/dev-shared';

describe('utils.ts', () => {
	it('getHost', () => {
		expect(typeof Utils.getHost()).toBe('string');
	});

	it('formatBytes', () => {
		expect(Utils.formatBytes(0)).toBe('0B');
		expect(Utils.formatBytes(8)).toBe('8B');
		expect(Utils.formatBytes(1024)).toBe('1KB');
		expect(Utils.formatBytes(1024 ** 3)).toBe('1GB');
	});

	it('autoCatch', () => {
		const OUTPUT = new Error();
		Utils.autoCatch(() => {
			return Promise.reject(OUTPUT);
		}, {
			onError: (e: any) => {
				expect(e).toBe(OUTPUT);
			}
		});

		Utils.autoCatch(() => {
			expect(OUTPUT).toBe(OUTPUT);
		});
	});
});
