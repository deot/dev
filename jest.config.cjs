const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { packageName } = options;

module.exports = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: {
					module: 'esnext',
					target: 'esnext',
					sourceMap: true
				}
			}
		],
		// 这里主要用于编译node_modules内的js
		'^.+\\.jsx?$': 'babel-jest'
	},
	// node_modules也需要编译，如import inquirer from 'inquirer'的模块需要被编译;
	transformIgnorePatterns: [],
	testEnvironment: 'jsdom', // or node
	// 匹配相关
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	moduleNameMapper: {
		'^@deot/dev$': '<rootDir>/packages/index/src',
		'^@deot/dev-(.*?)$': '<rootDir>/packages/$1/src'
	},
	// 匹配规则很重要
	rootDir: process.cwd(),
	watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
	testPathIgnorePatterns: [
		'/node_modules/'
	],
	testMatch: [
		`<rootDir>/packages/${packageName || '**'}/__tests__/**.(spec|test).[jt]s?(x)`
	],

	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		`packages/${packageName || '*'}/src/**/*.ts`,
		`!packages/cli/src/**/*.ts`
	],
	coverageThreshold: {
		global: {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		}
	},
	globals: {
		__VERSION__: 'test',
		__TEST__: true
	}
};
