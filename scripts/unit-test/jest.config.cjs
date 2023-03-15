const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { packageName } = options;

const userConfig = {};
module.exports = {
	preset: 'ts-jest',
	transform: {
		'^.+\\.tsx?$': [
			'ts-jest',
			{
				tsconfig: {
					target: 'esnext',
					sourceMap: true
				}
			}
		]
	},
	setupFiles: [],
	testEnvironment: 'jsdom', // or node
	// 匹配相关
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	moduleNameMapper: {
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
		`packages/${packageName || '*'}/src/**/*.ts`
	],
	coverageThreshold: {
		global: {
			branches: 95,
			functions: 95,
			lines: 95,
			statements: 95,
		}
	},
	globals: {},
	...userConfig
};
