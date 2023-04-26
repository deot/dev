import options from '../../../../../packages/extract/jest.config.js';

const rootDir = process.cwd();

export default {
	...options,
	rootDir,
	// node_modules也需要编译，如import inquirer from 'inquirer'的模块需要被编译;
	transformIgnorePatterns: [],
	moduleNameMapper: {
		'^@tester/helper$': '<rootDir>/packages/index/src',
		'^@tester/helper-(.*?)$': '<rootDir>/packages/$1/src'
	},
	collectCoverageFrom: [
		...options.collectCoverageFrom,
		`!packages/tester/src/**/*.ts`
	],
};
