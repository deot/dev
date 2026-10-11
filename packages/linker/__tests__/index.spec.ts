import { Locals } from '@deot/dev-shared';
import * as Linker from '@deot/dev-linker';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toBe(process.cwd());
	});

	it('run', async () => {
		expect(typeof Linker.run).toBe('function');
	});
});
