import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import os from 'os';
import fs from 'fs-extra';

const __dirname = dirname(fileURLToPath(import.meta.url));

export const host = (() => {
	const ips = [];
	const ntwk = os.networkInterfaces();
	for (const k in ntwk) {
		for (let i = 0; i < ntwk[k].length; i++) {
			const _add = ntwk[k][i].address;
			if (_add && _add.split('.').length == 4 && !ntwk[k][i].internal && ntwk[k][i].family == 'IPv4') {
				ips.push(ntwk[k][i].address);
			}
		}
	}
	return ips[0] || 'localhost';
})();

const nms = [
	resolve(__dirname, '../../node_modules'),
	resolve(process.cwd(), './node_modules')
	// ...module.paths
];

export const resolvePackage = (source, options) => {
	let $path = nms.find(i => fs.pathExistsSync(resolve(i, source)));

	if (!$path) {
		throw new Error(`@deot/dev: 未找到${source}`);
	}

	let fullPath = resolve($path, source);

	return options.read ? fs.readFileSync(fullPath) : fullPath;
};

export const formatBytes = (size, suffix = 2) => { 
	if (!size) return "0B"; 
	const base = 1024; // 表示要被转化的容量大小，以字节为单
	const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
	const index = Math.floor(Math.log(size) / Math.log(base)); 

	const value = parseFloat((size / (base ** index)).toFixed(suffix));
	return value + units[index];
};

export const autoCatch = async (impl, options = {}) => { 
	const { onError = console.error } = options;

	let target = impl;
	typeof target === 'function' && (target = target());

	try {
		const e = await target;
		return e;
	} catch (e) {
		onError(e);
	}
};