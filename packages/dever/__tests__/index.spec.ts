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
		expect.hasAssertions();
		const { stdout } = await Shell.exec(`npm`, ['run', 'dev'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		expect(stdout).toMatch('no entry file found!');
	}, 60000);

	it('singlerepo, play-dir', async () => {
		expect.hasAssertions();
		const subprocess = Shell.spawn(`npm`, ['run', 'dev', '--', '--play-dir', 'play'], {
			cwd: path.resolve('./packages/_/singlerepo'),
			stdio: 'pipe'
		});
		let stdout = '';
		const ready = new Promise<void>((resolve) => {
			subprocess.stdout.on('data', (data) => {
				stdout += data.toString().replace(/(\t|\n|\v|\r|\f|\s)/g, '');
				if (!stdout.includes('index.html')) return;
				resolve();
			});
		});

		try {
			await ready;
			subprocess.kill();
		} catch (e) {
			process.env.CI && console.log(e);
			!subprocess.killed && subprocess.kill();
		}
		expect(stdout).toMatch(/>index:http.*\/index\.html/);
	}, 60000);

	it('monorepo', async () => {
		expect.assertions(8);

		const subprocess = Shell.spawn(`npm`, ['run', 'dev'], {
			cwd: path.resolve('./packages/_/monorepo'),
			stdio: 'pipe'
		});
		let expects = ['/components/button/index.html', '/components/ext/index.html', '/vue/index.html', '/react/index.html'];

		const ready = new Promise<void>((resolve) => {
			const run = (url: string, timeout: number) => {
				let ctx: Launch;
				Promise.resolve()
					.then(() => {
						ctx = new Launch();
						return ctx.createPage();
					})
					.then(() => {
						return ctx.page.goto(url, { timeout });
					})
					.then(() => {
						return Promise.all([
							ctx.page.waitForSelector('#test'),
							ctx.page.waitForSelector('#app')
						]);
					})
					.then(() => {
						return Promise.all([
							ctx.operater.html('#test'),
							ctx.operater.classList('#app')
						]);
					})
					.then(([html, classList]) => {
						expect(html).toMatch('Hello World!');
						expect(classList).toEqual(['preload']);
						expects = expects.filter(i => !url.includes(i));

						if (!expects.length) {
							ctx.browser.close().finally(resolve);
						}
					})
					.catch((e) => {
						ctx.browser.close()
							.then(
								() => {
									if (String(e).includes('TimeoutError')) {
										process.env.CI && console.log(url, timeout, String(e).replace(/(.*)\n.*/, '$1'), /try again/);
										run(url, timeout + 100);
									} else {
										console.log(e, /task error/);
										throw e;
									}
								},
								resolve
							);
					});
			};
			subprocess.stdout.on('data', (data) => {
				data = data.toString().replace(/(\t|\n|\v|\r|\f|\s)/g, '');
				if (!data) return;
				data.split('➜')[0].split('>').filter((i: any) => !!i).forEach((url: string) => {
					url = url.match(/(.*)(http:.*)/)?.[2] || '';
					if (url && expects.some(i => url.includes(i))) {
						run(url, 1000);
					}
				});
			});
		});

		try {
			await ready;
			subprocess.kill('SIGTERM');
			await new Promise<void>((resolve, reject) => {
				setTimeout(() => {
					if (subprocess.killed) return resolve();
					if (!subprocess.killed) return reject('try force to exit');
				}, 2000);
			});
		} catch (e) {
			process.env.CI && console.log(e);
			!subprocess.killed && subprocess.kill('SIGKILL');
		}
	}, 150000);
});
