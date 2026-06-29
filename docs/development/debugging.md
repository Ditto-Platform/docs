---
title: 调试技巧
description: Ditto 应用开发调试 — dev 模式、Vite 代理、Cell 调试、DevTools、错误码表、后端 Cell 开发（AppCellModule 接口与完整示例）与权限声明。
---

# 调试技巧

本文档覆盖 Ditto 应用开发与调试的完整方法，包括 dev 模式、Vite 代理、后端 Cell 调试、浏览器 DevTools、常见错误码，以及后端 Cell 开发与权限声明的完整规范。

## 1. 开启 dev 模式

在 kernel 配置中开启 `dev: true`，权限自动授权，避免开发期被阻塞：

```typescript
const kernel = createKernel({
  kernel: { id: 'dev-kernel', dev: true },
});
```

::: tip dev 模式行为
- manifest 声明的权限自动授权（console.warn 提示），不弹交互对话框
- 详细的 IPC 日志会输出到 console
- 适合开发期快速迭代
:::

::: warning 生产环境必须关闭
生产环境务必设置 `dev: false`，否则任何应用都能绕过权限检查。详见 [权限声明 — 权限决策](#权限决策)。
:::

## 2. Vite dev server 代理

`apps/shell/vite.config.ts` 已配置 `/api` 代理到 `http://localhost:3001`，开发时直接访问 `http://localhost:3000`，无需处理 CORS。

```typescript
// apps/shell/vite.config.ts 中的代理配置（节选）
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
});
```

::: tip 自定义代理
如果你的后端服务端运行在其他端口，修改 `target` 即可。开发应用时通过 SDK 的 `useDittoCell` 调用 `/api/cell/{appId}/...`，请求会自动经代理转发到服务端。
:::

## 3. 调试后端 Cell

后端 Cell 在 Bun 环境运行，支持热重载：

```bash
cd server
bun run --watch src/index.ts
```

修改 `backend/index.ts` 后，server 自动重启。前端通过 `useDittoCell.checkBackendHealth()` 检测状态。

::: tip Bun --inspect
需要断点调试时，使用 `bun run --inspect src/index.ts`，然后用 Chrome DevTools attach 到 Bun 进程。
:::

## 4. 查看 Cell 状态

通过 curl 查看 Cell 运行状态：

```bash
# 查看所有 Cell
curl http://localhost:3001/api/health

# 查看特定应用 Cell
curl http://localhost:3001/api/cell/com.ditto.todo/health
```

### 典型响应

```json
// /api/health
{
  "status": "ok",
  "runningCells": ["com_ditto_todo"],
  "hibernatedCells": ["com_ditto_notes"],
  "uptime": 3600
}

// /api/cell/com.ditto.todo/health
{
  "status": "ok",
  "count": 5
}
```

::: tip 状态字段含义
- `runningCells`：当前运行的 Cell
- `hibernatedCells`：冬眠中的 Cell（资源占用低，可被唤醒）
- 调用 `useDittoCell.cellGet()` 会自动唤醒冬眠的 Cell
:::

## 5. 浏览器 DevTools

### iframe 内调试

应用运行在 iframe 沙盒中，调试步骤：

1. 打开 Chrome DevTools（`F12`）
2. 切换到 **Sources** 面板
3. 在左侧或顶部下拉框选择对应 iframe context（通常以应用 ID 命名）
4. 选择 iframe 内的脚本文件
5. 设置断点、查看 console

::: tip 快捷方式
在 DevTools 顶部下拉框中直接选择 iframe context，console 输出也会自动切换到该 context。
:::

### postMessage 监听

在 Console 中执行以下代码，监听所有 IPC 消息：

```javascript
window.addEventListener('message', e => console.log('[IPC]', e.data));
```

::: warning 跨 context 监听
在宿主页面（非 iframe 内）执行此代码可监听所有应用的 IPC 消息。在 iframe 内执行只能监听该应用收到的消息。
:::

### WebSocket 检查

DevTools 的 **Network** 面板筛选 `WS`，可查看：

- WebSocket 连接状态（连接中 / 已连接 / 已关闭）
- 帧数据（Frames 标签页，绿色为接收，红色为发送）
- 心跳包

::: tip 后端 Cell 的 WebSocket
`useDittoCell.connectWebSocket(appId)` 会连接到 `/api/cell/{appId}/realtime`，在 Network 面板可看到该连接。详见 [SDK 参考 — useDittoCell](/development/sdk#usedittocell-后端-cell-通信)。
:::

## 6. 本地测试应用

将应用放入 `server/data/apps/{app_id_with_underscores}/`，例如：

```text
server/data/apps/com_ditto_todo/
├── manifest.json
├── frontend/
│   └── index.html
└── backend/
    └── index.ts
```

服务端会自动扫描并注册。

::: danger 命名规则
应用 ID 中的 `.` 必须替换为 `_` 作为目录名。例如 `com.ditto.todo` → `com_ditto_todo`，`widget.clock` → `widget_clock`。否则服务端扫描时无法正确识别应用。
:::

## 7. 模拟移动端

使用浏览器 DevTools 的设备模拟器，`useDeviceMode` 会自动响应断点变化：

| 屏幕宽度 | 模式 |
|---------|------|
| `< 768px` | `mobile` |
| `768 ~ 1024px` | `tablet` |
| `> 1280px` | `desktop` |

::: tip 移动端调试
DevTools 切换到移动设备模拟（`Ctrl+Shift+M`），应用会自动切换到 mobile 布局。`useDeviceMode` 返回的 ref 会实时更新，可用于响应式逻辑。
:::

## 8. 常见错误

| 错误码 | 含义 | 解决方案 |
|--------|------|---------|
| `CELL_ALREADY_RUNNING` | Cell 已在运行 | 先 `stopCell` 再 `startCell` |
| `CELL_START_FAILED` | 启动失败 | 检查后端模块 import 路径 |
| `PERMISSION_DENIED` | 权限被拒 | 检查 `manifest.permissions` 是否声明 |
| `IPC_REQUEST_TIMEOUT` | IPC 超时 | 检查宿主是否注册了对应 handler |
| `SANDBOX_CREATE_FAILED` | 沙盒创建失败 | 检查 origin 是否提供 |
| `SERVICE_NOT_REGISTERED` | 服务未注册 | 检查 `registerKernelServices` 是否调用 |

### 错误码详解

::: warning CELL_ALREADY_RUNNING
Cell 实例已在运行中，不能重复启动。常见于热重载后旧实例未清理。解决方案：调用 `stopBackend(appId)` 后再 `startBackend(appId)`，或使用 `ensureBackendRunning(appId)`（它会自动处理已运行的情况）。
:::

::: warning CELL_START_FAILED
后端模块加载失败。常见原因：
- `backend.entry` 路径错误（应相对于项目根目录）
- `export default` 缺失（后端模块必须默认导出 `AppCellModule`）
- TypeScript 编译错误（检查 `bun run` 输出）
:::

::: warning PERMISSION_DENIED
应用调用了未声明的权限能力。解决方案：
1. 在 `manifest.permissions` 中声明所需权限
2. 运行时调用 `requestPermission()` 动态请求
3. 确认 dev 模式是否开启（开发期自动授权）
:::

::: warning IPC_REQUEST_TIMEOUT
IPC 请求 10 秒内未收到响应。常见原因：
- 宿主未注册对应 channel 的 handler
- handler 抛出异常未捕获
- 网络或 Cell 启动延迟导致响应超时
:::

## 后端 Cell 开发

dit 类型应用的后端称为 Cell，通过实现 `AppCellModule` 接口开发。

### AppCellModule 接口

源码：`packages/shared/src/types.ts`

```typescript
export interface AppCellModule {
  onInit?(ctx: CellContext): Promise<void>;       // 初始化（加载时）
  onStart?(ctx: CellContext): Promise<void>;      // 启动（每次 wake）
  onStop?(ctx: CellContext): Promise<void>;       // 停止
  onDestroy?(ctx: CellContext): Promise<void>;    // 销毁
  registerRoutes(router: CellRouter): void;      // 注册 HTTP 路由（必填）
  registerWebSocket?(ws: CellWebSocketHandler): void;  // 注册 WS handler
}
```

| 方法 | 必填 | 触发时机 |
|------|------|---------|
| `onInit` | 否 | Cell 首次加载时（一次性） |
| `onStart` | 否 | 每次 wake（包括从冬眠恢复） |
| `onStop` | 否 | 停止运行（进入冬眠或显式 stop） |
| `onDestroy` | 否 | Cell 被销毁（资源释放） |
| `registerRoutes` | 是 | 注册 HTTP 路由 |
| `registerWebSocket` | 否 | 注册 WebSocket handler |

### CellContext 注入

后端 Cell 通过 `CellContext` 访问系统能力：

```typescript
export interface CellContext {
  appId: string;
  cellId: string;
  config: Record<string, unknown>;
  env: Record<string, string>;        // 环境变量
  db: CellDatabase;                    // 数据库（内存）
  storage: CellStorage;                // KV 存储
  ipc: CellIPC;                        // IPC 通信
  logger: CellLogger;                  // 日志
  metrics: CellMetrics;                // 指标
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `appId` | `string` | 应用 ID |
| `cellId` | `string` | Cell 实例 ID |
| `config` | `Record` | manifest 中的配置 |
| `env` | `Record` | 环境变量（含 `backend.env` 注入） |
| `db` | `CellDatabase` | 内存数据库 |
| `storage` | `CellStorage` | KV 存储（持久化） |
| `ipc` | `CellIPC` | IPC 通信（与宿主交互） |
| `logger` | `CellLogger` | 日志（`info` / `warn` / `error`） |
| `metrics` | `CellMetrics` | 指标（`gauge` / `counter` / `timing`） |

::: tip 闭包捕获 ctx
`registerRoutes` 中的 handler 需要通过闭包捕获 `ctx`，因为路由 handler 的参数中不直接包含 ctx。在 `onInit` / `onStart` 中保存 ctx 到模块作用域变量即可。
:::

### registerRoutes

通过 `CellRouter` 注册 HTTP 路由：

```typescript
export interface CellRouter {
  get(path: string, handler: CellRouteHandler): void;
  post(path: string, handler: CellRouteHandler): void;
  put(path: string, handler: CellRouteHandler): void;
  delete(path: string, handler: CellRouteHandler): void;
  ws(path: string, handler: CellWSHandler): void;
  middleware(fn: CellMiddleware): void;
}
```

路由会挂载到 `/api/cell/{appId}` 下，例如 `router.get('/health')` 实际访问 `/api/cell/com.ditto.notes/health`。

::: warning 路由前缀
所有路由自动添加 `/api/cell/{appId}` 前缀，**不要**在 path 中重复写前缀。错误示例：`router.get('/api/cell/com.ditto.notes/health')`，正确示例：`router.get('/health')`。
:::

### 完整后端示例

```typescript
// backend/index.ts
import type { AppCellModule, CellContext, CellRouter, CellRequest, CellResponse } from '@ditto/shared';

interface Note {
  id: string;
  title: string;
  content: string;
  updatedAt: number;
}

const module: AppCellModule = {
  async onInit(ctx: CellContext): Promise<void> {
    ctx.logger.info('Notes backend initializing', { appId: ctx.appId });
    // 初始化存储
    const existing = await ctx.storage.list('notes/');
    ctx.logger.info(`Loaded ${existing.length} notes`);
  },

  async onStart(ctx: CellContext): Promise<void> {
    ctx.logger.info('Notes backend started');
    ctx.metrics.gauge('notes.startup', 1);
  },

  async onStop(ctx: CellContext): Promise<void> {
    ctx.logger.info('Notes backend stopping');
    // 保存状态到 storage
  },

  async onDestroy(ctx: CellContext): Promise<void> {
    ctx.logger.info('Notes backend destroyed');
  },

  registerRoutes(router: CellRouter): void {
    // 健康检查
    router.get('/health', async (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });

    // 获取所有笔记
    router.get('/notes', async (req, res) => {
      const keys = await req.ctx.storage.list('notes/');
      // ... 返回笔记列表
      res.json({ notes: [] });
    });

    // 创建笔记
    router.post('/notes', async (req, res) => {
      const { title, content } = req.body as { title: string; content: string };
      const note: Note = {
        id: crypto.randomUUID(),
        title,
        content,
        updatedAt: Date.now(),
      };
      res.status(201).json(note);
    });

    // 更新笔记
    router.put('/notes/:id', async (req, res) => {
      const id = req.params.id;
      // ... 更新逻辑
      res.json({ id, updated: true });
    });

    // 删除笔记
    router.delete('/notes/:id', async (req, res) => {
      // ... 删除逻辑
      res.status(204);
    });

    // WebSocket 端点
    router.ws('/realtime', (ws, req) => {
      ws.onMessage((data) => {
        // 广播给所有连接
      });
    });
  },
};

export default module;
```

::: warning req.ctx 使用注意
`req.ctx` 是简化示例，实际通过 `CellContext` 注入。后端 Cell 应通过闭包捕获 `ctx`（在 `onInit` 中保存到模块作用域变量），而非依赖 `req.ctx`。
:::

::: tip 完整可运行示例
完整的 `com.ditto.todo` 后端示例（带内存 Map 存储）见 [第三方应用开发 — 编写后端 Cell](/development/third-party#_3-编写后端-cell)。
:::

## 权限声明

在 `manifest.json` 的 `permissions` 字段声明应用所需权限。权限是 capability-based 的细粒度能力。

### 可用权限

| 权限 | 说明 | 参数 |
|------|------|------|
| `fs:read` | 读取文件 | `{ paths: string[] }` |
| `fs:write` | 写入文件 | `{ paths: string[] }` |
| `net:fetch` | 发起网络请求 | `{ origins: string[] }` |
| `net:websocket` | WebSocket 连接 | — |
| `clipboard:read` | 读取剪贴板 | — |
| `clipboard:write` | 写入剪贴板 | — |
| `notification:show` | 显示通知 | — |
| `window:multi` | 多窗口支持 | — |
| `window:fullscreen` | 全屏模式 | — |
| `cell:backend` | 后端 Cell 通信 | — |
| `cell:peer` | 跨用户 Cell 通信 | — |

### 声明示例

```json
{
  "permissions": [
    "fs:read",
    "fs:write",
    "net:fetch",
    "clipboard:write",
    "notification:show",
    "cell:backend"
  ]
}
```

::: tip 权限与 SDK 对应关系
- `fs:read` / `fs:write` → `useDittoFS`（见 [SDK 参考 — useDittoFS](/development/sdk#usedittofs-文件系统)）
- `net:fetch` → `useDittoNet`
- `notification:show` → `useDittoUI.showNotification`
- `cell:backend` → `useDittoCell`
:::

### 权限决策

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| **dev 模式** | manifest 声明即自动授权（console.warn 提示） | 开发期 |
| **生产模式** | 默认拒绝，需要用户交互式授权 | 生产环境 |

::: warning 生产模式权限流程
生产模式下，未声明的权限调用会直接抛 `PERMISSION_DENIED` 错误。已声明但未授权的权限会弹出交互式授权对话框（阶段 2 接入 dialog service 后）。
:::

::: tip 权限持久化
权限决策可通过 `PersistenceStore` 跨会话保留。即用户首次授权后，下次启动应用无需再次确认。
:::

### 运行时请求权限

除 manifest 声明外，可在运行时动态请求：

```typescript
import { useDittoApp } from '@ditto/sdk';

const { requestPermission } = useDittoApp();

const granted = await requestPermission('fs:write');
if (!granted) {
  // 提示用户去设置开启权限
}
```

::: tip requestPermission 适用场景
- 应用首次启动时引导用户授权核心权限
- 用户触发某个需要新权限的操作时按需请求
- 避免在 manifest 中声明过多权限吓到用户（按需请求更友好）
:::

### 权限调试技巧

::: tip 模拟生产权限流程
开发期权限自动授权难以测试拒绝流程。可手动设置 interactive prompt：

```typescript
kernel.permissionManager.setInteractivePrompt(async (perm) => {
  console.log('[Permission Request]', perm);
  return true;  // 或 false 模拟拒绝
});
```
:::

## 调试速查表

| 场景 | 方法 |
|------|------|
| 权限被拒 | 检查 manifest.permissions，或开启 dev 模式 |
| Cell 启动失败 | `bun run --watch` 看编译错误，检查 `backend.entry` 路径 |
| Cell 已在运行 | `stopBackend()` 后再 `startBackend()`，或用 `ensureBackendRunning()` |
| IPC 不响应 | Console 监听 `window.message`，检查宿主是否注册 handler |
| WebSocket 不通 | Network 面板筛 WS，检查 `/api/cell/{appId}/realtime` 连接 |
| 前端加载空白 | 检查 `manifest.entry` 路径与 origin 设置 |
| CORS 报错 | 用 Vite 代理 `/api`，不要直连后端 |
| 移动端布局错乱 | DevTools 设备模拟器，检查 `useDeviceMode` 断点 |

## 相关文档

- [开发指南](/development/)
- [第三方应用开发](/development/third-party)
- [SDK 参考](/development/sdk)
- [CLI 脚手架](/development/cli)
- [核心概念 — Cell 沙盒](/concepts/cell)
- [核心概念 — IPC 通信](/concepts/ipc)
- [核心概念 — 权限系统](/concepts/permission)
- [核心概念 — 生命周期](/concepts/lifecycle)
