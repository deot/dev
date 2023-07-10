import { fitVersion } from '../src/fit-version';

describe('fit-version.ts', () => {
	it('config', () => {
		const versions = [
			'1.0.0', 
			'1.0.1', 
			'1.0.2', 
			'1.1.0', 
			'1.1.1', 
			'1.1.2',
			'2.0.0',
			'2.0.1',
			'2.0.2',
			'2.1.0',
			'2.1.1',
			'2.1.2',
			'3.1.0',
			'3.1.1',
			'3.1.2'
		];
		let f = (version: string, options?: any) => fitVersion(versions, version, options);

		// keep
		expect(f('')).toBe('');
		expect(f('*')).toBe('*');
		expect(f('next')).toBe('next');
		expect(f('0.0.1')).toBe('0.0.1');
		expect(f('0.0.1')).toBe('0.0.1');
		expect(f('1.0.0')).toBe('1.0.0');

		// auto
		expect(f('>1.0.0')).toBe('>3.1.2');
		expect(f('>=1.0.0')).toBe('>=3.1.2');
		expect(f('^1.0.0')).toBe('^1.1.2');
		expect(f('~1.0.0')).toBe('~1.0.2');
		expect(f('~1.0.0-alpha.1')).toBe('~1.0.2');

		// major
		expect(f('1.0.0', { major: true })).toBe('3.1.2');
		expect(f('^1.0.0', { major: true })).toBe('^3.1.2');
		expect(f('~1.0.0', { major: true })).toBe('~3.1.2');
		expect(f('2.0.0', { major: true })).toBe('3.1.2');
		expect(f('^2.0.0', { major: true })).toBe('^3.1.2');
		expect(f('~2.0.0', { major: true })).toBe('~3.1.2');
		expect(f('^3.1.2', { major: true })).toBe('^3.1.2');

		// minor
		expect(f('1.0.0', { minor: true })).toBe('1.1.2');
		expect(f('^1.0.0', { minor: true })).toBe('^1.1.2');
		expect(f('~1.0.0', { minor: true })).toBe('~1.1.2');
		expect(f('2.0.0', { minor: true })).toBe('2.1.2');
		expect(f('^2.0.0', { minor: true })).toBe('^2.1.2');
		expect(f('~2.0.0', { minor: true })).toBe('~2.1.2');

		// patch
		expect(f('1.0.0', { patch: true })).toBe('1.0.2');
		expect(f('^1.0.0', { patch: true })).toBe('^1.0.2');
		expect(f('~1.0.0', { patch: true })).toBe('~1.0.2');
		expect(f('2.0.0', { patch: true })).toBe('2.0.2');
		expect(f('^2.0.0', { patch: true })).toBe('^2.0.2');
		expect(f('~2.0.0', { patch: true })).toBe('~2.0.2');
		expect(f('~3.1.2', { patch: true })).toBe('~3.1.2');

		// none
		expect(f('~3.1.3', { patch: true })).toBe('~3.1.3');
		expect(f('~33.1.3', { patch: true })).toBe('~33.1.3');
		expect(f('~33.11.3', { patch: true })).toBe('~33.11.3');
		expect(f('~33.11.33', { patch: true })).toBe('~33.11.33');
	});

	it('empty', () => {
		const versions = [];
		let f = (version: string, options?: any) => fitVersion(versions, version, options);

		// keep
		expect(f('')).toBe('');
		expect(f('*')).toBe('*');
		expect(f('next')).toBe('next');
		expect(f('0.0.1')).toBe('0.0.1');
		expect(f('0.0.1')).toBe('0.0.1');
		expect(f('1.0.0')).toBe('1.0.0');
	});
});
