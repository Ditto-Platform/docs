---
title: 开发指南
description: Ditto 第三方应用开发总览 — 应用类型、开发流程、SDK、CLI 与调试技巧的统一入口。
---

# 开发指南

Ditto 提供完整的应用开发链路：从 CLI 脚手架初始化项目，到 manifest 声明权限与窗口，再到 SDK 调用系统能力，最终打包为 `.dit` 文件发布安装。本章节将带你走完整个流程。

## 应用开发流程

一个典型 Ditto 应用的开发流程如下：

```text
┌─────────────┐    ┌──────────────┐    ┌──────────────┐    ┌────────────┐    ┌──────────────┐
│ ditto init  │ →  │ 编写 manifest │ →  │ 开发前端/后端 │ →  │ ditto pack │ →  │ ditto install│
└─────────────┘    └──────────────┘    └──────────────┘    └────────────┘    └──────────────┘
                                                                │
                                                                ▼
                                                        ┌──────────────────┐
                                                        │ ditto validate   │
                                                        │ ditto verify     │
                                                        └──────────────────┘
```

1. **初始化项目**：使用 `ditto init` 生成 manifest 与目录骨架
2. **声明 manifest**：配置应用元信息、权限、窗口、后端 Cell
3. **开发前端**：Vue / React / Vanilla 均可，通过 `@ditto/sdk` 调用系统能力
4. **开发后端（可选）**：实现 `AppCellModule` 接口，TypeScript + Bun 运行
5. **本地调试**：`ditto dev` 或 Vite dev server + Bun `--watch`
6. **打包**：`ditto pack` 生成 `.dit` / `.ditx` / `.ditc` / `.ditz`
7. **校验与签名验证**：`ditto validate` + `ditto verify`
8. **安装**：`ditto install` 或手动放入 `server/data/apps/`

## 应用类型对比

Ditto 中存在两个相互独立的 `type` 概念，开发者需要区分清楚：

### 维度一：AppManifest.type — 应用分类

声明在 `manifest.json` 中，决定打包扩展名、UI 呈现方式与权限默认值。

| 类型 | 说明 | 打包扩展名 | 典型场景 |
|------|------|-----------|---------|
| `app` | 普通应用（默认） | `.dit` | 文件管理器、终端、编辑器 |
| `widget` | 桌面小组件 | `.ditx` | 时钟、天气、系统监视 |
| `plugin` | 后台插件（无独立窗口） | `.ditc` | 剪贴板增强、输入法 |
| `theme` | 主题包 | `.ditz` | Nord / Forest / Ocean |
| `dit` | 前后端对称 Cell 应用 | `.dit` | 需要后端逻辑的应用（如协作计数器） |

::: tip 关于 dit 类型
`dit` 是 `app` 的超集：拥有前端 + 后端 Cell，运行时通过 `CellRuntimeConfig.type='dit'` 激活后端桥接。打包扩展名与 `app` 相同（`.dit`）。
:::

### 维度二：CellRuntimeConfig.type — 运行时沙盒类型

Shell 在启动 Cell 时根据运行时配置选择沙盒模式：

| 类型 | 说明 | 沙盒模式 | 后端 Cell | 典型场景 |
|------|------|---------|---------|---------|
| `native` | Vue 组件，shell 信任 | `shadow-trusted` | 否 | 内置应用（Settings、FileManager） |
| `web` | 远程 URL，iframe 加载 | `iframe-strict` | 否 | 现有 Web 应用接入 |
| `pwa` | PWA manifest 驱动 | `iframe-strict` | 否 | PWA 应用 |
| `dit` | 前后端对称 Cell | `iframe-strict` | 是 | 需要后端逻辑的应用（笔记、协作） |

::: warning 两个 type 的关系
`manifest.type='dit'` 的应用通常以 `CellRuntimeConfig.type='dit'` 启动（由 Shell 根据 `backend.type==='cell'` 推断），但二者维度不同 — `manifest.type` 描述"这是什么应用"，`CellRuntimeConfig.type` 描述"这个应用在什么沙盒里运行"。
:::

**推荐**：需要后端逻辑的新应用优先选择 `dit` 类型（manifest 与运行时均为 dit），可同时获得前后端能力与 Ditto 完整生态支持。

## 章节导航

| 文档 | 内容 | 适合人群 |
|------|------|---------|
| [第三方应用开发](/development/third-party) | 应用类型、manifest.json 规范、`.dit` 打包格式、`com.ditto.todo` 完整示例 | 首次开发应用 |
| [SDK 参考](/development/sdk) | 9 个 Vue 3 composable 的完整 API 签名表与用法 | 前端开发 |
| [CLI 脚手架](/development/cli) | `ditto init` / `pack` / `install` / `validate` / `verify` / `dev` | 工程化 |
| [调试技巧](/development/debugging) | dev 模式、Vite 代理、Cell 调试、DevTools、错误码、后端 Cell 开发、权限声明 | 排查问题 |

## 快速决策

::: tip 我应该从哪里开始？
- **想跑一个最小示例** → [第三方应用开发](/development/third-party) 的「完整示例应用」章节，从零创建 `com.ditto.todo`
- **想知道某个 SDK 方法怎么用** → [SDK 参考](/development/sdk)
- **想用命令行打包安装** → [CLI 脚手架](/development/cli)
- **应用跑不起来 / 报错码看不懂** → [调试技巧](/development/debugging)
:::

## 相关文档

- [核心概念 — Cell 沙盒](/concepts/cell)
- [核心概念 — IPC 通信](/concepts/ipc)
- [核心概念 — 权限系统](/concepts/permission)
- [核心概念 — 生命周期](/concepts/lifecycle)
- [第三方应用开发](/development/third-party)
- [SDK 参考](/development/sdk)
- [CLI 脚手架](/development/cli)
- [调试技巧](/development/debugging)
