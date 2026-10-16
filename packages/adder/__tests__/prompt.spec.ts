import { input, select, search } from '@inquirer/prompts';
import { getOptions } from '../src/prompt';

vi.mock('@inquirer/prompts', async original => ({
	...await original<typeof import('@inquirer/prompts')>(), input: vi.fn(), select: vi.fn(), search: vi.fn()
}));

describe('add prompts', () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it('validates new package names and derives the full package name', async () => {
		vi.mocked(select).mockResolvedValueOnce('package');
		vi.mocked(input).mockResolvedValueOnce('fresh-package');
		await expect(getOptions()).resolves.toEqual({
			mode: 'package', packageName: '@deot/dev-fresh-package', packageFolderName: 'fresh-package', dependentName: '', args: ['']
		});
		const { validate } = vi.mocked(input).mock.calls[0][0] as any;
		expect(validate('')).toBe('请输入需要添加的包名');
		expect(validate('shared')).toBe('包名已存在');
		expect(validate('dev')).toBe('包名已存在');
		expect(validate('fresh-package')).toBe(true);
		expect(search).not.toHaveBeenCalled();
	});

	it('filters dependency targets and preserves the selected installation mode', async () => {
		vi.mocked(select).mockResolvedValueOnce('dependent').mockResolvedValueOnce('-D');
		vi.mocked(search).mockResolvedValueOnce('shared');
		vi.mocked(input).mockResolvedValueOnce('some-library');
		await expect(getOptions()).resolves.toEqual({
			mode: 'dependent', packageName: '@deot/dev-shared', packageFolderName: 'shared', dependentName: 'some-library', args: ['-D']
		});
		const { source } = vi.mocked(search).mock.calls[0][0] as any;
		await expect(source(undefined)).resolves.toEqual(['index']);
		await expect(source('shared')).resolves.toEqual(['shared']);
		await expect(source('missing-package')).resolves.toEqual([]);
		const { validate } = vi.mocked(input).mock.calls[0][0] as any;
		expect(validate('')).toBe('请输入需要添加的模块名');
		expect(validate('some-library')).toBe(true);
	});
});
