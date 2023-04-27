import { Locals } from '@deot/dev-shared';
import * as Adder from '@deot/dev-adder';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Adder.run).toBe('function');
	});
});
