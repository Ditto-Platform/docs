---
title: Kernel 架构
description: DittoKernel 内核架构详解，包含 createKernel 工厂、ServiceRegistry 懒创建、LifecycleOrchestrator 阶段化启动、AppCellManager Cell 生命周期，以及内核服务一览表。
---

# Kernel 架构

DittoKernel 是 Ditto WebOS 的核心，负责服务编排、生命周期管理、IPC 通信与 Cell 调度。本文档详细介绍内核的创建、服务注册、阶段化启动流程，以及与 Cell 生命周期相关的核心 API。

源码位置：`packages/core/src/kernel.ts`

## 创建 Kernel

Ditto 使用显式 `createKernel()` 工厂函数创建内核实例，避免全局单例带来的隐式依赖与测试困难。

```typescript
import { createKernel } from '@ditto/core';

const kernel = createKernel({
  kernel: { id: 'my-kernel', dev: true },  // dev 模式自动授权权限请求
});

// 显式 init 才会触发阶段化启动
await kernel.init();

// ... 使用 kernel ...

// 显式 destroy 逆序清理
await kernel.destroy();
```

::: warning 注意
已移除全局单例 `getKernel()`，所有组件通过依赖注入获取 kernel：

```typescript
import { inject } from 'vue';

const kernel = inject('kernel');
// 或在 app 启动时：
app.provide('kernel', kernel);
```

全局单例会带来以下问题：
- 难以测试（无法 mock）
- 隐式依赖（编译期无法发现）
- 多实例场景不可用（如多窗口、SSR）
:::

## ServiceRegistry 工厂模式

源码：`packages/core/src/service-registry.ts`

ServiceRegistry 替代原本 kernel 上硬挂的成员，采用工厂模式懒创建 —— 首次 `resolve` 才实例化，避免启动期一次性创建所有服务的开销。

### 核心 API

```typescript
export class ServiceRegistry {
  register<T>(id: ServiceId, factory: ServiceFactory<T>): void;
  resolve<T>(id: ServiceId): T;
  async resolveAsync<T>(id: ServiceId): Promise<T>;
  has(id: ServiceId): boolean;
  list(): ServiceId[];
  async shutdown(): Promise<void>;
}
```

### 特性

- **工厂模式**：`ServiceFactory<T> = (ctx: ServiceResolveContext) => T | Promise<T>`，工厂函数接收 `resolve` / `has` 方法，支持服务间依赖
- **懒创建**：实例化后才缓存，未 resolve 的服务不占内存
- **同步/异步工厂**：`resolve` 用于同步工厂，`resolveAsync` 用于返回 Promise 的异步工厂
- **逆序销毁**：`shutdown` 按注册逆序调用每个实例的 `destroy()`，单个 destroy 异常不中断（错误收集后统一 warn）
- **重复注册保护**：同一 id 二次注册抛 `DittoError.serviceAlreadyRegistered`

### 注册示例

```typescript
import type { DittoKernel } from '@ditto/core';
import { registerKernelServices } from '@ditto/services';

const kernel = createKernel({ kernel: { id: 'my-kernel' } });
await kernel.init();

// 注册 8 个 UI 服务（懒创建）
registerKernelServices(kernel);

// 自定义服务
kernel.services.register('my-service', (ctx) => {
  const ipc = ctx.resolve('ipc');          // 通过 ctx 解析依赖
  return new MyService(ipc);
});

// 使用
const svc = kernel.services.resolve<MyService>('my-service');
```

::: tip 工厂函数的依赖注入
工厂函数的 `ctx` 参数提供 `resolve` 与 `has` 方法，使得服务间依赖在工厂内部解析，而非构造期硬绑定。这样可实现：

- 循环依赖安全（懒解析）
- 测试时替换单个服务（mock）
- 服务创建顺序由首次 resolve 触发，与注册顺序解耦
:::

### shutdown 行为

