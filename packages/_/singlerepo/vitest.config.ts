export default {
	test: {
		globals: true,
		include: [
			`__tests__/**.(spec|test).[jt]s?(x)`
		],
		coverage: {
			enabled: true,
			provider: 'istanbul',
			reporter: ['text', 'html'],
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
			include: [
				`src/**/*.ts`
			]
		}
	}
};