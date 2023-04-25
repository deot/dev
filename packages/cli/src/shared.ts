import { createRequire } from "node:module";
import * as path from 'node:path';
import fs from 'fs-extra';

const cwd = process.cwd();
const require$ = createRequire(cwd); // import.meta.url 在 jest需要额外配置

interface PackageOptions {
	[key: string]: any;
	version: string;
	name: string;
}

interface Config {
	cwd: string;
	workspace: string;
	homepage: string; 
	packageFolderName: string;
	packageDir: string;
	packageOptions: PackageOptions;
	packageName: string;
	packageVersion: string;
	packageFolderNames: string[];
	packageOptionsMap: {
		[key: string]: PackageOptions;
	};
	packageDirsMap: {
		[key: string]: PackageOptions;
	};
	packageRelation: {
		[key: string]: string[];
	};
	normalizePackageNames: string[];
	normalizePackageFolderNames: string[];
}

export class Shared {
	static config: Config;

	// 处理依赖关系的函数 如a依赖b, b依赖c，则输出c,b,a; 
	static getNormalizePackage = (dataMap: any) => {
		// checks
		Object.keys(dataMap).forEach(packageName => {
			const relations = dataMap[packageName];
			relations.forEach((packageName$: string) => {
				if (dataMap[packageName$].includes(packageName)) {
					throw new Error(`${packageName} ${packageName$} deps loop`);
				}
			});
		});

		// eslint-disable-next-line no-sequences
		const needUseMap: any = Object.keys(dataMap).reduce((pre, key) => (pre[key] = 0, pre), {});
		const queue: string[] = [];
		
		// 计算每个节点的入度
		for (let key in dataMap) {
			const dependencies = dataMap[key];
			dependencies.forEach((dependency: string) => {
				needUseMap[dependency] += 1;
			});
		}
		
		// 将入度为0的节点加入队列
		for (let key in needUseMap) {
			if (needUseMap[key] === 0) {
				queue.push(key);
			}
		}
		
		const result: string[] = [];
		while (queue.length > 0) {
			const node = queue.shift();
			if (!node) return [];
			result.push(node);
			
			const dependencies = dataMap[node];
		
			for (let i = 0; i < dependencies.length; i++) {
				const dependency = dependencies[i];
				needUseMap[dependency] -= 1;
				if (needUseMap[dependency] === 0) {
					queue.push(dependency);
				}
			}
		}
		return result.reverse();
	};

	static getPackageName = (packageFolderName$: string) => {
		const { workspace, packageFolderName, packageName } = Shared.impl();
		if (
			!workspace 
			|| !packageFolderName$ 
			|| packageFolderName$ === packageFolderName
		) {
			return packageName;
		} else {
			return `${packageName}-${packageFolderName$.replace(new RegExp(`${packageName}-?`), '')}`;
		}
	};

	static getPackageFolderName = (packageName$: string) => {
		const { workspace, packageFolderName, packageName } = Shared.impl();
		if (!workspace) return '';

		if (packageName$ === packageName) return packageFolderName;
		return packageName$?.replace(new RegExp(`${packageName}-?`), '');
	};

	static impl() {
		if (Shared.config) return Shared.config;
		const rootPackageOptions = require$(`${cwd}/package.json`);
		
		let workspace = 'packages';
		let isMonorepo = fs.existsSync(path.resolve(cwd, workspace));
		workspace = isMonorepo ? workspace : '';

		const packageFolderName = isMonorepo ? 'index' : '';
		const packageDir = path.resolve(cwd, workspace);
		const packageOptions = require$(path.resolve(packageDir, packageFolderName, 'package.json'));
		const packageName = packageOptions.name;
		const packageVersion = packageOptions.version;

		// 所有包的路径
		const packageFolderNames: string[] = !isMonorepo ? [] : fs
			.readdirSync(packageDir)
			.reduce((pre: string[], file: string) => {
				const fullpath = path.resolve(packageDir, file);
				// 获取文件信息
				const stat = fs.statSync(fullpath);
				if (!(/(^_|tpl)/.test(file)) 
					&& stat.isDirectory()
				) {
					pre.push(file);
				}
				return pre;
			}, []);

		// 所有包的package.json
		const packageOptionsMap = packageFolderNames.reduce((pre, packageFolderName$) => {
			pre[packageFolderName$] = require$(path.resolve(packageDir, packageFolderName$, 'package.json'));
			return pre;
		}, {});

		const packageDirsMap = packageFolderNames.reduce((pre, packageFolderName$) => {
			pre[packageFolderName$] = path.resolve(packageDir, packageFolderName$);
			return pre;
		}, {});

		const packageRelation = packageFolderNames.reduce((pre, packageFolderName$) => {
			let packagesOptions = packageOptionsMap[packageFolderName$];
			let deps = {
				...(packagesOptions.dependencies || {}),
				...(packagesOptions.devDependencies || {}),
			};
			pre[packagesOptions.name] = Object.keys(deps).filter(i => new RegExp(`${packageName}`).test(i));
			return pre;
		}, {});

		// 打包的优先级
		const normalizePackageNames = Shared.getNormalizePackage(packageRelation);
		const normalizePackageFolderNames = normalizePackageNames
			.map(i => i.replace(new RegExp(`${packageName}-?`), '') || packageFolderName);


		const homepage = (rootPackageOptions.repository || packageOptions.repository || {}).url || '';
		const config = {
			cwd,
			workspace,
			homepage: homepage.replace(/(.*)(https?:\/\/.*)(#|\.git)/, '$2'),
			packageFolderName,
			packageDir,
			packageOptions,
			packageName,
			packageVersion,
			packageFolderNames,
			packageOptionsMap,
			packageDirsMap,
			packageRelation,
			normalizePackageNames,
			normalizePackageFolderNames
		};

		Shared.config = config;
		return config;
	}
}