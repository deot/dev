import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';

const context = vi.hoisted(() => ({ cwd: '', workspace: 'packages' }));
vi.mock('@deot/dev-shared', () => ({ Locals: { impl: () => context } }));

describe('demo entry discovery', () => {
	beforeEach(async () => {
		vi.resetModules();
		context.cwd = await fs.mkdtemp(path.join(os.tmpdir(), 'dev-entries-test-'));
		context.workspace = 'packages';
	});

	afterEach(async () => {
		await fs.remove(context.cwd);
	});

	it('finds supported demo files recursively, deduplicates extensions and excludes generated and test folders', async () => {
		for (const file of [
			'button/examples/basic.ts', 'button/examples/basic.vue', 'button/examples/react.tsx',
			'button/nested/examples/html.html', 'button/examples/readme.md', 'button/src/ignored.ts',
			'button/dist/examples/ignored.ts', 'button/node_modules/examples/ignored.ts',
			'button/__tests__/examples/ignored.ts', 'button/_/examples/ignored.ts', 'button/tpl/examples/ignored.ts'
		]) {
			await fs.outputFile(path.join(context.cwd, 'packages', file), '');
		}
		const { get } = await import('../src/entries');
		const result = get('examples');
		expect(result.entries).toEqual(['button/basic', 'button/react', 'button/nested/html']);
		expect(result.html).toContain('button/basic');
		expect(result.html).not.toContain('ignored');
	});

	it('retains the selected folder names when more than one demo directory is enabled', async () => {
		await fs.outputFile(path.join(context.cwd, 'packages/button/examples/index.js'), '');
		await fs.outputFile(path.join(context.cwd, 'packages/button/play/index.jsx'), '');
		const { get } = await import('../src/entries');
		expect(get('examples,play').entries).toEqual(['button/examples/index', 'button/play/index']);
	});

	it('supports single-package roots and reuses its cached discovery result', async () => {
		context.workspace = '';
		await fs.outputFile(path.join(context.cwd, 'play/index.html'), '');
		const { get } = await import('../src/entries');
		const result = get('play');
		await fs.outputFile(path.join(context.cwd, 'play/later.html'), '');
		expect(get('play')).toBe(result);
		expect(result.entries).toEqual(['index']);
	});
});
