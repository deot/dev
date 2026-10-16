import { search, confirm } from '@inquirer/prompts';
import { Locals } from '@deot/dev-shared';
import { getOptions } from '../src/prompt';

vi.mock('@inquirer/prompts', () => ({ search: vi.fn(), confirm: vi.fn() }));

describe('test selection prompts', () => {
	const locals = Locals.impl();

	beforeEach(() => {
		vi.stubEnv('NODE_ENV', 'TEST');
		vi.spyOn(Locals, 'impl').mockReturnValue({
			...locals, packageFolderNames: ['cli', 'components'], subpackagesMap: { components: ['button', 'input'] }
		});
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.unstubAllEnvs();
	});

	it('all packages removes the folder selection and defaults watch off', async () => {
		vi.mocked(search).mockResolvedValueOnce('All Packages');
		vi.mocked(confirm).mockResolvedValueOnce(false).mockResolvedValueOnce(true);
		await expect(getOptions()).resolves.toEqual({ packageFolderName: undefined, subpackageFolderName: '', watch: false, coverage: true });
		expect(confirm).toHaveBeenNthCalledWith(1, { message: 'Watch Mode?', default: false });
		const { source } = vi.mocked(search).mock.calls[0][0] as any;
		await expect(source(undefined)).resolves.toEqual(['cli']);
		await expect(source('')).resolves.toEqual(['All Packages', 'cli', 'components']);
		await expect(source('missing')).resolves.toEqual([]);
	});

	it('selects a subpackage and offers filtered subpackage choices', async () => {
		vi.mocked(search).mockResolvedValueOnce('components').mockResolvedValueOnce('button');
		vi.mocked(confirm).mockResolvedValueOnce(true).mockResolvedValueOnce(false);
		await expect(getOptions()).resolves.toEqual({
			packageFolderName: 'components', subpackageFolderName: 'button', watch: true, coverage: false
		});
		const { source } = vi.mocked(search).mock.calls[1][0] as any;
		await expect(source(undefined)).resolves.toEqual(['All Packages', 'button', 'input']);
		await expect(source('but')).resolves.toEqual(['button']);
	});

	it('development always watches, skips the watch question and normalizes all subpackages', async () => {
		vi.stubEnv('NODE_ENV', 'development');
		vi.mocked(search).mockResolvedValueOnce('components').mockResolvedValueOnce('All Packages');
		vi.mocked(confirm).mockResolvedValueOnce(true);
		await expect(getOptions()).resolves.toEqual({
			packageFolderName: 'components', subpackageFolderName: undefined, watch: true, coverage: true
		});
		expect(confirm).toHaveBeenCalledExactlyOnceWith({ message: 'Coverage Analyze?', default: true });
	});
});
