---
title: 快速开始
description: Ditto WebOS 项目介绍、核心特性、系统要求与快速安装步骤，几分钟内把浏览器变成一个真正的操作系统。
---

# 快速开始

欢迎使用 **Ditto WebOS** —— 一个把浏览器变成真正操作系统的开源 Web 端 OS 框架。

## 项目介绍

Ditto WebOS 是一个基于 Web 技术构建的操作系统框架，专为教育、企业演示和低性能设备设计。它以 **Cell** 为中心采用前后端对称架构：前端 `ClientCell` 与后端 `CellInstance` 通过 `CellBridge`（WebSocket + HTTP）双向通信，配合 `ServiceRegistry` 服务编排、阶段化生命周期、capability-based 权限系统、严格 origin 沙盒与 `IPCBus v2` 中间件链，构成一个完整、安全、可扩展的 Web 操作系统。

通过 `.dit` 打包格式、SDK（9 个 composable）与 CLI 脚手架，Ditto 构建出完整的第三方应用生态。无论是树莓派、老旧 PC，还是最新的桌面浏览器，Ditto 都能流畅运行。

::: tip 适用场景
- **教育场景**：机房批量部署、Kiosk 模式、低动效模式适配老旧设备
- **企业演示**：快速搭建专属 WebOS 桌面环境
- **低性能设备**：树莓派、Chrome 80 老旧浏览器均可流畅运行
- **应用开发**：基于完整 SDK 与 CLI 的第三方应用生态
:::

## 核心特性

| 特性 | 说明 |
|------|------|
| ⚡ **轻量高效** | 支持 Chrome 80+ 及更低版本浏览器，在树莓派等低性能设备上流畅运行。动画可分级控制（none / subtle / normal / expressive），确保最佳性能体验。 |
| 🌐 **Chrome 80 兼容** | 通过 `@vitejs/plugin-legacy` 适配 Chrome 78+ / Firefox 72+ / Safari 13+，`build.target` 降至 `es2015`、`cssTarget` 降至 `chrome78`，自带 flex-gap polyfill。 |
| 🍓 **树莓派友好** | 桌面 / 平板 / 手机三档响应式断点（768 / 1024 / 1280），触控手势支持，资源占用极低。 |
| 🎓 **教育场景优化** | 一键切换低动效模式，Kiosk 锁定，多用户管控，机房批量部署脚本。 |
| 🔐 **Cell 架构** | 前后端对称 Cell 沙盒，IPC 通信，权限管理。支持 `iframe-strict`、`worker`、`trusted` 多种隔离模式，确保应用安全运行。 |
| 🎨 **深度定制** | ThemeEngine 基于 CSS 变量驱动，主题系统、动画档位、默认应用关联、全局快捷键，运行时切换、组件级 override。 |
| 📦 **完整生态** | 内置 9 个系统应用 + 应用市场 + CLI 脚手架。第三方应用开发 SDK，轻松扩展系统功能。 |
| 📱 **PWA 支持** | `vite-plugin-pwa` autoUpdate 模式，Workbox 缓存静态资源与 Google Fonts，离线可用，可独立安装。 |

## 系统要求

### 开发环境

| 项目 | 最低版本 | 推荐版本 | 说明 |
|------|---------|---------|------|
| Node.js | 20.0.0 | 20 LTS / 22 LTS | 前端构建、CLI、packager 运行时 |
| pnpm | 9.0.0 | 9.15.0 | monorepo 包管理（`packageManager` 字段固定为 `pnpm@9.15.0`） |
| Bun | 最新稳定版 | ≥ 1.1 | server 运行时（`bun run --watch src/index.ts`） |
| Git | 2.20+ | 最新版 | 克隆仓库与版本管理 |

### 浏览器支持

| 浏览器 | 最低版本 | 备注 |
|--------|---------|------|
| Chrome / Edge | 80+ | 推荐 90+，完整支持 PWA |
| Firefox | 75+ | 推荐 90+ |
| Safari | 13+ | 推荐 15+ |
| 移动端 Chrome / Safari | 最新版 | 响应式布局自动适配 |

### 设备要求

| 设备类型 | 最低配置 | 推荐配置 |
|---------|---------|---------|
| 桌面 PC | 2 GB RAM / 双核 CPU | 4 GB RAM / 四核 CPU |
| 笔记本 | 2 GB RAM | 4 GB RAM |
| 树莓派 | Pi 3B+ / 1 GB RAM | Pi 4 / 2 GB RAM |
| 屏幕 | ≥ 320px 宽度 | ≥ 1280px 宽度 |

::: tip 低性能设备支持
Ditto 在树莓派、老旧 PC 上也能流畅运行，只需将动画档位设置为「关闭」或「微妙」。详见 [部署运维 - 教育场景](/deployment/education)。
:::

## 快速安装

只需 4 步即可在本地启动 Ditto WebOS。

### 1. 克隆仓库

```bash
git clone https://github.com/Nevino2333/Ditto.git
cd Ditto
```

::: tip 网络问题
国内用户若访问 GitHub 较慢，可使用镜像：
```bash
git clone https://ghproxy.com/https://github.com/Nevino2333/Ditto.git
```
:::

### 2. 安装依赖

Ditto 使用 pnpm 作为 monorepo 包管理工具：

```bash
pnpm install
```

此命令会安装 `packages/*`、`apps/*`、`server` 三个 workspace 的全部依赖。首次安装约需 1-3 分钟。

::: warning Node 版本
请确保 Node.js ≥ 20，否则部分依赖将无法安装。可使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 切换版本：
```bash
nvm install 20
nvm use 20
```
:::

### 3. 启动后端 Server

Ditto 需要同时启动后端 server（端口 3001）与前端 shell（端口 3000）。打开第一个终端：

```bash
cd server
bun run --watch src/index.ts
```

::: info Bun 安装
若未安装 Bun，请参考 [Bun 官方文档](https://bun.sh/docs/installation)：
```bash
# macOS / Linux
curl -fsSL https://bun.sh/install | bash

# Windows (PowerShell)
powershell -c "irm bun.sh/install.ps1|iex"
```
:::

### 4. 启动前端 Shell

打开第二个终端：

```bash
cd apps/shell
pnpm dev
```

::: tip 一键启动
也可以在项目根目录使用 turbo 一键启动全部 dev 任务（turbo 会并行调度所有 workspace 的 `dev` script）：
```bash
pnpm dev
```
:::

## 访问应用

启动成功后，Vite 会自动打开浏览器。若未自动打开，请手动访问：

- **前端 Shell**：<http://localhost:3000>
- **后端 Server API**：<http://localhost:3001>
- **WebSocket**：`ws://localhost:3001/ws`

::: tip API 代理
Vite dev server 已配置代理，`/api` 与 `/ws` 请求会自动转发到 `http://localhost:3001`，无需额外 CORS 处理。
:::

启动成功后，你将看到 Ditto 桌面环境，包含任务栏、开始菜单、桌面图标与系统托盘。

## 下一步

- [安装](/quick-start/installation) - 完整环境准备、依赖安装、构建与部署指南
- [基本使用](/quick-start/basic-usage) - 系统界面介绍、核心操作、内置应用与快捷键
- [核心概念](/concepts/) - 深入理解 Kernel、Cell、IPC、权限系统
- [开发指南](/development/) - 第三方应用开发、SDK、CLI 脚手架
- [部署运维](/deployment/) - 生产部署、教育场景、配置项
