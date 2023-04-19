import { program } from 'commander';
import { createRequire } from "node:module";

import * as Link from './link';
import * as Add from './add';
import * as Test from './unit-test';
import * as Dev from './dev';
import * as Build from './build';
import * as Release from './release';

const require = createRequire(import.meta.url);

program
	.version(require('../package.json').version);


// 使用指令参数 如 ddc any;
program
	.usage('<cmd>');

// ddc link
program
	.command('link')
	.alias('d')
	.description('pnpm link')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Link.run);

// ddc add
program
	.command('add')
	.alias('a')
	.description('add dep or create package')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Add.run);

// ddc dev
program
	.command('dev')
	.alias('d')
	.description('dev')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Dev.run);

// ddc build	
program
	.command('build')
	.alias('b')
	.description('build')
	.option('-p, --package-name <string>', 'select packageName')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Build.run);

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
	.action(Release.run);


// ddc test
program
	.command('test')
	.alias('t')
	.description('unit-test')
	.option('-p, --package-name <string>', 'Select PackageName')
	.option('-w, --watch [boolean]', 'Watch Test')
	.option('--dry-run [boolean]', 'Dry Run')
	.action(Test.run);

program.parse(process.argv);

if (!program.args.length) {
	program.help();
}
