import * as Dev from '@deot/dev';
import { Utils, Logger, Shell, Command, Builder, Releaser, Tester } from '@deot/dev';
import * as Shared from '@deot/dev-shared';
import { Command as TestCommand } from '@deot/dev-test';

// @vitest-environment node
describe('index.ts', () => {
	it('reexports the original shared utilities and command constructor', () => {
		expect(Dev.Utils).toBe(Shared.Utils);
		expect(Dev.Logger).toBe(Shared.Logger);
		expect(Dev.Shell).toBe(Shared.Shell);
		expect(Dev.Command).toBe(TestCommand);
	});

	it.each(['Builder', 'Releaser', 'Tester', 'Adder', 'Dever', 'Linker', 'Updater'] as const)('exposes the %s workflow', async (name) => {
		const original = await import(`../../${name.toLowerCase()}/src/index.ts`);
		expect(Dev[name].run).toBe(original.run);
	});

	it('any', () => {
		expect(typeof Builder).toBe('object');
		expect(typeof Releaser).toBe('object');
		expect(typeof Tester).toBe('object');
		expect(typeof Utils).toBe('object');
		expect(typeof Logger).toBe('object');
		expect(typeof Shell).toBe('object');
		expect(typeof Command).toBe('function');
	});
});
