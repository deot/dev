// 第三方不存在d.ts时，用于忽略
declare module 'lodash';
declare module 'inquirer';
declare module 'inquirer-autocomplete-prompt';
declare module 'fs-extra';
declare module 'conventional-commits-parser';

// Global compile-time constants
declare const __VERSION__: string;
declare const __TEST__: string;