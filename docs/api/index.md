---
title: API 参考
description: Ditto WebOS API 总览，涵盖前端 TypeScript API（Kernel / ServiceRegistry / AppCellManager / ClientCell / CellBridge / PermissionManager / IPCBus / EventEmitter）与服务端 HTTP + WebSocket API。
outline: [2, 3]
---

# API 参考

Ditto WebOS 提供两套互补的 API，分别面向**前端运行时**与**服务端接入**。本章节是它们的总入口，也是一份严谨的参考手册。

## API 类型一览

| 类型 | 协议 / 形态 | 运行位置 | 主要用途 |
|------|------------|----------|----------|
| 前端 API | TypeScript SDK / Kernel | 浏览器（Shell 与 Cell 内部） | 内核控制、服务编排、Cell 生命周期、IPC 通信、权限管理 |
| 服务端 API | HTTP + WebSocket | Ditto Server（默认 `:3001`） | 应用安装、注册表、市场、认证、Cell 后端代理、VFS、限流配额 |

::: tip 何时用哪一套
- 在 Shell 或系统应用代码中操作内核、启动 Cell、收发 IPC → 使用[前端 API](./client)
- 通过命令行、外部脚本或移动端访问 Ditto → 调用[服务端 API](./server)
- 撰写 manifest、声明权限、约束 Cell 运行时类型 → 查阅[类型定义](./types)
:::

## 板块导航

| 板块 | 内容要点 |
|------|----------|
| [前端 API 参考](./client) | `createKernel`、`DittoKernel`、`ServiceRegistry`、`AppCellManager`、`ClientCell`、`CellBridge`、`PermissionManager`、`IPCBus`、`EventEmitter` 及内核事件一览 |
| [服务端 API 参考](./server) | 基础信息、认证、`/api/apps`、`/api/app-registry`、`/api/market`、`/api/auth`、`/api/admin`、`/api/proxy`、`/api/vfs`、`/api/cell`、`/ws`、错误响应、资源配额与限流 |
| [类型定义](./types) | `AppManifest`、`ThemeTokens`、`Capability`、`CellRuntimeConfig`、`CellEvent`、`IPCMessage` 与错误码一览 |

## 阅读约定

- 所有 TypeScript 签名均直接来自 `packages/core`、`packages/shared`、`packages/server` 的源码，标注了对应源文件路径。
- 标注 `异步` 的方法返回 `Promise`，需要 `await`。
- 表格中"认证"列：`否` 表示公开端点，`Authorization` / `X-User-Id` / `X-Session-Id` 表示所需凭证类型。
- 文档中 `*` 代表路径通配（如 `/api/vfs/read/*`），`:` 代表路径参数（如 `/:appId`）。

::: warning 版本对齐
本参考手册与 Ditto 主仓库 `docs/api-reference.md` 与 `docs/server-api.md` 同步。如发现行为与文档不一致，请以源码为准并提交 Issue 修订文档。
:::

## 相关文档

- [核心概念 — Kernel 架构](/concepts/kernel)
- [核心概念 — Cell 沙盒](/concepts/cell)
- [核心概念 — IPC 通信](/concepts/ipc)
- [核心概念 — 权限系统](/concepts/permission)
- [开发指南 — SDK 参考](/development/sdk)
