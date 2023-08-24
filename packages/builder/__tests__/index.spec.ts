import * as path from 'node:path';
import * as fs from 'node:fs';
import { Locals, Shell } from '@deot/dev-shared';
import * as Builder from '@deot/dev-builder';

describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Builder.run).toBe('function');
	});

	it('monorepo', async () => {
		expect.assertions(1);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		expect(response).toBe(0);
	}, 120000);

	it('singlerepo', async () => {
		expect.assertions(7);
		const response = await Shell.spawn(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		expect(response).toBe(0);
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/index.css'))).toBe(true);

		// 因为js引用了css，vite会将其打包出，命名为style.css
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/style.css'))).toBe(true);

		// es
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/index.es.js'))).toBe(true);

		// cjs
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/index.cjs'))).toBe(true);

		// iife
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/index.iife.js'))).toBe(true);

		// umd
		expect(fs.existsSync(path.resolve('./packages/_/singlerepo/dist/index.umd.js'))).toBe(true);
	}, 120000);
});
