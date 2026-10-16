import * as path from 'node:path';
import { Locals } from '@deot/dev-shared';

describe('shared.ts', () => {
	it('getPackageName', () => {
		expect(Locals.getPackageName('index')).toBe('@deot/dev');
		expect(Locals.getPackageName('shared')).toBe('@deot/dev-shared');
	});

	it('getPackageFolderName', () => {
		expect(Locals.getPackageFolderName('@deot/dev-shared')).toBe('shared');
		expect(Locals.getPackageFolderName('@deot/dev')).toBe('index');
	});

	it('getNormalizePackage', () => {
		expect(Locals.getNormalizePackage({})).toEqual([]);
		expect(Locals.getNormalizePackage({
			a: ['b'],
			b: ['c'],
			c: []
		})).toEqual(['c', 'b', 'a']);

		expect(() => Locals.getNormalizePackage({
			a: ['b'],
			b: ['a'],
		})).toThrow('a b deps loop');
	});

	it('orders shared dependencies before all dependents without mutating the graph', () => {
		const graph = { app: ['left', 'right'], left: ['shared'], right: ['shared'], shared: [], alone: [] };
		const original = structuredClone(graph);
		const result = Locals.getNormalizePackage(graph);
		expect(new Set(result)).toEqual(new Set(Object.keys(graph)));
		for (const [name, dependencies] of Object.entries(graph)) {
			for (const dependency of dependencies) {
				expect(result.indexOf(dependency)).toBeLessThan(result.indexOf(name));
			}
		}
		expect(graph).toEqual(original);
	});

	it('rejects a self dependency', () => {
		expect(() => Locals.getNormalizePackage({ self: ['self'] })).toThrow('self self deps loop');
	});

	it('getRealPackageName', () => {
		expect(Locals.getRealPackageName('*')).toBe('*');
		expect(Locals.getRealPackageName('index')).toBe('@deot/dev');
		expect(Locals.getRealPackageName('shared')).toBe('@deot/dev-shared');
		expect(Locals.getRealPackageName()).toBe(undefined);
		expect(Locals.getRealPackageName('index,shared')).toBe('@deot/dev,@deot/dev-shared');
		expect(Locals.getRealPackageName(',shared')).toBe('@deot/dev-shared');
		expect(Locals.getRealPackageName('@deot/dev')).toBe('@deot/dev');
		expect(Locals.getRealPackageName('@deot/dev,shared')).toBe('@deot/dev,@deot/dev-shared');
		// 过滤无效的包
		expect(Locals.getRealPackageName('@deot/dev,abc')).toBe('@deot/dev');
		expect(Locals.getRealPackageName('@deot/dev-bb,abc')).toBe('');
	});

	it('impl', () => {
		const it = Locals.impl();
		expect(it.workspace).toBe('packages');
		expect(it.packageName).toBe('@deot/dev');
		expect(it.packageDir).toBe(path.resolve(process.cwd(), 'packages'));
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

	it('keeps single-package names and reuses the configuration for the same directory', () => {
		const cwd = path.resolve('./packages/shared');
		expect(Locals.impl(cwd)).toBe(Locals.impl(cwd));
		expect(Locals.getPackageName('other', cwd)).toBe('@deot/dev-shared');
		expect(Locals.getPackageFolderName('@deot/dev-shared', cwd)).toBe('');
		expect(Locals.getRealPackageName('left,right', cwd)).toBe('left,right');
	});

	it('discovers package metadata, dependency order and subpackages in the monorepo fixture', () => {
		const cwd = path.resolve('./packages/_/monorepo');
		const config = Locals.impl(cwd);
		expect(config.packageName).toBe('@demo/helper');
		expect(config.packageFolderNames).not.toContain('shims.d.ts');
		expect(config.subpackagesMap['components']).toEqual(['button']);
		expect(config.packageDirsMap['shared']).toBe(path.join(cwd, 'packages/shared'));
		expect(config.normalizePackageNames).toHaveLength(config.packageFolderNames.length);
		for (const [name, dependencies] of Object.entries(config.packageRelation as Record<string, string[]>)) {
			for (const dependency of dependencies) {
				expect(config.normalizePackageNames.indexOf(dependency)).toBeLessThan(config.normalizePackageNames.indexOf(name));
			}
		}
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
