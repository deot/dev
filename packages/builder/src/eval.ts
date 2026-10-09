import * as path from 'node:path';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { gzipSync } from 'node:zlib';
import fs from 'fs-extra';
import chalk from 'chalk';
import { Logger } from '@deot/dev-shared';
import { build, minifySync, parseSync, Visitor } from 'vite';
import type { ESTree, Rolldown } from 'vite';

interface Context {
	enabled: boolean;
	format: string;
	filepath: string;
	outDir: string;
}

interface Edit {
	start: number;
	end: number;
	code: string;
}

interface Analysis {
	code: string;
	program: ESTree.Program;
	names: Set<string>;
	writes: Set<string>;
	dependencies: string[];
	dynamicImports: ESTree.ImportExpression[];
	unknownDependency: string;
	reason: string;
}

const require$ = createRequire(import.meta.url);
const decoders = new Map<string, Promise<string>>();
const bytes = (source: string | Uint8Array) => typeof source === 'string' ? Buffer.byteLength(source) : source.length;
const skip = (file: string, reason: string) => Logger.info(`${chalk.cyan('eval:')} ${chalk.magenta(file)} ${chalk.yellow(`skipped (${reason})`)}`);
const reportSize = (file: string, original: number, packed: number) => {
	const difference = packed - original;
	const message = difference > 0 ? '体积增加，按用户选择仍生成' : difference < 0 ? '体积减少' : '体积不变';
	const color = difference > 0 ? chalk.yellow : difference < 0 ? chalk.green : chalk.gray;
	Logger.info(`${chalk.cyan('eval:')} ${chalk.magenta(file)} ${chalk.blue(`${original} → ${packed} bytes`)} `
		+ color(`(${difference > 0 ? '+' : ''}${difference} bytes; ${message})`));
};

const editCode = (code: string, edits: Edit[]) => edits
	.sort((a, b) => b.start - a.start)
	.reduce((result, edit) => result.slice(0, edit.start) + edit.code + result.slice(edit.end), code);

const minifyCode = (filename: string, code: string, format: string) => {
	const result = minifySync(filename, code, {
		module: format === 'es',
		compress: true,
		mangle: true,
		codegen: { removeWhitespace: true, legalComments: 'none' }
	});
	if (result.errors.length) throw new Error(`eval: cannot minify ${filename}: ${result.errors.map(i => i.message).join('\n')}`);
	return result.code;
};

const bindingNames = (node: ESTree.Node): string[] => {
	switch (node.type) {
		case 'Identifier': return [node.name];
		case 'RestElement': return bindingNames(node.argument);
		case 'AssignmentPattern': return bindingNames(node.left);
		case 'ArrayPattern': return node.elements.flatMap(item => item ? bindingNames(item) : []);
		case 'ObjectPattern': return node.properties.flatMap(item => bindingNames(item.type === 'RestElement' ? item.argument : item.value));
		case 'VariableDeclaration': return node.declarations.flatMap(item => bindingNames(item.id));
		default: return [];
	}
};

