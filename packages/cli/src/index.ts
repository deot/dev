import { program } from 'commander';
import { createRequire } from "node:module";
import * as Releaser from '@deot/dev-releaser';
import * as Builder from '@deot/dev-builder';
import * as Tester from '@deot/dev-tester';
import * as Adder from '@deot/dev-adder';
import * as Linker from '@deot/dev-linker';
import * as Dever from '@deot/dev-dever';


const require = createRequire(import.meta.url);

program
	.version(require('../package.json').version);


// 使用指令参数 如 ddc any;
program
	.usage('<cmd>');

// ddc link
program
	.command('link')
	.alias('l')
	.description('pnpm link')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Linker.run);

// ddc add
program
	.command('add')
	.alias('a')
	.description('add dep or create package')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Adder.run);

// ddc dev
program
	.command('dev')
	.alias('d')
	.description('dev')
	.option('-p, --package-name <string>', 'Select PackageName')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Dever.run);

// ddc build	
program
	.command('build')
	.alias('b')
	.description('build')
	.option('-p, --package-name <string>', 'Select packageName')
	.option('--formats <string>', 'Formats(Output)', 'es,cjs')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Builder.run);

// ddc release (dryRun默认为true)
// 如果没任何option时，默认值为(no-会被处理): {
//   dryRun: true,
//   tag: true,
//   publish: true,
//   commit: true,
//   push: true
// }
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
	.option('--keep-last-tag [boolean]', 'Clean Tags, Keep Only Last Tag')
	.action(Releaser.run);


// ddc test
program
	.command('test')
	.alias('t')
	.description('unit-test')
	.option('-p, --package-name <string>', 'Select PackageName')
	.option('-w, --watch [boolean]', 'Watch Test')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Tester.run);

program.parse(process.argv);

if (!program.args.length) {
	program.help();
}
