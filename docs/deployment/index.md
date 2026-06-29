---
title: 部署运维
description: Ditto WebOS 部署总览——开发环境、生产环境、教育场景、配置项与监控运维的完整导航。
---

# 部署运维

Ditto WebOS 由前端 Shell（Vue 3 + Vite）与服务端 Server（Bun + Hono）组成，支持本地开发、Docker 容器化、手动部署、教育机房批量部署等多种形态。本章节汇总所有部署与运维相关文档。

## 部署架构概览

生产环境推荐架构（CDN + Nginx + Server + Shell 一体化）：

```
        ┌──────────────────────────────────────────┐
        │                  用户浏览器                │
        │  Chrome 78+ / Firefox 72+ / Safari 13+    │
        └──────────────────┬───────────────────────┘
                           │ HTTPS / WSS
                           ▼
        ┌──────────────────────────────────────────┐
        │              Nginx 反向代理               │
        │  - SPA 静态托管（apps/shell/dist）       │
        │  - /api/*  → Server (Bun)                │
        │  - /ws     → WebSocket 长连接            │
        │  - 静态资源 1 年强缓存（immutable）       │
        └──────────────────┬───────────────────────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
   ┌──────────────────┐      ┌──────────────────────┐
   │  Ditto Server    │      │   Shell 静态资源      │
   │  (Bun + Hono)    │      │   (Vite 构建产物)     │
   │  - /api/*        │      │   - index.html        │
   │  - /ws WebSocket │      │   - assets/           │
   │  - Cell 沙盒     │      │   - sw.js (PWA)       │
   │  - 资源配额/限流 │      │   - manifest.webmanifest │
   └──────────────────┘      └──────────────────────┘
              │
              ▼
   ┌──────────────────────┐
   │  data/apps/          │  ← 应用包目录
   │   ├── com_ditto_calc/│     (应用 ID 中的 . 替换为 _)
   │   │   ├── manifest.json
   │   │   ├── frontend/
   │   │   └── backend/
   │   └── ...
   └──────────────────────┘
```

## 部署方式速查

| 部署方式 | 适用场景 | 启动命令 | 复杂度 |
|---------|---------|---------|--------|
| 开发环境 | 本地调试、HMR | `pnpm dev` | ⭐ |
| Docker Compose | 生产推荐 | `docker-compose up -d` | ⭐⭐ |
| 手动部署 | 无 Docker 环境 | `bun run src/index.ts` + nginx | ⭐⭐⭐ |
| 教育机房部署 | 学校批量 | 中心服务器 + 学生机 Chrome | ⭐⭐⭐ |
| 树莓派部署 | 嵌入式 / Kiosk | `scp` + PM2 / systemd | ⭐⭐⭐ |
| Kiosk 信息终端 | 信息屏 / 自助终端 | `chrome.exe --kiosk` | ⭐⭐ |

## 板块导航

本章节分为 4 个子文档，按需查阅：

| 板块 | 描述 | 主要内容 |
|------|------|---------|
| [生产部署](./production) | 完整部署流程 | 开发环境、Docker Compose、手动部署、Dockerfile、nginx、PWA、环境变量、性能优化、Chrome 80 兼容 |
| [教育场景](./education) | 学校/培训机构部署 | 低端设备、机房批量部署、Kiosk 模式、多用户权限、响应式、无障碍、教学应用开发 |
| [配置项](./configuration) | 系统配置详解 | `DittoConfig` 完整字段、环境变量表、`ditto.config.ts` 示例 |
| [监控运维](./monitoring) | 性能监控与故障排查 | 健康检查、Cell 状态、`/api/admin/metrics`、资源配额、流量整形、弹性扩缩、日志查看 |

## 快速开始

::: tip 最快上手路径
1. 阅读 [生产部署 → 开发环境部署](./production#开发环境部署) 启动本地 dev server
2. 按 [生产部署 → 方式一：Docker Compose](./production#方式一-docker-compose-推荐) 完成首次生产部署
3. 参考 [配置项](./configuration) 调整 `DittoConfig`
4. 用 [监控运维 → 健康检查](./monitoring#健康检查端点) 验证部署成功
:::

## 运行时依赖

| 组件 | 版本要求 | 说明 |
|------|---------|------|
| Node.js | 20+ | 用于 pnpm 工具链与前端构建 |
| pnpm | 9.15.0+ | workspace 包管理 |
| Bun | 最新 | 服务端运行时（替代 Node） |
| 浏览器 | Chrome 78+ / Firefox 72+ / Safari 13+ / Edge 79+ | 通过 `@vitejs/plugin-legacy` 兼容老版本 |
| Docker | 20+（可选） | 容器化部署 |
| nginx | 1.18+（可选） | 反向代理 + 静态托管 |

## 端口约定

| 端口 | 服务 | 默认值 | 可配置 |
|------|------|--------|--------|
| 3000 | 前端 Vite dev server | 是 | `apps/shell/vite.config.ts` |
| 3001 | 服务端 Bun HTTP + WS | 是 | `PORT` 环境变量 |
| 80 / 443 | nginx（生产） | 是 | `server/nginx.conf` |

## 相关文档

- [快速开始](../quick-start/) — 安装与基本使用
- [核心概念](../concepts/) — Kernel、Cell、IPC、权限系统
- [API 参考](../api/) — 服务端 API、前端 API、类型定义
- [UI 与主题](../ui/) — UI 组件库、主题定制、图标
