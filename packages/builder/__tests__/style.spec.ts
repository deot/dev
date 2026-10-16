import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';
import type { Build } from '../src/build';
import { run } from '../src/style';
import { create } from '../src/minify';

describe('standalone stylesheet build', () => {
	let directory: string;
	let options: Build;

	beforeEach(async () => {
		directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dev-style-test-'));
		options = { packageSourceDir: path.join(directory, 'src'), packageOutDir: path.join(directory, 'dist') } as Build;
	});

	afterEach(async () => {
		await fs.remove(directory);
	});

	it('returns no artifacts when the source directory is absent', async () => {
		await expect(run(options)).resolves.toEqual([]);
		expect(await fs.pathExists(options.packageOutDir)).toBe(false);
	});

	it('builds only index styles, resolves Sass imports and reports the written file sizes', async () => {
		await fs.outputFile(path.join(options.packageSourceDir, '_colors.scss'), '$brand: red;');
		await fs.outputFile(path.join(options.packageSourceDir, 'index.scss'), '@use "colors"; .button { color: colors.$brand; }');
		await fs.outputFile(path.join(options.packageSourceDir, 'index.dark.scss'), '.button { color: white; }');
		await fs.outputFile(path.join(options.packageSourceDir, 'index.extra.css'), '.extra { display: flex; }');
		await fs.outputFile(path.join(options.packageSourceDir, 'unused.scss'), '.unused { color: blue; }');
		const stats = await run(options);
		expect(stats.map(stat => stat.file)).toEqual(['index.dark.scss', 'index.extra.css', 'index.scss']);
		expect(await fs.readdir(options.packageOutDir)).toEqual(['index.css', 'index.dark.css', 'index.extra.css']);
		expect(await fs.readFile(path.join(options.packageOutDir, 'index.css'), 'utf8')).toBe('.button{color:red}');
		for (const stat of stats) {
			expect(stat.size).toBe((await fs.stat(path.join(options.packageOutDir, stat.file.replace(/\.scss$/, '.css')))).size);
		}
	});

	it('rejects invalid Sass instead of reporting a successful build', async () => {
		await fs.outputFile(path.join(options.packageSourceDir, 'index.scss'), '.button { color: $undefined; }');
		await expect(run(options)).rejects.toThrow('Undefined variable');
		expect(await fs.pathExists(path.join(options.packageOutDir, 'index.css'))).toBe(false);
	});
});

describe('JavaScript minification override', () => {
	it.each([
		[undefined, {}], [false, { build: { minify: false } }], [true, { build: { minify: true } }]
	])('preserves explicit minify=%s', (value, expected) => {
		expect(create(value as boolean | undefined)).toEqual(expected);
	});
});
