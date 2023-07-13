import fs from 'fs-extra';
import * as path from 'node:path';
import * as sass from 'sass';

import postcss from 'postcss';
import atImport from "postcss-import";
import atUrl from "postcss-url";
import flexBugs from "postcss-flexbugs-fixes";
import cssnano from "cssnano";
import autoprefixer from "autoprefixer";

import type { Build } from './build';

export const run = async (options: Build) => {
	const { packageDir } = options || {};
	const srcDir = path.resolve(packageDir, './src');

	const styles = fs.existsSync(srcDir) 
		? fs
			.readdirSync(srcDir)
			.filter((i: string) => /^index\.(.*)\.?s?css$/.test(i))
		: [];
	const stats: Array<{ size: number; file: string }> = [];
	await styles
		.reduce(
			(preProcess: Promise<any>, file: any) => {
				preProcess = preProcess
					.then(() => {
						let filepath = path.resolve(srcDir, file);
						const data = sass.compile(filepath, { style: 'compressed' });
						return postcss()
							// @imoport资源，引进使用的代码，而不是@import '../xxx';
							.use(atImport())
							// css 中 url相对路径转化* inline 为使用base64
							.use(atUrl())
							// flex优化
							.use(flexBugs())
							// 压缩代码，删除重复部分
							.use(cssnano())
							// 适配浏览器前缀
							.use(autoprefixer({ remove: false }))
							.process(data.css, { from: filepath });
					})
					.then((source) => {
						let output = path.resolve(packageDir, `./dist/${file.replace(/\.scss$/g, '.css')}`);
						fs.outputFileSync(output, source.css);
						return fs.stat(output);
					})
					.then((stat) => {
						stats.push({
							file,
							size: stat.size
						});
					});
				return preProcess;
			}, 
			Promise.resolve()
		);
	return stats;
};