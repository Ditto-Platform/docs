---
title: CLI 脚手架
description: Ditto CLI 命令行工具 — init 创建应用、pack 打包、install 安装、validate 校验、verify 验证签名、dev 开发模式，附完整开发流程示例。
---

# CLI 脚手架

Ditto CLI 是命令行工具，用于创建、打包、校验、安装、调试应用。本文档覆盖 6 个核心命令与完整开发流程。

## 安装

```bash
# 全局安装
pnpm add -g @ditto/cli
# 或
npm install -g @ditto/cli
```

安装后即可使用 `ditto` 命令：

```bash
ditto --help
```

::: tip 使用 npx
不想全局安装也可以用 `npx @ditto/cli <command>`，例如 `npx @ditto/cli init my-app`。
:::

## ditto init — 创建新应用

创建一个新的 Ditto 应用项目骨架。

### 用法

```bash
ditto init <app-id> [options]
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `app-id` | 是 | 应用 ID，域名倒序格式（如 `com.ditto.todo`） |

### 选项

| 选项 | 简写 | 默认值 | 说明 |
|------|------|--------|------|
| `--template` | `-t` | `vue` | 模板：`vue` / `react` / `vanilla` |
| `--type` | — | `app` | 应用类型：`app` / `widget` / `plugin` / `theme` / `dit` |
| `--with-backend` | — | `false` | 同时创建后端 Cell 骨架（自动设置 `type=dit`） |
| `--cwd` | `-c` | 当前目录 | 输出目录 |

### 示例

```bash
# 创建一个普通的 Vue 应用
ditto init com.ditto.notes --template vue

# 创建一个 dit 类型应用（前后端对称）
ditto init com.ditto.todo --type dit --with-backend

# 创建一个 React widget
ditto init widget.clock --template react --type widget

# 在指定目录创建
ditto init com.ditto.todo --type dit --cwd ./projects
```

::: warning 应用 ID 规范
应用 ID 必须匹配 `/^[\w.-]+$/`（字母、数字、点、连字符、下划线）。推荐使用域名倒序格式，如 `com.ditto.notes`、`com.example.myapp`。widget 类型建议以 `widget.` 开头。
:::

### 生成的项目结构

以 `ditto init com.ditto.todo --type dit` 为例：

```text
com.ditto.todo/
├── manifest.json          # 应用清单
├── frontend/              # 前端代码
│   ├── index.html
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   └── vite.config.ts
├── backend/               # 后端代码（dit 类型）
│   ├── index.ts
│   └── package.json
├── icon.png               # 应用图标
└── README.md
```

## ditto pack — 打包应用

将应用打包为 `.dit` / `.ditx` / `.ditc` / `.ditz` 文件。

### 用法

```bash
ditto pack [options]
```

### 选项

| 选项 | 说明 |
|------|------|
| `--manifest <path>` | manifest.json 路径（默认 `./manifest.json`） |
| `--frontend <dir>` | 前端目录（默认 `./frontend`） |
| `--backend <dir>` | 后端目录（dit 类型必填） |
| `--icon <path>` | 图标文件路径 |
| `--output <path>` | 输出文件路径（默认 `./<app-id>-<version>.dit`） |
| `--encrypt` | 启用 AES-256-GCM 加密 |
| `--password <pwd>` | 加密密码（与 `--encrypt` 配合） |
| `--sign` | 启用 Ed25519 签名 |
| `--private-key <path>` | 私钥文件路径（与 `--sign` 配合） |

### 示例

```bash
# 基础打包
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend

# 指定输出路径
ditto pack --manifest ./manifest.json --frontend ./frontend --output ./dist/com.ditto.todo-1.0.0.dit

# 带加密
ditto pack --manifest ./manifest.json --frontend ./frontend --encrypt --password "your-password"

# 带签名
ditto pack --manifest ./manifest.json --frontend ./frontend --sign --private-key ./key.pem

# 加密 + 签名
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend \
  --encrypt --password "secret" \
  --sign --private-key ./key.pem \
  --output ./dist/com.ditto.todo-1.0.0.dit
```

::: tip 打包扩展名
输出文件的扩展名由 `manifest.type` 决定：
- `app` / `dit` → `.dit`
- `widget` → `.ditx`
- `plugin` → `.ditc`
- `theme` → `.ditz`

若 `--output` 指定的扩展名不匹配，CLI 会自动修正并 warning。
:::

## ditto install — 安装应用

将打包好的应用安装到服务端。

### 用法

```bash
ditto install <package-file> [options]
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `package-file` | 是 | `.dit` / `.ditx` / `.ditc` / `.ditz` 文件路径 |

