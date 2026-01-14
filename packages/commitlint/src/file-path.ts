import * as fs from 'node:fs';
import * as path from 'node:path';

const cwd = process.cwd();

export class FilePath {
	static lint = (filePath: string) => {
		if (/[A-Z]/g.test(filePath)) {
			return filePath;
		}
	};

	/* istanbul ignore next -- @preserve */
	static run = (argvStartIndex: number, argv = process.argv) => {
		const filePaths = argv.slice(argvStartIndex, argv.length);

		const excludeIndex = argv.findIndex(i => i === '--file-path-exclude');
		const excludes = excludeIndex !== -1 && argv[excludeIndex + 1]
			? new RegExp(`(${argv[excludeIndex + 1].replace(/,/g, '|')})`)
			: void 0;

		const errors = [] as string[];
		for (let i = 0; i < filePaths.length; i++) {
			const filePath = filePaths[i];
			if (filePath && fs.existsSync(filePath) && path.extname(filePath) !== '.md') {
				const filePathV2 = path.relative(cwd, filePath);
				if (excludes && excludes.test(filePath)) continue;
				const error = FilePath.lint(filePathV2);
				error && errors.push(error);
			}
		}
		if (errors.length) {
			return `Invalid Commit FilePaths: \n\n${errors.join('\n')}\n\nAllowed Filepath: xxx-xxx-xxx\n`;
		}
	};
};
