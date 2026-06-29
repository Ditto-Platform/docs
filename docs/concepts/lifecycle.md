---
title: 生命周期
description: Ditto Cell 生命周期状态机详解，包含客户端状态机（loading/active/paused/stopped/error）、TRANSITIONS 合法转换表、服务端状态机（creating/running/hibernated/waking/stopped）、冬眠机制（ElasticScaler），以及服务编排（8 个 UI 服务 + 内部服务）。
---

# 生命周期

本页面介绍 Ditto 中应用（Cell）的生命周期管理，包括客户端状态机、服务端状态机、冬眠机制与服务编排。

源码位置：`packages/core/src/app-cell/lifecycle.ts` + `packages/shared/src/cell-contract.ts`

## AppCellManager API

Ditto 使用 `AppCellManager` 管理应用生命周期：

```typescript
// 启动应用
await kernel.cellManager.startCell(appId, manifest, options);

// 停止应用
await kernel.cellManager.stopCell(appId);

// 暂停应用（保留状态）
await kernel.cellManager.pauseCell(appId);

// 恢复应用
await kernel.cellManager.resumeCell(appId);
```

::: warning 注意
Shell 层的 `appStore.launchApp()` 只负责开窗，未调用 `kernel.cellManager.startCell()`。
这是当前架构缺陷，后续版本会修复。开发者需要：

```typescript
// 正确的启动流程
const cell = await kernel.cellManager.startCell(appId, manifest, options);
// 然后再开窗显示
windowStore.open(cell);
```
:::

## 客户端状态机

源码：`packages/core/src/app-cell/lifecycle.ts` + `packages/shared/src/cell-contract.ts`

ClientCell 使用五状态有限状态机管理生命周期：

```
        ┌─────────────────────────────────────┐
        │                                     │
        ▼                                     │
   ┌─────────┐         ┌─────────┐            │
   │ loading │ ──────► │ active  │            │
   └────┬────┘         └────┬────┘            │
        │                   │                 │
        │          ┌────────┼────────┐        │
        │          ▼        │        ▼        │
        │     ┌─────────┐  │  ┌──────────┐    │
        └────►│ paused  │  │  │ stopped  │    │
              └────┬────┘  │  └──────────┘    │
                   │       │                  │
                   └───────┘──────────────────┘
```

### 状态说明

| 状态 | 含义 |
|------|------|
| `loading` | 加载中（沙盒创建、模块加载、权限请求） |
| `active` | 运行中，正常接受用户交互 |
| `paused` | 已暂停（保留状态，但不响应交互） |
| `stopped` | 已停止（终态，资源已释放） |
| `error` | 异常态（可恢复或转入 stopped） |

### 合法转换（TRANSITIONS 表）

`TRANSITIONS` 表定义了所有合法的状态转换，非法转换会被拒绝：

| From | To |
|------|-----|
| `loading` | `active` / `error` / `stopped` |
| `active` | `paused` / `stopped` / `error` |
| `paused` | `active` / `stopped` |
| `stopped` | （终态） |
| `error` | `stopped` / `loading` |

通过 `canTransition(from, to)` 查询合法性，`assertTransition(from, to)` 在非法转换时抛 `CELL_START_FAILED`。

```typescript
import { canTransition, assertTransition } from '@ditto/core';

// 查询合法性
canTransition('loading', 'active');   // true
canTransition('stopped', 'active');   // false（终态）
canTransition('paused', 'active');    // true

// 断言（非法时抛错）
assertTransition('loading', 'active');  // 通过
assertTransition('stopped', 'active');  // 抛 CELL_START_FAILED
```

::: tip 终态语义
`stopped` 是终态，无法转换到任何其他状态。如果需要重新启动已停止的 Cell，必须创建新的 ClientCell 实例（新的 `startCell` 调用）。

`error` 不是终态，可以从 `error` 转回 `loading`（重试）或转入 `stopped`（放弃）。
:::

### 状态转换示例