`kernel.destroy()` 内部会调用 `ServiceRegistry.shutdown()`，按注册逆序销毁：

```typescript
async shutdown(): Promise<void> {
  const ids = [...this.instances.keys()].reverse();
  const errors: unknown[] = [];
  for (const id of ids) {
    try {
      await this.instances.get(id)?.destroy?.();
    } catch (err) {
      errors.push(err);
    }
  }
  if (errors.length) {
    console.warn('[ServiceRegistry] shutdown errors:', errors);
  }
}
```

单个服务 `destroy()` 抛错不会中断其他服务的清理，错误统一 warn 输出。

## LifecycleOrchestrator 阶段化启动

源码：`packages/core/src/lifecycle-orchestrator.ts`

阶段化生命周期编排，按固定顺序执行 7 个 stage 的 `onInit`，destroy 时逆序执行 `onDestroy`。

### 阶段顺序

```
storage → events → ipc → permissions → services → cells → ready
```

| Stage | 作用 | 内核默认注册 |
|-------|------|--------------|
| `storage` | 持久化存储就绪 | `PersistenceStore` 已在构造函数创建 |
| `events` | EventEmitter 就绪 | 无额外操作（构造时已创建） |
| `ipc` | IPCBus v2 就绪 | 注册 `ipc` 服务 |
| `permissions` | 权限管理就绪 | 加载持久化权限、注册 `permissions` 服务 |
| `services` | 业务服务就绪 | 注册 `events` / `store` 服务 |
| `cells` | Cell 管理器就绪 | 创建 `AppCellManager`、注册 `cells` 服务 |
| `ready` | 启动完成 | 触发 `kernel:ready` 事件 |

### 关键特性

- **错误隔离**：单个 stage 的 handler 抛错不会中断后续 stage，错误通过 `stage-error` 事件派发
- **逆序销毁**：`destroy` 逆序执行 `onDestroy`，`cells` stage 最先销毁（释放应用资源）
- **可扩展**：通过 `onStage(stage, handler)` 注册自定义阶段逻辑，返回 unsubscribe 函数

### 自定义阶段 handler

```typescript
// 自定义阶段 handler
kernel.lifecycle.onStage('services', {
  onInit: async () => {
    console.log('services stage init');
    await loadExternalData();
  },
  onDestroy: async () => {
    console.log('services stage destroy');
  },
});

// 监听阶段错误
kernel.lifecycle.onStageError((stage, error) => {
  console.error(`Stage ${stage} failed:`, error);
});
```

::: warning 错误隔离的语义
错误隔离指的是「单 stage handler 抛错不中断其他 stage」，并不意味着该 stage 视为成功。如果 `cells` stage 抛错，`AppCellManager` 可能未就绪，后续调用 `kernel.cellManager.startCell(...)` 仍可能失败。建议：

1. 监听 `stage-error` 事件做降级处理
2. 在 `ready` 之前的关键 stage 加 retry 逻辑
3. 不要在 `onInit` 中做不可逆的副作用（除非 stage 成功）
:::

### 启动与关闭顺序对比

```
启动（正序）：
storage → events → ipc → permissions → services → cells → ready

关闭（逆序）：
ready → cells → services → permissions → ipc → events → storage
```

逆序关闭确保依赖关系正确：先释放依赖方（如 Cell），再释放被依赖方（如 IPC、storage）。

## AppCellManager Cell 生命周期

源码：`packages/core/src/app-cell/manager.ts`

AppCellManager 是客户端 Cell 编排器，与服务端 `AppCellManager` 对称，承担应用全生命周期管理。

### 核心职责

- 启动 / 停止 / 暂停 / 恢复 Cell
- 为 dit 类型应用创建 `CellBridge`（WebSocket 桥接）
- 代理 Cell 事件到统一 emitter（`cell:active` / `cell:error` / `cell:stopped`）
- 权限请求委托给 `PermissionManager`

