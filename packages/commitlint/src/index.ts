import { Message } from './message.ts';
import { FilePath } from './file-path.ts';

export { Message, FilePath };

/**
 * 一次只执行一项任务
 * @returns error
 */
const check = () => {
	for (let i = 0; i < process.argv.length; i++) {
		/* istanbul ignore next -- @preserve */
		if (['--edit', '--message'].includes(process.argv[i])) { // @deprecated（--edit）
			/* istanbul ignore next -- @preserve */
			return Message.run(i + 1);
		}

		/* istanbul ignore next -- @preserve */
		if (['--file-path'].includes(process.argv[i])) {
			/* istanbul ignore next -- @preserve */
			return FilePath.run(i + 1);
		}
	};
};

const error = check();
/* istanbul ignore next -- @preserve */
if (error) {
	console.error(error);
	process.exit(1);
};
