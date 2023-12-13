import semver from 'semver';
import type { Update } from './update';

export const fitVersion = (versions: string[], version: string, commandOptions?: Update['commandOptions']) => {
	const vRegex = /([\d]+\.[\d]+\..*)/;
	if (!(vRegex.test(version))) return version;
	const { major = false, minor = false, patch = false } = commandOptions || {};

	// 原来的标识会继承
	const originalPrefix = (version.match(/([^\d]*).*/) || ['', ''])[1];

	const prefix = major
		? '>='
		: minor
			? '^'
			: patch
				? '~'
				: originalPrefix;
	const oldVersion = version.match(vRegex)![1];
	const vailds = versions.slice(versions.indexOf(oldVersion) + 1);
	const newVersion = semver.maxSatisfying(vailds, prefix + oldVersion) || oldVersion;

	return `${originalPrefix}${newVersion}`;
};
