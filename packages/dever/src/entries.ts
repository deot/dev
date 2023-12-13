import * as path from 'node:path';
import * as fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { Locals } from '@deot/dev-shared';
import { render } from 'ejs';

const dirname = path.dirname(fileURLToPath(import.meta.url));

const target = {
	entries: [] as string[],
	html: ''
};

const excludes = ['tpl', '_', 'dist', 'node_modules', '__tests__'];
const walk = (dir: string, playDir: string[]) => {
	const { cwd, workspace } = Locals.impl();
	const directory = path.join(cwd, workspace, dir);

	fs.readdirSync(directory).forEach((file: string) => {
		const fullpath = path.join(directory, file);
		const paths = fullpath.split('/') || [];
		const stat = fs.statSync(fullpath);
		const extname = path.extname(fullpath);

		if (stat.isFile()
			&& (/\.((t|j)sx?|vue|html)$/.test(extname))
			&& paths.length >= 2 && playDir.includes(paths[paths.length - 2])
		) {
			const basename = path.basename(file, extname);
			const name = path.join(dir!, basename).split('/');
			playDir.length === 1 && name.splice(name.length - 2, 1);

			const name$ = name.join('/');
			if (!target.entries.includes(name$)) {
				target.entries.push(name$);
			}
		} else if (stat.isDirectory() && !excludes.includes(file)) {
			const subdir = path.join(dir!, file);
			walk(subdir, playDir);
		}
	});
};

export const get = (playDir: string) => {
	if (target.html) return target;
	walk('.', playDir.split(','));

	const tpl = fs.readFileSync(path.resolve(dirname, '../index.ejs'));
	target.html = render(tpl.toString(), {
		title: 'demo',
		base: '/',
		pages: target.entries
	});

	return target;
};
