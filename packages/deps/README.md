# @deot/dev-deps

集中安装 `@deot/dev` 工具链共用的开发依赖，减少业务仓库直接维护的依赖数量。

## 安装

通常随 `@deot/dev` 安装；也可以单独使用：

```bash
pnpm add -D @deot/dev-deps
```

当前包含：

- TypeScript、TSX 与 Node/ESLint 类型。
- ESLint、Stylelint。
- Husky、lint-staged。

该包没有 JavaScript 运行时入口，仅通过 dependencies 提供工具。项目使用 pnpm 时需要确保这些依赖可以被配置文件解析；本仓库采用 `shamefullyHoist: true`。
