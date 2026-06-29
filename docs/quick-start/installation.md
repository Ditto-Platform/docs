---
title: 安装
description: Ditto WebOS 完整安装指南，包含前置依赖、克隆仓库、安装依赖、启动后端 server 与前端 shell、turbo 一键启动、测试与构建命令、常见问题与开发模式特性。
---

# 安装

本页面介绍 Ditto WebOS 的完整安装与启动流程，覆盖开发模式、生产构建、测试验证与常见问题排查。

## 前置依赖

Ditto 采用 monorepo 架构，前端基于 Vite + Vue 3，后端基于 Bun + Hono。请确保已安装以下工具：

### 依赖清单

| 工具 | 最低版本 | 推荐版本 | 用途 | 安装命令 |
|------|---------|---------|------|---------|
| **Node.js** | 20.0.0 | 20 LTS / 22 LTS | 前端构建、CLI、packager 运行时 | [nodejs.org](https://nodejs.org/) |
| **pnpm** | 9.0.0 | 9.15.0 | monorepo 包管理（`packageManager` 字段固定为 `pnpm@9.15.0`） | `npm install -g pnpm@9.15.0` |
| **Bun** | 1.1 | 最新稳定版 | server 运行时 | [bun.sh](https://bun.sh/) |
| **Git** | 2.20+ | 最新版 | 克隆仓库与版本管理 | [git-scm.com](https://git-scm.com/) |

::: warning 版本严格性
- Node.js 必须 ≥ 20，`package.json` 中 `engines.node` 字段已锁定
- pnpm 推荐 9.15.0，避免依赖解析冲突
- Bun 必须单独安装，server 启动脚本依赖 `bun run --watch`
:::

### 安装 Node.js 与 pnpm

:::: details Windows 系统
1. 从 [Node.js 官网](https://nodejs.org/) 下载 LTS 安装包（推荐 20 LTS）
2. 安装后打开 PowerShell 验证：
   ```powershell
   node -v   # 应输出 v20.x.x
   npm -v
   ```
3. 启用 pnpm：
   ```powershell
   npm install -g pnpm@9.15.0
   pnpm -v    # 应输出 9.15.0
   ```
::::

:::: details macOS 系统
推荐使用 [Homebrew](https://brew.sh/)：
```bash
brew install node@20
npm install -g pnpm@9.15.0
```

或使用 [nvm](https://github.com/nvm-sh/nvm)：
```bash
nvm install 20
nvm use 20
nvm alias default 20
npm install -g pnpm@9.15.0
```
::::

:::: details Linux 系统
```bash
# Node.js (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# pnpm
npm install -g pnpm@9.15.0
```
::::

### 安装 Bun

Bun 是 Ditto 后端 server 的运行时，提供 `--watch` 热重载能力。

:::: details macOS / Linux
```bash
curl -fsSL https://bun.sh/install | bash
```
::::

:::: details Windows (PowerShell)
```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```
::::

安装完成后，请重启终端并验证：

```bash
bun --version    # 应输出 1.x.x
```

## 克隆仓库

```bash
git clone https://github.com/Nevino2333/Ditto.git
cd Ditto
```

::: tip 镜像加速
国内用户若访问 GitHub 较慢，可使用镜像加速：
```bash
# ghproxy 镜像
git clone https://ghproxy.com/https://github.com/Nevino2333/Ditto.git

# 或 gitclone 镜像
git clone https://gitclone.com/github.com/Nevino2333/Ditto.git
```
:::

仓库结构如下（节选）：

```
Ditto/
├── packages/          # 共享包（pnpm workspace）
│   ├── shared/        # 共享类型、配置、常量
│   ├── core/          # 内核：ServiceRegistry / LifecycleOrchestrator / AppCellManager / ClientCell / CellBridge / IPCBus / PermissionManager / Sandbox
│   ├── ui/            # Vue 3 UI 组件库
│   ├── services/      # Pinia 服务包
│   ├── theme/         # 主题引擎
│   ├── sdk/           # 第三方应用 SDK
│   ├── adapter/       # 移动端适配
│   ├── packager/      # .dit 打包/解包/加密/签名
│   └── cli/           # CLI 脚手架
├── apps/
│   └── shell/         # 桌面环境（Vue 3 + Vite + PWA）
├── server/            # Bun + Hono 后端
├── test-apps/         # 示例应用
├── Ditto_Market/     # 应用市场数据
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## 安装依赖

Ditto 使用 pnpm workspace 管理 monorepo，根目录 `pnpm-workspace.yaml` 声明了 `packages/*`、`apps/*`、`server` 三个 workspace：

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
  - 'server'
```

在项目根目录执行：

```bash
pnpm install
```

此命令会一次性安装所有 workspace 的依赖，并自动建立 workspace 内部 `workspace:*` 链接。首次安装约需 1-3 分钟，取决于网络速度。

::: tip 验证安装
```bash
# 查看是否成功建立 workspace 链接
ls -la packages/ui/node_modules/@ditto    # 应为软链接
ls -la apps/shell/node_modules/@ditto      # 应为软链接
```
:::

::: warning 常见问题
- **`ERR_PNPM_PEER_DEP_ISSUES`**：可尝试 `pnpm install --strict-peer-dependencies=false`
- **Node 版本不匹配**：请确保 `node -v` ≥ 20
- **网络问题**：可配置 `.npmrc` 使用淘宝镜像：
  ```ini
  registry=https://registry.npmmirror.com
  ```
:::

## 启动后端 Server

Ditto 需要同时启动后端 server（端口 3001）与前端 shell（端口 3000）。打开第一个终端：

```bash
cd server
bun run --watch src/index.ts
```

::: info 关于 Bun
- `--watch` 标志会在源码变更时自动重启 server
- server 基于 [Hono](https://hono.dev/) 框架，提供 RESTful API 与 WebSocket 服务
- 默认监听 `http://localhost:3001`，提供 `/api/*` 与 `/ws` 端点
:::

启动成功后控制台会显示：

```
[ditto:server] Listening on http://localhost:3001
[ditto:server] WebSocket ready at ws://localhost:3001/ws
[ditto:server] AppCell service registered
```

## 启动前端 Shell

打开第二个终端（保留 server 终端运行）：

```bash
cd apps/shell
pnpm dev
```

Vite dev server 启动后会自动打开浏览器。若未自动打开，请手动访问：

- **Ditto 桌面**：<http://localhost:3000>
- **后端 API**：<http://localhost:3001>

::: tip API 代理
Vite dev server 已配置代理，`/api` 与 `/ws` 请求会自动转发到 `http://localhost:3001`，无需额外 CORS 处理。
:::

## 一键启动（turbo）

Ditto 提供基于 [turbo](https://turbo.build/) 的一键启动方案。在项目根目录：

```bash
pnpm dev
```

turbo 会并行调度所有 workspace 的 `dev` script（`turbo.json` 中 `dev` 任务配置为 `persistent: true`），同时启动：

- `apps/shell` 的 Vite dev server（端口 3000）
- `server` 的 Bun `--watch` server（端口 3001）
- 各 packages 的 watch 任务（如有）

::: warning turbo 注意事项
- turbo 输出来自多个 workspace，日志会交错显示
- 推荐在调试特定模块时使用「分别启动」方式
- 若 turbo 任务异常，可使用 `pnpm dev --filter @ditto/shell` 指定单个包
:::

## 测试与构建命令

### 运行测试

```bash
pnpm test
```

测试基于 [vitest](https://vitest.dev/) 3.0+ + [happy-dom](https://github.com/capricorn86/happy-dom)，覆盖 `packages/core` 的全部模块：

- `service-registry` —— 服务注册与工厂懒创建
- `lifecycle-orchestrator` —— 7 阶段生命周期编排
- `app-cell-manager` —— Cell 管理器
- `cell-bridge` —— WebSocket 双向通信
- `client-cell` —— 前端 Cell
- `ipc-bus` —— IPCBus v2 中间件链
- `permission` —— 权限系统
- `sandbox` —— 沙盒隔离
- `kernel` —— 内核
- `emitter` —— 事件发射器

::: tip 单独测试某个包
```bash
pnpm --filter @ditto/core test
pnpm --filter @ditto/packager test
```
:::

### 生产构建

```bash
pnpm build
```

turbo 会按依赖拓扑顺序构建（`dependsOn: ["^build"]`），输出到各包的 `dist/` 目录：

- **shell 产物**：`apps/shell/dist`，可直接托管到静态服务器
- **server 产物**：`server/dist`，可使用 `bun run` 直接运行
- **packages 产物**：各 `packages/*/dist`，供 workspace 内部引用

::: warning 构建产物
- `apps/shell/dist` 已包含完整 PWA Service Worker（基于 `vite-plugin-pwa`）
- 生产环境需要同时部署 server 与 shell，以支持应用市场、应用安装、Cell 后端服务等功能
:::

### 其他命令

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动所有 workspace 的开发模式（turbo 并行） |
| `pnpm build` | 构建所有 workspace 生产产物（按拓扑顺序） |
| `pnpm test` | 运行所有 workspace 的 vitest 测试 |
| `pnpm lint` | 执行代码检查（依赖各包配置） |
| `pnpm clean` | 清理所有 workspace 的 `dist/` 与产物 |
| `pnpm --filter @ditto/<pkg> <script>` | 仅运行指定包的脚本 |

::: tip 清理重装
当依赖出现疑难问题时，可彻底清理并重装：
```bash
pnpm clean
rm -rf node_modules
rm -rf packages/*/node_modules
rm -rf apps/*/node_modules
rm -rf server/node_modules
pnpm install
```
:::

## 常见问题

### Q1：`pnpm install` 报错 `ERR_PNPM_PEER_DEP_ISSUES`

**原因**：peer 依赖版本冲突。

**解决**：
```bash
pnpm install --strict-peer-dependencies=false
```
或检查根 `package.json` 与 `pnpm-workspace.yaml` 的 `overrides` 字段。

### Q2：`bun run --watch src/index.ts` 提示 `command not found`

**原因**：未安装 Bun 或未加入 PATH。

**解决**：参考 [Bun 官方文档](https://bun.sh/docs/installation) 重新安装，并重启终端。

### Q3：前端启动后白屏

**可能原因**：
1. 后端 server 未启动 —— 启动 server 后刷新页面
2. 浏览器版本过低 —— 升级 Chrome / Firefox 至推荐版本
3. 端口被占用 —— 修改 `apps/shell/vite.config.ts` 中的 `server.port`

### Q4：WebSocket 连接失败

**原因**：后端 server 未运行，或端口被防火墙拦截。

**解决**：
```bash
# 检查 server 是否运行
curl http://localhost:3001/api/health

# 检查端口占用
lsof -i :3001    # macOS / Linux
netstat -ano | findstr :3001    # Windows
```

### Q5：Chrome 80 老旧浏览器无法运行

**原因**：开发模式下 Vite 默认使用最新 ES 语法。

**解决**：开发模式不兼容老旧浏览器是正常的，请使用 `pnpm build` 构建生产产物，由 `@vitejs/plugin-legacy` 自动降级。详见 [部署运维 - 教育场景](/deployment/education)。

### Q6：Node.js 版本不匹配

**原因**：`engines.node` 字段要求 ≥ 20。

**解决**：使用 [nvm](https://github.com/nvm-sh/nvm) 或 [fnm](https://github.com/Schniz/fnm) 切换版本：
```bash
nvm install 20
nvm use 20
```

### Q7：turbo 启动时控制台日志混乱

**原因**：turbo 并行输出多 workspace 日志。

**解决**：使用单独启动方式，或运行时按 `Ctrl + Space` 切换 turbo TUI 视图查看特定任务。

## 开发模式特性

Ditto 开发模式提供以下特性以提升开发体验：

### Vite HMR（热模块替换）

前端 shell 基于 Vite 6.0+，提供完整的 HMR 支持：

- **Vue SFC 热更新**：修改 `.vue` 文件后，组件状态保留，仅刷新视图
- **CSS 热注入**：修改样式立即生效，无需刷新页面
- **依赖优化**：Vite 自动预构建依赖，启动速度极快

### Bun `--watch` 热重载

后端 server 通过 `bun run --watch src/index.ts` 启动：

- 修改 `server/src/**/*.ts` 文件后自动重启
- 重启速度极快（毫秒级），几乎无感
- 保留 Vite 端口 3000 → server 端口 3001 的代理转发

### API 代理

`apps/shell/vite.config.ts` 已配置代理：

```ts
server: {
  proxy: {
    '/api': 'http://localhost:3001',
    '/ws': {
      target: 'ws://localhost:3001',
      ws: true
    }
  }
}
```

前端代码可直接调用 `/api/*` 与建立 `ws://localhost:3000/ws` 连接，无需关心 CORS。

### 源码 alias

monorepo 内部通过 `workspace:*` 协议建立软链接，前端 shell 可直接 import workspace 包：

```ts
import { createKernel } from '@ditto/core'
import { DittoSDK } from '@ditto/sdk'
import { dittoLight, dittoDark } from '@ditto/theme'
```

修改 `packages/*` 中的源码会立即反映到 `apps/shell`，无需重新安装依赖。

### PWA 调试

开发模式下，PWA Service Worker 已禁用，避免缓存干扰调试。生产构建后会启用 `vite-plugin-pwa` autoUpdate 模式。

::: warning 注意
生产环境需要同时部署服务端（server 目录），以支持应用市场、应用安装、Cell 后端服务等功能。详见 [生产部署](/deployment/production)。
:::

## 下一步

- [基本使用](/quick-start/basic-usage) - 系统界面介绍、核心操作与快捷键
- [核心概念](/concepts/) - 深入理解 Kernel、Cell、IPC、权限系统
- [部署运维](/deployment/) - 生产部署、Docker、教育场景
- [开发指南](/development/) - 第三方应用开发、SDK、CLI
