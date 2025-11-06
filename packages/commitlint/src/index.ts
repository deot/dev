import * as fs from 'node:fs';

// eslint-disable-next-line @stylistic/max-len
const commitRE = /^(revert:? "?|Revert "?)?(void|fix|feat|docs|style|perf|test|types|build|chore|refactor|workflow|ci|wip|release|breaking change)(\(.+\))?: .{1,50}/;
const mergeRE = /Merge (remote-tracking )?branch /;

export const run = (commitMessage: string) => {
	let content = '';
	if (!commitRE.test(commitMessage) && !mergeRE.test(commitMessage)) {
		content += `\nInvalid commit message: "${commitMessage}".\n`;
		content += `\nExamples: \n`;
		content += `	- fix(Button): incorrect style\n`;
		content += `	- feat(Button): incorrect style\n`;
		content += `	- docs(Button): fix typo\n`;
		content += `\nAllowed Types:\n`;
		content += `	- fix：修补bug\n`;
		content += `	- feat：新功能（feature）\n`;
		content += `	- docs：文档（documentation）\n`;
		content += `	- style：不影响代码含义的更改，可能与代码格式有关，例如空格、缺少分号等\n`;
		content += `	- test：包括新的或更正以前的测试\n`;
		content += `	- chore：构建过程或辅助工具的变动\n`;
		content += `	- refactor：重构（即不是新增功能，也不是修改bug的代码变动）\n`;
		content += `	- perf：性能改进（performance improvements）\n`;
		content += `	- types：类型\n`;
		content += `	- build：影响构建系统或外部依赖项的更改\n`;
		content += `	- ci: 持续集成相关\n`;
		content += `	- breaking change：破坏性修改\n`;
		content += `	- void：无类型，通常用于初始化\n`;
		content += `	- Merge branch 'foo' into 'bar'\n`;
		content += `	- Revert ""\n`;
	}
	return content;
};

const index = process.argv.findIndex(arg => arg === '--edit');
/* istanbul ignore next -- @preserve */
const filepath = index !== -1 && process.argv[index + 1];
/* istanbul ignore next -- @preserve */
const message = filepath && fs.existsSync(filepath)
	? fs.readFileSync(filepath, 'utf-8').trim()
	: (filepath || '');

/* istanbul ignore next -- @preserve */
if (message) {
	const error = run(message);
	if (error) {
		console.error(error);
		process.exit(1);
	}
}
