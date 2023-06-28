/* eslint-disable no-return-await */
import type { Page, ClickOptions } from 'puppeteer';

export class Operater {
	page: Page;

	constructor(v: Page) {
		this.page = v;
	}

	/**
	 * @param {string} selector ~
	 * @param {ClickOptions} options ~
	 */
	async click(selector: string, options?: ClickOptions) {
		await this.page.click(selector, options);
	}

	/**
	 * @param {string} selector ~
	 * @returns {number} ~
	 */
	async count(selector: string): Promise<number> {
		return (await this.page.$$(selector)).length;
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<string>} ~
	 */
	async text(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.textContent);
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<string>} ~
	 */
	async value(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.value);
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<string>} ~
	 */
	async html(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.innerHTML);
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<string[]>} ~
	 */
	async classList(selector: string): Promise<string[]> {
		return await this.page.$eval(selector, (node: any) => [...node.classList]);
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<HTMLElement[]>} ~
	 */
	async children(selector: string): Promise<HTMLElement[]> {
		return await this.page.$eval(selector, (node: any) => [...node.children]);
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<boolean>} ~
	 */
	async isVisible(selector: string): Promise<boolean> {
		const display = await this.page.$eval(selector, (node: any) => {
			return window.getComputedStyle(node).display;
		});
		return display !== 'none';
	}

	/**
	 *
	 * @param {string} selector ~
	 * @returns {Promise<boolean>} ~
	 */
	async isChecked(selector: string): Promise<boolean> {
		return await this.page.$eval(
			selector,
			(node: any) => node.checked
		);
	}

	/**
	 *
	 * @param {string} selector ~
	 * @returns {Promise<boolean>} ~
	 */
	async isFocused(selector: string): Promise<boolean> {
		return await this.page.$eval(selector, node => node === document.activeElement);
	}

	/**
	 * @param {string} selector ~
	 * @param {string} value$ ~
	 * @returns {Promise<void>} ~
	 */
	async setValue(selector: string, value$: string): Promise<void> {
		await this.page.$eval(
			selector,
			(node, value$$) => {
				(node as HTMLInputElement).value = value$$ as string;
				node.dispatchEvent(new Event('input'));
			},
			value$
		);
	}

	/**
	 * @param {string} selector ~
	 * @param {string} value$ ~
	 * @returns {Promise<void>} ~
	 */
	async typeValue(selector: string, value$: string): Promise<void> {
		const el = (await this.page.$(selector))!;
		await el.evaluate(node => ((node as HTMLInputElement).value = ''));
		await el.type(value$);
	}

	/**
	 * @param {string} selector ~
	 * @param {string} value$ ~
	 * @returns {Promise<void>} ~
	 */
	async enterValue(selector: string, value$: string): Promise<void> {
		const el = (await this.page.$(selector))!;
		await el.evaluate(node => ((node as HTMLInputElement).value = ''));
		await el.type(value$);
		await el.press('Enter');
	}

	/**
	 * @param {string} selector ~
	 * @returns {Promise<void>} ~
	 */
	async clearValue(selector: string): Promise<void> {
		return await this.page.$eval(
			selector,
			node => {
				(node as HTMLInputElement).value = '';
			}
		);
	}

	/**
	 *
	 * @param {number} time ~
	 * @returns {Promise<any>} ~
	 */
	sleep(time: number): Promise<any> {
		return this.page.evaluate((time$: number) => {
			return new Promise(r => {
				setTimeout(r, time$);
			});
		}, time);
	}

	nextFrame() {
		return this.page.evaluate(() => {
			return new Promise(resolve => {
				requestAnimationFrame(() => {
					requestAnimationFrame(resolve);
				});
			});
		});
	}
}