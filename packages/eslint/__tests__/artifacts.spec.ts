// @vitest-environment node
import * as path from 'node:path';
import { createRequire } from 'node:module';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { pathToFileURL } from 'node:url';
import fs from 'fs-extra';

const root = path.resolve(__dirname, '../../..');
const execute = promisify(execFile);
const require$ = createRequire(import.meta.url);
const tsx = require$.resolve('tsx');
const vite = pathToFileURL(require$.resolve('vite')).href;
const shared = pathToFileURL(path.join(root, 'packages/builder/shared.config.ts')).href;

describe('ESLint build artifacts', () => {
	let directory: string;

	beforeEach(async () => {
		await fs.ensureDir(path.join(root, 'node_modules/.cache'));
		directory = await fs.mkdtemp(path.join(root, 'node_modules/.cache/eslint-artifacts-'));
	});

	afterEach(async () => {
		await fs.remove(directory);
	});

	it.each(['es', 'cjs'])('loads default and custom %s configs with Markdown enabled', async (format) => {
		const filename = path.join(directory, format === 'es' ? 'index.js' : 'index.cjs');
		await execute(process.execPath, ['--import', tsx, '--input-type=module', '-e', `
import {build,mergeConfig} from ${JSON.stringify(vite)};
import shared from ${JSON.stringify(shared)};
await build(mergeConfig(shared, {
	configFile:false,
	build:{outDir:${JSON.stringify(directory)},lib:{fileName:()=>${JSON.stringify(path.basename(filename))}}}
}));`], {
			cwd: root,
			env: {
				...process.env,
				BUILD_OPTIONS: encodeURIComponent(JSON.stringify({
					format,
					packageName: '@deot/dev-eslint',
					packageSourceDir: path.join(root, 'packages/eslint/src'),
					files: ['index.ts']
				}))
			}
		});
		await fs.outputJson(path.join(directory, 'package.json'), { type: 'module' });

		const imports = format === 'es'
			? `import {Linter} from 'eslint';import config,{configure} from ${JSON.stringify(pathToFileURL(filename).href)};`
			: `const {Linter}=require('eslint');const {default:config,configure}=require(${JSON.stringify(filename)});`;
		const code = '```js\nconsole.log(123);\n```\n';
		const { stdout } = await execute(process.execPath, ['--input-type', format === 'es' ? 'module' : 'commonjs', '-e', `
${imports}
Promise.all([config,configure()]).then(configs=>{
	const result=configs.map(config=>new Linter().verify(${JSON.stringify(code)},config,'example.md').map(message=>message.ruleId));
	console.log(JSON.stringify(result));
}).catch(error=>{console.error(error);process.exitCode=1;});`], { cwd: root });
		expect(JSON.parse(stdout)).toEqual([['no-console'], ['no-console']]);
	}, 30000);
});
