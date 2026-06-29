---
title: 类型定义
description: Ditto WebOS 核心 TypeScript 类型参考：AppManifest、ThemeTokens、Capability、CellRuntimeConfig、CellEvent、IPCMessage 及错误码一览。
outline: [2, 3]
---

# 类型定义

本页面汇总 Ditto WebOS 在前后端共享的核心 TypeScript 类型，是撰写 `manifest.json`、声明权限、约束 Cell 运行时类型与排查错误码时的参考依据。所有类型均来自 `packages/shared`、`packages/core` 与 `packages/server`。

## 目录

- [AppManifest](#appmanifest)
- [ThemeTokens](#themetokens)
- [Capability](#capability)
- [CellRuntimeConfig](#cellruntimeconfig)
- [CellEvent 与 CellEventHandler](#cellevent-与-celleventhandler)
- [IPCMessage](#ipcmessage)
- [IPCHandler / IPCMiddleware](#ipchandler--ipcmiddleware)
- [ClientCellStatus](#clientcellstatus)
- [KernelState](#kernelstate)
- [错误码一览](#错误码一览)

## AppManifest

应用清单，描述应用的元数据、入口、权限与窗口规格，源码位于 `packages/shared/src/manifest.ts`。

```typescript
interface AppManifest {
  id: string;                                       // 唯一标识，reverse-domain（如 com.ditto.notes）
  name: string;                                     // 显示名称
  version: string;                                  // 版本号，semver
  description?: string;                             // 描述
  icon?: string;                                    // 图标（FontAwesome class 或 URL）
  type?: 'app' | 'widget' | 'plugin' | 'theme' | 'dit'; // 应用类型，决定打包扩展名
  entry: string;                                    // 入口文件路径
  category?: string;                                // 分类（如 productivity、utilities）
  sandbox: 'strict' | 'trusted';                    // 沙盒模式
  permissions: string[];                            // 权限列表（Capability 字符串）
  window: {
    width: number;
    height: number;
    minWidth?: number;
    minHeight?: number;
    resizable?: boolean;
    maximizable?: boolean;
  };
  backend?: {
    type: 'cell';
    entry: string;
  };
  hooks?: {
    onStart?: string;
    onPause?: string;
    onResume?: string;
    onStop?: string;
  };
}
```

### 字段详解

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | `string` | 是 | 唯一标识，建议使用 reverse-domain 格式（如 `com.ditto.notes`）。同一台机器上不允许重复安装。 |
| `name` | `string` | 是 | 显示名称，会出现在任务栏、开始菜单、窗口标题。 |
| `version` | `string` | 是 | 遵循 [semver](https://semver.org/) 规范。 |
| `description` | `string` | 否 | 应用简介，会显示在市场详情页。 |
| `icon` | `string` | 否 | 图标。支持 FontAwesome class（如 `fa-solid fa-note`）或图片 URL。 |
| `type` | `string` | 否 | 应用分类，影响打包扩展名（`.dit` / `.ditx` / `.ditc` / `.ditz`）。默认 `app`。 |
| `entry` | `string` | 是 | 前端入口，相对于包根目录。 |
| `category` | `string` | 否 | 市场分类，便于过滤与排序。 |
| `sandbox` | `'strict' \| 'trusted'` | 是 | 沙盒模式。`trusted` 仅用于内置系统应用。 |
| `permissions` | `string[]` | 是 | 声明需要的 [Capability](#capability)。未声明的权限在生产模式下会被直接拒绝。 |
| `window` | `object` | 是 | 窗口规格。 |
| `backend` | `object` | 否 | 后端 Cell 描述。仅 `type: 'dit'` 的应用通常配置此项。 |
| `hooks` | `object` | 否 | 生命周期钩子入口名称。 |

::: tip type 与 sandbox 的关系
`type: 'dit'` 的应用通常同时配置 `backend` 字段、以 [`CellRuntimeConfig.type = 'dit'`](./client#startcell) 启动。`sandbox: 'trusted'` 一般只给系统内置应用（设置、文件管理器等），第三方应用一律使用 `'strict'`。
:::

### 示例

```json
{
  "id": "com.ditto.notes",
  "name": "Ditto Notes",
  "version": "0.1.0",
  "description": "极简笔记应用",
  "type": "dit",
  "entry": "frontend/index.html",
  "category": "productivity",
  "sandbox": "strict",
  "permissions": ["fs:read", "fs:write", "notification:show"],
  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 480,
    "minHeight": 360,
    "resizable": true,
    "maximizable": true
  },
  "backend": {
    "type": "cell",
    "entry": "backend/index.ts"
  },
  "hooks": {
    "onStart": "handleStart",
    "onStop": "handleStop"
  }
}
```

## ThemeTokens

主题 token 结构，描述一套主题的色彩与排版，由 ThemeService 加载与切换。

```typescript
interface ThemeTokens {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    error: string;
    warning: string;
    success: string;
    info: string;
  };
  typography: {
    fontFamily: string;
    fontSize: {
      base: string;
      sm: string;
      lg: string;
      xl: string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      bold: number;
    };
  };
  spacing: {
    xs: string;
    sm: string;
    md: string;
    lg: string;
    xl: string;
  };
  radius: {
    sm: string;
    md: string;
    lg: string;
    full: string;
  };
  shadows: {
    sm: string;
    md: string;
    lg: string;
  };
  scheme: 'light' | 'dark';
}
```

::: tip 主题定制
ThemeTokens 是应用主题的"标准接口"。Shell 与第三方应用都应通过 ThemeService 读取 token 而非硬编码颜色，确保亮/暗主题一致切换。详见 [UI & 主题](/ui/theme)。
:::

### 示例（暗色主题）

```json
{
  "colors": {
    "primary": "#00dfd9",
    "secondary": "#6c5ce7",
    "accent": "#fd79a8",
    "background": "#0e1116",
    "surface": "#161b22",
    "text": "#e6edf3",
    "textSecondary": "#7d8590",
    "border": "#30363d",
    "error": "#ff6b6b",
    "warning": "#feca57",
    "success": "#51cf66",
    "info": "#74c0fc"
  },
  "typography": {
    "fontFamily": "Inter, system-ui, sans-serif",
    "fontSize": { "base": "14px", "sm": "12px", "lg": "16px", "xl": "20px" },
    "fontWeight": { "normal": 400, "medium": 500, "bold": 700 }
  },
  "spacing": { "xs": "4px", "sm": "8px", "md": "12px", "lg": "16px", "xl": "24px" },
  "radius": { "sm": "4px", "md": "8px", "lg": "12px", "full": "9999px" },
  "shadows": {
    "sm": "0 1px 2px rgba(0,0,0,0.3)",
    "md": "0 4px 8px rgba(0,0,0,0.4)",
    "lg": "0 8px 24px rgba(0,0,0,0.5)"
  },
  "scheme": "dark"
}
```

## Capability

权限能力联合类型，源码位于 `packages/shared/src/cell-contract.ts`。

```typescript
type Capability =
  | 'fs:read'
  | 'fs:write'
  | 'net:fetch'
  | 'net:websocket'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notification:show'
  | 'window:multi'
  | 'window:fullscreen'
  | 'cell:backend'
  | 'cell:peer'
  | (string & {});   // 兜底允许自定义扩展
```

### 内置 Capability

| Capability | 说明 |
|------------|------|
| `fs:read` | 读取 VFS 文件 |
| `fs:write` | 写入 VFS 文件 |
| `net:fetch` | 通过 `/api/proxy/fetch` 或 SDK `net.fetch` 发起网络请求 |
| `net:websocket` | 直接发起 WebSocket 连接 |
| `clipboard:read` | 读取剪贴板 |
| `clipboard:write` | 写入剪贴板 |
| `notification:show` | 推送系统通知 |
| `window:multi` | 多窗口支持 |
| `window:fullscreen` | 全屏窗口 |
| `cell:backend` | 启用后端 Cell |
| `cell:peer` | 与其他应用 Cell 通信（peer-to-peer IPC） |

::: tip 自定义扩展
`(string & {})` 是 TypeScript 的常见技巧，允许任意字符串字面量但保留 IDE 自动补全。如果你的应用需要私有权限（如 `myapp:admin`），可直接使用字符串字面量而无需修改 Ditto 源码。
:::

## CellRuntimeConfig

启动 Cell 时传入的运行时配置，源码位于 `packages/core/src/app-cell/types.ts`。

```typescript
type CellRuntimeConfig =
  | NativeRuntimeConfig
  | WebRuntimeConfig
  | PwaRuntimeConfig
  | DitRuntimeConfig;
```

### 4 种运行时类型

#### 1. native

```typescript
interface NativeRuntimeConfig {
  type: 'native';
  componentLoader: () => Promise<unknown>;
}
```

加载 Vue 组件作为应用 UI，沙盒为 `shadow-trusted`，无后端 Cell。适用于内置系统应用（设置、文件管理器等）。

```typescript
{
  type: 'native',
  componentLoader: () => import('./Settings.vue')
}
```

#### 2. web

```typescript
interface WebRuntimeConfig {
  type: 'web';
  url: string;                  // 应用 URL
  origin: string;               // 沙盒 origin（必须与 url 同源）
  sandboxAttributes?: string;   // 自定义 iframe sandbox 属性
}
```

加载远程 URL，沙盒为 `iframe-strict`，无后端 Cell。适用于第三方纯前端应用。

```typescript
{
  type: 'web',
  url: 'https://external-app.com',
  origin: 'https://external-app.com'
}
```

#### 3. pwa

```typescript
interface PwaRuntimeConfig {
  type: 'pwa';
  manifestUrl: string;          // PWA manifest URL
  scope?: string;               // PWA scope
  startUrl?: string;            // 启动 URL（相对 scope）
}
```

加载 PWA manifest 并启动，沙盒为 `iframe-strict`，无后端 Cell。适用于安装 PWA。

```typescript
{
  type: 'pwa',
  manifestUrl: 'https://example.com/manifest.json',
  scope: 'https://example.com/',
  startUrl: 'index.html'
}
```

#### 4. dit

```typescript
interface DitRuntimeConfig {
  type: 'dit';
  origin: string;              // 后端 origin（如 http://localhost:3001）
  backendCell?: boolean;        // 是否启用后端 Cell
}
```

Ditto 原生应用，沙盒为 `iframe-strict`。`backendCell: true` 时前端通过 [CellBridge](./client#cellbridge-api) 与服务端后端 Cell 通信。

```typescript
{
  type: 'dit',
  origin: 'http://localhost:3001',
  backendCell: true
}
```

### 类型对比

| type | 沙盒 | 后端 Cell | 典型场景 | 来源 |
|------|------|-----------|----------|------|
| `native` | shadow-trusted | 否 | 内置系统应用 | Vue 组件 |
| `web` | iframe-strict | 否 | 第三方纯前端应用 | 远程 URL |
| `pwa` | iframe-strict | 否 | PWA | manifest URL |
| `dit` | iframe-strict | 可选 | 前后端对称应用 | `.dit` 安装包 |

::: warning 与 AppManifest.type 的区别
`AppManifest.type` 描述应用**分类**（app/widget/plugin/theme/dit），决定打包扩展名。`CellRuntimeConfig.type` 描述**运行时沙盒**，决定如何启动。两者独立：`manifest.type='dit'` 的应用通常以 `CellRuntimeConfig.type='dit'` 启动，但也可以其他方式启动（如 dev 模式下用 `native` 加载源码）。
:::

## CellEvent 与 CellEventHandler

源码位于 `packages/core/src/app-cell/types.ts`。

```typescript
type CellEvent =
  | 'cell:loading'
  | 'cell:active'
  | 'cell:paused'
  | 'cell:resumed'
  | 'cell:stopped'
  | 'cell:error';

type CellEventHandler = (payload: unknown) => void;
```

| 事件 | Payload | 触发时机 |
|------|---------|----------|
| `cell:loading` | `{ appId, cell }` | Cell 开始加载 |
| `cell:active` | `{ appId, cell }` | Cell 激活完成 |
| `cell:paused` | `ClientCell` | Cell 被暂停 |
| `cell:resumed` | `ClientCell` | Cell 从暂停恢复 |
| `cell:stopped` | `{ appId, cell }` | Cell 被停止 |
| `cell:error` | `{ appId, error }` | Cell 出错 |

::: tip 订阅方式
通过 `AppCellManager.onCellEvent` 订阅。返回的 unsubscribe 函数用于取消订阅。
:::

## IPCMessage

IPC 消息通用结构，源码位于 `packages/shared/src/ipc/types.ts`。

```typescript
interface IPCMessage {
  id: string;                                       // 消息 ID（自动生成 UUID）
  type: 'request' | 'response' | 'event' | 'error'; // 消息类型
  channel: string;                                  // 频道名（如 fs:read）
  source: string;                                   // 发送方（appId 或 'host'）
  target?: string;                                   // 接收方（appId / 'host' / '*'，默认 'host'）
  payload: unknown;                                 // 消息体
  timestamp: number;                                // 毫秒时间戳
  requestId?: string;                                // 请求 ID（request/response 配对）
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 每条消息的唯一 ID，用于追踪。 |
| `type` | `string` | `request` 期望收到 `response`/`error`；`event` 是单向通知。 |
| `channel` | `string` | 业务频道，命名约定为 `domain:action`（如 `fs:read`、`window:close`）。 |
| `source` | `string` | 发送方标识。Cell 内为 appId，宿主侧为 `'host'`。 |
| `target` | `string` | 可选目标。`'*'` 表示广播。 |
| `payload` | `unknown` | 业务数据，无固定结构。 |
| `timestamp` | `number` | 发送时刻的 `Date.now()`。 |
| `requestId` | `string` | 仅 `request`/`response`/`error` 携带，用于配对。 |

### 消息类型语义

| type | 说明 |
|------|------|
| `request` | 请求消息，期望对方响应。需要 `requestId`。 |
| `response` | 成功响应。`requestId` 与请求配对。 |
| `error` | 失败响应。`requestId` 与请求配对，`payload` 为错误描述。 |
| `event` | 单向事件，无需响应。无 `requestId`。 |

::: warning 异步错误
`type: 'error'` 是 IPC 层面的错误响应，对应 `respondError`。若 handler 抛出同步异常，IPCBus 会派发 `ipc:handler-error` 事件而非构造 error 消息。
:::

## IPCHandler / IPCMiddleware

```typescript
type IPCHandler = (message: IPCMessage) => void;

type IPCMiddleware = (message: IPCMessage, next: (msg: IPCMessage) => void) => void;
```

- `IPCHandler` 是普通消息处理器，通过 `on(channel, handler)` 注册。
- `IPCMiddleware` 采用洋葱模型，通过 `use(middleware)` 注册。中间件可选择不调用 `next(msg)` 吞掉消息。

## ClientCellStatus

```typescript
type ClientCellStatus = 'loading' | 'active' | 'paused' | 'stopped' | 'error';
```

### 状态机

```
                ┌────────── activate ──────────┐
                ▼                              │
            loading ───────────────► active ───┘
              │                       │  ▲
              │ error                 pause│  │resume
              ▼                       ▼    │
            error ◄─── unload ──► paused ────┘
                            │
                            ▼
                          stopped
```

| 状态 | 说明 | 可触发的方法 |
|------|------|--------------|
| `loading` | 正在创建沙盒与挂载 | `activate` 进入 |
| `active` | 激活运行中 | `pause`、`unload` |
| `paused` | 暂停（DOM 隐藏，state 保留） | `resume`、`unload` |
| `stopped` | 已卸载（终态） | 无 |
| `error` | 激活或运行出错 | `unload` |

## KernelState

```typescript
type KernelState = 'created' | 'initializing' | 'ready' | 'destroying' | 'destroyed';
```

详见 [前端 API — KernelState](./client#kernelstate)。

## 错误码一览

Ditto 内核与服务端使用统一的 `DittoError` 类型携带错误码。以下罗列主要错误码及其触发场景。

### 内核与运行时错误

| 错误码 | 触发场景 | 处理建议 |
|--------|----------|----------|
| `CELL_ALREADY_RUNNING` | `AppCellManager.startCell` 时 appId 已存在 active 的 Cell | 先 `stopCell` 再启动，或忽略重复启动 |
| `CELL_NOT_FOUND` | `stopCell` / `pauseCell` / `resumeCell` 找不到对应 appId | 检查 appId 拼写 |
| `CELL_NOT_ACTIVE` | 对非 active 状态的 Cell 调用 `pause` | 先 `resume` 或检查状态 |
| `CELL_NOT_PAUSED` | 对非 paused 状态的 Cell 调用 `resume` | 检查状态机 |
| `SANDBOX_CREATE_FAILED` | iframe / shadow DOM 沙盒创建失败 | 检查容器元素与 origin |
| `SANDBOX_LOAD_FAILED` | 沙盒内容加载失败（URL 无法访问） | 检查网络与 CORS |
| `IPC_BRIDGE_DISCONNECTED` | `connectBridge` 时 `origin` 为 `'*'` 或非法 | 显式指定合法 origin |
| `IPC_TIMEOUT` | `request` 等待响应超时（默认 10000ms） | 调用方需处理 reject，或调长 `timeout` |
| `IPC_HANDLER_ERROR` | handler 同步异常 | 检查 handler 实现 |
| `SERVICE_ALREADY_REGISTERED` | `ServiceRegistry.register` 时 id 已存在 | 改用唯一 id 或先 `shutdown` |
| `SERVICE_NOT_REGISTERED` | `resolve` / `resolveAsync` 时 id 未注册 | 检查 id 拼写与服务注册时机 |
| `PERMISSION_DENIED` | 生产模式下权限请求被拒 | 引导用户在权限 UI 中授权 |
| `KERNEL_NOT_READY` | 在 `init()` 完成前访问 `cellManager` 等 | 等待 `kernel:ready` 事件 |

::: tip DittoError 结构
所有 Ditto 内部错误均继承自 `DittoError`，可通过 `error.code` 获取错误码、`error.message` 获取可读描述、`error.cause` 获取原始错误。捕获时优先按 `code` 分支处理。
:::

### HTTP 错误状态码

服务端 API 的 HTTP 响应状态码遵循常规约定：

| 状态码 | 含义 | 典型场景 |
|--------|------|----------|
| `400` | Bad Request | 参数无效、`.dit` 包格式错误 |
| `401` | Unauthorized | 未携带 `Authorization` 或 token 无效 |
| `403` | Forbidden | 代理目标域名被黑名单拦截 |
| `404` | Not Found | 应用/Cell/资源不存在 |
| `409` | Conflict | 重复评论、appId 已注册 |
| `429` | Too Many Requests | 限流或超配额，附 `Retry-After` |
| `500` | Internal Server Error | 服务端未捕获异常 |
| `502` | Bad Gateway | 上游代理失败、市场包下载失败 |
| `503` | Service Unavailable | Cell 不可用、流量整形器未启用 |

::: warning 错误响应示例
错误响应统一为 JSON，至少包含 `error` 字段。详细字段与示例见 [服务端 API — 错误响应格式](./server#错误响应格式)。
:::

## 相关文档

- [API 参考 — 总览](./index)
- [API 参考 — 前端 API](./client)
- [API 参考 — 服务端 API](./server)
- [核心概念 — Cell 沙盒](/concepts/cell)
- [核心概念 — IPC 通信](/concepts/ipc)
- [核心概念 — 权限系统](/concepts/permission)
- [核心概念 — 生命周期](/concepts/lifecycle)
- [开发指南 — 第三方应用开发](/development/third-party)
- [UI & 主题 — 主题定制](/ui/theme)
