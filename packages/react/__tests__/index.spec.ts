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
		expect(typeof output[0].code === 'string').toBe(true);
	});

	it('tsc, *.d.ts', async () => {
		fs.remove(path.resolve(dirname, './fixtures/dist'));
		const has = (filename: string) => fs.existsSync(path.resolve(dirname, './fixtures/dist', filename));
		await Shell.exec(`tsc`, ['-p', path.resolve(dirname, './fixtures/tsconfig.json')]);
		expect(has('index.d.ts')).toBe(true);
		expect(has('app.d.ts')).toBe(true);
	}, 100000);
});
