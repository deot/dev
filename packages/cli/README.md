# @deot/dev-cli

包管理命令行

## `ddc <cmd>`

- `dev`
- `build`
- `link`
- `test`
- `add`
- `update`
- `release`: [与本仓库相同](../../README.md)

## 其他

暂时不支持全局引入，一些配置项，如`tsconfig.json`, `vitest.config.ts` 这些依赖项目本身


## 默认的目录参考（配置后期再考虑）

#### Monorepo

```
Monorepo
├─ .husky
├─ packages
│    ├─ index
│    │    ├─ __tests__
│    │    ├─ src
│    │    │    └─ index.*.ts
│    │    └─ package.json
│    ├─ shared
│    │    ├─ __tests__
│    │    ├─ src
│    │    │    └─ index.*.ts
│    │    └─ package.json            # 如果含build/build:types会跳过执行内部的
│    ├─ components                   # 也支持组件式的设计
│    │    ├─ __tests__
│    │    ├─ button
│    │    │    └─ __tests__
│    │    ├─ table
│    │    │    └─ __tests__
│    │    ├─ icon
│    │    │    └─ __tests__
│    │    ├─ ...
│    │    ├─ index.*.ts
│    │    └─ package.json
│    └─ shims.d.ts
├─ .eslintignore
├─ .eslintrc.cjs
├─ .lintstagedrc.json
├─ .npmrc                            # shamefully-hoist = true
├─ z.*.config.ts                     # 没有这个文件也可以执行
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ tsconfig.json
└─ package.json                      # 引入@deot/dev
```

#### Single Repo

```
Single Repo
├─ .husky
├─ __tests__
├─ src
│   └─ index.*.ts
├─ .eslintignore
├─ .eslintrc.cjs
├─ .npmrc
├─ z.*.config.ts                     # 没有这个文件也可以执行
├─ shims.d.ts
├─ pnpm-lock.yaml
├─ pnpm-workspace.yaml
├─ tsconfig.json
├─ yarn.lock
└─ package.json
```

