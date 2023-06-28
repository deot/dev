import { E2E } from '@deot/dev-test';
import { resolve } from 'node:path';

describe('e2e.ts', () => {
	const launch = E2E.impl();
	const baseUrl = `file://${resolve(__dirname, './fixtures/e2e.html')}`;

	it('operater', async () => {
		const { page, operater } = launch;
		await page.goto(baseUrl);

		// click, isFocused
		await operater.click('input');
		expect(await operater.isFocused('input')).toBe(true);

		// count
		expect(await operater.count('input')).toBe(2);

		// text
		expect(await operater.text('p')).toBe('text');

		// html
		expect(await operater.html('p')).toBe('text');

		// classList
		expect(await operater.classList('p')).toEqual(['small', 'bold']);

		// isVisible
		expect(await operater.isVisible('p')).toBe(true);
		expect(await operater.isVisible('span')).toBe(false);

		// isChecked
		expect(await operater.isChecked('#checkbox')).toBe(true);

		// value, setValue, clearValue
		expect(await operater.value('input')).toMatch('test');
		
		let value = 'e2e';
		await operater.setValue('#input', value);
		expect(await operater.value('input')).toBe(value);

		await operater.clearValue('#input');
		expect(await operater.value('input')).toBe('');

		// typeValue
		await operater.typeValue('input', value);
		expect(await operater.value('input')).toBe(value);

		// enterValue
		await operater.clearValue('#input');
		await operater.enterValue('input', value);
		expect(await operater.value('input')).toBe(value);

		// sleep
		await operater.sleep(10);

		// nextFrame
		await operater.nextFrame();

	}, E2E.TIME_OUT);

	it('empty entry', async () => {
		const { page, operater } = launch;
	
		let html1 = await operater.html('html');
		let html2 = await page.$eval('html', (node: any) => node.innerHTML);
		
		expect(html1).toBe(html2);
	}, E2E.TIME_OUT);
});

