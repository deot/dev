import { Locals } from '@deot/dev-shared';
import * as Dever from '@deot/dev-dever';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Dever.run).toBe('function');
	});
});
