import { resolve } from 'node:path';
import { Launch, E2E } from '@deot/dev-test';

describe('launch.ts', () => {
	const baseUrl = `file://${resolve(__dirname, './fixtures/e2e.html')}`;

	it('browser', async () => {
		const ctx = new Launch();
		expect(() => ctx.browser.close()).toThrow('browser is not defined');
		try {
			const task = ctx.createBrowser();
			expect(ctx.createBrowser()).toBe(task);
			const first = await task;
			expect(ctx.browser).toBe(first);
			const second = await ctx.createBrowser(true);
			expect(second).not.toBe(first);
			expect(ctx.browser).toBe(second);
			await expect.poll(() => first.connected).toBe(false);
		} finally {
			await ctx.browser.close();
		}
	}, E2E.TIME_OUT);

	it('page', async () => {
		const ctx = new Launch();
		expect(() => ctx.page.goto(baseUrl)).toThrow('page is not defined');
		try {
			const first = await ctx.createPage();
			expect(await ctx.createPage()).toBe(first);
			const second = await ctx.createPage(true);
			expect(second).not.toBe(first);
			expect(ctx.page).toBe(second);
			await expect.poll(() => first.isClosed()).toBe(true);
			await second.goto(baseUrl);
			expect(await ctx.operater.value('#input')).toBe('test');
		} finally {
			await ctx.browser.close();
		}
	}, E2E.TIME_OUT);

	it('operater', async () => {
		const ctx = new Launch();
		expect(() => ctx.operater.value('input')).toThrow('operater is not defined');
		try {
			const first = ctx.operater;
			await ctx.createPage();
			expect(ctx.operater === first).toBe(false);
			expect(ctx.operater.page).toBe(ctx.page);
			await ctx.createPage(true);
			expect(ctx.operater.page).toBe(ctx.page);
		} finally {
			await ctx.browser.close();
		}
	}, E2E.TIME_OUT);
});
