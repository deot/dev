import * as os from 'node:os';
import * as path from 'node:path';
import fs from 'fs-extra';
import { Shell, Logger } from '@deot/dev-shared';
import { Release } from '../src/release';

describe('release scenarios', () => {
	let directory: string;
	let instance: Release;
	const commit = (type = 'fix', overrides: Partial<Release['commits'][number]> = {}) => ({
		type, header: `${type}(shared): improve behavior`, hash: '1234567890', effect: false, custom: false, breaking: false, ...overrides
	});

	beforeEach(async () => {
		directory = await fs.mkdtemp(path.join(os.tmpdir(), 'dev-release-test-'));
		await fs.outputJson(path.join(directory, 'package.json'), {
			name: '@deot/dev-shared', version: '1.2.3',
			dependencies: { '@deot/dev-test': '^1.0.0', 'external': '^2.0.0' },
			devDependencies: { '@deot/dev-test': '^1.0.0' }
		});
		instance = new Release({ dir: directory, name: 'shared' }, { dryRun: true, commits: [] } as any);
		vi.spyOn(Logger, 'log').mockImplementation(() => {});
		vi.spyOn(Shell, 'exec').mockResolvedValue({ stdout: '', stderr: '' } as never);
		vi.spyOn(Shell, 'spawn').mockResolvedValue(0 as never);
	});

	afterEach(async () => {
		vi.restoreAllMocks();
		vi.useRealTimers();
		await fs.remove(directory);
	});

	it.each([
		['fix(shared): fix behavior', {}, '1.2.4'],
		['feat(shared): add behavior', { patch: true }, '1.2.4'],
		['fix(shared): change API\n\nBREAKING CHANGE: changed argument', { minor: true }, '1.3.0'],
		['fix(shared): fix behavior', { major: true, minor: true, patch: true }, '2.0.0'],
		['fix(shared): fix behavior', { customVersion: '4.0.0' }, '4.0.0']
	])('selects version for %s with %j', async (message, options, version) => {
		Object.assign(instance.commandOptions, options, { commits: [`${message}\n-hash-\n1234567890`] });
		await expect(instance.process()).resolves.toBe(instance);
		expect(instance.version).toBe(version);
		expect(instance.commits).toHaveLength(1);
	});

	it.each([
		['feat(shared): add behavior', '1.3.0'],
		['fix(shared): change API\n\nBREAKING CHANGE: changed argument', '2.0.0']
	])('automatically selects the release level for %s', async (message, version) => {
		instance.commandOptions.commits = [`${message}\n-hash-\n1234567890`];
		await instance.process();
		expect(instance.commits).toHaveLength(1);
		expect(instance.version).toBe(version);
	});

	it('filters commits by package scope and accepts wildcard and multiple scopes', async () => {
		instance.commandOptions.commits = [
			'fix(shared): local\n-hash-\n1111111',
			'feat(*): all\n-hash-\n2222222',
			'fix(index,shared): joint\n-hash-\n3333333',
			'fix(other): unrelated\n-hash-\n4444444',
			'docs(shared): documentation\n-hash-\n5555555',
			'fix: missing scope\n-hash-\n6666666'
		];
		await instance.process();
		expect(instance.commits.map(item => item.hash)).toEqual(['1111111', '2222222', '3333333']);
		expect(instance.version).toBe('1.3.0');
	});

	it('skip-update excludes a selected package even when valid commits exist', async () => {
		instance.commandOptions.commits = ['feat(shared): change'];
		instance.commandOptions.skipUpdatePackage = '@deot/dev-shared';
		await instance.process();
		expect(instance.commits).toEqual([]);
		expect(instance.changeLog).toBe('');
	});

	it('force-update creates a patch release with a custom changelog when there are no commits', async () => {
		instance.commandOptions.forceUpdatePackage = '*';
		await instance.process();
		expect(instance.version).toBe('1.2.4');
		expect(instance.commits).toEqual([expect.objectContaining({ custom: true, type: 'chore', hash: '' })]);
		expect(instance.changeLog).toContain('### Force Update Package');
		expect(instance.changeLog).toContain('`1.2.3` -> `1.2.4`');
	});

	it('groups breaking, fix, feature and maintenance commits and links references', async () => {
		await instance.updateCommits([
			commit('refactor', { breaking: true }),
			commit('fix', { header: 'fix(shared): resolve (close #12)' }),
			commit('feat', { header: 'feat(shared): feature (#34)' }),
			commit('style')
		]);
		expect(instance.changeLog).toContain('### Breaking Changes');
		expect(instance.changeLog).toContain('### Bugfixes');
		expect(instance.changeLog).toContain('### Features');
		expect(instance.changeLog).toContain('### Updates');
		expect(instance.changeLog).toContain('[close 12](https://github.com/deot/dev/issues/12)');
		expect(instance.changeLog).toContain('[#34](https://github.com/deot/dev/pull/34)');
		expect(instance.changeLog).toContain('[1234567](https://github.com/deot/dev/commit/1234567890)');
		expect(instance.changeLog).not.toContain('(shared):');
	});

	it('deduplicates dependency commits, preserves their scope and replaces force-update placeholders', async () => {
		instance.commits = [commit('chore', { custom: true })];
		const incoming = commit('feat');
		await instance.updateCommits([incoming], '@deot/dev-other');
		await instance.updateCommits([incoming], '@deot/dev-other');
		expect(instance.commits).toEqual([{ ...incoming, effect: true }]);
		expect(instance.changeLog).toContain('feat(shared): improve behavior');
		expect(incoming.effect).toBe(false);
	});

	it('ignores commits already recorded in the changelog', async () => {
		await instance.updateCommits([commit()]);
		await fs.writeFile(path.join(directory, 'CHANGELOG.md'), instance.changeLog);
		instance.commits = [];
		instance.changeLog = '';
		await instance.updateCommits([commit()]);
		expect(instance.commits).toEqual([]);
		expect(instance.changeLog).toBe('');
	});

	it('updates the package version and both internal dependency sections without writing during dry run', async () => {
		instance.commits = [commit()];
		instance.version = '1.3.0';
		instance.packageRelation = ['@deot/dev-test'];
		await instance.updatePackageOptions({ '@deot/dev-test': '^2.0.0', 'unknown': '^9.0.0' });
		expect(instance.packageOptions).toMatchObject({
			version: '1.3.0', dependencies: { '@deot/dev-test': '^2.0.0', 'external': '^2.0.0' },
			devDependencies: { '@deot/dev-test': '^2.0.0' }
		});
		expect((await fs.readJson(path.join(directory, 'package.json'))).version).toBe('1.2.3');
	});

	it('writes a new changelog section once above existing history', async () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2026-10-16T00:00:00Z'));
		instance.commandOptions.dryRun = false;
		instance.commits = [commit()];
		instance.packageOptions.version = '1.2.4';
		instance.changeLog = '### Bugfixes\n\n- fix: repaired';
		await fs.writeFile(path.join(directory, 'CHANGELOG.md'), '# @deot/dev-shared ChangeLog\n\n## v1.2.3\n\nold notes\n');
		await instance.updateChangelog();
		expect(await fs.readFile(path.join(directory, 'CHANGELOG.md'), 'utf8')).toBe(
			'# @deot/dev-shared ChangeLog\n\n## v1.2.4\n\n_2026-10-16_\n\n### Bugfixes\n\n- fix: repaired\n\n## v1.2.3\n\nold notes\n'
		);
	});

	it('does not execute release actions for an unchanged package', async () => {
		Object.assign(instance.commandOptions, { dryRun: false, publish: true, tag: true });
		await instance.test();
		await instance.build();
		await instance.publish();
		await instance.tag();
		await instance.updateChangelog();
		expect(Shell.exec).not.toHaveBeenCalled();
		expect(Shell.spawn).not.toHaveBeenCalled();
		expect(await fs.pathExists(path.join(directory, 'CHANGELOG.md'))).toBe(false);
	});

	it('passes package, coverage, publication and tag arguments to the external commands', async () => {
		instance.commits = [commit()];
		Object.assign(instance.commandOptions, { dryRun: false, coverage: false, publish: true, tag: true });
		await instance.test();
		await instance.build();
		await instance.publish();
		await instance.tag();
		expect(vi.mocked(Shell.exec).mock.calls).toEqual([
			['npm run test -- --package-name @deot/dev-shared --no-coverage'],
			['npm run build -- --package-name @deot/dev-shared']
		]);
		expect(vi.mocked(Shell.spawn).mock.calls).toEqual([
			['npm', ['publish', '--no-git-checks', '--access', 'public'], { cwd: directory }],
			['git', ['tag', '@deot/dev-shared@1.2.3'], { cwd: directory }]
		]);
	});

	it('cleans old tags from oldest to newest, removing each remote tag before its local tag', async () => {
		Object.assign(instance.commandOptions, { dryRun: false, keepLastTag: true });
		vi.mocked(Shell.exec).mockResolvedValue({ stdout: 'shared@3\nshared@2\nshared@1\n', stderr: '' } as never);
		await instance.cleanTagsAndKeepLastTag();
		expect(vi.mocked(Shell.spawn).mock.calls).toEqual([
			['git', ['push', 'origin', '--delete', 'shared@1']], ['git', ['tag', '--delete', 'shared@1']],
			['git', ['push', 'origin', '--delete', 'shared@2']], ['git', ['tag', '--delete', 'shared@2']]
		]);
	});
});
