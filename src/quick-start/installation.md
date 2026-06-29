# 安装

本页面介绍 Ditto WebOS 的安装与启动方式。

## 快速体验

如果你只是想快速体验 Ditto，可以直接访问在线演示：

> [在线演示站](https://ditto-demo.example.com)（待部署）

## 源码安装

### 1. 克隆仓库

```bash
git clone https://github.com/Nevino2333/Ditto.git
cd Ditto
```

### 2. 安装依赖

Ditto 使用 pnpm 作为包管理工具：

```bash
pnpm install
```

### 3. 启动开发服务器

```bash
pnpm run dev
```

启动后访问 `http://localhost:5173` 即可看到 Ditto 桌面。

## 生产构建

```bash
pnpm run build
```

构建产物位于 `apps/shell/dist` 目录，可直接部署到静态服务器。

::: warning 注意
生产环境需要同时部署服务端（server 目录），以支持应用市场、应用安装等功能。
:::

## 服务端部署

服务端基于 Bun + Hono：

```bash
cd server
bun install
bun run dev  # 开发模式
bun run build && bun run start  # 生产模式
```

## Docker 部署

Ditto 提供 Docker 部署方案：

```bash
docker-compose up -d
```

详见 [部署运维](/deployment/) 章节。

## 下一步

安装完成后，继续阅读 [基本使用](/quick-start/basic-usage)。