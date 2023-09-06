import { mount } from '@vue/test-utils';
import { App } from '@demo/helper-vue';

// @vitest-environment jsdom
describe('index.ts', () => {
	it('basic', () => {
		expect(typeof App).toBe('object');
	});

	it('click', async () => {
		const wrapper = mount(App);
		expect(wrapper.text()).toMatch('Hello World');

		await wrapper.find('div').trigger('click');
	});
});
