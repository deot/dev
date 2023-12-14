import { Linter } from 'eslint';
import flatConfigPromise, { configure } from '@deot/dev-eslint';
import type { FlatConfig } from '@deot/dev-eslint';

let config: FlatConfig[];
const getFlatConfig = async () => {
	if (!config) {
		config = await flatConfigPromise;
	}

	return config;
};

const lint = async (text: string, filename?: string) => {
	const linter = new Linter({
		configType: 'flat'
	});

	await getFlatConfig();
	return {
		data: linter.verify(text, config, filename),
		config,
		linter
	};
};

describe('index.ts', () => {
	it('zero', async () => {
		expect.hasAssertions();
		const config$ = await configure({
			javascript: {
				enable: false
			},
			vue: false,
			react: false,
			import: false,
			typescript: false,
			markdown: false,
			jsdoc: false,
			stylistic: false,
			ignores: [
				'!**/node_modules', // 用于移除默认值
				'**/dist'
			]
		});
		const { ignores } = config$[0];
		expect(ignores).toBeTruthy();
		expect(ignores!.includes('**/dist')).toBeTruthy();
		expect(ignores!.includes('**/node_modules')).toBeFalsy();
	});

	it('success', async () => {
		expect.hasAssertions();
		const { data } = await lint(``);
		expect(data.length).toBe(0);
	});

	it('javascript', async () => {
		expect.hasAssertions();
		// globals
		let code = '';

		code += `let a = 1;`;

		const { data } = await lint(code);
		expect(data[0].ruleId).toBe('no-unused-vars');
	});

	it('javascript, filename', async () => {
		expect.hasAssertions();
		// globals
		let code = '';

		code += `let a = 1;\n`;
		code += `console.log(a);\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data.length).toBe(0);
	});

	it('import', async () => {
		expect.assertions(1);
		let code = '';

		code += `import * as path from 'node:path';`;
		code += `console.log(path);`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe(`import/newline-after-import`);
	});

	it('import/parsers', async () => {
		expect.assertions(1);
		let code = '';

		code += `import jsd from 'eslint-plugin-jsdoc';\n\n`;
		code += `console.log(jsd);\n`;

		const { data } = await lint(code, './any/any.ts');
		try {
			expect(data.length).toBe(0);
		} catch {
			throw data;
		}
	});

	it('jsdoc', async () => {
		expect.hasAssertions();
		let code = '';

		code += `/*`;
		code += ` * ~`;
		code += ` */`;
		code += `function sum(a, b) {`;
		code += `	return a + b;`;
		code += `}`;
		code += `sum(1, 2);`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe('jsdoc/require-jsdoc');
	});

	it('typescript', async () => {
		expect.hasAssertions();
		let code = '';

		code += `const a:number = 1;`;

		const { data } = await lint(code, './any/any.ts');
		expect(data.some(i => i.ruleId === '@typescript-eslint/no-unused-vars')).toBeTruthy();
	});

	it('markdown', async () => {
		expect.hasAssertions();

		let code = '';

		code += '```js\n';
		code += 'console.log(123);\n';
		code += '```';

		const { data } = await lint(code, './any/any.md');
		expect(data[0].ruleId).toBe(`no-console`);
	});

	it('stylistic/indent', async () => {
		expect.hasAssertions();
		let code = '';

		code += `if (typeof window === 'undefined') {\n`;
		code += `  console.log('any');\n`;
		code += `}\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe('@stylistic/indent');
	});

	it('stylistic/semi', async () => {
		expect.hasAssertions();
		let code = '';

		code += `if (typeof window === 'undefined') {\n`;
		code += `	console.log('any')\n`;
		code += `}\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe('@stylistic/semi');
	});

	it('stylistic/quotes', async () => {
		expect.hasAssertions();
		let code = '';

		code += `if (typeof window === 'undefined') {\n`;
		code += `	console.log("any");\n`;
		code += `}\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe('@stylistic/quotes');
	});
});
