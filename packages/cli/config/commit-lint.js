import fs from 'fs';

const commitRE = /^(revert: )?(fix|feat|docs|style|perf|test|types|build|chore|refactor|workflow|ci|wip|release|breaking change)(\(.+\))?: .{1,50}/;
const mergeRE = /Merge branch /;

const gitParams = process.env.HUSKY_GIT_PARAMS || process.argv.pop(); // 兼容husky@v4和husky@v8
const commitMsg = fs.readFileSync(gitParams, 'utf-8').trim();

if (!commitRE.test(commitMsg) && !mergeRE.test(commitMsg)) {
	console.error(
		`invalid commit message: "${commitMsg}".

		Examples: 

		- fix(Button): incorrect style
		- feat(Button): incorrect style
		- docs(Button): fix typo

		Allowed Types:
		
		- fix：修补bug
		- feat：新功能（feature）
		- docs：文档（documentation）
		- style：不影响代码含义的更改，可能与代码格式有关，例如空格、缺少分号等
		- test：包括新的或更正以前的测试
		- chore：构建过程或辅助工具的变动
		- refactor：重构（即不是新增功能，也不是修改bug的代码变动）
		- perf：性能改进（performance improvements）
		- types：类型
		- build：影响构建系统或外部依赖项的更改
		- ci: 持续集成相关
		- breaking change：破坏性修改
		- Merge branch 'foo' into 'bar'
		`
	);
	process.exit(1);
}
