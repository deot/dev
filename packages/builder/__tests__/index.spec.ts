import * as path from 'node:path';
import * as fs from 'node:fs';
import { Locals, Shell } from '@deot/dev-shared';
import * as Builder from '@deot/dev-builder';

// @vitest-environment node
describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Builder.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.assertions(4);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		const has = (filename: string) => fs.existsSync(path.resolve(`./packages/_/monorepo/packages/components/dist/`, filename));
		expect(response).toBe(0);
		expect(has('index.es.js')).toBe(true);
		expect(has('index.cjs')).toBe(true);
		expect(has('index.d.ts')).toBe(true);
	}, 120000);

	it('singlerepo', async () => {
		expect.assertions(7);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		expect(response).toBe(0);

		const has = (filename: string) => fs.existsSync(path.resolve('./packages/_/singlerepo/dist/', filename));
		expect(has('index.css')).toBe(true);

		// 因为js引用了css，vite会将其打包出，命名为style.css
		expect(has('style.css')).toBe(true);

		// es
		expect(has('index.es.js')).toBe(true);

		// cjs
		expect(has('index.cjs')).toBe(true);

		// iife
		expect(has('index.iife.js')).toBe(true);

		// umd
		expect(has('index.umd.js')).toBe(true);
	}, 120000);
});
