import puppeteer from 'puppeteer';
import type { PuppeteerLaunchOptions, Browser, Page } from 'puppeteer';
import { Operater } from './operater';

export class Launch {
	browser: Browser;

	page: Page;

	operater: Operater;

	private _browser!: Promise<Browser>;

	private _page!: Promise<Page>;

	puppeteerOptions: PuppeteerLaunchOptions;

	options: {
		logLevel?: string;
	};

	constructor(options?: Launch['options']) {
		this.options = options || { logLevel: 'slient' };

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

		/* istanbul ignore next -- @preserve */
		this.puppeteerOptions = process.env.CI
			? { args: ['--no-sandbox', '--disable-setuid-sandbox'] }
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
				...this.puppeteerOptions,
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
					const page = await this.browser!.newPage();

					await page.evaluateOnNewDocument(/* istanbul ignore next */ () => {
						localStorage.clear();
					});

					/* istanbul ignore next -- @preserve */
					this.options.logLevel !== 'slient' && page.on('console', (e) => {
						const key = e.type();
						console[key].call(console[key], `${key} from puppeteer: `, ...e.args().map(i => i.remoteObject()));
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
