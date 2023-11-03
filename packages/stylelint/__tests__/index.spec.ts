import stylelint from 'stylelint';
import stylelintrc from '..';

const lint = async (text: string) => {
	const resultObject = await stylelint.lint({
		config: stylelintrc,
		code: text
	});
	return resultObject;
};

describe('index.ts', () => {
	it('success', async () => {
		expect.hasAssertions();
		try {
			const data = await lint(`a { color: red; }\n`);
			expect(data.errored).toBe(false);
		} catch (e) {
			console.log(e);
		}
	});

	it('declaration-block-trailing-semicolon', async () => {
		expect.hasAssertions();
		const data = await lint(`a { color: red }`);
		expect(data.output).toMatch('declaration-block-trailing-semicolon');
	});
});