```typescript
// 启动 → loading → active
const cell = await kernel.cellManager.startCell(appId, manifest, options);
// 此时 cell.status === 'active'

// 暂停 → active → paused
await kernel.cellManager.pauseCell(appId);
// 此时 cell.status === 'paused'

// 恢复 → paused → active
await kernel.cellManager.resumeCell(appId);
// 此时 cell.status === 'active'

// 停止 → active → stopped（终态）
await kernel.cellManager.stopCell(appId);
// 此时 cell.status === 'stopped'
```

## 服务端状态机

服务端 `CellInstance.status` 比 client 更细，包含冬眠子态：

```
creating → running ⇄ hibernated → stopped
                │           │
                ▼           ▼
              error       waking → running
```

### 状态说明

| 状态 | 含义 |
|------|------|
| `creating` | 正在加载后端模块、初始化 context |
| `running` | 正常运行，接受请求 |
| `hibernating` | 正在冬眠（停止健康检查与内存监控） |
| `hibernated` | 已冬眠，保留 state，释放 CPU/内存 |
| `waking` | 正在唤醒（重新调用 `onStart`） |
| `stopping` | 正在停止 |
| `stopped` | 已停止（终态） |
| `error` | 异常 |

::: info 客户端与服务端状态对应
- 客户端 `loading` ↔ 服务端 `creating`
- 客户端 `active` ↔ 服务端 `running`
- 客户端 `paused` ↔ 服务端 `hibernated`（dit 类型）
- 客户端 `stopped` ↔ 服务端 `stopped`

冬眠是 dit 类型应用特有的：客户端 `pause` 时通知服务端 `hibernate`，客户端 `resume` 时通知服务端 `wake`。
:::

## 冬眠机制（ElasticScaler 驱动）

冬眠是服务端 Cell 的资源优化机制，由 `ElasticScaler` 驱动：

- **自动冬眠**：空闲超过 `hibernateAfterMs`（默认 15 分钟）自动冬眠
- **唤醒**：客户端 `resume` 时 `CellBridge.notifyWake()` 唤醒
- **请求处理**：冬眠期间前端发请求返回 503，SDK 会自动重试 wake

### 冬眠流程

```
1. Cell 空闲超过 hibernateAfterMs（默认 15 分钟）
   ↓
2. ElasticScaler 触发 hibernate：
   - 调用 cell.onHibernate?()（如有）
   - 停止健康检查定时器
   - 停止内存监控定时器
   - 状态转为 hibernating → hibernated
   ↓
3. 保留 CellContext.state（state 不释放）
   释放：CPU、定时器、网络连接
   ↓
4. 前端请求到达 → 返回 503 + 'hibernated'
   ↓
5. SDK 自动调用 /api/cell/{appId}/wake
   ↓
6. 状态转为 waking
   - 重新调用 onStart
   - 恢复健康检查、内存监控
   - 状态转为 running
   ↓
7. 重试原请求 → 正常响应
```

### 手动冬眠与唤醒

```typescript
// 通过 CellBridge 手动触发
// 客户端 pause 时自动触发：
await kernel.cellManager.pauseCell('com.ditto.notes');
// → CellBridge.notifyHibernate()
// → POST /api/cell/com.ditto.notes/hibernate

// 客户端 resume 时自动触发：
await kernel.cellManager.resumeCell('com.ditto.notes');
// → CellBridge.notifyWake()
// → POST /api/cell/com.ditto.notes/wake
```

::: tip 冬眠 vs 停止
- **冬眠（hibernate）**：保留 state，释放 CPU/内存，可快速唤醒（仅重新执行 `onStart`）
- **停止（stop）**：完全销毁，下次启动需重新创建 CellInstance（执行完整 `onInit` → `registerRoutes` → `onStart`）

冬眠适合「暂时不用但稍后可能恢复」的场景，停止适合「彻底退出」的场景。
:::

::: warning 503 重试的副作用
冬眠期间前端的请求会收到 503，SDK 自动重试 wake。但要注意：

