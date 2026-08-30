# @deot/dev-test

为工具链测试提供可交互子进程、Puppeteer 页面操作、异步中断器和测试服务器辅助。

## 导出

| 导出 | 说明 |
| --- | --- |
| `Command` | 启动并控制需要键盘交互的子进程。 |
| `Launch` | 创建和复用 Puppeteer Browser、Page。 |
| `Operater` | 对 Puppeteer Page 的常用 DOM 操作封装。 |
| `Interrupter` | 可由外部信号继续或结束的 thenable。 |
| `E2E` | Vitest 生命周期与 Puppeteer 组合。 |
| `Server` | 查找本机 Host 和可用端口。 |
| `Utils` | 轮询断言、延时和属性定义辅助。 |

## `Command`

```ts
import { Command } from '@deot/dev-test';

const command = new Command('npm', ['run', 'test']);
await command.press('ENTER');
const result = await command.stop();
const { stdout, stderr, code } = result;
```

| 方法 | 说明 |
| --- | --- |
| `press(key, timeout = 200)` | 写入普通文本或 `UP`、`DOWN`、`ENTER`、`SPACE`。 |
| `stop()` | 等待当前输出调度点，关闭 stdin，并返回最终结果。 |
| `start(command, args)` | 启动子进程；构造函数会自动调用。 |

实例本身通过 `target` 暴露最终 Promise，并记录 `stdout`、`stderr`、`code`、`error` 和 `isClose`。

## `Launch` 与 `Operater`

```ts
import { Launch } from '@deot/dev-test';

const launch = new Launch();
await launch.createPage();
await launch.page.goto('http://localhost:5173');
await launch.operater.click('button');
```

`createBrowser(force?)` 和 `createPage(force?)` 默认复用实例；传 `true` 时关闭并重建已有对象。CI 环境会添加 Puppeteer sandbox 兼容参数。

`Operater` 提供 `click`、`count`、`text`、`value`、`html`、`classList`、`children`、`isVisible`、`isChecked`、`isFocused`、`setValue`、`typeValue`、`enterValue`、`clearValue`、`sleep` 和 `nextFrame`。

## `Interrupter`

```ts
import { Interrupter } from '@deot/dev-test';

const ready = new Interrupter<string>();
queueMicrotask(() => ready.next('ok'));
const value = await ready;
ready.finish();
```

| 方法 | 说明 |
| --- | --- |
| `next(value?)` | 解决当前等待，并为下一次信号建立新任务。 |
| `nextWithError(error?)` | 拒绝当前等待，并建立新任务。 |
| `finish(value?)` / `finishWithError(error?)` | 永久结束并返回当前实例。 |
| `then` / `catch` / `finally` | 使实例可直接 await。 |

## `E2E`、`Server` 与 `Utils`

```ts
import { E2E, Server, Utils } from '@deot/dev-test';

const launch = E2E.impl();
const { baseUrl } = await Server.available();
await Utils.expectByPolling(() => launch.page.url(), baseUrl, { to: 'toMatch' });
```

- `E2E.impl()` 为 Vitest 注册 Browser/Page 的 before/after 生命周期，默认超时常量为 `E2E.TIME_OUT`（60 秒）。
- `Server.host(force?)` 获取外部 IPv4，`Server.port(host?, start = 1024)` 查找可用端口，`Server.available()` 返回 `{ host, port, baseUrl }`。
- `Utils.sleep(ms)` 延时；`expectByPolling` 默认最多 30 次、间隔 50ms；`def` 用可写、可配置且默认不可枚举的描述符定义属性。
