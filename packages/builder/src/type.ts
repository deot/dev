import * as path from 'node:path';
import fs from 'fs-extra';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Logger, Shell, Locals } from '@deot/dev-shared';
import { fileURLToPath } from 'node:url';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const { workspace } = Locals.impl();
	const { packageDir, packageFolderName, packageOptions, commandOptions } = options;

	const done = () => {
		const stats: Array<{ size: number; file: string }> = [];
		let fullpath = `${packageDir}/dist/index.d.ts`;
		if (fs.existsSync(fullpath)) {
			let stat = fs.statSync(fullpath);
			stats.push({
				file: 'index.d.ts',
				size: stat.size
			});
		}

		return stats;
	};

	if (!commandOptions.dts) {
		return done();
	}

	// 子包含有自己的build:types则自行执行
	if (workspace && packageOptions?.scripts?.['build:types']) {
		await Shell.spawn(`npm`, ['run', 'build:types'], {
			cwd: packageDir
		});
		return done();
	}

	let tempDir = `${packageDir}/dist/temp`;
	let rootDir = path.relative(tempDir, process.cwd()); // '../../../..'

	// 生成tsconfig用于输出dts
	fs.outputFileSync(`${tempDir}/tsconfig.json`, JSON.stringify({
		extends: `${rootDir}/tsconfig.json`,
		compilerOptions: {
			declaration: true,
			emitDeclarationOnly: true,
			rootDir,
			outDir: '.'
		},
		include: [
			path.relative(tempDir, path.resolve(packageDir, `src/*`))
		]
	}, null, '\t'));

	// TODO: tsc是个变量，如vue-tsc就可以编译vue相关 
	await Shell.spawn('tsc', ['-p', `${tempDir}/tsconfig.json`]);

	const configPath = `${tempDir}/api-extractor.json`;
	// 生成api-extractor用于合并dts
	fs.outputFileSync(configPath, JSON.stringify({
		extends: path.relative(tempDir, path.resolve(dirname, '../api-extractor.shared.json')),
		mainEntryPointFilePath: `.${workspace ? '/packages/' : ''}${packageFolderName}/src/index.d.ts`, // workspace、时以temp/packages/*/src结构，否则APIExtractor会报错
		dtsRollup: {
			publicTrimmedFilePath: "../index.d.ts"
		}
	}, null, '\t'));

	const result = Extractor.invoke(
		ExtractorConfig.loadFileAndPrepare(configPath), 
		{
			localBuild: true,
			showVerboseMessages: false,

			// 去掉版本提示
			messageCallback: (message) => {
				if (
					message.messageId === 'console-compiler-version-notice'
					|| message.messageId === 'console-preamble'
				) {
					message.handled = true;
				}
			}
		}
	);

	if (!result.succeeded) {
		Logger.error(
			`API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
		);
		process.exitCode = 1;
	}			

	await fs.remove(`${packageDir}/dist/temp`);

	return done();
};