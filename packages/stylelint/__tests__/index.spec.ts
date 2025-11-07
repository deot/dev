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
		expect.hasAssertions();
		try {
			let code = '';
			code += `a { color: inherit; }\n`;

			const data = await lint(code);
			expect(data.errored).toBe(false);
		} catch (e) {
			console.log(e);
		}
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
		expect(data.report).toMatch('Unexpected unknown unit \\"xxx\\" (unit-no-unknown)');
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
