import stylelint from 'stylelint';
import stylelintrc from '..';

const lint = async (text: string) => {
	const resultObject = await stylelint.lint({
		config: stylelintrc,
		code: text
	});
	return resultObject;
};

describe('index.js', () => {
	it('success', async () => {
		expect.hasAssertions();
		try {
			const data = await lint(`a { color: inherit; }\n`);
			expect(data.errored).toBe(false);
		} catch (e) {
			console.log(e);
		}
	});

	it('single line comments', async () => {
		expect.hasAssertions();
		const data = await lint(`// allow`);
		expect(data.errored).toBe(false);
	});

	it('stylelint-config-standard-scss', async () => {
		expect.hasAssertions();
		const data = await lint(`
			@use 'sass:meta';

			@function color($value) {
				@return if(meta.type-of($value) == 'string', $value, 'inherit');
			}

			a { color: color(1); }
		`);
		expect(data.errored).toBe(false);
	});

	it('unit-no-unknown, rpx', async () => {
		expect.hasAssertions();
		const data = await lint(`a { font-size: 12rpx; }`);
		expect(data.errored).toBe(false);
	});

	it('unit-no-unknown, xxx disallow', async () => {
		expect.hasAssertions();
		const data = await lint(`a { font-size: 12xxx; }`);
		expect(data.errored).toBe(true);
	});

	it('stylelint-order', async () => {
		expect.hasAssertions();
		const data = await lint(`a { bottom: 2px; top: 1px; }`);
		expect(data.output).toMatch('Expected \\"top\\" to come before \\"bottom\\" (order/properties-order)');
	});
});

/**
 * https://stylelint.io/migration-guide/to-15
 * 代码风格的提示已经移除, 现在都不会校正了;
 * 包含
 * 	1. 结尾需要分号
 * 	2. 缩进
 * 	3. ....
 */
describe('deprecated', () => {
	it('semicolon', async () => {
		expect.hasAssertions();
		const data = await lint(`a { color: inherit }`);
		expect(data.errored).toBe(false);
	});

	it('indentation', async () => {
		expect.hasAssertions();
		const data = await lint(`a {\n    color: inherit \n}`);
		expect(data.errored).toBe(false);
	});
});



