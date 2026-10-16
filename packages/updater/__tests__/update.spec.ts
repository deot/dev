import * as path from 'node:path';
import fs from 'fs-extra';
import { Shell, Logger } from '@deot/dev-shared';
import { Update } from '../src/update';

describe('dependency update workflow', () => {
	let instance: Update;
	const cwd = process.cwd();
	const child = path.join(cwd, 'packages/shared');

	beforeEach(() => {
		instance = new Update({ dryRun: true } as Update['commandOptions']);
		instance.packageOptionsMap = {
			[cwd]: { dependencies: { library: '^1.0.0', unchanged: '1.0.0' } },
			[child]: { devDependencies: { library: '^1.0.0', unavailable: '^1.0.0' } }
		};
		vi.spyOn(Shell, 'exec').mockImplementation((async (_command, args) => {
			if (args?.[1] === 'unavailable') throw new Error('registry unavailable');
			return {
				stdout: JSON.stringify(args?.[2] === 'versions' ? ['1.0.0', '1.1.0', '1.2.0', '2.0.0-beta.1'] : '1.1.0'),
				stderr: ''
			} as never;
		}) as unknown as typeof Shell.exec);
		vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
		vi.spyOn(Logger, 'log').mockImplementation(() => {});
		vi.spyOn(fs, 'removeSync').mockImplementation(() => {});
		vi.spyOn(fs, 'outputFileSync').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('queries shared dependencies once, respects the latest tag, and skips failed or unchanged packages', async () => {
		await expect(instance.getPackageChanged()).resolves.toEqual({ library: { '^1.0.0': '^1.1.0' } });
		expect(Shell.exec).toHaveBeenCalledTimes(5);
		expect(Shell.exec).toHaveBeenCalledWith('npm', ['view', 'library', 'versions', '--json']);
	});

	it('updates both dependency sections and returns only changed child folders in dry run', async () => {
		const changed = { library: { '^1.0.0': '^1.1.0' } };
		await expect(instance.updatePackageOptions(changed)).resolves.toEqual(['shared']);
		expect(instance.packageOptionsMap[cwd].dependencies).toEqual({ library: '^1.1.0', unchanged: '1.0.0' });
		expect(instance.packageOptionsMap[child].devDependencies).toEqual({ library: '^1.1.0', unavailable: '^1.0.0' });
		expect(fs.removeSync).not.toHaveBeenCalled();
		expect(fs.outputFileSync).not.toHaveBeenCalled();
	});

	it('writes only changed package manifests when dry run is disabled', async () => {
		instance.commandOptions.dryRun = false;
		await instance.updatePackageOptions({ unchanged: { '1.0.0': '1.0.1' } });
		expect(fs.removeSync).toHaveBeenCalledExactlyOnceWith(`${cwd}/node_modules`);
		expect(fs.outputFileSync).toHaveBeenCalledExactlyOnceWith(
			`${cwd}/package.json`, JSON.stringify(instance.packageOptionsMap[cwd], null, 2)
		);
	});

	it('does not write or report folders when no versions match', async () => {
		await expect(instance.updatePackageOptions({ missing: { '*': '2.0.0' } })).resolves.toEqual([]);
		expect(fs.outputFileSync).not.toHaveBeenCalled();
	});

	it('does not install, commit or push during dry run', async () => {
		instance.commandOptions.commit = true;
		instance.commandOptions.push = true;
		await instance.updateLock('puppeteer updated');
		await instance.commit('chore: deps updated');
		await instance.push();
		expect(Shell.exec).not.toHaveBeenCalled();
		expect(Shell.spawn).not.toHaveBeenCalled();
	});

	it.each([
		[false, false, 0],
		[false, true, 0],
		[true, true, 0],
		[true, false, 1]
	])('runs project tests only when enabled outside dry run (test=%s, dryRun=%s)', async (test, dryRun, calls) => {
		Object.assign(instance.commandOptions, { test, dryRun });
		await instance.test();
		expect(Shell.exec).toHaveBeenCalledTimes(calls);
		if (calls) {
			expect(Shell.exec).toHaveBeenCalledWith(`npm run test -- --package-name '*'`);
		}
	});

	it('does not commit or push if updating the lockfile fails', async () => {
		vi.spyOn(instance, 'getPackageChanged').mockResolvedValue({ library: { '^1.0.0': '^1.1.0' } });
		vi.spyOn(instance, 'updatePackageOptions').mockResolvedValue(['shared']);
		const error = new Error('install failed');
		vi.spyOn(instance, 'updateLock').mockRejectedValue(error);
		const commit = vi.spyOn(instance, 'commit').mockResolvedValue();
		const push = vi.spyOn(instance, 'push').mockResolvedValue();
		await expect(instance.process()).rejects.toBe(error);
		expect(commit).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
	});

	it('stops the workflow before installation when the registry has no updates', async () => {
		vi.spyOn(instance, 'getPackageChanged').mockResolvedValue({});
		const updateLock = vi.spyOn(instance, 'updateLock');
		await instance.process();
		expect(updateLock).not.toHaveBeenCalled();
		expect(Logger.log).toHaveBeenCalledWith(expect.stringContaining('No Package Update Found.'));
	});

	it('runs update, lock, tests, commit and push in order and scopes the changelog to changed packages', async () => {
		instance.commandOptions.changeLog = true;
		instance.commandOptions.all = true;
		vi.spyOn(instance, 'getPackageChanged').mockResolvedValue({ library: { '^1.0.0': '^1.1.0' } });
		vi.spyOn(instance, 'updatePackageOptions').mockResolvedValue(['shared']);
		const lock = vi.spyOn(instance, 'updateLock').mockResolvedValue();
		const test = vi.spyOn(instance, 'test').mockResolvedValue();
		const commit = vi.spyOn(instance, 'commit').mockResolvedValue();
		const push = vi.spyOn(instance, 'push').mockResolvedValue();
		await instance.process();
		expect(commit).toHaveBeenCalledWith('chore(*): deps updated \n\nlibrary: ^1.0.0 -> ^1.1.0\n');
		expect(lock.mock.invocationCallOrder[0]).toBeLessThan(test.mock.invocationCallOrder[0]);
		expect(test.mock.invocationCallOrder[0]).toBeLessThan(commit.mock.invocationCallOrder[0]);
		expect(commit.mock.invocationCallOrder[0]).toBeLessThan(push.mock.invocationCallOrder[0]);
	});
});