- 长时间未唤醒的请求可能超时
- 写操作（POST/PUT/DELETE）在 503 后重试可能导致重复执行
- 服务端应实现幂等性，或前端在 503 后显式等待 wake 再重试
:::

## 系统级生命周期

Ditto 启动流程（`kernel.init()`）：

```
storage → events → ipc → permissions → services → cells → ready
```

Ditto 关闭流程（`kernel.destroy()`，逆序）：

```
ready → cells → services → permissions → ipc → events → storage
```

详细说明参见 [Kernel 架构 - LifecycleOrchestrator](./kernel#lifecycleorchestrator-阶段化启动)。

## 服务编排

### 8 个 UI 服务

源码：`packages/services/src/register.ts`

`registerKernelServices(kernel)` 把 services 包的 8 个服务注册到 `ServiceRegistry`，懒创建：

| ServiceId | 实现 | 类型 | 职责 |
|-----------|------|------|------|
| `dialog` | `useDialogStore` | Pinia store | 对话框 / 确认框 / 文件选择 |
| `notification` | `useNotificationStore` | Pinia store | 系统通知中心 |
| `window` | `useWindowStore` | Pinia store | 窗口管理（focus/minimize/maximize/snap） |
| `widget` | `useWidgetStore` | Pinia store | 桌面小组件 |
| `island` | `useIslandStore` | Pinia store | Dynamic Island 槽位 |
| `search` | `useSearchStore` | Pinia store | 全局搜索 |
| `vfs` | `getVFS()` | 类单例 | 虚拟文件系统（IndexedDB / OPFS） |
| `net-proxy` | `getNetProxy()` | 类单例 | 网络代理（带缓存） |

### kernel 内部服务

由 `DittoKernel.registerStages()` 在各 stage 注册：

| ServiceId | 注册 stage | 实现 |
|-----------|-----------|------|
| `ipc` | `ipc` | `IPCBus` |
| `permissions` | `permissions` | `PermissionManager` |
| `events` | `services` | `EventEmitter` |
| `store` | `services` | `PersistenceStore` |
| `cells` | `cells` | `AppCellManager` |

### 完整服务注册示例

```typescript
import { createKernel } from '@ditto/core';
import { registerKernelServices } from '@ditto/services';

const kernel = createKernel({
  kernel: { id: 'my-kernel', dev: true },
});

// 注册 UI 服务（必须在 init 之后调用，因为 ServiceRegistry 此时才就绪）
await kernel.init();
registerKernelServices(kernel);

// 按需 resolve
const windowStore = kernel.services.resolve('window');
const dialog = kernel.services.resolve('dialog');
const vfs = kernel.services.resolve('vfs');

// 销毁时自动逆序 shutdown
await kernel.destroy();
```

::: tip 服务编排与生命周期的关系
服务的注册与生命周期编排紧密耦合：

- `init` 阶段：各 stage 注册对应服务到 ServiceRegistry
- `init` 完成：所有服务可被 `resolve`
- `destroy` 阶段：逆序调用各服务的 `destroy()`，先销毁依赖方（cells），再销毁被依赖方（ipc、storage）

这种设计确保服务间的依赖关系在销毁时被正确处理。
:::

## 关闭流程

`kernel.destroy()` 触发：

1. `LifecycleOrchestrator.destroy()` 逆序执行各 stage `onDestroy`（cells 最先）
2. `ServiceRegistry.shutdown()` 逆序调用每个实例 `destroy()`
3. `IPCBus.destroy()` 清理 bridge、pending request、handlers
4. `EventEmitter.removeAllListeners()`
5. 状态转为 `destroyed`

## 相关文档

- [架构概览](./)
- [Kernel 架构](./kernel)
- [Cell 沙盒](./cell)
- [IPC 通信](./ipc)
- [权限系统](./permission)
- [API 参考 - 服务端 API](/api/server)
- [API 参考 - 前端 API](/api/client)
