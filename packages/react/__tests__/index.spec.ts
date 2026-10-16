import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { build } from 'vite';
import type { InlineConfig } from 'vite';
import { Shell } from '@deot/dev-shared';
import sharedConfig from '@deot/dev-react';

const dirname = path.dirname(fileURLToPath(import.meta.url));
// @vitest-environment node
describe('index.ts', () => {
	const entry = path.resolve(dirname, './fixtures/app.tsx');

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
		expect(output[0].code).toContain('Hello World');
		expect(output[0].code).not.toContain('<div>');
	});

	it('tsc, *.d.ts', async () => {
		await fs.remove(path.resolve(dirname, './fixtures/dist'));
		const has = (filename: string) => fs.existsSync(path.resolve(dirname, './fixtures/dist', filename));
		await Shell.exec(`"${path.resolve('node_modules/.bin/tsc')}"`, [
			'-p', `"${path.resolve(dirname, './fixtures/tsconfig.json')}"`, '--skipLibCheck'
		]);
		expect(has('index.d.ts')).toBe(true);
		expect(has('app.d.ts')).toBe(true);
		expect(await fs.readFile(path.resolve(dirname, './fixtures/dist/index.d.ts'), 'utf8')).toContain('export { App }');
		expect(await fs.readFile(path.resolve(dirname, './fixtures/dist/app.d.ts'), 'utf8')).toContain('export default');
	}, 100000);
});
