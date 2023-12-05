import semver from 'semver';
import type { Update } from './update';

export const fitVersion = (versions: string[], version: string, commandOptions?: Update['commandOptions']) => {
	let vRegex = /([\d]+\.[\d]+\..*)/;
	if (!(vRegex.test(version))) return version;
	const { major = false, minor = false, patch = false } = commandOptions || {};

	// 原来的标识会继承
	let originalPrefix = (version.match(/([^\d]*).*/) || ['', ''])[1];

	let prefix = major 
		? '>=' 
		: minor
			? '^'
			: patch 
				? '~'
				: originalPrefix;
	let oldVersion = version.match(vRegex)![1];
	let vailds = versions.slice(versions.indexOf(oldVersion) + 1);
	let newVersion = semver.maxSatisfying(vailds, prefix + oldVersion) || oldVersion;

	return `${originalPrefix}${newVersion}`;
};