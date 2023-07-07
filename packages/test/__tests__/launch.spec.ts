import { Launch, E2E } from '@deot/dev-test';
import { resolve } from 'node:path';

describe('launch.ts', () => {
	const baseUrl = `file://${resolve(__dirname, './fixtures/e2e.html')}`;

	it('browser', async () => {
		const ctx = new Launch();
		try {
			await ctx.browser.close();
		} catch {
			await ctx.createBrowser();
			await ctx.createBrowser();
			await ctx.createBrowser(true);
			await ctx.browser.close();
			expect(typeof ctx.browser.close).toBe('function');
		}
	}, E2E.TIME_OUT);

	it('page', async () => {
		const ctx = new Launch();

		try {
			await ctx.page.goto(baseUrl);
		} catch {
			await ctx.createPage();
			await ctx.createPage();
			await ctx.createPage(true);
			await ctx.page.goto(baseUrl);
			expect(typeof ctx.page.goto).toBe('function');
		}

		await ctx.browser.close();
	}, E2E.TIME_OUT);

	it('operater', async () => {
		const ctx = new Launch();

		try {
			await ctx.operater.value('input');
		} catch {
			await ctx.createPage();
			expect(typeof ctx.operater.value).toBe('function');
		}

		expect(typeof ctx.page).toBe('object');
		await ctx.browser.close();
	}, E2E.TIME_OUT);
});

