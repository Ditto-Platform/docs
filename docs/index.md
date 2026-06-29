---
layout: home

hero:
  name: Ditto
  text: WebOS
  tagline: 开源 · 轻量 · 易于定制 —— 支持 Chrome 80、树莓派、教育场景的 Web 端操作系统
  image:
    src: /logo.png
    alt: Ditto WebOS
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /quick-start/
    - theme: alt
      text: 📦 安装部署
      link: /quick-start/installation
    - theme: alt
      text: 📖 使用指南
      link: /quick-start/basic-usage
    - theme: alt
      text: GitHub
      link: https://github.com/Nevino2333/Ditto

features:
  - icon: ⚡
    title: 轻量高效
    details: 支持 Chrome 80 及更低版本浏览器，在树莓派等低性能设备上流畅运行。动画可分级控制（none / subtle / normal / expressive），确保最佳性能体验。
    link: /quick-start/installation
    linkText: 安装部署 →
  - icon: 🌐
    title: Chrome 80 兼容
    details: 通过 @vitejs/plugin-legacy 适配 Chrome 78+ / Firefox 72+ / Safari 13+，build.target 降至 es2015、cssTarget 降至 chrome78，自带 flex-gap polyfill。
    link: /deployment/education
    linkText: 教育场景 →
  - icon: 🔐
    title: Cell 架构
    details: 前后端对称 Cell 沙盒，ClientCell ↔ CellInstance 通过 CellBridge 双向通信，IPC 通信，权限管理。支持 iframe-strict、worker、trusted 多种隔离模式，确保应用安全运行。
    link: /concepts/cell
    linkText: 了解架构 →
  - icon: 🎨
    title: 深度定制
    details: ThemeEngine 基于 CSS 变量驱动，主题系统、4 档动画预设、默认应用关联、全局快捷键，运行时切换、组件级 override，满足教育与企业场景需求。
    link: /ui/theme
    linkText: 主题定制 →
  - icon: 📦
    title: 完整生态
    details: 内置 9 个系统应用 + 应用市场 + CLI 脚手架。第三方应用开发 SDK（9 个 composable），.dit 打包格式支持 AES-256-GCM 加密与 Ed25519 签名，轻松扩展系统功能。
    link: /development/third-party
    linkText: 应用开发 →
  - icon: 🛡️
    title: 安全沙盒
    details: iframe-strict 隔离、PermissionManager 权限申请、交互式权限确认对话框。capability-based 权限系统提供 11+ 细粒度能力（fs:read、net:fetch 等），dev 模式自动授权、生产模式默认拒绝并可持久化。
    link: /concepts/permission
    linkText: 权限系统 →
---

## 快速导航

| 板块 | 描述 | 链接 |
|------|------|------|
| 🚀 快速开始 | 安装、启动、基本使用 | [进入](/quick-start/) |
| 🧠 核心概念 | Kernel、Cell、IPC、权限系统、生命周期 | [进入](/concepts/) |
| 🛠 开发指南 | 第三方应用开发、SDK、CLI、调试技巧 | [进入](/development/) |
| 🚢 部署运维 | 生产部署、教育场景、配置项、监控运维 | [进入](/deployment/) |
| 📡 API 参考 | 服务端 API、前端 API、类型定义 | [进入](/api/) |
| 🎨 UI & 主题 | UI 组件库、主题定制、图标系统 | [进入](/ui/) |

## 为什么选择 Ditto？

Ditto 是一个面向 Web 的开源操作系统，专为教育、企业演示和低性能设备设计。它把浏览器变成一个真正的操作系统：以 **Cell** 为中心的对称架构，前端 `ClientCell` 与后端 `CellInstance` 通过 `CellBridge` 双向通信；内置 ServiceRegistry 服务编排、阶段化生命周期、capability-based 权限系统、严格 origin 沙盒、IPCBus v2 中间件链；并通过 `.dit` 打包格式、SDK 与 CLI 构建完整的第三方应用生态。

### 核心优势

