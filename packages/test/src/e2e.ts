import { Launch } from './launch';

export const TIME_OUT = 30 * 1000;
export const impl = () => {
	let launch = new Launch();

	beforeAll(async () => {
		await launch.createBrowser();
	}, 20000);

	beforeEach(async () => {
		await launch.createPage(true);
	});

	afterEach(async () => {
		await launch.page.close();
	});

	afterAll(async () => {
		await launch.browser.close();
	});

	return launch;
};