const analyze = (filename: string, source: string, format: string): Analysis => {
	const sourceType = format === 'es' ? 'module' : 'script';
	let parsed = parseSync(filename, source, { sourceType });
	if (parsed.errors.length) throw new Error(`eval: cannot parse ${filename}: ${parsed.errors.map(i => i.message).join('\n')}`);
	const mappingComments = parsed.comments.filter(i => /^\s*[#@]\s*sourceMappingURL=/u.test(i.value));
	const code = editCode(source, mappingComments.map(i => ({ start: i.start, end: i.end, code: '' })));
	if (mappingComments.length) parsed = parseSync(filename, code, { sourceType });
	const result: Analysis = {
		code,
		program: parsed.program,
		names: new Set(),
		writes: new Set(),
		dependencies: [],
		dynamicImports: [],
		unknownDependency: '',
		reason: parsed.program.hashbang ? 'hashbang' : ''
	};
	interface Scope {
		parent?: Scope;
		functionScope: boolean;
		names: Set<string>;
	}
	let scope: Scope = { functionScope: true, names: new Set() };
	let functionDepth = 0;
	let directEval = false;
	const switchScopes: boolean[] = [];
	const pendingWrites: Array<{ scope: Scope; names: string[] }> = [];
	const enterScope = (functionScope = false, names: string[] = []) => {
		scope = { parent: scope, functionScope, names: new Set(names) };
	};
	const leaveScope = () => { scope = scope.parent!; };
	const enterFunction = (node: ESTree.Function | ESTree.ArrowFunctionExpression) => {
		if (node.type === 'FunctionDeclaration' && node.id) scope.names.add(node.id.name);
		const names = node.params.flatMap(bindingNames);
		if (node.type === 'FunctionExpression' && node.id) names.push(node.id.name);
		enterScope(true, names);
		functionDepth++;
	};
	const leaveFunction = () => { leaveScope(); functionDepth--; };
	const enterClass = (node: ESTree.Class) => {
		if (node.type === 'ClassDeclaration' && node.id) scope.names.add(node.id.name);
		enterScope(false, node.id ? [node.id.name] : []);
	};
	const addWrites = (node: ESTree.Node) => pendingWrites.push({ scope, names: bindingNames(node) });
	new Visitor({
		'Identifier': (node) => { result.names.add(node.name); },
		'FunctionDeclaration': enterFunction,
		'FunctionDeclaration:exit': leaveFunction,
		'FunctionExpression': enterFunction,
		'FunctionExpression:exit': leaveFunction,
		'ArrowFunctionExpression': enterFunction,
		'ArrowFunctionExpression:exit': leaveFunction,
		'BlockStatement': () => { enterScope(); },
		'BlockStatement:exit': leaveScope,
		'StaticBlock': () => { enterScope(true); },
		'StaticBlock:exit': leaveScope,
		'ClassDeclaration': enterClass,
		'ClassDeclaration:exit': leaveScope,
		'ClassExpression': enterClass,
		'ClassExpression:exit': leaveScope,
		'CatchClause': (node) => { enterScope(false, node.param ? bindingNames(node.param) : []); },
		'CatchClause:exit': leaveScope,
		'SwitchStatement': () => { switchScopes.push(false); },
		'SwitchCase': () => {
			// The discriminant runs before the case block's lexical scope exists.
			if (!switchScopes[switchScopes.length - 1]) {
				enterScope();
				switchScopes[switchScopes.length - 1] = true;
			}
		},
		'SwitchStatement:exit': () => { if (switchScopes.pop()) leaveScope(); },
		'ForStatement': () => { enterScope(); },
		'ForStatement:exit': leaveScope,
		'VariableDeclaration': (node) => {
			let bindingScope = scope;
			if (node.kind === 'var') while (!bindingScope.functionScope) bindingScope = bindingScope.parent!;
			bindingNames(node).forEach(name => bindingScope.names.add(name));
		},
		'AssignmentExpression': (node) => { addWrites(node.left); },
		'UpdateExpression': (node) => { addWrites(node.argument); },
		'ForInStatement': (node) => { enterScope(); addWrites(node.left); },
		'ForInStatement:exit': leaveScope,
		'ForOfStatement': (node) => {
			enterScope();
			addWrites(node.left);
			if (node.await && !functionDepth) result.reason = 'top-level await';
		},
		'ForOfStatement:exit': leaveScope,
		'AwaitExpression': () => { if (!functionDepth) result.reason = 'top-level await'; },
		'MetaProperty': (node) => { if (node.meta.name === 'import') result.reason = 'import.meta'; },
		'CallExpression': (node) => {
			if (node.callee.type !== 'Identifier') return;
			if (node.callee.name === 'eval') { directEval = true; result.reason = 'direct eval'; }
			if (node.callee.name === 'require') result.unknownDependency = 'require()';
		},
		'ImportExpression': (node) => {
			if (node.source.type === 'Literal' && typeof node.source.value === 'string') result.dependencies.push(node.source.value);
			else result.dynamicImports.push(node);
		}
	}).visit(parsed.program);
	if (directEval && result.dynamicImports.length) result.unknownDependency = 'direct eval with dynamic import';
	pendingWrites.forEach((write) => {
		write.names.forEach((name) => {
			let bindingScope = write.scope;
			while (bindingScope.parent && !bindingScope.names.has(name)) bindingScope = bindingScope.parent;
			if (!bindingScope.parent) result.writes.add(name);
		});
	});
	parsed.program.body.forEach((node) => {
		if (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration' || node.type === 'ExportNamedDeclaration') {
			if (node.source) result.dependencies.push(node.source.value);
		}
	});
	if (format !== 'es') {
		for (const node of parsed.program.body) {
			if (node.type !== 'ExpressionStatement' || node.expression.type !== 'Literal' || typeof node.expression.value !== 'string') break;
			if (node.expression.value === 'use strict') result.reason = 'top-level strict mode';
		}
	}
	return result;
};

const findCycles = (graph: Map<string, string[]>) => {
	const cycles = new Set<string>();
	const visited = new Set<string>();
	const stack: string[] = [];
	const visit = (file: string) => {
		const index = stack.indexOf(file);
		if (index >= 0) {
			stack.slice(index).forEach(i => cycles.add(i));
			return;
		}
		if (visited.has(file)) return;
		stack.push(file);
		graph.get(file)!.forEach(visit);
		stack.pop();
		visited.add(file);
	};
	graph.forEach((_dependencies, file) => visit(file));
	return cycles;
};

const decoder = (format: string): Promise<string> => {
	const decoderFormat = format === 'es' ? 'es' : 'iife';
	if (!decoders.has(decoderFormat)) {
		decoders.set(decoderFormat, (async () => {
			const entry = '/__builder_eval_decoder__.js';
			const result = await build({
				configFile: false,
				logLevel: 'silent',
				plugins: [{
					name: 'builder-eval-decoder',
					enforce: 'pre',
					resolveId: id => id === entry ? '\0builder-eval-decoder' : null,
					load: id => id === '\0builder-eval-decoder'
						? `import { gunzipSync, strFromU8 } from ${JSON.stringify(require$.resolve('fflate/browser'))};
export function decode(payload) {
	const binary = atob(payload);
	const data = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
	return strFromU8(gunzipSync(data));
}
${decoderFormat === 'es'
				? `export function createImportResolver(referrer, filename, files) {
	const root = new URL('../'.repeat(filename.split('/').length - 1) || './', referrer);
	const originalRoot = new URL('../', root);
	const originalReferrer = new URL(filename, originalRoot);
	const modules = new Map(files.map(file => [new URL(file, originalRoot).href, new URL(file, root).href]));
	return specifier => ({
		toString() {
			const value = \`\${specifier}\`;
			if (!/^(?:\\.{1,2}\\/|\\/|[a-z][a-z\\d+.-]*:)/i.test(value)) return value;
			const resolved = new URL(value, originalReferrer);
			const search = resolved.search;
			const hash = resolved.hash;
			resolved.search = '';
			resolved.hash = '';
			const local = modules.get(resolved.href);
			if (local) resolved.href = local;
			resolved.search = search;
			resolved.hash = hash;
			return resolved.href;
		}
	});
}`
				: ''}`
						: null
				}],
				build: {
					write: false,
					minify: true,
					target: 'es2015',
					lib: { entry, name: '__EvalDecoder', formats: [decoderFormat] },
					rolldownOptions: { output: { minify: true, comments: false } }
				}
			});
			const outputs = Array.isArray(result) ? result : [result];
			const chunk = outputs.flatMap(i => (i as Rolldown.RolldownOutput).output).find(i => i.type === 'chunk')!;
			return minifyCode(chunk.fileName, chunk.code, decoderFormat);
		})());
	}
	return decoders.get(decoderFormat)!;
};

const prepareDynamicImports = (analysis: Analysis, runtimeFile: string, filename: string, files: string[]) => {
	let sequence = 0;
	const [factory, resolver] = [0, 1].map(() => {
		let name: string;
		do { name = `__evalImport${sequence++}`; } while (analysis.names.has(name));
		analysis.names.add(name);
		return name;
	});
	let specifier = path.posix.relative(path.posix.dirname(filename), runtimeFile);
	if (!specifier.startsWith('.')) specifier = `./${specifier}`;
	const edits: Edit[] = [];
	analysis.dynamicImports.forEach(({ source }) => {
		// Insertions also support nested import expressions without overlapping replacements.
		edits.push({ start: source.start, end: source.start, code: `${resolver}(` },
			{ start: source.end, end: source.end, code: ')' });
	});
	const position = analysis.program.hashbang?.end || 0;
	edits.push({
		start: position,
		end: position,
		code: `${position ? '\n' : ''}import{createImportResolver as ${factory}}from${JSON.stringify(specifier)};`
			+ `const ${resolver}=${factory}(import.meta.url,${JSON.stringify(filename)},${JSON.stringify(files)});`
	});
	return { code: editCode(analysis.code, edits), resolver };
};

const packES = (analysis: Analysis, runtimeFile: string, filename: string, resolver = ''): string | null => {
	const { code, program, names, writes } = analysis;
	let sequence = 0;
	// References also reserve names, so undeclared typeof references cannot be captured.
	const unique = () => {
		let name: string;
		do { name = `__eval${sequence++}`; } while (names.has(name));
		names.add(name);
		return name;
	};
	const decodeName = unique();
	const namespace = unique();
	const exports: Array<{ local: string; exported: string }> = [];
	const declarations = new Map<string, number>();
	const edits: Edit[] = [];
	const preamble: string[] = [];
	const declare = (node: ESTree.Node) => {
		const ids = node.type === 'FunctionDeclaration' || node.type === 'ClassDeclaration'
			? node.id ? [node.id.name] : []
			: bindingNames(node);
		ids.forEach(name => declarations.set(name, (declarations.get(name) || 0) + 1));
		return ids;
	};
	for (const node of program.body) {
		if (node.type === 'ImportDeclaration' || node.type === 'ExportAllDeclaration' || (node.type === 'ExportNamedDeclaration' && node.source)
			|| (node.type === 'VariableDeclaration' && node.declarations.length === 1
				&& node.declarations[0].id.type === 'Identifier' && node.declarations[0].id.name === resolver)) {
			preamble.push(code.slice(node.start, node.end));
			edits.push({ start: node.start, end: node.end, code: '' });
		} else if (node.type === 'ExportNamedDeclaration') {
			if (node.declaration) {
				declare(node.declaration).forEach(local => exports.push({ local, exported: local }));
				edits.push({ start: node.start, end: node.declaration.start, code: '' });
			} else {
				node.specifiers.forEach(i => exports.push({
					local: i.local.type === 'Identifier' ? i.local.name : i.local.value,
					exported: i.exported.type === 'Identifier' ? i.exported.name : i.exported.value
				}));
				edits.push({ start: node.start, end: node.end, code: '' });
			}
		} else if (node.type === 'ExportDefaultDeclaration') {
			const declaration = node.declaration;
			if (declaration.type === 'FunctionDeclaration' || declaration.type === 'ClassDeclaration') {
				if (!declaration.id) { analysis.reason = 'anonymous default declaration'; return null; }
				declare(declaration);
				exports.push({ local: declaration.id.name, exported: 'default' });
				edits.push({ start: node.start, end: declaration.start, code: '' });
			} else {
				if (declaration.type === 'ArrowFunctionExpression' || declaration.type === 'FunctionExpression'
					|| declaration.type === 'ClassExpression') {
					analysis.reason = 'anonymous default expression';
					return null;
				}
				const local = unique();
				declarations.set(local, 1);
				exports.push({ local, exported: 'default' });
				edits.push({ start: node.start, end: node.end, code: `const ${local}=${code.slice(declaration.start, declaration.end)};` });
			}
		} else declare(node);
	}
	if (exports.some(i => writes.has(i.local) || declarations.get(i.local) !== 1)) {
		analysis.reason = 'mutable or non-local export';
		return null;
	}
	const fields = exports.map(i => `[${JSON.stringify(i.exported)}]:${i.local}`).join(',');
	const body = `${editCode(code, edits)}\n;({${fields}});`;
	const payload = gzipSync(Buffer.from(body), { level: 9 }).toString('base64');
	let specifier = path.posix.relative(path.posix.dirname(filename), runtimeFile);
	if (!specifier.startsWith('.')) specifier = `./${specifier}`;
	const assignments = exports.map((item) => {
		const local = unique();
		const exported = /^[$_\p{ID_Start}][$_\p{ID_Continue}\u200C\u200D]*$/u.test(item.exported)
			? item.exported
			: JSON.stringify(item.exported);
		return `const ${local}=${namespace}[${JSON.stringify(item.exported)}];export{${local} as ${exported}};`;
	}).join('');
	// Direct eval stays in this module to retain access to its original import bindings.
	return `${preamble.join('\n')}\nimport{decode as ${decodeName}}from${JSON.stringify(specifier)};\n`
		+ `const ${namespace}=(()=>eval(${decodeName}(${JSON.stringify(payload)})))();\n${assignments}\n`;
};

export const run = async (outputs: Rolldown.RolldownOutput[], context: Context) => {
	if (!context.enabled) return;
	const { format, filepath, outDir } = context;
	if (!['es', 'iife', 'umd'].includes(format)) { skip(filepath, `${format} format`); return; }
	for (const output of outputs) {
		const chunks = output.output.filter(i => i.type === 'chunk');
		const analyses = new Map(chunks.map(i => [i.fileName, analyze(i.fileName, i.code, format)]));
		const graph = new Map<string, string[]>();
		let dependencyFailure = '';
		chunks.forEach((chunk) => {
			const analysis = analyses.get(chunk.fileName)!;
			const dependencies: string[] = [];
			if (analysis.unknownDependency) dependencyFailure ||= `${chunk.fileName} -> ${analysis.unknownDependency}`;
			analysis.dependencies.forEach((id) => {
				if (/^(?:https?:\/\/|data:|blob:)/u.test(id)) return;
				const file = path.posix.normalize(path.posix.join(path.posix.dirname(chunk.fileName), id));
				if (!/^\.\.?\//u.test(id) || !analyses.has(file)) dependencyFailure ||= `${chunk.fileName} -> ${id}`;
				else dependencies.push(file);
			});
			// Emitted specifiers are authoritative; output metadata may use resolved external IDs.
			graph.set(chunk.fileName, dependencies);
		});
		if (dependencyFailure) { skip(filepath, `unverifiable module dependencies: ${dependencyFailure}`); continue; }
		const cycles = findCycles(graph);
		const candidate = new Map<string, string | Uint8Array>();
		let originalSize = 0;
		output.output.forEach((item) => {
			if (item.fileName.endsWith('.map')) return;
			const file = item.type === 'asset'
				? filepath.replace(/^(.*)((\..*\.js)|\.cjs|\.ts)/u, `$1.${item.fileName}`)
				: item.fileName;
			const source = item.type === 'chunk' ? analyses.get(item.fileName)!.code : item.source;
			const normalized = typeof source === 'string' && item.type === 'asset' && item.fileName.endsWith('.css')
				? source.replace(/\/\*[#@]\s*sourceMappingURL=[\s\S]*?\*\/\s*$/u, '')
				: source;
			candidate.set(file, item.type === 'chunk' ? minifyCode(file, normalized as string, format) : normalized);
			originalSize += bytes(normalized);
		});
		let runtime: string | undefined;
		let runtimeFile = '';
		let packedCount = 0;
		for (const chunk of chunks) {
			const original = analyses.get(chunk.fileName)!;
			if (cycles.has(chunk.fileName)) original.reason = 'circular dependency';
			if (format !== 'es' && original.dynamicImports.length) original.reason = 'dynamic module path';
			if (original.reason && (format !== 'es' || !original.dynamicImports.length)) { skip(chunk.fileName, original.reason); continue; }
			// Minify the complete ES module so imports and references are renamed together.
			let analysis = analyze(chunk.fileName, candidate.get(chunk.fileName) as string, format);
			runtime ||= await decoder(format);
			runtimeFile ||= `chunks/eval-runtime-${createHash('sha256').update(runtime).digest('hex').slice(0, 12)}.js`;
			if (candidate.has(runtimeFile)) { skip(filepath, 'decoder filename collision'); return; }
			let resolver = '';
			if (format === 'es' && analysis.dynamicImports.length) {
				const prepared = prepareDynamicImports(analysis, runtimeFile, chunk.fileName, [...analyses.keys()]);
				resolver = prepared.resolver;
				candidate.set(chunk.fileName, prepared.code);
				analysis = analyze(chunk.fileName, prepared.code, format);
			}
			if (original.reason) { skip(chunk.fileName, original.reason); continue; }
			const payload = format === 'es' ? '' : gzipSync(Buffer.from(analysis.code), { level: 9 }).toString('base64');
			const packed = format === 'es'
				? packES(analysis, runtimeFile, chunk.fileName, resolver)
				: `(()=>{${runtime}\n(0,eval)(__EvalDecoder.decode(${JSON.stringify(payload)}));})();\n`;
			if (!packed) { skip(chunk.fileName, analysis.reason); continue; }
			candidate.set(chunk.fileName, packed);
			packedCount++;
			reportSize(chunk.fileName, bytes(original.code), bytes(packed));
		}
		if (!packedCount) continue;
		if (format === 'es') candidate.set(runtimeFile, runtime!);
		const packedSize = [...candidate.values()].reduce((sum, source) => sum + bytes(source), 0);
		for (const [file, source] of candidate) await fs.outputFile(path.resolve(outDir, 'eval', file), source);
		reportSize(`${filepath} ${format.toUpperCase()} (${packedCount} chunks, including decoder)`, originalSize, packedSize);
	}
};