### 选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `--server <url>` | `http://localhost:3001` | 服务端地址 |
| `--force` | `false` | 覆盖已存在的同 ID 应用 |
| `--token <api-token>` | — | 鉴权 token（生产环境必填） |

### 示例

```bash
# 安装到本地服务端
ditto install ./com.ditto.todo-1.0.0.dit --server http://localhost:3001

# 强制覆盖已存在应用
ditto install ./com.ditto.todo-1.0.0.dit --force

# 带鉴权
ditto install ./com.ditto.todo-1.0.0.dit --server https://ditto.example.com --token $DITTO_TOKEN
```

::: danger 安装目录命名规则
应用安装到服务端时，ID 中的 `.` 会被替换为 `_` 作为目录名。例如 `com.ditto.todo` 安装后会位于 `server/data/apps/com_ditto_todo/`。

也可手动放置文件到该目录而无需通过 CLI 安装，但需保证 `manifest.json` / `frontend/` / `backend/` 结构正确。
:::

## ditto validate — 校验包

校验 `.dit` 包的完整性与字段合法性，不安装。

### 用法

```bash
ditto validate <package-file> [options]
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `package-file` | 是 | 待校验的包文件路径 |

### 选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `--check-dependencies` | `false` | 检查依赖应用是否已安装 |
| `--min-ditto-version <ver>` | — | 校验最低 Ditto 版本要求 |

### 示例

```bash
# 基础校验
ditto validate ./com.ditto.todo-1.0.0.dit

# 校验依赖与版本
ditto validate ./com.ditto.todo-1.0.0.dit --check-dependencies --min-ditto-version 0.1.0
```

### 校验规则

CLI 调用 `Packager.validate()` 检查以下内容：

- `id` 必填，且匹配 `/^[\w.-]+$/`
- `name` / `version` / `entry` 必填
- `version` 推荐语义化版本（`/^\d+\.\d+\.\d+/`），不符会 warning
- `frontend/` 目录必须存在
- 声明 `backend` 时，`backend.entry` 必填，`backend/` 目录必须存在
- widget 类型 ID 建议以 `widget.` 开头
- theme 类型应包含 `tokens.json`
- 若传入 `--check-dependencies`，检查 `dependencies` 中声明的应用是否已安装
- 若传入 `--min-ditto-version`，检查 `minDittoVersion` 是否满足

### 输出示例

```text
✓ Validating com.ditto.todo-1.0.0.dit
✓ manifest.json parsed
✓ frontend/ exists
✓ backend/ exists
✓ Permissions declared: fs:read, fs:write, cell:backend, notification:show
⚠ Warning: version "1.0" is not semver, recommended format: 1.0.0
✓ Package is valid

result.valid = true
result.warnings = 1
result.errors = 0
```

## ditto verify — 验证签名

验证 `.dit` 包的数字签名，确认来源可信。

### 用法

```bash
ditto verify <package-file> [options]
```

### 参数

| 参数 | 必填 | 说明 |
|------|------|------|
| `package-file` | 是 | 待验证的包文件路径 |

### 选项

| 选项 | 说明 |
|------|------|
| `--public-key <path>` | 公钥文件路径（用于验证未在 manifest 中声明的签名） |

### 示例

```bash
# 验证包内签名
ditto verify ./com.ditto.todo-1.0.0.dit

# 用外部公钥验证
ditto verify ./com.ditto.todo-1.0.0.dit --public-key ./publisher.pub
```

### 输出示例

```text
✓ Verifying signature for com.ditto.todo-1.0.0.dit
✓ signature.sig found
✓ Algorithm: ed25519
✓ Hash: sha256
✓ Signature matches public key
✓ Verified

verifyResult.verified = true
verifyResult.signer = "base64-public-key..."
```

::: warning 未签名的包
未签名的包可以运行，但 Shell 会标记为"未验证来源"。生产环境建议始终签名。
:::

## ditto dev — 开发模式

启动开发模式，自动监听文件变更并热重载。

### 用法

```bash
ditto dev [options]
```

### 选项

| 选项 | 默认值 | 说明 |
|------|--------|------|
| `--manifest <path>` | `./manifest.json` | manifest 路径 |
| `--port <port>` | `5173` | 前端 dev server 端口 |
| `--server <url>` | `http://localhost:3001` | 后端服务端地址 |
| `--watch-backend` | `true` | 监听后端文件变更（Bun `--watch`） |

### 示例

```bash
# 启动开发模式
ditto dev

# 指定端口
ditto dev --port 3000 --server http://localhost:3001

# 不监听后端
ditto dev --no-watch-backend
```

