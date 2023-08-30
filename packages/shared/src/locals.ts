import { createRequire } from "node:module";
import * as path from 'node:path';
import * as fs from 'node:fs';

const cwd$ = process.cwd();
const require$ = createRequire(cwd$);

interface PackageOptions {
	[key: string]: any;
	version: string;
	name: string;
}

interface Config {
	cwd: string;
	workspace: string;
	homepage: string; 
	rootPackageOptions: PackageOptions;
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
	subpackagesMap: {
		[key: string]: string[];
	};
}

// 处理依赖关系的函数 如a依赖b, b依赖c，则输出c,b,a; 
export const getNormalizePackage = (dataMap: any) => {
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
		 /* istanbul ignore next -- @preserve */
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

export const getPackageName = (packageFolderName$: string) => {
	const { workspace, packageFolderName, packageName } = impl();
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

export const getPackageFolderName = (packageName$: string) => {
	const { workspace, packageFolderName, packageName } = impl();
	/* istanbul ignore next -- @preserve */
	if (!workspace) return '';

	if (packageName$ === packageName) return packageFolderName;
	return packageName$?.replace(new RegExp(`${packageName}-?`), '');
};

let configMap: { [key: string]: Config } = {};
export const impl = (cwd?: string) => {
	cwd = cwd || cwd$;
	if (configMap[cwd]) return configMap[cwd];
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

	// 根目录含index.ts, 不含src, 有文件夹且含__tests__，即认为当前为子包
	const subpackagesMap = packageFolderNames.reduce((pre, packageFolderName$) => {
		let dir = path.resolve(packageDir, packageFolderName$);
		pre[packageFolderName$] = workspace && fs.existsSync(`${dir}/index.ts`) && !fs.existsSync(`${dir}/src`)
			? fs.readdirSync(dir).filter((file: string) => {
				const fullpath = path.join(dir, file);
				const stat = fs.statSync(fullpath);
				if (stat.isDirectory()) {
					return fs.existsSync(`${fullpath}/__tests__`);
				}
				return false;
			})
			: [];
		return pre;
	}, {});

	// 打包的优先级
	const normalizePackageNames = getNormalizePackage(packageRelation);
	const normalizePackageFolderNames = normalizePackageNames
		.map(i => i.replace(new RegExp(`${packageName}-?`), '') || packageFolderName);


	const homepage = (rootPackageOptions.repository || packageOptions.repository || {}).url || '';
	const config = {
		cwd,
		workspace,
		homepage: homepage.replace(/(.*)(https?:\/\/.*)(#|\.git)/, '$2'),
		rootPackageOptions,
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
		normalizePackageFolderNames,
		subpackagesMap
	};

	configMap[cwd] = config;
	return config;
};
