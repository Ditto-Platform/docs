---
title: SDK 参考
description: Ditto SDK 的 9 个 Vue 3 composable 完整 API 参考 — IPC、窗口、文件系统、网络、认证、UI、Widget、应用生命周期与后端 Cell 通信。
---

# SDK 参考

Ditto SDK 提供 9 个 Vue 3 composable，通过 `DittoSDK` plugin 注入到应用，覆盖 IPC 通信、窗口控制、文件系统、网络请求、认证、UI 通知、小组件、应用生命周期与后端 Cell 通信等场景。

## 安装与初始化

### 安装

```bash
pnpm add @ditto/sdk
# 或
npm install @ditto/sdk
```

### 初始化

在你的应用入口（如 `frontend/index.html` 或 Vue `main.ts`）注册 plugin：

```typescript
import { createApp } from 'vue';
import { DittoSDK } from '@ditto/sdk';

const app = createApp(App);
app.use(DittoSDK);
app.mount('#app');
```

::: tip 直接 inject
如果不想用 plugin 形式，也可以直接 `inject` 对应的 key：

```typescript
import { inject } from 'vue';
import { DittoWindowKey, useDittoWindow } from '@ditto/sdk';

const windowApi = inject(DittoWindowKey) ?? useDittoWindow();
```
:::

## useDittoIPC — IPC 通信

源码：`packages/sdk/src/ipc-api.ts`

最基础的 IPC composable，其他 composable 都基于它。通过 `window.postMessage` 与宿主通信。

```typescript
import { useDittoIPC } from '@ditto/sdk';

const { send, request, onMessage } = useDittoIPC();

// 发送事件（无需响应）
send('app:ready', { id: 'com.my.app' });

// 发送请求（等待响应，默认 10s 超时）
const result = await request<{ status: string }>('system:status');
console.log(result.status);

// 监听消息
const unsubscribe = onMessage('app:lifecycle', (channel, payload) => {
  console.log('收到', channel, payload);
});

// 组件卸载时自动清理（onUnmounted 内置）
```

### API 签名

| 方法 | 签名 | 说明 |
|------|------|------|
| `send` | `(channel: string, payload?: unknown, target?: string) => void` | 发送事件消息 |
| `request` | `<T>(channel: string, payload?: unknown, timeout?: number) => Promise<T>` | 发送请求并等待响应 |
| `onMessage` | `(channel: string, handler: (channel, payload) => void) => () => void` | 监听消息，返回 unsubscribe |

::: tip request 超时
`request` 默认超时 10 秒。可通过第三个参数自定义：`request('channel', payload, 30000)` 设置为 30 秒。
:::

## useDittoWindow — 窗口控制

源码：`packages/sdk/src/window-api.ts`

控制应用窗口行为。

```typescript
import { useDittoWindow } from '@ditto/sdk';

const { setTitle, close, minimize, maximize, restore, setIcon } = useDittoWindow();

// 修改窗口标题
setTitle('我的笔记 - 编辑中');

// 修改图标
setIcon('📝');

// 用户点击退出按钮时
function onExit() {
  close();
}
```

### API 签名

| 方法 | 签名 | 说明 |
|------|------|------|
| `setTitle` | `(title: string) => void` | 设置窗口标题 |
| `close` | `() => void` | 关闭窗口 |
| `minimize` | `() => void` | 最小化 |
| `maximize` | `() => void` | 最大化 |
| `restore` | `() => void` | 还原 |
| `setIcon` | `(icon: string) => void` | 设置图标 |

## useDittoFS — 文件系统

源码：`packages/sdk/src/fs-api.ts`

通过 VFS（IndexedDB / OPFS）读写文件，需要 `fs:read` / `fs:write` 权限。

