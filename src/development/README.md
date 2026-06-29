# 开发指南

本章节介绍如何为 Ditto 开发第三方应用。

## 目录

- [第三方应用开发](/development/third-party) - 从零开始创建应用
- [SDK 参考](/development/sdk) - 前端 SDK API
- [CLI 脚手架](/development/cli) - 命令行工具
- [调试技巧](/development/debugging) - 开发与调试方法

## 应用类型

Ditto 支持多种应用类型：

| 类型 | 扩展名 | 描述 |
|------|--------|------|
| `app` | `.dit` | 普通应用 |
| `widget` | `.dit` | 桌面小部件 |
| `plugin` | `.dit` | 功能插件（无 UI） |
| `theme` | `.ditz` | 主题包 |
| `dit` | `.dit` | 前后端对称应用 |

## 开发流程

1. **使用 CLI 创建项目**：`npx ditto-cli create my-app`
2. **编写 manifest**：配置应用信息、权限、窗口等
3. **开发前端**：Vue/React/Vanilla 均可
4. **开发后端**（可选）：TypeScript + Bun/Hono
5. **测试**：本地启动 Ditto + 应用
6. **打包**：`ditto-cli pack my-app`
7. **发布**：上传到 Ditto Market

## 下一步

开始学习 [第三方应用开发](/development/third-party)。