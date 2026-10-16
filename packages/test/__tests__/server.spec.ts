import { Server } from '@deot/dev-test';
import * as http from 'node:http';
import os from 'node:os';
import { syncBuiltinESMExports } from 'node:module';

describe('server.ts', () => {
	afterEach(() => {
		vi.restoreAllMocks();
		syncBuiltinESMExports();
	});

	it('falls back to localhost when a forced host lookup has no external addresses', () => {
		const cached = Server.host();
		vi.spyOn(os, 'networkInterfaces').mockReturnValue({});
		syncBuiltinESMExports();
		expect(Server.host(true)).toBe('localhost');
		expect(Server.host()).toBe(cached);
	});

	it('rejects ports below the supported range synchronously', () => {
		expect(() => Server.port('127.0.0.1', 1023)).toThrow('port < 1024');
	});

	it('skips an occupied port and releases the selected free port', async () => {
		const occupied = http.createServer();
		await new Promise<void>(resolve => occupied.listen(0, '127.0.0.1', resolve));
		try {
			const port = (occupied.address() as import('node:net').AddressInfo).port;
			const available = await Server.port('127.0.0.1', port) as number;
			expect(available).toBeGreaterThan(port);
			await expect(Server.port('127.0.0.1', available)).resolves.toBe(available);
		} finally {
			await new Promise<void>((resolve, reject) => occupied.close(error => error ? reject(error) : resolve()));
		}
	});
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
		expect(baseUrl).toBe(`http://${host}:${port}`);
	});
});
