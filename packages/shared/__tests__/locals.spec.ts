import * as path from 'node:path';
import { Locals } from '@deot/dev-shared';

describe('shared.ts', () => {
	it('command', () => {
		expect(Locals.getPackageName('index')).toBe('@deot/dev');
		expect(Locals.getPackageName('shared')).toBe('@deot/dev-shared');
		expect(Locals.getPackageFolderName('@deot/dev-shared')).toBe('shared');
		expect(Locals.getPackageFolderName('@deot/dev')).toBe('index');
		expect(Locals.getNormalizePackage({})).toEqual([]);
		expect(Locals.getNormalizePackage({
			a: ['b'],
			b: ['c'],
			c: []
		})).toEqual(['c', 'b', 'a']);

		try {
			Locals.getNormalizePackage({
				a: ['b'],
				b: ['a'],
			});
		} catch (e) {
			expect(1).toBe(1);
		}
	});

	it('impl', () => {
		const it = Locals.impl();
		expect(it.workspace).toBe('packages');
		expect(it.packageName).toBe('@deot/dev');
		expect(it.packageDir).toMatch(`/dev/packages`);
		expect(it.packageFolderNames.length > 0).toBe(true);
		expect(it.homepage).toBe(`https://github.com/deot/dev`);
	});

	it('impl single', () => {
		const it$ = Locals.impl();
		const it = Locals.impl(it$.packageDir + '/shared');
		expect(it.workspace).toBe('');
		expect(it.packageName).toBe('@deot/dev-shared');
		expect(it.packageDir).toMatch(`/shared`);
		expect(it.packageFolderNames.length).toBe(0);
	});

	it('subpackage', () => {
		const it$ = Locals.impl();
		expect(!!it$.subpackagesMap['index'].length).toBe(false);
	});

	it('subpackage, components', () => {
		const it$ = Locals.impl(path.resolve('./packages/_/monorepo'));
		expect(!!it$.subpackagesMap['components'].length).toBe(true);
	});
});
