import { resolve } from 'node:path';
import { E2E } from '@deot/dev-test';

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

		const value = 'e2e';
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

		const html1 = await operater.html('html');
		const html2 = await page.$eval('html', (node: any) => node.innerHTML);

		expect(html1).toBe(html2);
	}, E2E.TIME_OUT);

	it('setValue dispatches input, while clearValue only changes the DOM value', async () => {
		const { page, operater } = launch;
		await page.setContent('<input id="value" value="initial"><output id="events">0</output>');
		await page.evaluate(() => {
			let count = 0;
			document.querySelector('input')!.addEventListener('input', () => {
				document.querySelector('output')!.textContent = String(++count);
			});
		});
		await operater.setValue('#value', 'updated');
		expect(await operater.value('#value')).toBe('updated');
		expect(await operater.text('#events')).toBe('1');
		await operater.clearValue('#value');
		expect(await operater.value('#value')).toBe('');
		expect(await operater.text('#events')).toBe('1');
	}, E2E.TIME_OUT);

	it('typing replaces existing text, Enter dispatches a key event, and missing selectors reject', async () => {
		const { page, operater } = launch;
		await page.setContent('<input value="old"><output>waiting</output>');
		await page.evaluate(() => {
			document.querySelector('input')!.addEventListener('keydown', (event) => {
				if (event.key === 'Enter') document.querySelector('output')!.textContent = 'submitted';
			});
		});
		await operater.typeValue('input', 'new');
		expect(await operater.value('input')).toBe('new');
		await operater.enterValue('input', 'final');
		expect(await operater.value('input')).toBe('final');
		expect(await operater.text('output')).toBe('submitted');
		expect(await operater.count('.missing')).toBe(0);
		await expect(operater.text('.missing')).rejects.toThrow();
	}, E2E.TIME_OUT);
});
