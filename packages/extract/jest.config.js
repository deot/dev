const options = JSON.parse(decodeURIComponent(process.env.TEST_OPTIONS || '{}'));
const { workspace, packageFolderName } = options;
const rootDir = process.cwd();

const testDirPrefix = workspace 
	? `<rootDir>/${workspace}/${packageFolderName || '*'}/__tests__` 
	: `<rootDir>/__tests__`;

const collectDirPrefix = workspace 
	? `<rootDir>/${workspace}/${packageFolderName || '*'}/src`
	: `<rootDir>/src`;

export default {
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

	testEnvironment: 'jsdom', // or node
	// 匹配相关
	moduleFileExtensions: ['ts', 'tsx', 'js', 'json'],
	// 匹配规则很重要
	rootDir,
	watchPathIgnorePatterns: ['/node_modules/', '/dist/', '/.git/'],
	testPathIgnorePatterns: [
		'/node_modules/'
	],
	testMatch: [
		`${testDirPrefix}/**.(spec|test).[jt]s?(x)`
	],

	collectCoverage: true,
	coverageDirectory: 'coverage',
	collectCoverageFrom: [
		`${collectDirPrefix}/**/*.ts`
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
