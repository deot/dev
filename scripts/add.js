import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import ora from 'ora';
import fs from 'fs-extra';
import { Prompt } from './add/prompt.js';
import { Shell, Utils } from './shared/index.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

Utils.autoCatch(async () => {
	const { mode, dependentName, args, packageName, $packageName } = await new Prompt().run();

	let command = mode === 'dependent' 
		? `lerna add ${dependentName} ${args.join(' ')} --scope=${$packageName}`
		: `lerna create ${$packageName}`;
		
	const spinner = ora(command).start();
	await Shell.spawn(command);
	spinner.stop();

	// 包名修改
	if (mode === 'package') {
		let dir = resolve(__dirname, `../packages`);
		fs.renameSync(
			`${dir}/dev-${packageName}`,
			`${dir}/${packageName}`
		);

		// 清理lerna创建的文件
		fs.removeSync(`${dir}/${packageName}/__tests__`);
		fs.removeSync(`${dir}/${packageName}/lib`);

		fs.outputFileSync(`${dir}/${packageName}/README.md`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/index.ts`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/package.json`, JSON.stringify({
			name: $packageName,
			version: '1.0.0',
			main: 'dist/index.js',
			license: 'MIT',
			publishConfig: {
				access: 'public'
			},
			dependencies: {}
		}, null, '\t'));
	}
});