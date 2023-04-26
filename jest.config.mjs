import options from './packages/cli/config/jest.config.js';

export default {
	...options,
	// node_modules也需要编译，如import inquirer from 'inquirer'的模块需要被编译;
	transformIgnorePatterns: [],
	moduleNameMapper: {
		'^@deot/dev$': '<rootDir>/packages/index/src',
		'^@deot/dev-(.*?)$': '<rootDir>/packages/$1/src'
	},
	collectCoverageFrom: [
		...options.collectCoverageFrom,
		`!packages/cli/src/**/*.ts`,
		`!packages/releaser/src/**/*.ts`
	]
};
