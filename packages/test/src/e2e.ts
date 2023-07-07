import { Launch } from './launch';

export const TIME_OUT = 60 * 1000;
export const impl = () => {
	let launch = new Launch();

	beforeAll(async () => {
		await launch.createBrowser();
	}, 20000);

	beforeEach(async () => {
		await launch.createPage(true);
	});

	afterEach(async () => {
		if (!launch.page.isClosed()) {
			await launch.page.close();
		}
	});

	afterAll(async () => {
		if (launch.browser.isConnected()) {
			await launch.browser.close();
		}
	});

	return launch;
};
