// 第三方不存在d.ts时，用于忽略
declare module 'lodash';
declare module 'inquirer';
declare module 'eslint';
declare module 'inquirer-autocomplete-prompt';
declare module 'fs-extra';
declare module 'conventional-commits-parser';

declare module 'postcss-url';
declare module 'postcss-import';
declare module 'postcss-flexbugs-fixes';
declare module 'conventional-commits-parser';
declare module 'stylelint';

declare module '*.scss';

// Global compile-time constants
declare const __VERSION__: string;
declare const __TEST__: string;