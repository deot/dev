import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Locals } from '@deot/dev-shared';
import { render } from 'ejs'; 

const dirname = path.dirname(fileURLToPath(import.meta.url));

let target = {
	entries: [] as string[],
	html: ''
};

const walk = (dir?: string) => {
	const { cwd, workspace } = Locals.impl();
	dir = dir || '.';
	const directory = path.join(cwd, workspace, dir);

	fs.readdirSync(directory).forEach((file: string) => {
		const fullpath = path.join(directory, file);
		const paths = fullpath.split('/') || [];
		const stat = fs.statSync(fullpath);
		const extname = path.extname(fullpath);

		if (stat.isFile() 
			&& (/\.(t|j)sx?$/.test(extname)) 
			&& paths.length >= 2 && paths[paths.length - 2] === 'examples'
		) {
			const basename = path.basename(file, extname);
			const name = path.join(dir!, basename);

			// 记录
			target.entries.push(name.replace(/\/examples/, ''));
		} else if (stat.isDirectory() && !['dist', 'node_modules', '__tests__'].includes(file)) {
			const subdir = path.join(dir!, file);
			walk(subdir);
		}
	});
};

export const get = () => {
	if (target.html) return target;
	walk();

	const tpl = fs.readFileSync(path.resolve(dirname, '../index.ejs'));
	target.html = render(tpl.toString(), {
		title: 'demo',
		base: '/',
		pages: target.entries
	});

	return target;
};
