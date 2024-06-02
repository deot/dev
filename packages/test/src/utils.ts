export const sleep = (s?: number) => new Promise((_) => { setTimeout(_, s || 0); });

interface ExpectByPollingOptions {
	interval?: number;
	maxTries?: number;
	to?: string;
}
/**
 * @param poll ~
 * @param expected ~
 * @param options ~
 */
export const expectByPolling = async (
	poll: () => Promise<any> | any,
	expected: any,
	options?: ExpectByPollingOptions
) => {
	const { maxTries = 30, interval = 50, to } = options || {};

	for (let tries = 0; tries < maxTries; tries++) {
		const actual = await poll();

		const allowMatch = (!to || to === 'toMatch') && typeof expected === 'string' && typeof actual === 'string';

		if (
			(allowMatch && actual.indexOf(expected) > -1)
			|| actual === expected
			|| tries === maxTries - 1
		) {
			allowMatch
				? expect(actual).toMatch(expected)
				: expect(actual)[to || 'toBe'](expected);
			break;
		} else {
			await sleep(interval);
		}
	}
};

export const def = <T = object>(
	target: T,
	key: PropertyKey,
	value?: any,
	options?: PropertyDescriptor
): T => {
	return Object.defineProperty<T>(target, key, {
		value,
		enumerable: false,
		writable: true,
		configurable: true,
		...options
	});
};
