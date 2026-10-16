import * as path from 'node:path';
import fs from 'fs-extra';
import { fileURLToPath } from 'node:url';
import { Shell } from '@deot/dev-shared';
import { build } from 'vite';
import type { InlineConfig } from 'vite';
import sharedConfig from '@deot/dev-vue';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// @vitest-environment node
describe('index.ts', () => {
	const entry = path.resolve(dirname, './fixtures/app.vue');

	it('basic', () => {
		expect(typeof sharedConfig).toBe('object');
	});

	it('build', async () => {
		const options: InlineConfig = {
			logLevel: 'silent',
			build: {
				write: false,
				lib: {
					entry,
					formats: ['es'],
					fileName: 'index.js'
				}
			}
		};
		options.configFile = path.resolve(dirname, '../src/index.ts');
		const { output } = (await build(options))[0];
		expect(output[0]).toMatchObject({ type: 'chunk', exports: ['default'] });
		expect(output[0].code).toContain('Hello World!');
		expect(output[0].code).not.toContain('<div>Hello World!</div>');
	});

	it('vue-tsc, *.d.ts', async () => {
		await fs.remove(path.resolve(dirname, './fixtures/dist'));
		const has = (filename: string) => fs.existsSync(path.resolve(dirname, './fixtures/dist', filename));

		await Shell.exec(`"${path.resolve('node_modules/.bin/vue-tsc')}"`, [
			'-p', `"${path.resolve(dirname, './fixtures/tsconfig.json')}"`, '--skipLibCheck'
		]);
		expect(has('index.d.ts')).toBe(true);
		expect(has('app.vue.d.ts')).toBe(true);
		expect(await fs.readFile(path.resolve(dirname, './fixtures/dist/index.d.ts'), 'utf8')).toContain('export { App }');
		expect(await fs.readFile(path.resolve(dirname, './fixtures/dist/app.vue.d.ts'), 'utf8')).toContain('export default');
	}, 100000);

	it.each(['', '1'])('USE_REACT=%s applies Vue JSX only to matching files', async (useReact) => {
		vi.stubEnv('USE_REACT', useReact);
		vi.resetModules();
		try {
			const { default: config } = await import('../src/index.ts');
			const plugin: any = config.plugins!.find((item: any) => item.name === 'vite:vue-jsx');
			const code = 'export const render = () => <div>Vue JSX</div>;';
			const matched = await plugin.transform.handler(code, '/app.vue.jsx');
			expect(matched.code).toContain('createVNode');
			const ordinary = await plugin.transform.handler(code, '/app.jsx');
			if (useReact) {
				expect(ordinary).toBeUndefined();
			} else {
				expect(ordinary.code).toContain('createVNode');
			}
		} finally {
			vi.unstubAllEnvs();
		}
	});
});
