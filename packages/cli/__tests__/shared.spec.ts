import { Shared } from '../src/shared';

describe('shared.ts', () => {
	it('command', () => {
		expect(Shared.getPackageName('index')).toBe('@deot/dev');
		expect(Shared.getPackageName('shared')).toBe('@deot/dev-shared');
		expect(Shared.getPackageFolderName('@deot/dev-shared')).toBe('shared');
		expect(Shared.getPackageFolderName('@deot/dev')).toBe('index');
		expect(Shared.getNormalizePackage({})).toEqual([]);
		expect(Shared.getNormalizePackage({
			a: ['b'],
			b: ['c'],
			c: []
		})).toEqual(['c', 'b', 'a']);

	});

	it('impl', () => {
		const it = Shared.impl();
		expect(it.workspace).toBe('packages');
		expect(it.packageName).toBe('@deot/dev');
		expect(it.packageDir).toMatch(`/dev/packages`);
		expect(it.packageFolderNames.length > 0).toBe(true);
		expect(it.homepage).toBe(`https://github.com/deot/dev`);
	});
});