- **兼容性优先**：支持 Chrome 80，覆盖老旧设备，通过 `@vitejs/plugin-legacy` 自动降级
- **性能优化**：在树莓派上流畅运行，动画可分级控制，4 档动画预设适配各种设备
- **安全沙盒**：第三方应用运行在 `iframe-strict` 隔离环境中，权限需用户确认
- **易于定制**：主题、壁纸、默认应用、动画档位均可自定义，CSS 变量驱动无闪烁切换
- **完整生态**：9 个内置系统应用 + 应用市场 + 9 个 SDK composable + CLI 脚手架
- **跨设备响应式**：桌面 / 平板 / 手机三档断点（768 / 1024 / 1280），支持触控手势
- **PWA 离线**：`vite-plugin-pwa` autoUpdate 模式，Workbox 缓存静态资源，可独立安装

### 技术栈

| 层级 | 技术 |
|------|------|
| **前端框架** | Vue 3.5+（`<script setup>` + Composition API） |
| **状态管理** | Pinia 2.2+ |
| **构建工具** | Vite 6.0+ + `@vitejs/plugin-vue` + `@vitejs/plugin-legacy` |
| **PWA** | `vite-plugin-pwa` 1.2+（Workbox autoUpdate） |
| **语言** | TypeScript 5.7+（strict mode） |
| **后端运行时** | Bun（最新版） |
| **后端框架** | Hono 4.7+ |
| **WebSocket** | Bun 原生 `Bun.serve` upgrade |
| **monorepo** | pnpm workspace + turbo 2.4+ |
| **测试** | vitest 3.0+ + happy-dom |

### 适用场景

- 🎓 **教育场景**：机房批量部署、Kiosk 模式、低动效模式适配老旧设备、多用户管控
- 🏢 **企业演示**：快速搭建专属 WebOS 桌面环境，定制品牌主题
- 🍓 **低性能设备**：树莓派、老旧 PC、Chrome 80 浏览器均可流畅运行
- 🛠 **应用开发**：基于完整 SDK 与 CLI 的第三方应用生态，9 个 composable 一站式调用系统能力
- 🎨 **创意原型**：完整桌面环境作为 Web 应用原型展示

## 快速开始

只需 4 步即可在本地启动 Ditto WebOS：

```bash
# 1. 克隆仓库
git clone https://github.com/Nevino2333/Ditto.git
cd Ditto

# 2. 安装依赖
pnpm install

# 3. 启动后端 server（端口 3001）
cd server
bun run --watch src/index.ts

# 4. 启动前端 shell（端口 3000，新开终端）
cd apps/shell
pnpm dev
```

启动后访问 <http://localhost:3000> 即可看到 Ditto 桌面环境。

::: tip 完整指南
详细安装步骤、生产构建、常见问题请参考 [安装指南](/quick-start/installation)。
:::

## 获取帮助

- 📌 **[GitHub Issues](https://github.com/Nevino2333/Ditto/issues)** — 提交 Bug 报告或功能建议
- 💬 **[GitHub Discussions](https://github.com/Nevino2333/Ditto/discussions)** — 讨论与问答
- 📖 **[官方文档](/quick-start/)** — 完整使用与开发指南
- 🔌 **[第三方应用开发](/development/third-party)** — SDK、CLI、.dit 打包
- 🎨 **[主题定制](/ui/theme)** — ThemeEngine、CSS 变量、组件 override

## 社区与贡献

Ditto 是一个开源项目，欢迎社区贡献：

1. Fork 仓库并创建特性分支：`git checkout -b feature/your-feature`
2. 遵循 TypeScript strict 模式与现有代码风格
3. 为新功能补充 vitest 测试（参考 `packages/core/src/__tests__/`）
4. 提交前执行 `pnpm test` 与 `pnpm build` 确保通过
5. 提交信息使用 conventional commits（`feat:` / `fix:` / `docs:` / `refactor:`）
6. 发起 Pull Request 并关联 issue

::: info 许可证
Ditto WebOS 基于 [MIT 协议](https://github.com/Nevino2333/Ditto/blob/main/LICENSE) 开源，可自由使用、修改、分发。
:::
