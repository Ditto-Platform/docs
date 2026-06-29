---
title: Cell 沙盒
description: Ditto 客户端-服务端对称 Cell 架构详解，包含 ClientCell 四种类型、CellInstanceImpl 服务端、CellBridge 桥接层（WebSocket + HTTP），以及三档沙盒安全模型（iframe-strict / shadow-trusted / worker）。
---

# Cell 沙盒

Cell 是 Ditto 中应用的运行单元，提供隔离环境与 IPC 能力。Ditto 的核心创新是**前后端对称的 Cell 架构**：dit 类型的应用同时拥有前端（ClientCell）和后端（CellInstance），通过 CellBridge 双向通信。

## 客户端-服务端对称 Cell 架构

Ditto 把浏览器与服务端视作对称的运行时，dit 类型应用在前端有 ClientCell、在后端有 CellInstance，二者通过 CellBridge 双向通信。

### 架构图

```
┌─────────────────── 客户端（浏览器）───────────────────┐
│  DittoKernel                                          │
│  ├── AppCellManager                                   │
│  │   └── ClientCell                                   │
│  │       ├── CellSandbox (iframe-strict)              │
│  │       │   └── <iframe src="frontend/index.html">   │
│  │       └── CellBridge                               │
│  │           ├── WebSocket → ws://server/ws           │
│  │           └── HTTP → /api/cell/{appId}/start|stop  │
│  ├── IPCBus v2                                        │
│  └── PermissionManager                                │
└───────────────────────┬───────────────────────────────┘
                        │ WebSocket + HTTP
┌───────────────────────▼───────────────────────────────┐
│  服务端（Bun + Hono）                                  │
│  AppCellManager                                       │
│  ├── CellInstanceImpl                                 │
│  │   ├── CellContext (db/storage/ipc/logger/metrics)   │
│  │   ├── CellRouter (get/post/put/delete/ws)           │
│  │   └── CellIPCBridge                                │
│  ├── ResourceQuotaManager                             │
│  ├── TrafficShaper                                    │
│  ├── FairScheduler                                    │
│  └── ElasticScaler (hibernate/wake/throttle)          │
└───────────────────────────────────────────────────────┘
```

::: tip 对称设计的好处
- 心智模型统一：前端理解 ClientCell，就理解了后端 CellInstance
- 共享契约：两端使用 `packages/shared/src/cell-contract.ts` 中的同一份类型定义
- 调试便利：状态机对称，前端 `loading` 对应后端 `creating`，前端 `paused` 对应后端 `hibernated`
:::

## ClientCell（客户端）

源码：`packages/core/src/app-cell/cell.ts`

ClientCell 是客户端应用实例，承担应用全生命周期。

### 四种类型

ClientCell 支持四种应用类型，每种类型对应不同的沙盒与后端策略：

| 类型 | 沙盒 | 后端 Cell | 典型场景 |
|------|------|----------|----------|
| `native` | `shadow-trusted` | ❌ | 内置系统应用（Vue 组件，shell 信任） |
| `web` | `iframe-strict` | ❌ | 远程 URL 应用（第三方网页） |
| `pwa` | `iframe-strict` | ❌ | PWA manifest 应用 |
| `dit` | `iframe-strict` | ✅ | 前后端对称应用（dit 类型，自带 backend） |

### 沙盒选择规则

- **native**：使用 `shadow-trusted`（Shadow DOM 直接挂载，无 origin 隔离）
- **其他（web / pwa / dit）**：使用 `iframe-strict`（强制 origin 白名单）

### dit 类型特殊处理

dit 类型应用是前后端对称架构的核心，其生命周期各阶段会自动通知后端：

| 客户端动作 | 调用 |
|------------|------|
| `activate` | `bridge.notifyStart()` |
| `pause` | `bridge.notifyHibernate()` |
| `resume` | `bridge.notifyWake()` |
| `unload` | `bridge.notifyStop()` |

::: warning dit 类型的 pause/resume 语义
dit 类型应用的 `pause` 不只是停止前端动画，还会通知后端 Cell 进入冬眠（hibernate）—— 释放 CPU/内存但保留 state。`resume` 时后端重新唤醒并执行 `onStart`。

