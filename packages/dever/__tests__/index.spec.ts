/* eslint-disable no-promise-executor-return */
import * as path from 'node:path';
import { Locals, Shell } from '@deot/dev-shared';
import * as Dever from '@deot/dev-dever';
import { Launch } from '@deot/dev-test';

// @vitest-environment node
describe('index', () => {
	it('config', () => {
		const it = Locals.impl();
		expect(it.cwd).toMatch('/dev');
	});

	it('run', async () => {
		expect(typeof Dever.run).toBe('function');
	});

	it('singlerepo', async () => {
		expect.assertions(1);
		const { stdout } = await Shell.exec(`npm`, ['run', 'dev'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		expect(stdout).toMatch('no entry file found!');
	}, 60000);

	it('monorepo', async () => {
		expect.assertions(3);
		const ctx = new Launch();
		await ctx.createPage();

		let task = Promise.resolve();
		const subprocess = Shell.spawn(`npm`, ['run', 'dev'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});

		let expects = ['/components/button/index.html', '/vue/index.html', '/react/index.html'];
		await new Promise<void>(resolve => {
			const run = (url: string, timeout: number) => {
				task = task
					.then(() => {
						return ctx.page.goto(url, { timeout });
					})
					.then(() => {
						return ctx.operater.html("#test");
					})
					.then((res) => {
						expect(res).toMatch('Hello World!');
						expects = expects.filter(i => !url.includes(i));
						if (!expects.length) {
							subprocess.kill();
							ctx.browser.close().then(() => resolve());
						}
					}).catch((e) => {
						if (e.toString().includes('TimeoutError')) {
							run(url, timeout + 100);
						} else {
							console.log(e, /task error/);							
						}
					});
			};
			subprocess.stdout.on('data', (data) => {
				data = data.toString().replace(/(\t|\n|\v|\r|\f|\s)/g, '');
				if (!data) return;
				data.split('>').filter((i: any) => !!i).forEach((url: string) => {
					url = url.match(/(.*)(http:.*)/)?.[2] || '';
					if (url && expects.some(i => url.includes(i))) {
						run(url, 300);
					}
				});
			}); 
		});
	}, 150000);
});
