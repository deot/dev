import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import fs from 'fs-extra';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Logger, Shell, Locals } from '@deot/dev-shared';
import type { Build } from './build';

const dirname = path.dirname(fileURLToPath(import.meta.url));

export const run = async (options: Build) => {
	const { workspace, packageDir: packageRootDir } = Locals.impl();
	const { isVuePackage, packageDir, packageOutDir, packageSourceDir, packageOptions, commandOptions } = options;

	const done = () => {
		const stats: Array<{ size: number; file: string }> = [];
		const fullpath = `${packageOutDir}/index.d.ts`;
		if (fs.existsSync(fullpath)) {
			const stat = fs.statSync(fullpath);
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

	const tempDir = `${packageOutDir}/temp`;
	const rootDir = path.relative(tempDir, process.cwd()); // '../../../..'

	const tsc = async (skipLibCheck: boolean) => {
		// 生成tsconfig用于输出dts
		fs.outputFileSync(`${tempDir}/tsconfig.json`, JSON.stringify({
			extends: `${rootDir}/tsconfig.json`,
			compilerOptions: {
				declaration: true,
				emitDeclarationOnly: true,
				allowJs: true,
				outDir: '.',
				skipLibCheck,
				rootDir,
			},
			include: [
				path.relative(tempDir, path.resolve(packageSourceDir, `*`))
			]
		}, null, '\t'));

		await Shell.spawn(isVuePackage ? 'vue-tsc' : 'tsc', ['-p', `${tempDir}/tsconfig.json`]);
	}

	try {
		await tsc(false);
	} catch(e) {
		try {
			await tsc(true);
		} catch {
			throw e;
		}
	}

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
			 *
			 *
			 * 4. TS2590, TS2320, TS2344, TS2430
			 *  打包vue项目时，出现的warning
			 *   (TS2344) Type 'C' does not satisfy the constraint 'ElementType<any>'.
			 *   (TS2320) Interface 'Element' cannot simultaneously extend types 'VNode<RendererNode,
			 *   (TS2430) Interface 'IntrinsicElements' incorrectly extends interface 'NativeElements'
			 *   (TS2590) Expression produces a union type that is too complex to represent
			 */
			
			messageCallback: (message) => {
				if (
					message.messageId === 'console-compiler-version-notice'
					|| message.messageId === 'console-preamble'
					|| ['TS18028', 'TS2590', 'TS2320', 'TS2344', 'TS2430'].includes(message.messageId)
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