```typescript
import { useDittoFS } from '@ditto/sdk';

const { readFile, readText, writeFile, writeText, listDir, deleteFile, mkdir, stat, rename, exists } = useDittoFS();

// 读取文本
const content = await readText('/my-app/notes/hello.md');

// 写入文本
await writeText('/my-app/notes/hello.md', '# Hello Ditto');

// 读取二进制
const buffer = await readFile('/my-app/images/avatar.png');

// 列目录
const entries = await listDir('/my-app/notes');
console.log(entries);  // ['hello.md', 'todo.md']

// 检查文件是否存在
const hasConfig = await exists('/my-app/config.json');

// 创建目录
await mkdir('/my-app/cache');

// 重命名
await rename('/my-app/old-name.md', '/my-app/new-name.md');

// 获取文件信息
const info = await stat('/my-app/notes/hello.md');
console.log(info.size, info.modified, info.type);

// 删除文件
await deleteFile('/my-app/cache/temp.tmp');
```

### API 签名

| 方法 | 签名 | 说明 |
|------|------|------|
| `readFile` | `(path: string) => Promise<ArrayBuffer>` | 读取二进制 |
| `readText` | `(path: string) => Promise<string>` | 读取文本 |
| `writeFile` | `(path: string, data: ArrayBuffer) => Promise<void>` | 写入二进制 |
| `writeText` | `(path: string, text: string) => Promise<void>` | 写入文本 |
| `listDir` | `(path: string) => Promise<string[]>` | 列出目录 |
| `deleteFile` | `(path: string) => Promise<void>` | 删除文件 |
| `mkdir` | `(path: string) => Promise<void>` | 创建目录 |
| `stat` | `(path: string) => Promise<{size, modified, type}>` | 获取信息 |
| `rename` | `(oldPath: string, newPath: string) => Promise<void>` | 重命名/移动 |
| `exists` | `(path: string) => Promise<boolean>` | 检查存在 |

::: warning 权限要求
- `readFile` / `readText` / `listDir` / `stat` / `exists` 需要 `fs:read` 权限
- `writeFile` / `writeText` / `deleteFile` / `mkdir` / `rename` 需要 `fs:write` 权限

