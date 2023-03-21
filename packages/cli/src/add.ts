import { Utils, Shell } from '@deot/dev-shared';
import { resolve } from 'node:path';
import ora from 'ora';
import fs from 'fs-extra';
import { getOptions } from './add/prompt';
import { Shared } from './shared';

export const run = () => Utils.autoCatch(async () => {
	const { mode, dependentName, args, packageName, $packageName } = await getOptions();
	const { directory } = Shared.impl();
	let command = mode === 'dependent' 
		? `lerna add ${dependentName} ${args.join(' ')} --scope=${$packageName}`
		: `lerna create ${$packageName} --yes`;
	
	if (process.env.NODE_ENV === 'UNIT') return Shell.spawn(`echo "${command}"`);

	const spinner = ora(command).start();
	await Shell.spawn(command);
	spinner.stop();

	// 包名修改
	if (mode === 'package') {
		let dir = resolve(directory);
		fs.renameSync(
			`${dir}/${$packageName.split('/')[1]}`,
			`${dir}/${packageName}`
		);

		// 清理lerna创建的文件
		fs.removeSync(`${dir}/${packageName}/__tests__`);
		fs.removeSync(`${dir}/${packageName}/lib`);

		fs.outputFileSync(`${dir}/${packageName}/README.md`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/src/index.ts`, '// TODO');
		fs.outputFileSync(`${dir}/${packageName}/package.json`, JSON.stringify({
			name: $packageName,
			version: '1.0.0',
			main: 'dist/index.js',
			types: "dist/index.d.ts",
			type: "module",
			files: [
			  "dist"
			],
			license: 'MIT',
			publishConfig: {
				access: 'public'
			},
			dependencies: {}
		}, null, '\t'));

		fs.outputFileSync(`${dir}/${packageName}/api-extractor.json`, JSON.stringify({
			extends: "../../api-extractor.json",
			mainEntryPointFilePath: `./dist/packages/${packageName}/src/index.d.ts`,
			dtsRollup: {
				publicTrimmedFilePath: "./dist/index.d.ts"
			}
		}, null, '\t'));
	}
});