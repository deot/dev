# @deot/dev-builder

打包

- 优先执行`scripts`下的`build`和`build:types`，如果声明`build`，打包由用户管理，`build:types`，类型编译由用户管理


## 其它

- 目前依赖`rollup`打包，后续考虑读取`rollup.config.js`
- 如果改成`vite`打包，则考虑读取配置`vite.config.js`

打包输出文件`index.[format].js` + `index.d.ts`