import { Server } from '@deot/dev-test';

describe('server.ts', () => {
	it('host', async () => {
		const host1 = Server.host();
		const host2 = Server.host();

		expect(host1).toBe(host2);
	});
	it('port', async () => {
		const port1 = await Server.port();
		const port2 = await Server.port();

		expect(port1).toBe(port2);
	});

	it('available', async () => {
		const { port, host, baseUrl } = await Server.available();

		expect(typeof port).toBe('number');
		expect(typeof host).toBe('string');
		expect(typeof baseUrl).toBe('string');
	});
});