权限声明详见 [调试技巧 — 权限声明](/development/debugging#权限声明)。
:::

## useDittoNet — 网络请求

源码：`packages/sdk/src/net-api.ts`

通过宿主代理发起网络请求（绕过 CORS），需要 `net:fetch` 权限。

```typescript
import { useDittoNet } from '@ditto/sdk';

const { fetch, getText, getJSON, getBlob, loading, error } = useDittoNet();

// 发起请求
const response = await fetch('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ key: 'value' }),
});
const data = await response.json();

// 简便方法
const text = await getText('https://example.com/robots.txt');
const json = await getJSON<{ items: any[] }>('https://api.example.com/list');
const blob = await getBlob('https://example.com/image.png');

// 响应式状态
console.log(loading.value);  // true/false
console.log(error.value);    // Error | null
```

### API 签名

| 方法/属性 | 签名 | 说明 |
|----------|------|------|
| `fetch` | `(url: string, options?: RequestInit) => Promise<Response>` | 标准 fetch 封装 |
| `getText` | `(url: string) => Promise<string>` | 获取文本 |
| `getJSON` | `<T>(url: string) => Promise<T>` | 获取 JSON |
| `getBlob` | `(url: string) => Promise<Blob>` | 获取 Blob |
| `loading` | `Ref<boolean>` | 加载状态 |
| `error` | `Ref<Error | null>` | 错误状态 |

::: tip 绕过 CORS
`useDittoNet` 通过宿主代理发起请求，因此不受浏览器同源策略限制。但 `manifest.json` 必须声明 `net:fetch` 权限，且可通过 `permissions` 参数限制可访问的 origins。
:::

## useDittoAuth — 认证

源码：`packages/sdk/src/auth-api.ts`

集成 Ditto 账户系统。

```typescript
import { useDittoAuth } from '@ditto/sdk';

const { isAuthenticated, user, login, register, logout, me } = useDittoAuth();

// 登录
await login('alice', 'password123');
console.log(user.value);  // { id, username, avatar? }

// 注册
await register('bob', 'password456');

// 获取当前用户（自动检测登录状态）
const currentUser = await me();
if (currentUser) {
  console.log('已登录:', currentUser.username);
}

// 登出
await logout();
console.log(isAuthenticated.value);  // false
```

### API 签名

| 方法/属性 | 签名 | 说明 |
|----------|------|------|
| `isAuthenticated` | `Ref<boolean>` | 登录状态 |
| `user` | `Ref<{id, username, avatar?} | null>` | 当前用户 |
| `login` | `(username, password) => Promise<void>` | 登录 |
| `register` | `(username, password) => Promise<void>` | 注册 |
| `logout` | `() => Promise<void>` | 登出 |
| `me` | `() => Promise<user | null>` | 获取当前用户 |

## useDittoUI — UI 通知与对话框

源码：`packages/sdk/src/ui-api.ts`

调用系统 UI 组件（通知、对话框、文件选择）。

```typescript
import { useDittoUI } from '@ditto/sdk';

const { showNotification, showOpenFileDialog, showConfirm, showAlert } = useDittoUI();

// 显示通知
showNotification('保存成功', '笔记已自动保存', 'success');
// type: 'info' | 'success' | 'warning' | 'error'

// 确认对话框
const confirmed = await showConfirm('删除确认', '确定删除这条笔记吗？');
if (confirmed) {
  await deleteNote();
}

// 警告框
await showAlert('提示', '请先登录');

// 文件选择
const files = await showOpenFileDialog({ accept: '.md', multiple: true });
for (const file of files) {
  console.log(file.name, file.size, file.type);
  const text = await file.text();
}
```

### API 签名

| 方法 | 签名 | 说明 |
|------|------|------|
| `showNotification` | `(title, body, type?) => void` | 显示通知 |
| `showOpenFileDialog` | `(options?: {accept?, multiple?}) => Promise<File[]>` | 文件选择 |
| `showConfirm` | `(title, message) => Promise<boolean>` | 确认框 |
| `showAlert` | `(title, message) => Promise<void>` | 警告框 |

::: tip 通知类型
`showNotification` 的 `type` 参数可选值：`'info'` | `'success'` | `'warning'` | `'error'`。需要 `notification:show` 权限。
:::

## useDittoWidget — 小组件

源码：`packages/sdk/src/widget-api.ts`

桌面小组件 API（widget 类型应用专用）。

```typescript
import { useDittoWidget } from '@ditto/sdk';

const { data, loading, error, updateData, getData, requestRefresh, resize, notifyHost, requestIslandSlot, updateIslandSlot, removeIslandSlot } = useDittoWidget();

// 更新小组件数据（自动通知宿主刷新）
updateData({ weather: 'sunny', temp: 25 });

// 读取数据
const current = getData();

// 主动请求刷新
requestRefresh();

// 调整小组件尺寸
resize('large');  // 'small' | 'medium' | 'large'

// 通知宿主事件
notifyHost('click', { action: 'open-app' });

// 申请 Dynamic Island 槽位
const slotId = await requestIslandSlot('正在同步...', {
  icon: '🔄',
  priority: 'high',
  expandable: true,
  actions: [{ label: '查看', action: 'view' }],
});

if (slotId) {
  // 更新 Island 内容
  updateIslandSlot(slotId, '同步完成', { priority: 'normal' });

  // 移除 Island 槽位
  setTimeout(() => removeIslandSlot(slotId), 3000);
}
```

### API 签名

| 方法/属性 | 签名 | 说明 |
|----------|------|------|
| `data` | `Ref<Record<string, unknown>>` | 小组件数据 |
| `loading` | `Ref<boolean>` | 加载状态 |
| `error` | `Ref<Error | null>` | 错误状态 |
| `updateData` | `(newData) => void` | 更新数据 |
| `getData` | `() => Record` | 获取数据 |
| `requestRefresh` | `() => void` | 请求刷新 |
| `resize` | `(size: 'small'|'medium'|'large') => void` | 调整尺寸 |
| `notifyHost` | `(event, payload?) => void` | 通知宿主 |
| `requestIslandSlot` | `(content, options?) => Promise<string|null>` | 申请 Island 槽位 |
| `updateIslandSlot` | `(slotId, content, options?) => void` | 更新 Island |
| `removeIslandSlot` | `(slotId) => void` | 移除 Island |

::: warning 仅 widget 类型可用
`useDittoWidget` 仅在 `manifest.type === 'widget'` 的应用中可用。在普通 app 中调用会返回空数据且不生效。
:::

## useDittoApp — 应用生命周期

源码：`packages/sdk/src/app-api.ts`

管理应用注册与生命周期事件。

```typescript
import { useDittoApp } from '@ditto/sdk';

const { isReady, appInfo, registerApp, onLifecycle, ready, exit, suspend, requestPermission, getManifest } = useDittoApp();

// 注册应用信息
registerApp({
  id: 'com.ditto.notes',
  name: 'Ditto Notes',
  version: '1.0.0',
  description: 'Markdown 笔记',
});

// 监听生命周期事件
onLifecycle('mount', () => console.log('应用挂载'));
onLifecycle('suspend', async () => {
  console.log('应用被挂起，保存状态');
  await saveState();
});
onLifecycle('resume', async () => {
  console.log('应用恢复');
  await restoreState();
});
onLifecycle('destroy', () => console.log('应用销毁'));

// 通知宿主应用已就绪
ready();

// 请求权限
const granted = await requestPermission('fs:write');
if (granted) {
  await saveFile();
}

// 主动退出
function onExit() {
  exit();
}
```

### 生命周期事件

| 事件 | 触发时机 |
|------|---------|
| `init` | 应用初始化 |
| `mount` | 应用挂载到 DOM |
| `unmount` | 应用从 DOM 卸载 |
| `suspend` | 应用被挂起（如切换到后台） |
| `resume` | 应用恢复（从挂起恢复） |
| `destroy` | 应用销毁 |

::: tip suspend / resume
移动端切换应用或桌面端最小化时，宿主会触发 `suspend`。在 `suspend` 中保存状态，在 `resume` 中恢复，可避免数据丢失。
:::

## useDittoCell — 后端 Cell 通信

源码：`packages/sdk/src/cell-api.ts`

dit 类型应用专用，与后端 CellInstance 通信，需要 `cell:backend` 权限。

```typescript
import { useDittoCell } from '@ditto/sdk';

const {
  loading, error, backendStatus,
  cellFetch, cellGet, cellPost, cellPut, cellDelete,
  checkBackendHealth, startBackend, stopBackend, ensureBackendRunning,
  sendToBackend, onBackendMessage, connectWebSocket, disconnectWebSocket,
} = useDittoCell();

// HTTP 调用后端 API（自动唤醒冬眠的 Cell）
const stats = await cellGet('com.ditto.notes', '/stats');
const result = await cellPost('com.ditto.notes', '/notes', { title: 'Hello', content: 'World' });

// 带选项的 fetch
const data = await cellFetch('com.ditto.notes', '/notes/123', {
  method: 'PUT',
  body: { title: 'Updated' },
  timeout: 15000,
  autoWake: true,  // 后端冬眠时自动唤醒
});

// 检查后端状态
const health = await checkBackendHealth('com.ditto.notes');
console.log(backendStatus.value);  // 'running' | 'hibernated' | 'stopped' | 'error'

// 主动启动/停止后端
await startBackend('com.ditto.notes');
await stopBackend('com.ditto.notes');

// WebSocket 实时通信
connectWebSocket('com.ditto.notes');

// 发送消息到后端
sendToBackend('com.ditto.notes', 'note:updated', { id: 123 });

// 监听后端消息
const unsub = onBackendMessage('note:synced', (payload) => {
  console.log('笔记已同步:', payload);
});

// 组件卸载时自动断开 WebSocket（onUnmounted 内置）
```

### API 签名

| 方法/属性 | 签名 | 说明 |
|----------|------|------|
| `loading` | `Ref<boolean>` | 加载状态 |
| `error` | `Ref<Error | null>` | 错误状态 |
| `backendStatus` | `Ref<'unknown'\|'running'\|'hibernated'\|'stopped'\|'error'>` | 后端状态 |
| `cellFetch` | `<T>(appId, path, options?) => Promise<{data, status, headers}>` | 通用请求 |
| `cellGet` | `<T>(appId, path) => Promise<T>` | GET 请求 |
| `cellPost` | `<T>(appId, path, body?) => Promise<T>` | POST 请求 |
| `cellPut` | `<T>(appId, path, body?) => Promise<T>` | PUT 请求 |
| `cellDelete` | `<T>(appId, path) => Promise<T>` | DELETE 请求 |
| `checkBackendHealth` | `(appId) => Promise<{status, runningCells?, hibernatedCells?}>` | 健康检查 |
| `startBackend` | `(appId) => Promise<boolean>` | 启动后端 |
| `stopBackend` | `(appId) => Promise<boolean>` | 停止后端 |
| `ensureBackendRunning` | `(appId, retries?) => Promise<boolean>` | 确保运行（含重试） |
| `sendToBackend` | `(appId, channel, payload) => void` | 发送 IPC 消息 |
| `onBackendMessage` | `(channel, handler) => () => void` | 监听后端消息 |
| `connectWebSocket` | `(appId) => WebSocket | null` | 连接 WebSocket（自动重连） |
| `disconnectWebSocket` | `() => void` | 断开 WebSocket |

### 自动唤醒机制

::: tip 后端冬眠自动唤醒
- `cellFetch` 默认 `autoWake: true`，检测到后端非 running 状态时自动调用 `ensureBackendRunning`
- 后端冬眠时返回 503，SDK 自动调用 `/wake` 并重试（默认最多 2 次，间隔 1s）
- 资源配额超限返回 503，SDK 不会重试，`console.warn` 提示
:::

::: warning 资源配额超限不会重试
当后端因为系统资源配额超限返回 503 时，SDK 不会自动重试（避免雪崩）。此时需要在 UI 中提示用户稍后再试，或手动调用 `startBackend`。
:::

## Composable 速查表

| Composable | 用途 | 源码文件 | 关键权限 |
|-----------|------|---------|---------|
| `useDittoIPC` | IPC 通信基础 | `ipc-api.ts` | — |
| `useDittoWindow` | 窗口控制 | `window-api.ts` | — |
| `useDittoFS` | 文件系统读写 | `fs-api.ts` | `fs:read` / `fs:write` |
| `useDittoNet` | 网络请求 | `net-api.ts` | `net:fetch` |
| `useDittoAuth` | 账户认证 | `auth-api.ts` | — |
| `useDittoUI` | 通知与对话框 | `ui-api.ts` | `notification:show` |
| `useDittoWidget` | 桌面小组件 | `widget-api.ts` | widget 类型专用 |
| `useDittoApp` | 应用生命周期 | `app-api.ts` | — |
| `useDittoCell` | 后端 Cell 通信 | `cell-api.ts` | `cell:backend` |

## 相关文档

- [开发指南](/development/)
- [第三方应用开发](/development/third-party)
- [CLI 脚手架](/development/cli)
- [调试技巧](/development/debugging)
- [核心概念 — IPC 通信](/concepts/ipc)
- [核心概念 — 生命周期](/concepts/lifecycle)