::: tip dev 模式权限自动授权
在 dev 模式下，manifest 声明的权限会自动授权（console.warn 提示），无需用户交互确认。详见 [调试技巧 — 开启 dev 模式](/development/debugging#_1-开启-dev-模式)。
:::

## 配置文件

CLI 支持项目根目录的 `ditto.config.json` 配置文件，可预设默认值：

```json
{
  "defaultTemplate": "vue",
  "marketApiUrl": "https://market.ditto.dev/api",
  "outputDir": "dist",
  "defaultServer": "http://localhost:3001"
}
```

| 字段 | 说明 |
|------|------|
| `defaultTemplate` | `ditto init` 默认模板 |
| `marketApiUrl` | 应用市场 API 地址 |
| `outputDir` | `ditto pack` 默认输出目录 |
| `defaultServer` | `ditto install` / `ditto dev` 默认服务端地址 |

## 完整开发流程示例

下面演示从零到安装的完整 CLI 流程，创建并发布 `com.ditto.todo` 应用。

### 步骤 1：初始化项目

```bash
# 创建 dit 类型应用（带后端）
ditto init com.ditto.todo --type dit --with-backend

cd com.ditto.todo
```

生成的目录：

```text
com.ditto.todo/
├── manifest.json
├── frontend/
│   ├── index.html
│   └── src/
├── backend/
│   └── index.ts
└── README.md
```

### 步骤 2：编辑 manifest.json

按需修改 `manifest.json`，配置权限、窗口、后端等（完整字段见 [第三方应用开发 — manifest.json 规范](/development/third-party#manifest-json-规范)）：

```json
{
  "id": "com.ditto.todo",
  "name": "Ditto Todo",
  "version": "1.0.0",
  "entry": "frontend/index.html",
  "sandbox": "strict",
  "permissions": ["fs:read", "fs:write", "cell:backend", "notification:show"],
  "type": "app",
  "window": { "width": 480, "height": 600 },
  "backend": { "entry": "backend/index.ts", "type": "cell", "healthCheck": "/health" }
}
```

### 步骤 3：启动开发模式

```bash
# 终端 1：启动后端服务端
cd ../Ditto/server && bun run --watch src/index.ts

# 终端 2：启动应用 dev 模式
ditto dev
```

浏览器访问 `http://localhost:5173`，修改 `frontend/` 或 `backend/` 文件会自动热重载。

### 步骤 4：编写前端与后端代码

参考 [第三方应用开发 — 完整示例应用](/development/third-party#完整示例应用) 编写 `frontend/index.html` 与 `backend/index.ts`。

### 步骤 5：校验 manifest

开发完成后，先校验 manifest 合法性：

```bash
ditto validate ./manifest.json
```

::: tip 校验源码而非包
`ditto validate` 也可以直接传入项目目录或 `manifest.json` 路径，无需先打包。
:::

### 步骤 6：打包

```bash
# 基础打包
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend \
  --output ./com.ditto.todo-1.0.0.dit

# 生产环境推荐：加密 + 签名
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend \
  --encrypt --password "$ENCRYPT_PASSWORD" \
  --sign --private-key ./keys/publisher.pem \
  --output ./dist/com.ditto.todo-1.0.0.dit
```

### 步骤 7：校验包与签名

```bash
# 校验包完整性
ditto validate ./dist/com.ditto.todo-1.0.0.dit --check-dependencies --min-ditto-version 0.1.0

# 验证签名
ditto verify ./dist/com.ditto.todo-1.0.0.dit
```

### 步骤 8：安装到服务端

```bash
# 本地服务端
ditto install ./dist/com.ditto.todo-1.0.0.dit --server http://localhost:3001

# 生产服务端（带鉴权）
ditto install ./dist/com.ditto.todo-1.0.0.dit \
  --server https://ditto.example.com \
  --token "$DITTO_TOKEN"
```

安装后可在 Ditto 桌面的应用列表中看到 `Ditto Todo`，点击启动即可。

## 命令速查表

| 命令 | 作用 | 关键参数 |
|------|------|---------|
| `ditto init` | 创建新应用 | `<app-id>` `--type` `--template` `--with-backend` |
| `ditto pack` | 打包应用 | `--manifest` `--frontend` `--backend` `--encrypt` `--sign` |
| `ditto install` | 安装应用 | `<package-file>` `--server` `--force` `--token` |
| `ditto validate` | 校验包 | `<package-file>` `--check-dependencies` `--min-ditto-version` |
| `ditto verify` | 验证签名 | `<package-file>` `--public-key` |
| `ditto dev` | 开发模式 | `--manifest` `--port` `--server` `--watch-backend` |

## 相关文档

- [开发指南](/development/)
- [第三方应用开发](/development/third-party)
- [SDK 参考](/development/sdk)
- [调试技巧](/development/debugging)
- [核心概念 — 权限系统](/concepts/permission)
