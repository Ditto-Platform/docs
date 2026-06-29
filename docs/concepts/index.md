---
title: 架构概览
description: Ditto WebOS 内核架构总览、子系统目录结构、客户端与服务端对称关系表，以及核心概念导航。
---

# 架构概览

DittoKernel 是以 Cell 为中心的服务编排器，把浏览器变成一个真正的操作系统。本章节介绍 Ditto WebOS 的核心架构与设计理念，并引导你深入了解各子系统。

## 架构总览

DittoKernel 由以下子系统组成，每个子系统职责单一、可独立演进：

```
DittoKernel
├── ServiceRegistry        # 服务注册表，工厂模式懒创建
├── LifecycleOrchestrator  # 阶段化 init/destroy，每阶段错误隔离
├── IPCBus (v2)            # 能力路由 + 严格 origin + 中间件链
├── AppCellManager         # 客户端 Cell 编排器（替代 PluginLoader + AppRuntime）
│   └── ClientCell[]       # 与服务端 CellInstance 对称
│       ├── CellSandbox    # 统一沙盒接口（IFrame / Shadow / Worker）
│       ├── CellBridge     # 与服务端 CellInstance 的 IPC 桥接（WS）
│       └── CellLifecycle  # load → activate → pause → resume → unload
├── PermissionManager (v2) # capability-based 细粒度权限
├── EventEmitter           # 命名空间事件 + 错误隔离
└── PersistenceStore       # 持久化存储
```

源码位置：`packages/core/src/kernel.ts`

::: tip 三层架构
从外部视角看，Ditto 是经典三层结构：

```
┌─────────────────────────────────────────────────┐
│                   Shell (Vue)                    │
│  ┌─────────┬─────────┬─────────┬──────────────┐ │
│  │ Desktop │ Taskbar │ Window  │ StartMenu    │ │
│  └─────────┴─────────┴─────────┴──────────────┘ │
├─────────────────────────────────────────────────┤
│                   Kernel (Core)                  │
│  ┌─────────┬─────────┬─────────┬──────────────┐ │
│  │ Service │ IPCBus  │ CellMgr │ Permission   │ │
│  │ Registry│         │         │ Manager      │ │
│  └─────────┴─────────┴─────────┴──────────────┘ │
├─────────────────────────────────────────────────┤
│                   Server (Hono)                  │
│  ┌─────────┬─────────┬─────────┬──────────────┐ │
│  │ Market  │ AppCell │ VFS     │ WebSocket    │ │
│  │ Service │ Router  │ Service │ Gateway      │ │
│  └─────────┴─────────┴─────────┴──────────────┘ │
└─────────────────────────────────────────────────┘
```
:::

## 与服务端对称关系

Ditto 的核心创新之一是「客户端-服务端对称 Cell 架构」。下表展示了两端对应模块与共享契约：

| 服务端 | 客户端 | 共享契约 |
|--------|--------|----------|
| `AppCellManager`（`server/src/services/app-cell/manager.ts`） | `AppCellManager`（`packages/core/src/app-cell/manager.ts`） | Cell 生命周期状态机 |
| `CellInstanceImpl` | `ClientCell` | `CellContext`、`CellStatus` |
| `CellMembrane` | `CellSandbox` | `Sandbox` 接口 |
| `CellIPCBridge` | `CellBridge` | `IPCMessage` 协议 |
| `CellRouter` | `IPCBus` 能力路由 | `IPCMessage.target` 路由规则 |
| `CellContext` | `CellContext`（client 简化版） | 用户隔离的存储/日志 |

共享契约定义在 `packages/shared/src/cell-contract.ts`，两端各自实现，保证心智模型统一。

## 设计理念

### 1. 安全隔离

第三方应用运行在受限沙盒中，无法直接访问系统资源，所有操作需通过 IPC 请求，并由权限系统管控。详见 [Cell 沙盒](./cell) 与 [权限系统](./permission)。

### 2. 前后端对称

每个应用可有前端（UI）和后端（Cell），通过 IPC Bridge 通信，支持协作、实时同步等场景。详见 [Cell 沙盒](./cell) 与 [IPC 通信](./ipc)。

### 3. 性能优先

动画分级、RAF throttling、输入 debounce，确保低性能设备流畅运行。

### 4. 兼容性优先

通过 polyfill.ts 注入兼容代码，支持 Chrome 80 等老旧浏览器。

## 板块导航

本章节包含以下 5 个子文档，建议按顺序阅读：

| 板块 | 描述 | 关键内容 |
|------|------|----------|
| [Kernel 架构](./kernel) | 系统内核与服务编排 | `createKernel` 工厂、`ServiceRegistry` 懒创建、`LifecycleOrchestrator` 阶段化、`AppCellManager` |
| [Cell 沙盒](./cell) | 应用隔离与运行环境 | 客户端-服务端对称架构、`ClientCell` 4 种类型、`CellBridge`、三档沙盒安全模型 |
| [IPC 通信](./ipc) | 跨 Cell 消息传递 | `IPCBus` v2 关键变更、`IPCMessage` 协议、中间件链（onion 模式）、错误隔离 |
| [权限系统](./permission) | 权限申请与管理 | capability-based 设计、dev/prod 模式、持久化、API |
| [生命周期](./lifecycle) | 应用启动/停止/暂停流程 | 客户端状态机、`TRANSITIONS` 转换表、服务端冬眠机制、服务编排 |

::: info 阅读建议
- 初次接触 Ditto 的开发者：先读本页 → [Kernel 架构](./kernel) → [Cell 沙盒](./cell)
- 关注安全的开发者：直接看 [Cell 沙盒](./cell) 与 [权限系统](./permission)
- 关注运行时行为的开发者：重点阅读 [生命周期](./lifecycle) 与 [IPC 通信](./ipc)
:::

## 源码导航

核心源码位于主仓库的 `packages/core` 与 `packages/shared`：

| 子系统 | 源码路径 |
|--------|----------|
| Kernel 入口 | `packages/core/src/kernel.ts` |
| ServiceRegistry | `packages/core/src/service-registry.ts` |
| LifecycleOrchestrator | `packages/core/src/lifecycle-orchestrator.ts` |
| AppCellManager | `packages/core/src/app-cell/manager.ts` |
| ClientCell | `packages/core/src/app-cell/cell.ts` |
| CellBridge | `packages/core/src/app-cell/bridge.ts` |
| Cell 生命周期 | `packages/core/src/app-cell/lifecycle.ts` |
| 沙盒 | `packages/core/src/sandbox/index.ts` |
| iframe 沙盒 | `packages/core/src/sandbox/iframe-sandbox.ts` |
| Shadow 沙盒 | `packages/core/src/sandbox/shadow-sandbox.ts` |
| IPCBus | `packages/core/src/ipc/bus.ts` |
| PermissionManager | `packages/core/src/permission/manager.ts` |
| 共享契约 | `packages/shared/src/cell-contract.ts` |
| UI 服务注册 | `packages/services/src/register.ts` |
| 服务端 CellInstance | `server/src/services/app-cell/cell-instance.ts` |
| 服务端 AppCellManager | `server/src/services/app-cell/manager.ts` |

## 相关文档

- [Kernel 架构](./kernel)
- [Cell 沙盒](./cell)
- [IPC 通信](./ipc)
- [权限系统](./permission)
- [生命周期](./lifecycle)
- [快速开始](/quick-start/)
- [开发指南](/development/)
