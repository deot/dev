import options from '../../../config/jest.config.js';

const rootDir = process.cwd();

export default {
	...options,
	rootDir,
	// node_modules也需要编译，如import inquirer from 'inquirer'的模块需要被编译;
	transformIgnorePatterns: [],
	moduleNameMapper: {
		'^@demo/helper$': '<rootDir>/packages/index/src',
		'^@demo/helper-(.*?)$': '<rootDir>/packages/$1/src'
	},
	collectCoverageFrom: [
		...options.collectCoverageFrom,
		`!packages/cli/src/**/*.ts`
	],
};