详见 [生命周期 - 冬眠机制](./lifecycle#冬眠机制-elasticscaler-驱动)。
:::

## CellInstanceImpl（服务端）

源码：`server/src/services/app-cell/cell-instance.ts`

服务端 Cell 实例，加载并执行 `AppCellModule`。每个 dit 类型应用对应一个 `CellInstanceImpl`。

### 生命周期

```
start → hibernate → wake → stop → destroy
```

### 模块加载流程

```
1. 动态 import(backendDir + entry)
2. 调用 onInit（初始化模块资源）
3. 调用 registerRoutes（注册 CellRouter 路由）
4. 调用 onStart（启动业务逻辑）
```

### 监控机制

- **健康检查**：定时检查 cell 状态（默认 30s）
- **内存监控**：定时采样 `process.memoryUsage()`（默认 10s）

### 资源副本

CellInstance 支持两种资源副本模式：

| 模式 | 含义 | 适用场景 |
|------|------|----------|
| `shared` | 多用户共享同一 Cell 实例 | 只读应用、协作应用 |
| `exclusive` | 每个用户独占 Cell 实例 | 个人数据应用、有状态服务 |

::: tip 资源副本的选型
- `shared` 节省内存，但要求 Cell 是无状态或共享状态
- `exclusive` 隔离性强，但每个用户都会创建一份实例，内存成本高
- 默认按 manifest 中的 `backend.replica` 字段决定
:::

## CellBridge（桥接层）

源码：`packages/core/src/app-cell/bridge.ts`

CellBridge 是客户端 ↔ 服务端的 IPC 桥接，双通道：

- **WebSocket**：连接 `ws://server/ws?userId=xxx`，双向实时消息（`{ type: 'ditto-ipc', message }`）
- **HTTP**：调用 `/api/cell/{appId}/start|stop|hibernate|wake` 控制后端 Cell 生命周期

### HTTP 端点

```typescript
// HTTP 端点
POST /api/cell/{appId}/start      // 启动后端 Cell
POST /api/cell/{appId}/stop       // 停止后端 Cell
POST /api/cell/{appId}/hibernate  // 冬眠（释放资源，保留 state）
POST /api/cell/{appId}/wake       // 唤醒（从冬眠恢复）
GET  /api/cell/{appId}/health     // 健康检查
```

### WebSocket 消息格式

```typescript
// 客户端 → 服务端
{
  type: 'ditto-ipc',
  message: IPCMessage,  // 标准 IPC 消息
}

// 服务端 → 客户端
{
  type: 'ditto-ipc',
  message: IPCMessage,
}
```

::: info CellBridge 与 IPCBus
CellBridge 是「客户端 Cell ↔ 服务端 Cell」的桥接，而 IPCBus 是「客户端 Cell ↔ 客户端 Kernel/其他 Cell」的总线。两者协同工作：

- 同一窗口内 Cell 间通信 → IPCBus
- 客户端 Cell 与服务端 Cell 通信 → CellBridge（底层也走 IPCBus 协议）

详见 [IPC 通信](./ipc)。
:::

## 沙盒安全模型

源码：`packages/core/src/sandbox/index.ts`

### 三档沙盒模式

Ditto 提供三档沙盒模式，根据应用类型自动选择：

| 模式 | 适用场景 | 隔离强度 | origin 校验 |
|------|---------|---------|-------------|
| `iframe-strict` | 第三方应用（web / pwa / dit） | 强隔离 | 强制白名单，拒绝 `*` |
| `shadow-trusted` | native 应用（shell 信任） | 无隔离（Shadow DOM） | 不适用 |
| `worker` | 预留（阶段 2） | — | 抛 `SANDBOX_MODE_UNSUPPORTED` |

### iframe-strict 安全收紧

源码：`packages/core/src/sandbox/iframe-sandbox.ts`

iframe-strict 是默认安全模式，对第三方应用强制执行 origin 白名单与最小权限：

```typescript
// 默认 sandbox 属性：allow-scripts（不含 allow-same-origin）
const attrs = o.sandboxAttributes ?? 'allow-scripts';
this.sandboxAttributes = o.allowSameOrigin ? `${attrs} allow-same-origin` : attrs;
```

### 关键安全措施

1. **origin 强制白名单**：构造时必须提供 `origin`，构造时为空则抛 `SANDBOX_CREATE_FAILED`
2. **默认不含 allow-same-origin**：第三方应用无法访问宿主 cookie、localStorage、DOM
3. **message 校验三重防护**：
   - `event.data.type !== DITTO_MSG_TYPE` 过滤非 Ditto 消息
   - `event.origin !== this.allowedOrigin` 拒绝非白名单 origin
   - `event.source !== this.iframe.contentWindow` 拒绝非本 iframe 消息
4. **trusted 应用显式声明**：`allowSameOrigin: true` 才会加上 `allow-same-origin`

::: danger 默认不含 allow-same-origin 的含义
默认配置下，第三方应用 iframe 处于完全隔离状态：
- 无法读取宿主 cookie / localStorage / sessionStorage
- 无法访问宿主 DOM（`window.parent.document` 抛错）
- 无法通过 `postMessage` 发起跨域请求（origin 不匹配会被拒绝）

只有显式声明 `allowSameOrigin: true` 的 trusted 应用才会获得 same-origin 权限，此时该应用必须由 shell 团队审计。
:::

### 创建沙盒示例

```typescript
import { createSandbox } from '@ditto/core';

// 第三方应用（默认安全）
const sandbox = createSandbox('com.third.app', 'iframe-strict', {
  origin: 'https://third-party.com',
});

// trusted 应用（需要 same-origin 访问）
const trustedSandbox = createSandbox('com.trusted.app', 'iframe-strict', {
  origin: 'https://trusted.com',
  allowSameOrigin: true,
});
```

### message 校验三重防护

```typescript
// IFrameSandbox 内部实现（简化）
window.addEventListener('message', (event) => {
  // 防护 1：必须是 Ditto 消息类型
  if (event.data?.type !== DITTO_MSG_TYPE) return;

  // 防护 2：origin 必须在白名单
  if (event.origin !== this.allowedOrigin) {
    console.warn('[sandbox] rejected origin:', event.origin);
    return;
  }

  // 防护 3：source 必须是本 iframe
  if (event.source !== this.iframe.contentWindow) return;

  // 通过所有校验，派发消息
  this.emit('message', event.data.message);
});
```

## shadow-trusted

源码：`packages/core/src/sandbox/shadow-sandbox.ts`

native 应用使用 `ShadowSandbox`，无 origin 隔离，直接挂载到宿主 DOM（通过 Shadow DOM 封装样式）。仅用于 shell 内置应用，第三方应用不可使用。

### ShadowSandbox 特点

- **无 origin 校验**：native 应用是 shell 信任的 Vue 组件，无需白名单
- **Shadow DOM 隔离样式**：避免应用样式污染宿主
- **直接 DOM 访问**：可通过 `props` 接收宿主数据

::: warning shadow-trusted 仅限 native
`shadow-trusted` 模式假设应用是 shell 团队维护的，具备完全信任。第三方应用（web / pwa / dit）一律使用 `iframe-strict`，不可降级为 `shadow-trusted`。

如果发现第三方应用 manifest 中 `sandbox` 字段为 `shadow-trusted`，应视为安全风险并拒绝启动。
:::

## 启动 Cell

```typescript
// 启动 Cell
const cell = await kernel.cellManager.startCell(
  'com.example.app',
  manifest,
  {
    type: 'dit',                          // 'native' / 'web' / 'pwa' / 'dit'
    origin: 'https://example.com',        // iframe-strict 必须
    backendCell: true,                    // dit 类型默认 true
  }
);

// 停止 Cell
await kernel.cellManager.stopCell('com.example.app');

// 暂停 / 恢复
await kernel.cellManager.pauseCell('com.example.app');
await kernel.cellManager.resumeCell('com.example.app');
```

::: tip manifest 中的 backend 字段
dit 类型应用在 manifest 中声明 `backend` 字段：

```json
{
  "id": "com.ditto.counter",
  "type": "dit",
  "backend": {
    "type": "cell",
    "entry": "backend/index.ts",
    "replica": "exclusive"
  }
}
```

CellBridge 启动时会自动调用 `/api/cell/{appId}/start` 创建后端 CellInstance。
:::

## 与 AppManifest.type 的区别

`AppManifest.type` 描述应用分类（app/widget/plugin/theme/dit），决定打包扩展名。
`CellRuntimeConfig.type` 描述运行时沙盒。

两者独立：`manifest.type='dit'` 的应用通常以 `CellRuntimeConfig.type='dit'` 启动，但也可以以其他方式启动（如调试时用 `iframe` 启动 dit 应用）。

## 相关文档

- [架构概览](./)
- [Kernel 架构](./kernel)
- [IPC 通信](./ipc)
- [权限系统](./permission)
- [生命周期](./lifecycle)
- [开发指南 - 第三方应用开发](/development/third-party)
