import * as path from 'node:path';
import * as fs from 'node:fs';
import { createRequire } from "node:module";
import { defineConfig } from 'vitest/config';
import type { UserConfig, ViteDevServer } from 'vite';

const cwd = process.cwd();

// devOptions
const devOptions = JSON.parse(decodeURIComponent(process.env.DEV_OPTIONS || '{}'));
const { workspace, html } = devOptions;

// alias
const replacement = (name: string) => path.resolve(cwd, `./packages/${name}/src`);
const { name } = createRequire(cwd)(path.resolve(cwd, workspace ? `${workspace}/index` : '', 'package.json'));

const getHtmlContent = async (url: string) => {
	let fullpath = path.join(cwd, url);
	if (
		/^\/?@vite/.test(url)
		|| (
			fs.existsSync(fullpath) 
			&& fs.statSync(fullpath).isFile()
		)
	) {
		return;
	}

	if (url === '/') return html;

	const [packageFolderName, htmlEntry] = url.split('/').filter(i => !!i);

	fullpath = path.join(
		cwd, 
		'packages', 
		packageFolderName,
		'examples',
		`${htmlEntry?.replace(/(\.html)/g, '')}.ts`
	);
	if (!fs.existsSync(fullpath)) return html;

	let contents = '';
	contents += `<!DOCTYPE html>\n`;
	contents += `<html lang="en">\n`;
	contents += `	<head>\n`;
	contents += `		<meta charset="UTF-8" />\n`;
	contents += `		<meta name="viewport" content="width=device-width, initial-scale=1.0" />\n`;
	contents += `		<title>demo-${url}</title>\n`;
	contents += `	</head>\n`;
	contents += `	<body>\n`;
	contents += `		<script type="module">\n`;
	contents += `		import "/${path.relative(cwd, fullpath)}";\n`;
	contents += `		</script>\n`;
	contents += `	</body>\n`;
	contents += `</html>\n`;
	return contents;
};

export default defineConfig({
	resolve: workspace
		? {
			alias: [
				{
					find: new RegExp(`^${name}$`),
					replacement: replacement('index')
				},
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
					const url = req.url as string;

					const content = await getHtmlContent(url);

					if (!content) {
						return next();
					}

					res.end(content);
				});
			}
		}
	],

	// // 因为virtualHtml不需要入口，这样可以不弹出Skipping dependency pre-bundling.
	optimizeDeps: { entries: [] }
}) as UserConfig;