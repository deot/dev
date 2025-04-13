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

		code += `const a = 1;\n`;
		code += `console.log(a);\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data.length).toBe(0);
	});

	it('import-x', async () => {
		expect.assertions(1);
		let code = '';

		code += `import * as path from 'node:path';`;
		code += `console.log(path);`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe(`import-x/newline-after-import`);
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

	it('javascript/prefer-const, boundary problem', async () => {
		expect.hasAssertions();
		// globals
		let code = '';

		// 这个会要求改成 `const b = Math.ceil(a); 不会自动fixed`
		code += `export const fn = (a) => {\n`;
		code += `	let b;\n`;
		code += `	b = Math.ceil(a);\n`;
		code += `	return a + b;\n`;
		code += `};\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe(`prefer-const`);
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

	it('stylistic/max-len', async () => {
		expect.hasAssertions();
		let code = '';

		code += `if (typeof window === 'undefined') {\n`;
		code += `  console.log('${'any'.padEnd(150)}');\n`;
		code += `}\n`;

		const { data } = await lint(code, './any/any.js');
		expect(data[0].ruleId).toBe('@stylistic/max-len');
	});

	it('vue/html-indent', async () => {
		expect.hasAssertions();

		let code = '';

		code += '<template>\n';
		code += '  <div>123</div>\n';
		code += '</template>';

		const { data } = await lint(code, './any/any.vue');
		expect(data[0].ruleId).toBe(`vue/html-indent`);
	});

	it('vue/require-v-for-key', async () => {
		expect.hasAssertions();

		let code = '';

		code += '<template>\n';
		code += '	<div v-for="i in 5">{{ i }}</div>\n';
		code += '</template>';

		const { data } = await lint(code, './any/any.vue');
		expect(data[0].ruleId).toBe(`vue/require-v-for-key`);
	});
});