### 启动流程（`startCell`）

1. 检查 appId 是否已 active，已运行则抛 `cellAlreadyRunning`
2. 若是 dit 类型且有 backendCell，创建 `CellBridge` 并通过 WebSocket 连接服务端 `/ws`
3. 创建 `ClientCell`，注入 container、bridge、requestPermission 回调
4. 代理 cell 事件到 manager emitter
5. 调用 `cell.activate()`，触发权限请求 → 沙盒创建 → 挂载 → 状态转换

```typescript
const cell = await kernel.cellManager.startCell(
  'com.ditto.notes',
  manifest,
  { type: 'dit', origin: 'http://localhost:3001', backendCell: true }
);
```

::: tip 与服务端对称
客户端 `AppCellManager` 与服务端 `AppCellManager`（`server/src/services/app-cell/manager.ts`）共享同一份 Cell 生命周期状态机定义（`packages/shared/src/cell-contract.ts`），两端语义完全对称，便于调试与心智模型统一。
:::

更多 Cell 生命周期细节参见 [生命周期](./lifecycle) 与 [Cell 沙盒](./cell)。

## 内核服务一览

内核通过 `DittoKernel.registerStages()` 在各 stage 注册以下服务，可在 `kernel.services` 中 resolve：

| ServiceId | 注册 stage | 实现 | 类型 | 职责 |
|-----------|-----------|------|------|------|
| `ipc` | `ipc` | `IPCBus` | 内核服务 | 跨 Cell 消息传递，严格 origin + 中间件链 |
| `permissions` | `permissions` | `PermissionManager` | 内核服务 | capability-based 权限管理 |
| `events` | `services` | `EventEmitter` | 内核服务 | 命名空间事件 + handler 错误隔离 |
| `store` | `services` | `PersistenceStore` | 内核服务 | 持久化存储 |
| `cells` | `cells` | `AppCellManager` | 内核服务 | Cell 启停/暂停/恢复 |

### 8 个 UI 服务（来自 `packages/services`）

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

::: warning 注册时机
`registerKernelServices(kernel)` 必须在 `kernel.init()` 之后调用，因为 `ServiceRegistry` 在 `init()` 内部才就绪。在 `init()` 之前调用会抛 `kernel-not-ready` 错误。
:::

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

## 关闭流程

`kernel.destroy()` 触发以下清理步骤，按依赖逆序执行：

1. `LifecycleOrchestrator.destroy()` 逆序执行各 stage `onDestroy`（cells 最先）
2. `ServiceRegistry.shutdown()` 逆序调用每个实例 `destroy()`
3. `IPCBus.destroy()` 清理 bridge、pending request、handlers
4. `EventEmitter.removeAllListeners()`
5. 状态转为 `destroyed`

::: danger destroy 是幂等的
重复调用 `kernel.destroy()` 不会重复执行清理逻辑。第二次调用会直接返回，因为状态已为 `destroyed`。但建议应用层通过 `try/finally` 确保只调用一次。
:::

### 关闭顺序详解

```
ready    → 移除 kernel:ready 监听
cells    → 停止所有 ClientCell、断开 CellBridge
services → 释放 UI 服务（Pinia store dispose）
permissions → 保存未持久化的权限决策
ipc      → 清理 bridge、reject 所有 pending request
events   → removeAllListeners
storage  → 关闭 PersistenceStore
```

::: tip 优雅关闭的最佳实践
- 应用卸载前显式调用 `await kernel.destroy()`
- 监听 `beforeunload` 事件做最后清理
- 在 SPA 路由切换时无需 destroy（kernel 与路由解耦）
:::

## 相关文档

- [架构概览](./)
- [Cell 沙盒](./cell)
- [IPC 通信](./ipc)
- [权限系统](./permission)
- [生命周期](./lifecycle)
- [开发指南 - SDK 参考](/development/sdk)
