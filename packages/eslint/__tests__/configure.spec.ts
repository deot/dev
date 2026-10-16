import { Linter } from 'eslint';
import { configure } from '../src/configure';
import { pickOptions, cleanRules } from '../src/configs/_helper';
import { ignores } from '../src/configs/ignores';

describe('ESLint configuration customization', () => {
	it.each([true, false])('supports a boolean module switch: %s', async (enable) => {
		await expect(pickOptions('javascript', { javascript: enable })).resolves.toEqual({ enable, overrides: {} });
	});

	it('merges local overrides with global overrides taking precedence without mutating options', async () => {
		const options = {
			javascript: { enable: true, overrides: { 'no-debugger': 'off', 'no-undef': 'error' } },
			overrides: { javascript: { 'no-debugger': 'error' } }
		} as const;
		const original = structuredClone(options);
		await expect(pickOptions('javascript', options)).resolves.toEqual({
			enable: true, overrides: { 'no-debugger': 'error', 'no-undef': 'error' }
		});
		expect(options).toEqual(original);
	});

	it('removes deprecated recommended rules without changing the input rules', () => {
		const current = { 'no-debugger': 'warn', 'deprecated': 'error' } as const;
		expect(cleanRules('javascript', { 'no-debugger': 'error' }, { deprecated: 'error' }, current)).toEqual({ 'no-debugger': 'warn' });
		expect(current.deprecated).toBe('error');
	});

	it('can remove a default ignore and add custom paths without duplicates or input mutation', async () => {
		const patterns = ['!**/node_modules', '**/dist', '**/generated'];
		const result = await ignores(patterns);
		expect(result[0].ignores).toContain('**/generated');
		expect(result[0].ignores).not.toContain('**/node_modules');
		expect(result[0].ignores).not.toContain('!**/node_modules');
		expect(result[0].ignores!.filter(value => value === '**/dist')).toHaveLength(1);
		expect(patterns).toEqual(['!**/node_modules', '**/dist', '**/generated']);
	});

	it('appends user configs last so they can override built-in rules in actual linting', async () => {
		const user = { rules: { 'no-debugger': 'off' } } as const;
		const config = await configure({
			typescript: false, import: false, vue: false, markdown: false, jsdoc: false, stylistic: false,
			javascript: { overrides: { 'no-debugger': 'error' } }
		}, user);
		expect(config.at(-1)).toBe(user);
		const linter = new Linter();
		expect(linter.verify('debugger;', config, 'example.js')).toEqual([]);
		expect(linter.verify('debugger;', config.slice(0, -1), 'example.js')).toEqual([
			expect.objectContaining({ ruleId: 'no-debugger', severity: 2 })
		]);
	});
});
