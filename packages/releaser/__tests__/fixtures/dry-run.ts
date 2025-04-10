import * as Release from '../../src';

Release.run({
	dryRun: true,
	coverage: true,
	tag: false,
	commit: false,
	publish: false,
	push: false,
	keepLastTag: false,

	// fake
	commits: [
		`feat(*): all changed by *`,
		`fix(index): ci tag (#2)`,
		`fix(shared): error (close #1)`,
		`refactor(index): remove deprecated`,
		`style(index,shared): mutiple changed`,
		`chore(builder,cli,deps,dever,eslint): deps updated`
	].map((i, index) => {
		return i += `\n\n-hash-\n${String(index).repeat(5)}`;
	})
});
