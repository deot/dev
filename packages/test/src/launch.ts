import puppeteer from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser, Page } from 'puppeteer';
import { Operater } from './operater';

export class Launch {
	browser: Browser;

	page: Page;

	operater: Operater;

	private _browser!: Promise<Browser>;

	private _page!: Promise<Page>;

	options: PuppeteerLaunchOptions;

	constructor() {
		this.operater = new Proxy({} as Operater, {
			get: () => {
				throw new Error('operater is not defined. create* invote first');
			}
		});

		this.browser = new Proxy({} as Browser, {
			get: () => {
				throw new Error('browser is not defined. createBrowser invote first');
			}
		});

		this.page = new Proxy({} as Page, {
			get: () => {
				throw new Error('page is not defined. createPage invote first');
			}
		});
		

		this.options = process.env.CI
			? /* istanbul ignore next */ { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
			: {};
	}

	createBrowser(force?: boolean): Promise<Browser> {
		if (force || !this._browser) {
			if (force && this._browser) {
				this._browser.then((browser) => {
					browser.isConnected() && browser.close();
				});
			}

			this._browser = puppeteer.launch({
				...this.options,
				headless: 'new'
			});

			this._browser.then((browser) => {
				this.browser = browser;
			});
		}

		return this._browser;
	}

	async createPage(force?: boolean): Promise<Page> {
		await this.createBrowser();

		if (force || !this._page) {
			if (force && this._page) {
				this._page.then((page) => {
					!page.isClosed() && page.close();
				});
			}

			this._page = new Promise((resolve) => {
				(async () => {
					let page = await this.browser!.newPage();

					await page.evaluateOnNewDocument(/* istanbul ignore next */ () => {
						localStorage.clear();
					});

					page.on('console', /* istanbul ignore next */ e => {
						if (e.type() === 'error') {
							const err = e.args()[0];
							console.error(
								`Error from Puppeteer-loaded page:\n`,
								err.remoteObject().description
							);
						}
					});

					this.page = page;
					this.operater = new Operater(page);

					resolve(page);
				})();
			});
		}
		return this._page;
	}
}