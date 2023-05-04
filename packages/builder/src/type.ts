import * as path from 'node:path';
import fs from 'fs-extra';
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor';
import { Logger, Shell, Locals } from '@deot/dev-shared';
import type { Build } from './build';

export const run = async (options: Build) => {
	const { workspace } = Locals.impl();
	const { packageDir, packageOptions } = options;

	// 子包含有自己的build:types则自行执行
	if (workspace && packageOptions?.scripts?.['build:types']) {
		await Shell.spawn(`npm`, ['run', 'build:types'], {
			cwd: packageDir
		});
		return;
	}

	// build types
	const config = path.resolve(packageDir, `api-extractor.json`);
	if (fs.existsSync(config)) {
		const result = Extractor.invoke(
			ExtractorConfig.loadFileAndPrepare(config), 
			{
				localBuild: true,
				showVerboseMessages: false
			}
		);

		if (!result.succeeded) {
			Logger.error(
				`API Extractor completed with ${result.errorCount} errors and ${result.warningCount} warnings`
			);
			process.exitCode = 1;
		}			
	}

	await fs.remove(`${packageDir}/dist/${workspace || 'src'}`);
};