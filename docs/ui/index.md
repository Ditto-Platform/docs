---
title: UI & 主题
description: Ditto WebOS 的 UI 组件库、主题系统与图标系统总览。
---

# UI & 主题

本章节介绍 Ditto WebOS 的 UI 组件库、主题系统与图标系统。Ditto 的 UI 层基于 **Vue 3 + CSS 变量驱动**，遵循「设计 Token → CSS 变量 → 组件消费」的链路，使主题切换可以在运行时即时生效，无需重新加载。

## 三大支柱

| 支柱 | 解决的问题 | 源码位置 |
|------|-----------|----------|
| **组件库**（`@ditto/ui`） | 提供 DWindow、DTaskbar、DDesktop、DIcon 等开箱即用的 Vue 组件 | `packages/ui/*` |
| **主题系统**（`@ditto/theme`） | 通过 ThemeEngine 统一管理 token、运行时切换、组件级覆盖 | `packages/theme/*` |
| **图标系统** | 集成 FontAwesome 6，DIcon 自动识别 FA class / URL / emoji | `@ditto/ui` 内置 |

## 主题系统简介

ThemeEngine 是 Ditto 的主题核心，具备以下特性：

- **CSS 变量驱动**：所有 token 自动展平为 `--ditto-*` CSS 变量注入 `document.documentElement`
- **运行时切换**：调用 `setTheme()` 立即生效，无需刷新
- **持久化**：用户选择自动保存到 `localStorage['ditto:theme']`
- **4 档动画预设**：`none` / `subtle` / `normal` / `expressive`，适配从树莓派到高端设备
- **组件级覆盖**：可对单个组件独立设置 token，不影响全局
- **第三方主题分发**：通过 `.ditz` 主题包分享主题，支持扁平 schema

```typescript
import { getThemeEngine } from '@ditto/theme'

const engine = getThemeEngine()
engine.setTheme('ditto-dark')          // 切换主题
engine.setAnimationPreset('subtle')     // 切换动画档位
engine.toggleColorScheme()              // 浅色 ↔ 深色
```

详见 [主题定制](./theme)。

## 组件库简介

`@ditto/ui` 提供构建 WebOS 桌面体验所需的全部组件：

| 组件 | 描述 |
|------|------|
| `DWindow` | 窗口容器（拖拽、缩放、最大化、吸附） |
| `DTaskbar` | 任务栏 |
| `DDesktop` | 桌面区域（图标网格、壁纸） |
| `DStartMenu` | 开始菜单 |
| `DContextMenu` | 右键菜单 |
| `DNotification` | 通知气泡 |
| `DNotificationCenter` | 通知中心面板 |
| `DControlCenter` | 控制中心（亮度、音量、电源） |
| `DLockScreen` | 锁屏界面 |
| `DTaskSwitcher` | 任务切换器（Alt+Tab） |
| `DGlobalSearch` | 全局搜索面板 |
| `DCalendarPanel` | 日历面板 |
| `DWidgetBoard` | 桌面小组件面板 |
| `DDialog` | 对话框（alert / confirm / prompt） |
| `DIcon` | 统一图标组件 |

所有组件都通过消费 `--ditto-*` CSS 变量来呈现视觉，因此切换主题即对所有组件生效。

详见 [组件库](./components)。

## 图标系统简介

Ditto 内置 FontAwesome 6 Free，并通过 `DIcon` 组件统一渲染图标。`DIcon` 支持三种输入并自动识别模式：

```vue
<template>
  <!-- 1. FontAwesome class -->
  <DIcon name="fa-solid fa-star" />

  <!-- 2. URL 图片 -->
  <DIcon name="https://example.com/icon.svg" />

  <!-- 3. Emoji fallback -->
  <DIcon name="📦" />
</template>
```

应用 manifest 中的 `icon` 字段也使用同样的识别规则，方便第三方应用同时支持矢量图标、位图与 emoji。

详见 [图标系统](./icons)。

## 板块导航

| 板块 | 描述 |
|------|------|
| [组件库](./components) | @ditto/ui 组件清单与使用示例 |
| [主题定制](./theme) | ThemeEngine、ThemeTokens、.ditz 包、动画预设、组件级覆盖、SDK 主题 API |
| [图标系统](./icons) | FontAwesome 6 集成、DIcon API、命名规范 |

## 相关文档

- [Kernel 架构](/concepts/kernel)：内核服务编排，包含 DefaultAppsService
- [默认应用关联](/concepts/default-apps)：mime/scheme/extension 到应用 ID 的映射
- [权限系统](/concepts/permission)：组件级覆盖与权限审批的关系
- [生命周期](/concepts/lifecycle)：ThemeEngine 的初始化时机
