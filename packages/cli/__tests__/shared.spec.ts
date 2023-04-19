import { Shared } from '../src/shared';

describe('shared.ts', () => {
	it('command', () => {
		expect(Shared.getPackageName('index')).toBe('@deot/dev');
		expect(Shared.getPackageName('shared')).toBe('@deot/dev-shared');
		expect(Shared.getPackageFolderName('@deot/dev-shared')).toBe('shared');
		expect(Shared.getPackageFolderName('@deot/dev')).toBe('index');
	});
});
