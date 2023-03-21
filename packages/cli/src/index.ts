import { program } from 'commander';
import { createRequire } from "node:module";

import * as Link from './link';
import * as Add from './add';
import * as Test from './unit-test';
import * as Dev from './dev';
import * as Build from './build';

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
	.description('lerna link')
	.action(Link.run);

// ddc add
program
	.command('add')
	.alias('a')
	.description('lerna add or lerna create')
	.action(Add.run);

// ddc dev
program
	.command('dev')
	.alias('d')
	.description('dev')
	.action(Dev.run);

// ddc build	
program
	.command('build')
	.alias('b')
	.description('build')
	.action(Build.run);

// ddc test
program
	.command('test')
	.alias('t')
	.description('unit-test')
	.option('-p, --packageName <packageName>', 'select packageName')
	.action(Test.run);

program.parse(process.argv);

if (!program.args.length) {
	program.help();
}
