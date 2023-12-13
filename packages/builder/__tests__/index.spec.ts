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
		expect.hasAssertions();
		const { stdout: v } = await Shell.exec(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/monorepo'),
		});

		const has = (filename: string) => fs.existsSync(path.resolve(`./packages/_/monorepo/packages/components/dist/`, filename));
		expect(has('index.js')).toBe(true);
		expect(has('index.iife.js')).toBe(true);
		expect(has('index.cjs')).toBe(true);
		expect(has('index.d.ts')).toBe(true);

		// logs
		[
			'index.ts: CJS',
			'index.ts: ES'
		].forEach(i => expect(v).toMatch(i));
	}, 120000);

	it('singlerepo', async () => {
		expect.hasAssertions();
		const { stdout: v } = await Shell.exec(`npm`, ['run', 'build'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});

		const has = (filename: string) => fs.existsSync(path.resolve('./packages/_/singlerepo/dist/', filename));
		expect(has('index.css')).toBe(true);

		// 因为js引用了css，vite会将其打包出，命名为style.css
		expect(has('index.style.css')).toBe(true);
		expect(has('index.m.style.css')).toBe(true);

		// es
		expect(has('index.js')).toBe(true);
		expect(has('index.m.js')).toBe(true);

		// cjs
		expect(has('index.cjs')).toBe(true);
		expect(has('index.m.cjs')).toBe(true);

		// iife
		expect(has('index.iife.js')).toBe(true);
		expect(has('index.m.iife.js')).toBe(true);

		// umd
		expect(has('index.umd.cjs')).toBe(true);
		expect(has('index.m.umd.cjs')).toBe(true);

		// logs
		[
			'index.ts: CJS',
			'index.ts: ES',
			'index.ts: IIFE',
			'index.ts: UMD',
			'index.m.ts: CJS',
			'index.m.ts: ES',
			'index.m.ts: IIFE',
			'index.m.ts: UMD'
		].forEach(i => expect(v).toMatch(i));
	}, 120000);
});
