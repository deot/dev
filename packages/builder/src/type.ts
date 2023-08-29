import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Logger, Shell, Locals } from '@deot/dev-shared';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const { workspace, packageDir: packageRootDir } = Locals.impl();
	const { packageDir, packageOutDir, packageSourceDir, packageOptions, commandOptions } = options;

	const done = () => {
		const stats: Array<{ size: number; file: string }> = [];
		let fullpath = `${packageOutDir}/index.d.ts`;
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

	let tempDir = `${packageOutDir}/temp`;
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
			path.relative(tempDir, path.resolve(packageSourceDir, `*`))
		]
	}, null, '\t'));

	// TODO: tsc是个变量，如vue-tsc就可以编译vue相关 
	await Shell.spawn('tsc', ['-p', `${tempDir}/tsconfig.json`]);

	const configPath = `${tempDir}/api-extractor.json`;
	// 生成api-extractor用于合并dts
	fs.outputFileSync(configPath, JSON.stringify({
		extends: path.relative(tempDir, path.resolve(dirname, '../api-extractor.shared.json')),
		mainEntryPointFilePath: (workspace ? `./${workspace}/` : './') + path.relative(packageRootDir, `${packageSourceDir}/index.d.ts`), // workspace、时以temp/packages/*/src结构，否则APIExtractor会报错
		dtsRollup: {
			publicTrimmedFilePath: "../index.d.ts"
		}
	}, null, '\t'));

	const result = Extractor.invoke(
		ExtractorConfig.loadFileAndPrepare(configPath), 
		{
			localBuild: true,
			showVerboseMessages: false,

			/**
			 * 去掉部分提示提示
			 * 也可设置skipLibCheck=true去掉，这个目前在puppeteer上有提示，设置了target: 'esnext'仍然有，这里先不做排查
			 * 1. (TS18028) Private identifiers are only available when targeting ECMAScript 2015 and higher
			 *
			 * 版本提示：
			 * 2. console-compiler-version-notice
			 * 	*** The target project appears to use TypeScript 5.1.6 which is newer 
			 * 		than the bundled compiler engine; consider upgrading API Extractor.
			 * 3. console-preamble
			 * 	Analysis will use the bundled TypeScript version 5.0.4
			 */
			
			messageCallback: (message) => {
				if (
					message.messageId === 'console-compiler-version-notice'
					|| message.messageId === 'console-preamble'
					|| message.messageId === 'TS18028'
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

	await fs.remove(tempDir);

	return done();
};