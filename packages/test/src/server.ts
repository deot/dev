import * as http from 'http';
import * as os from 'os';

let defaultHost = '';
export const host = (force?: boolean) => {
	if (!force && defaultHost) return defaultHost;
	const ips: string[] = [];
	const ntwk = os.networkInterfaces();
	for (const k in ntwk) {
		for (let i = 0; i < ntwk[k]!.length; i++) {
			const _add = ntwk[k]![i].address;
			if (_add && _add.split('.').length == 4 && !ntwk[k]![i].internal && ntwk[k]![i].family == 'IPv4') {
				ips.push(ntwk[k]![i].address);
			}
		}
	}

	/* istanbul ignore next -- @preserve */
	return ips[0] || 'localhost';
};

defaultHost = host();

export const port = (host$: string = defaultHost, port$: number = 1024) => {
	/* istanbul ignore next -- @preserve */
	if (port$ < 1024) throw new Error('port < 1024');
	return new Promise((resolve, reject) => {
		const server = http.createServer();
		server.unref();
		server.on('error', /* istanbul ignore next -- @preserve */ () => {
			if (port$ >= 65535) {
				reject();
			} else {
				port(host$, port$ + 1)
					.then(resolve)
					.catch(reject);
			}
		});

		server.listen({ host: host$, port: port$ }, () => {
			server.close(() => {
				resolve(port$);
			});
		});
	});
};

export const available = async () => {
	const host$ = host();
	const port$ = await port(host$);

	return {
		host: host$,
		port: port$,
		baseUrl: `http://${host$}:${port$}`
	};
};
