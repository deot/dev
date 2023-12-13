import { Utils } from '@deot/dev-test';

describe('utils.ts', () => {
	it('sleep', async () => {
		await Utils.sleep(1);
		await Utils.sleep();
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
	});
});
