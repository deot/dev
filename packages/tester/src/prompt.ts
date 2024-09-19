import { search, confirm } from '@inquirer/prompts';
import { Locals } from '@deot/dev-shared';

const ALL_PACKAGE = 'All Packages';

export const getOptions = async () => {
	const isDev = process.env.NODE_ENV === 'development';

	const { packageFolderNames, subpackagesMap } = Locals.impl();
	const packages$ = [ALL_PACKAGE, ...packageFolderNames] as string[];
	const packageFolderName = await search({
		message: `Select Package To ${isDev ? 'Develop' : 'Test'}:`,
		source: (term) => {
			const input = typeof term === 'undefined' ? 'cli' : term;
			return new Promise((($resolve) => {
				const filter = input
					? packages$.filter(item => item.includes(input))
					: packages$;

				$resolve(filter);
			}));
		}
	});
	let subpackageFolderName = '';
	let watch = false;

	if (subpackagesMap[packageFolderName as string]?.length) {
		subpackageFolderName = await search({
			message: `Select Subpackage To ${isDev ? 'Develop' : 'Test'}:`,
			source: (term) => {
				const input = typeof term === 'undefined' ? '' : term;
				const subpackages = [ALL_PACKAGE, ...subpackagesMap[packageFolderName as string]];
				return new Promise<string[]>((($resolve) => {
					const filter = input
						? subpackages.filter(item => item.includes(input))
						: subpackages;
					$resolve(filter);
				}));
			}
		});
	}
	if (!isDev) {
		watch = await confirm({
			message: 'Watch Mode?',
			default: packageFolderName !== ALL_PACKAGE
		});
	}

	const coverage = await confirm({
		message: 'Coverage Analyze?',
		default: true
	});

	return {
		packageFolderName: packageFolderName == ALL_PACKAGE ? undefined : packageFolderName,
		subpackageFolderName: subpackageFolderName == ALL_PACKAGE ? undefined : subpackageFolderName,
		watch: watch || isDev,
		coverage

	};
};
