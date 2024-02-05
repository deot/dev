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
		expect(typeof output[0].code === 'string').toBe(true);
	});

	it('vue-tsc, *.d.ts', async () => {
		fs.remove(path.resolve(dirname, './fixtures/dist'));
		const has = (filename: string) => fs.existsSync(path.resolve(dirname, './fixtures/dist', filename));

		try {
			await Shell.exec(`vue-tsc`, ['-p', path.resolve(dirname, './fixtures/tsconfig.json')]);
		} catch (e) {
			// 等价于skipLibCheck
		}
		expect(has('index.d.ts')).toBe(true);
		expect(has('app.vue.d.ts')).toBe(true);
	}, 100000);
});
