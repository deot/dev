import * as path from 'node:path';
import * as fs from 'node:fs';
import { createRequire } from "node:module";
import { defineConfig } from 'vitest/config';
import type { UserConfig, ViteDevServer } from 'vite';

/**
 * https://github.com/vuejs/core/issues/8303
 * to fix error: ReferenceError: __name is not defined
 */
let __defProp = Object.defineProperty;
let __name = (target: any, value: any) => __defProp(target, 'name', { value, configurable: true });
globalThis.__name = globalThis.__name || __name;

const cwd = process.cwd();

// devOptions
const devOptions = JSON.parse(decodeURIComponent(process.env.DEV_OPTIONS || '{}'));
const { workspace, html, subpackagesMap } = devOptions;

const generateIndexHtml = (url: string, inject: string) => {
	let contents = '';
	contents += `<!DOCTYPE html>\n`;
	contents += `<html lang="en">\n`;
	contents += `	<head>\n`;
	contents += `		<meta charset="UTF-8" />\n`;
	contents += `		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n`;
	contents += `		<title>demo-${url}</title>\n`;
	contents += `	</head>\n`;
	contents += `	<body>\n`;
	contents += `		<div id="app"></div>\n`;
	contents += `		<script type="module">\n`;
	contents += inject;

	contents += `		</script>\n`;
	contents += `	</body>\n`;
	contents += `</html>\n`;

	return contents;
};

const getVirtualHtml = async (url: string) => {
	const info = url.split('/').filter(i => !!i);

	const prefix = info.slice(0, -1);
	const entry = info.slice(-1)[0];

	if (prefix[prefix.length - 1] !== 'examples') {
		prefix.push('examples');
	}

	if (workspace && prefix[0] !== workspace) {
		prefix.unshift(workspace);
	}

	const dir = path.join(cwd, prefix.join('/'));
	const isExist = (ext: string) => {
		const fullpath = path.join(dir, `${entry.replace(/(.*)(\..*)$/, '$1') + ext}`);
		return fs.existsSync(fullpath) ? fullpath : false;
	};

	const getPreload = (fullpath: string) => {
		let dir$ = path.dirname(fullpath);
		let preload = '';
		while (dir$ !== cwd && !preload) {
			let preloadFullPath = path.resolve(dir$, './preload.ts');
			if (fs.existsSync(preloadFullPath)) {
				preload = `		import "/${path.relative(cwd, preloadFullPath)}";\n`;
			} else {
				dir$ = path.resolve(dir$, '..');
			}
		}

		return preload;
	};
	
	const htmlFullpath = isExist('.html');
	if (htmlFullpath) {
		return fs.readFileSync(htmlFullpath).toString();
	}

	const tsFullpath = isExist('.ts');
	if (tsFullpath) {
		let inject = getPreload(tsFullpath);
		inject += `		import "/${path.relative(cwd, tsFullpath)}";\n`;
		return generateIndexHtml(url, inject);
	}

	const vueFullpath = isExist('.vue');
	if (vueFullpath) {
		let inject = getPreload(vueFullpath);
		inject += `		import { createApp } from "vue"\n`;
		inject += `		import App from "/${path.relative(cwd, vueFullpath)}";\n`;
		inject += `		const app = createApp(App);\n`;
		inject += `		app.mount("#app");\n`;
		inject += `		typeof window !== "undefined" && (window.app = app);\n`;
		return generateIndexHtml(url, inject);
	}

	const tsxFullpath = isExist('.tsx');
	if (tsxFullpath) {
		let inject = getPreload(tsxFullpath);
		inject += `		import React, { StrictMode } from 'react';`;
		inject += `		import { createRoot } from 'react-dom/client';`;
		inject += `		import App from "/${path.relative(cwd, tsxFullpath)}";\n`;
		inject += `		const h = React.createElement\n`;
		inject += `		const app = createRoot(document.getElementById('app'));\n`;
		inject += `		app.render(h(StrictMode, {}, h(App)))\n`;

		return generateIndexHtml(url, inject);
	}
};


// alias
const require$ = createRequire(cwd);
const getPackageName = (name: string) => (require$(path.resolve(cwd, workspace ? `${workspace}/${name}` : '', 'package.json'))).name;
const replacement = (name: string, isSubpackage?: boolean) => path.resolve(cwd, `./packages/${name}`, isSubpackage ? 'index.ts' : './src');
const name = getPackageName('index');

export default defineConfig({
	resolve: workspace
		? {
			alias: [
				{
					find: new RegExp(`^${name}$`),
					replacement: replacement('index')
				},
				...Object.keys(subpackagesMap).reduce((pre, cur: string) => {
					if (subpackagesMap[cur].length) {
						pre.push({
							find: new RegExp(`^${getPackageName(cur)}$`),
							replacement: replacement(cur, true)
						});
					}
					return pre;
				}, [] as any),
				{

					find: new RegExp(`^${name}-(.*?)$`),
					replacement: replacement('$1')
				}
			]
		}
		: {},
	plugins: [
		{
			name: 'vite-plugin-virtual-html',
			configureServer(server: ViteDevServer) {
				server.middlewares.use(async (req, res, next) => {
					if (res.writableEnded) {
					    return next();
					}
					if (req.url!.includes('html-proxy&')) {
						return next();
					}

					let url = req.url?.replace(/[?#].*$/s, '') || '';					
					if (url === '/') return res.end(html);

					// 文件已存在，这样xxx.png可以被获取，真实路径的.ts,.html都可以被获取
					if (fs.existsSync(path.join(cwd, url))) {
						return next();
					}

					let vHtml = await getVirtualHtml(url);
					if (
						(url?.endsWith('.html') || vHtml) 
						&& req.headers['sec-fetch-dest'] !== 'script'
					) {
						if (!vHtml) {
							return res.end(html);
						}
						vHtml = await server.transformIndexHtml(url, vHtml, req.originalUrl);
						res.end(vHtml);
						return;
					}

					next();
				});
			}
		}
	],

	// 因为virtualHtml不需要入口，这样可以不弹出Skipping dependency pre-bundling.
	optimizeDeps: { entries: [] }
}) as UserConfig;