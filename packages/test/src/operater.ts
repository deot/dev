/* eslint-disable no-return-await */
import type { Page, ClickOptions } from 'puppeteer';

export class Operater {
	page: Page;

	constructor(v: Page) {
		this.page = v;
	}

	/**
	 * @param selector ~
	 * @param options ~
	 */
	async click(selector: string, options?: ClickOptions) {
		await this.page.click(selector, options);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async count(selector: string): Promise<number> {
		return (await this.page.$$(selector)).length;
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async text(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.textContent);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async value(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.value);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async html(selector: string): Promise<string> {
		return await this.page.$eval(selector, (node: any) => node.innerHTML);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async classList(selector: string): Promise<string[]> {
		return await this.page.$eval(selector, (node: any) => [...node.classList]);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async children(selector: string): Promise<HTMLElement[]> {
		return await this.page.$eval(selector, (node: any) => [...node.children]);
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async isVisible(selector: string): Promise<boolean> {
		const display = await this.page.$eval(selector, (node: any) => {
			return window.getComputedStyle(node).display;
		});
		return display !== 'none';
	}

	/**
	 *
	 * @param selector ~
	 * @returns ~
	 */
	async isChecked(selector: string): Promise<boolean> {
		return await this.page.$eval(
			selector,
			(node: any) => node.checked
		);
	}

	/**
	 *
	 * @param selector ~
	 * @returns ~
	 */
	async isFocused(selector: string): Promise<boolean> {
		return await this.page.$eval(selector, node => node === document.activeElement);
	}

	/**
	 * @param selector ~
	 * @param value$ ~
	 * @returns ~
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
	 * @param selector ~
	 * @param value$ ~
	 * @returns ~
	 */
	async typeValue(selector: string, value$: string): Promise<void> {
		const el = (await this.page.$(selector))!;
		await el.evaluate(node => ((node as HTMLInputElement).value = ''));
		await el.type(value$);
	}

	/**
	 * @param selector ~
	 * @param value$ ~
	 * @returns ~
	 */
	async enterValue(selector: string, value$: string): Promise<void> {
		const el = (await this.page.$(selector))!;
		await el.evaluate(node => ((node as HTMLInputElement).value = ''));
		await el.type(value$);
		await el.press('Enter');
	}

	/**
	 * @param selector ~
	 * @returns ~
	 */
	async clearValue(selector: string): Promise<void> {
		return await this.page.$eval(
			selector,
			(node) => {
				(node as HTMLInputElement).value = '';
			}
		);
	}

	/**
	 *
	 * @param time ~
	 * @returns ~
	 */
	sleep(time: number): Promise<any> {
		return this.page.evaluate((time$: number) => {
			return new Promise((r) => {
				setTimeout(r, time$);
			});
		}, time);
	}

	nextFrame() {
		return this.page.evaluate(() => {
			return new Promise((resolve) => {
				requestAnimationFrame(() => {
					requestAnimationFrame(resolve);
				});
			});
		});
	}
}
