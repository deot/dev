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
		expect.assertions(1);
		const data = await lint(`a { color: red; }\n`);
		expect(data.errored).toBe(false);
	});

	it('no-missing-end-of-source-newline', async () => {
		expect.assertions(1);
		const data = await lint(`a { color: red; }`);
		expect(data.output).toMatch('no-missing-end-of-source-newline');
	});
});
