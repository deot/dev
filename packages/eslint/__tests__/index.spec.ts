import { ESLint } from 'eslint';
import eslintrc from '..';

const rules = {
	
};
const cli = new ESLint({
	useEslintrc: false,
	baseConfig: eslintrc,
	...({ overrideConfig: { rules } }),
});

const lint = async (text: string) => {
	const linter = await cli.lintText(text);
	return linter[0];
};

describe('index.ts', () => {
	it('success', async () => {
		expect.assertions(1);
		const data = await lint(`let a = 1;\nconsole.log(a);`);
		expect(data.messages.length).toBe(0);
	});

	it('semi', async () => {
		expect.assertions(2);
		const data = await lint(`console.log(1)`);
		const it = data.messages[0];
		expect(it.ruleId).toBe('semi');
		expect(it.message).toBe('Missing semicolon.');
	});
});
