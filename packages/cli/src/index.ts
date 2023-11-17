import { createRequire } from "node:module";
import type { Command } from 'commander';
import { program, Option } from 'commander';
import * as Releaser from '@deot/dev-releaser';
import * as Builder from '@deot/dev-builder';
import * as Tester from '@deot/dev-tester';
import * as Adder from '@deot/dev-adder';
import * as Linker from '@deot/dev-linker';
import * as Dever from '@deot/dev-dever';
import * as Updater from '@deot/dev-updater';

const require = createRequire(import.meta.url);

program
	.version(require('../package.json').version);

const defaultOptions: Option[] = [
	// new Option('--workspace <string>', 'Workspace'),
	new Option('--dry-run [boolean]', 'Dry Run')
];

/**
 * 后置公共options
 * ctx.option('--no-dry-run').option('--dry-run')
 * 默认 -> dryRun: true.目前这是期望的
 *
 * ctx.option('--dry-run').option('--no-dry-run')
 * 默认 -> dryRun: undefined
 * @param ctx ~
 * @param action ~
 */
const addOptions = (ctx: Command, action: any) => {
	defaultOptions.forEach(i => ctx.addOption(i));
	ctx.action(action);
};

// 使用指令参数 如 ddc any;
program
	.usage('<cmd>');

// ddc link
addOptions(
	program
		.command('link')
		.alias('l')
		.description('pnpm link'),
	Linker.run
);

// ddc add
addOptions(
	program
		.command('add')
		.alias('a')
		.description('add dep or create package'),
	Adder.run
);

// ddc dev
addOptions(
	program
		.command('dev')
		.alias('d')
		.description('dev')
		.option('--package-name <string>', 'Select PackageName')
		.option('--vue-package <string>')
		.option('--react-package <string>'),
	Dever.run
);

// ddc build
addOptions(
	program
		.command('build')
		.alias('b')
		.description('build')
		.option('--package-name <string>', 'Select packageName')
		.option('--script-formats <string>', 'Script Formats(Output)', 'es,cjs')
		.option('--external <string>', 'External, IIFE/UMD Used(Output)')
		.option('--globals <string>', 'Globals, IIFE/UMD Used(Output)')
		.option('--node-package <string>')
		.option('--vue-package <string>')
		.option('--react-package <string>')
		.option('--no-dts [boolean]', 'No Export Types'),
	Builder.run
);


// ddc release (dryRun默认为true)
// 如果没任何option时，默认值为(no-会被处理): {
//   dryRun: true,
//   tag: true,
//   publish: true,
//   commit: true,
//   push: true
// }
addOptions(
	program
		.command('release')
		.alias('r')
		.description('release')
		.option('--no-dry-run [boolean]', 'No Dry Run')
		.option('--no-tag [boolean]', 'No Tag')
		.option('--no-publish [boolean]', 'No Publish')
		.option('--no-commit [boolean]', 'No Commit')
		.option('--no-push [boolean]', 'No Push')
		.option('--force-update-package [string]', 'Force Update Package')
		.option('--skip-update-package [string]', 'Skip Update Package')
		.option('--custom-version [string]', 'Dry Run') 
		.option('--patch [boolean]', 'Patch')
		.option('--major [boolean]', 'Major')
		.option('--minor [boolean]', 'Minor')
		.option('--keep-last-tag [boolean]', 'Clean Tags, Keep Only Last Tag'),
	Releaser.run
);

// ddc test
addOptions(
	program
		.command('test')
		.alias('t')
		.description('unit-test')
		.option('--no-coverage [boolean]', 'Coverage Analyze')
		.option('--package-name <string>', 'Select PackageName')
		.option('--subpackage <string>', 'Select SubpackageName')
		.option('--vue-package <string>')
		.option('--react-package <string>')
		.option('--watch [boolean]', 'Watch Test')
		.option('--environment <string>', 'Environment', 'jsdom'),
	Tester.run
);

// ddc update
addOptions(
	program
		.command('update')
		.alias('u')
		.description('update devDependencies & dependencies')
		.option('--no-dry-run [boolean]', 'No Dry Run')
		.option('--no-commit [boolean]', 'No Commit')
		.option('--no-push [boolean]', 'No Push')
		.option('--no-test [boolean]', 'No Test')
		.option('--patch [boolean]', 'Patch')
		.option('--major [boolean]', 'Major')
		.option('--minor [boolean]', 'Minor')
		.option('--all [boolean]', 'Update All Package'),
	Updater.run
);


program.parse(process.argv);

if (!program.args.length) {
	program.help();
}
