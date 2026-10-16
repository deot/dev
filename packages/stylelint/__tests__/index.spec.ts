import stylelint from 'stylelint';
import configPromise, { configure } from '@deot/dev-stylelint';

// @vitest-environment node
const lint = async (text: string, options?: stylelint.LinterOptions) => {
	const resultObject = await stylelint.lint({
		config: await configPromise,
		code: text,
		...options
	});
	return resultObject;
};

describe('index.js', () => {
	it('basic', async () => {
		expect(typeof configure).toBe('function');
	});

	it('success', async () => {
		const data = await lint('a { color: inherit; }\n');
		expect(data.errored).toBe(false);
		expect(data.results[0].warnings).toEqual([]);
	});

	it('creates independent configurations so caller overrides do not affect later consumers', async () => {
		const first = await configure();
		first.rules!['unit-no-unknown'] = null;
		const second = await configure();
		expect(second.rules!['unit-no-unknown']).not.toBeNull();
		expect(second.plugins).toEqual(['stylelint-order', '@stylistic/stylelint-plugin']);
	});

	it('autofixes property ordering and produces a clean result when linted again', async () => {
		const result = await lint('a {\n\tbottom: 2px;\n\ttop: 1px;\n}\n', { fix: true });
		expect(result.code).toBe('a {\n\ttop: 1px;\n\tbottom: 2px;\n}\n');
		const checked = await lint(result.code!);
		expect(checked.errored).toBe(false);
		expect(checked.results[0].warnings).toEqual([]);
	});

	it('ignores template and script content while checking invalid units in a Vue style block', async () => {
		const code = '<template><div>text</div></template>\n<script setup>const value = "12xxx";</script>\n'
			+ '<style lang="scss">.example { font-size: 12xxx; }</style>';
		const result = await lint(code, { codeFilename: 'component.vue' });
		expect(result.errored).toBe(true);
		expect(result.results[0].warnings).toEqual(expect.arrayContaining([
			expect.objectContaining({ rule: 'unit-no-unknown', line: 3 })
		]));
	});

	it('single line comments', async () => {
		expect.hasAssertions();
		let code = '';

		code += `// allow`;

		const data = await lint(code);
		expect(data.errored).toBe(false);
	});

	it('stylelint-config-standard-scss', async () => {
		expect.hasAssertions();
		let code = '';

		code += `@use 'sass:meta';\n\n`;
		code += `@function color($value) {\n`;
		code += `	@return if(meta.type-of($value) == 'string', $value, 'inherit');\n`;
		code += `}\n\n`;
		code += `a { color: color(1); }\n`;

		const data = await lint(code);
		expect(data.errored).toBe(false);
	});

	it('stylelint-config-standard-vue', async () => {
		expect.hasAssertions();
		let code = '';

		code += '<style lang="scss">';
		code += `@use 'sass:meta';\n\n`;
		code += `@function color($value) {\n`;
		code += `	@return if(meta.type-of($value) == 'string', $value, 'inherit');\n`;
		code += `}\n\n`;
		code += `a { color: color(1); }\n`;
		code += '</style>';

		const data = await lint(code, { codeFilename: './any.vue' });
		expect(data.errored).toBe(false);
	});

	it.each(['', ' lang="scss"'])('fix Vue style block%s', async (lang) => {
		const code = '<template><div class="example">example</div></template>\n'
			+ '<script setup>const message = "example";</script>\n'
			+ `<style${lang}>.example { color: red }</style>`;

		const data = await lint(code, { codeFilename: './any.vue', fix: true });
		expect(data.errored).toBe(false);
		expect(data.results[0].warnings).toEqual([]);
		expect(data.code).toBe(code.replace('color: red }', 'color: red; }'));
	});

	it('unit-no-unknown, rpx', async () => {
		expect.hasAssertions();
		let code = '';
		code += `a { font-size: 12rpx; }`;

		const data = await lint(code);
		expect(data.errored).toBe(false);
	});

	it('unit-no-unknown, xxx disallow', async () => {
		expect.hasAssertions();
		let code = '';
		code += `a { font-size: 12xxx; }`;

		const data = await lint(code);
		expect(data.errored).toBe(true);
		expect(data.report).toMatch('Unknown unit \\"xxx\\" (unit-no-unknown)');
	});

	it('stylelint-order', async () => {
		expect.hasAssertions();

		let code = '';
		code += `a { bottom: 2px; top: 1px; }`;

		const data = await lint(code);
		expect(data.report).toMatch('Expected \\"top\\" to come before \\"bottom\\" (order/properties-order)');
	});

	it('nesting-selector-no-missing-scoping-root/ignore', async () => {
		expect.hasAssertions();

		let code = '';
		code += `@include b(any) {\n`;
		code += `	@include when(any) {\n`;
		code += `		&:hover {\n`;
		code += `			color: red;\n`;
		code += `		}\n`;
		code += `	}\n`;
		code += `}\n`;

		const data = await lint(code);
		expect(data.errored).toBe(false);
	});
	it('block-no-redundant-nested-style-rule/ignore', async () => {
		expect.hasAssertions();

		let code = '';
		code += `@include b(any) {\n`;
		code += `	@include when(any) {\n`;
		code += `		& {\n`;
		code += `			::after {\n`;
		code += `				color: red;\n`;
		code += `			}\n`;
		code += `		}\n`;
		code += `	}\n`;
		code += `}\n`;

		const data = await lint(code, { fix: true });
		expect(data.errored).toBe(false);
	});
});

/**
 * https://stylelint.io/migration-guide/to-15
 * 代码风格的提示从stylelint中移除
 * 包含
 * 	1. 结尾需要分号
 * 	2. 缩进
 * 	3. ....
 *
 * 现使用移植的第三方库来检查代码风格
 * https://github.com/firefoxic/stylelint-codeguide
 */
describe('stylistic', () => {
	it('semicolon', async () => {
		expect.hasAssertions();
		const data = await lint(`a { color: inherit }`);
		expect(data.report).toMatch(`Expected a trailing semicolon (@stylistic/declaration-block-trailing-semicolon)`);
	});

	it('indentation', async () => {
		expect.hasAssertions();
		const data = await lint(`a {\n    color: inherit \n}`);
		expect(data.report).toMatch(`Expected indentation of 1 tab (@stylistic/indentation)`);
	});
});
