---
title: 配置项
description: Ditto WebOS 完整配置参考——DittoConfig 字段（kernel/window/taskbar/desktop/theme/permissions/ipc）、环境变量表与 ditto.config.ts 示例。
---

# 配置项

本页面介绍 Ditto WebOS 的系统配置，涵盖前端 `DittoConfig` 完整字段、服务端环境变量，以及一份可直接复制的 `ditto.config.ts` 配置文件示例。

## 目录

- [DittoConfig 总览](#dittoconfig-总览)
- [kernel 配置](#kernel-配置)
- [window 配置](#window-配置)
- [taskbar 配置](#taskbar-配置)
- [desktop 配置](#desktop-配置)
- [theme 配置](#theme-配置)
- [permissions 配置](#permissions-配置)
- [ipc 配置](#ipc-配置)
- [环境变量配置表](#环境变量配置表)
- [配置文件完整示例](#配置文件完整示例-ditto-config-ts)
- [配置加载机制](#配置加载机制)

## DittoConfig 总览

Ditto 前端 Kernel 的所有可调参数集中在 `DittoConfig` 接口，源码定义见 [`packages/shared/src/config.ts`](https://github.com/Nevino2333/Ditto/blob/main/packages/shared/src/config.ts)。

```typescript
import type { DeepPartial } from '@ditto/shared';

export interface DittoConfig {
  kernel: {
    id: string;
    strictMode: boolean;
    dev?: boolean;
  };
  window: {
    defaultWidth: number;
    defaultHeight: number;
    minWidth: number;
    minHeight: number;
    titlebarHeight: number;
    borderRadius: number;
    animations: boolean;
    snapEnabled: boolean;
    snapThreshold: number;
  };
  taskbar: {
    height: number;
    position: 'bottom' | 'top' | 'left' | 'right';
    autoHide: boolean;
    blur: boolean;
  };
  desktop: {
    iconSize: number;
    iconGap: number;
    columns: number;
    wallpaper?: string;
  };
  theme: {
    defaultScheme: 'light' | 'dark';
    followSystem: boolean;
    customTokens?: Partial<ThemeTokens>;
  };
  permissions: {
    autoGrantSystemApps: boolean;
    persistDecisions: boolean;
  };
  ipc: {
    requestTimeout: number;
    maxRetries: number;
  };
}
```

配置采用**深合并策略**：传入的部分字段会与 `defaultConfig` 递归合并，未指定的字段保留默认值。源码：

```typescript
export function mergeConfig(partial: DeepPartial<DittoConfig>): DittoConfig {
  return deepMerge(defaultConfig, partial) as DittoConfig;
}
```

::: tip 配置层级
Ditto 定制分四个层级（详见 [深度定制指南](../ui/customization)）：

| 层级 | 定制点 | 持久化 | 影响范围 |
|------|--------|--------|----------|
| L1 运行时切换 | 主题、配色、动画预设 | localStorage | 全局 UI |
| L2 配置覆盖 | `DittoConfig` 字段 | 启动配置 | 全局行为 |
| L3 Token 覆盖 | `customTokens` | 启动配置 | 全局视觉 |
| L4 组件覆盖 | `setComponentOverride` | 运行时 | 单组件 |
:::

## 默认值速查

`defaultConfig` 完整默认值：

| 字段路径 | 默认值 | 说明 |
|---------|--------|------|
| `kernel.id` | `'ditto-kernel'` | 内核实例标识 |
| `kernel.strictMode` | `false` | 严格模式 |
| `kernel.dev` | `undefined` | 开发模式 |
| `window.defaultWidth` | `800` | 默认窗口宽度 |
| `window.defaultHeight` | `600` | 默认窗口高度 |
| `window.minWidth` | `320` | 最小窗口宽度 |
| `window.minHeight` | `240` | 最小窗口高度 |
| `window.titlebarHeight` | `36` | 标题栏高度 |
| `window.borderRadius` | `10` | 窗口圆角 |
| `window.animations` | `true` | 启用窗口动画 |
| `window.snapEnabled` | `true` | 启用窗口吸附 |
| `window.snapThreshold` | `20` | 吸附阈值（px） |
| `taskbar.height` | `52` | 任务栏高度 |
| `taskbar.position` | `'bottom'` | 任务栏位置 |
| `taskbar.autoHide` | `false` | 自动隐藏 |
| `taskbar.blur` | `true` | 毛玻璃效果 |
| `desktop.iconSize` | `80` | 桌面图标尺寸 |
| `desktop.iconGap` | `8` | 图标间距 |
| `desktop.columns` | `0` | 列数（0=自适应） |
| `desktop.wallpaper` | `undefined` | 壁纸路径 |
| `theme.defaultScheme` | `'light'` | 默认配色 |
| `theme.followSystem` | `true` | 跟随系统配色 |
| `theme.customTokens` | `undefined` | 自定义主题 token |
| `permissions.autoGrantSystemApps` | `true` | 系统应用自动授权 |
| `permissions.persistDecisions` | `true` | 持久化权限决策 |
| `ipc.requestTimeout` | `10000` | IPC 请求超时（ms） |
| `ipc.maxRetries` | `0` | IPC 最大重试次数 |

## kernel 配置

```typescript
kernel: {
  id: string;          // 内核实例唯一标识，用于多实例区分
  strictMode: boolean; // 严格模式：开启后启用更多运行时检查与告警
  dev?: boolean;       // 开发模式：true 时自动授权所有权限，false 时严格按 manifest 授权
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `id` | `string` | `'ditto-kernel'` | 内核实例 ID，用于多实例场景区分日志、权限、storage 命名空间 |
| `strictMode` | `boolean` | `false` | 严格模式，启用运行时不变式检查与告警（开发调试用） |
| `dev` | `boolean` | `undefined`（按环境推断） | 开发模式自动授权所有权限 |

::: danger 生产环境必须 `dev: false`
开发模式 `dev: true` 会自动授权所有权限，包括 `fs.*`、`net.*` 等敏感权限。**生产环境务必显式设置为 `false`**，避免第三方应用越权。
:::

```typescript
// 生产环境推荐
const kernel = createKernel({
  kernel: { id: 'prod-instance', strictMode: false, dev: false },
});

// 开发环境（自动授权，便于调试）
const kernel = createKernel({
  kernel: { id: 'dev-instance', dev: true },
});
```

## window 配置

```typescript
window: {
  defaultWidth: number;     // 新窗口默认宽度
  defaultHeight: number;    // 新窗口默认高度
  minWidth: number;         // 窗口最小宽度
  minHeight: number;        // 窗口最小高度
  titlebarHeight: number;   // 标题栏高度（px）
  borderRadius: number;     // 窗口圆角半径（px）
  animations: boolean;      // 是否启用窗口动画（开/关/缩放/拖拽）
  snapEnabled: boolean;     // 是否启用窗口边缘吸附
  snapThreshold: number;    // 吸附触发阈值（px）
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultWidth` | `number` | `800` | 应用未指定 `window.width` 时的默认宽度 |
| `defaultHeight` | `number` | `600` | 应用未指定 `window.height` 时的默认高度 |
| `minWidth` | `number` | `320` | 兼容老旧小屏设备（如 1024×600 上网本） |
| `minHeight` | `number` | `240` | 极端最小高度 |
| `titlebarHeight` | `number` | `36` | 自定义标题栏高度（DWindow 组件读取） |
| `borderRadius` | `number` | `10` | 窗口圆角，影响视觉风格 |
| `animations` | `boolean` | `true` | 窗口开关、拖拽、缩放动画 |
| `snapEnabled` | `boolean` | `true` | 拖拽到屏幕边缘自动吸附（半屏 / 全屏） |
| `snapThreshold` | `number` | `20` | 距边缘多少 px 触发吸附 |

::: tip 低端设备优化
低端设备（树莓派、老旧 PC）建议关闭动画：

```typescript
window: {
  animations: false,  // 关闭所有窗口动画
  minWidth: 320,      // 兼容小屏
  minHeight: 240,
}
```
:::

## taskbar 配置

```typescript
taskbar: {
  height: number;                                  // 任务栏高度
  position: 'bottom' | 'top' | 'left' | 'right';   // 任务栏位置
  autoHide: boolean;                              // 自动隐藏
  blur: boolean;                                   // 毛玻璃背景效果
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `height` | `number` | `52` | 任务栏像素高度 |
| `position` | `'bottom' \| 'top' \| 'left' \| 'right'` | `'bottom'` | 任务栏位置（四向） |
| `autoHide` | `boolean` | `false` | 鼠标移开自动隐藏，悬停时显示 |
| `blur` | `boolean` | `true` | 背景毛玻璃效果，需 GPU 加速 |

::: warning 毛玻璃性能
`blur: true` 在低端设备会显著影响 FPS。树莓派、老旧 PC 建议关闭：

```typescript
taskbar: { blur: false }
```
:::

## desktop 配置

```typescript
desktop: {
  iconSize: number;       // 图标尺寸（px）
  iconGap: number;        // 图标间距（px）
  columns: number;        // 列数（0 = 自适应）
  wallpaper?: string;     // 壁纸图片 URL 或路径
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `iconSize` | `number` | `80` | 桌面图标尺寸（含文字） |
| `iconGap` | `number` | `8` | 图标之间的间距 |
| `columns` | `number` | `0` | 桌面列数，`0` 表示根据宽度自适应 |
| `wallpaper` | `string` | `undefined` | 壁纸图片路径，相对根目录或绝对 URL |

```typescript
// Kiosk / 教育场景示例
desktop: {
  iconSize: 72,
  iconGap: 8,
  columns: 0,                          // 自适应
  wallpaper: '/assets/classroom.jpg',  // 校园主题壁纸
}
```

## theme 配置

```typescript
theme: {
  defaultScheme: 'light' | 'dark';   // 默认配色方案
  followSystem: boolean;             // 跟随系统 prefers-color-scheme
  customTokens?: Partial<ThemeTokens>; // 自定义主题 token
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `defaultScheme` | `'light' \| 'dark'` | `'light'` | 启动时的默认配色方案 |
| `followSystem` | `boolean` | `true` | 监听 `prefers-color-scheme` 媒体查询实时跟随系统 |
| `customTokens` | `Partial<ThemeTokens>` | `undefined` | 启动时应用到基底主题的自定义 token |

### ThemeTokens 完整结构

`customTokens` 接收的 `ThemeTokens` 完整结构（详见 `packages/shared/src/types.ts`）：

```typescript
interface ThemeTokens {
  color: {
    primary: Record<string, string>;   // 50-900 十阶调色板
    surface: Record<string, string>;   // base / raised / overlay
    text: Record<string, string>;      // primary / secondary / disabled
    border: Record<string, string>;    // subtle / strong
    semantic: Record<string, string>; // success / warning / error / info
    window: Record<string, string>;   // frame / titlebar / border / shadow / shadowFocused
  };
  space: Record<string, string>;
  radius: Record<string, string>;     // button / card / window / pill
  shadow: Record<string, string>;     // taskbar / window / windowFocused / dropdown
  motion: {
    duration: Record<string, string>; // fast / normal / slow
    easing: Record<string, string>;   // default / decelerate / accelerate / spring
  };
}
```

### customTokens 配置示例

```typescript
theme: {
  defaultScheme: 'light',
  followSystem: false,                    // 不监听媒体查询，省 CPU
  customTokens: {
    color: {
      primary: { '500': '#0066cc' },       // 学校品牌色
      surface: { base: '#fafafa' },
    },
    radius: { window: 12 },
  },
}
```

`customTokens` 会在启动时创建一个名为 `ditto-custom` 的派生主题并自动应用（见 `apps/shell/src/main.ts` 的 `applyKernelThemeConfig` 函数）。

::: tip followSystem 行为
`followSystem: true` 时：

1. 启动时检测 `prefers-color-scheme: dark` 媒体查询
2. 监听媒体查询变化，自动切换 light/dark
3. 使用 `addEventListener` 优先，回退到 `addListener`（兼容旧浏览器）

低端设备建议关闭（节省媒体查询监听开销）。
:::

### 动画档位（运行时切换）

虽然动画档位不在 `DittoConfig` 中，但通过 `ThemeEngine` 可在运行时切换：

```typescript
import { getThemeEngine } from '@ditto/theme';

getThemeEngine().setAnimationPreset('none');      // 完全关闭
getThemeEngine().setAnimationPreset('subtle');     // 微妙（低端设备推荐）
getThemeEngine().setAnimationPreset('normal');    // 默认
getThemeEngine().setAnimationPreset('expressive'); // 丰富（高性能设备）
```

| 档位 | 描述 | 适用设备 |
|------|------|----------|
| `none` | 无动画 | 树莓派、老旧 PC |
| `subtle` | 微妙动画 | 低端设备 |
| `normal` | 标准动画 | 主流设备 |
| `expressive` | 丰富动画 | 高性能设备 |

## permissions 配置

```typescript
permissions: {
  autoGrantSystemApps: boolean;   // 系统应用自动授权
  persistDecisions: boolean;       // 持久化权限决策
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `autoGrantSystemApps` | `boolean` | `true` | 内置系统应用（`com.ditto.*`）自动授权，跳过用户确认 |
| `persistDecisions` | `boolean` | `true` | 用户授权决策持久化到 localStorage，下次不再询问 |

```typescript
// 生产环境推荐
permissions: {
  autoGrantSystemApps: true,    // 系统应用可信，自动授权
  persistDecisions: true,       // 持久化决策，避免重复弹窗
}
```

::: warning 权限持久化清理
用户可在「系统设置 → 应用 → 权限」中清理持久化的权限决策。开发调试时也可手动清除 `localStorage` 的 `ditto:permissions` 键。
:::

## ipc 配置

```typescript
ipc: {
  requestTimeout: number;   // IPC 请求超时（ms）
  maxRetries: number;        // 最大重试次数
}
```

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `requestTimeout` | `number` | `10000` | IPC 请求超时时间（毫秒） |
| `maxRetries` | `number` | `0` | 请求失败后最大重试次数 |

```typescript
// 网络不稳定场景
ipc: {
  requestTimeout: 30000,  // 30 秒超时
  maxRetries: 2,          // 失败重试 2 次
}
```

::: tip IPC 通道
Ditto 前后端 IPC 通过 `@ditto/sdk` 暴露，详见 [核心概念 IPC](../concepts/ipc)。常见通道包括 `theme:*`、`vfs:*`、`cell:*` 等。
:::

## 环境变量配置表

服务端通过环境变量配置运行参数，与前端 `DittoConfig` 相互独立。

| 变量名 | 默认值 | 说明 | 示例 |
|--------|--------|------|------|
| `PORT` | `3001` | server 监听端口 | `PORT=3001` |
| `NODE_ENV` | — | 环境标识（`production` / `development`） | `NODE_ENV=production` |
| `APPS_DIR` | `{cwd}/data/apps` | 应用数据目录 | `APPS_DIR=/var/lib/ditto/apps` |
| `TEST_APPS_DIR` | `{cwd}/../test-apps` | 测试应用目录（市场发布用） | `TEST_APPS_DIR=/opt/ditto/test-apps` |
| `MARKET_DATA_DIR` | — | 市场数据目录（覆盖默认） | `MARKET_DATA_DIR=/opt/ditto/market` |
| `GITHUB_TOKEN` | — | GitHub token（市场从 GitHub 拉取应用） | `GITHUB_TOKEN=ghp_xxxxx` |
| `DITTO_CORS_ORIGIN` | `*` | CORS 白名单（逗号分隔） | `DITTO_CORS_ORIGIN=https://ditto.example.com` |

### 配置示例

**Docker Compose**：

```yaml
services:
  server:
    environment:
      - PORT=3001
      - NODE_ENV=production
      - APPS_DIR=/app/data/apps
      - GITHUB_TOKEN=ghp_xxxxx
      - DITTO_CORS_ORIGIN=https://ditto.example.com
```

**systemd**：

```ini
Environment=PORT=3001
Environment=NODE_ENV=production
Environment=APPS_DIR=/var/lib/ditto/apps
Environment=DITTO_CORS_ORIGIN=https://ditto.example.com
```

**直接运行**：

```bash
PORT=3001 NODE_ENV=production bun run src/index.ts
```

::: danger CORS 安全提醒
默认 `DITTO_CORS_ORIGIN=*` 允许任意来源跨域访问。生产环境务必设置为白名单：

```bash
export DITTO_CORS_ORIGIN=https://ditto.example.com,https://app.ditto.dev
```
:::

### 应用专属环境变量

应用的 `manifest.json` 中 `backend.env` 字段可注入应用专属环境变量：

```json
{
  "backend": {
    "entry": "backend/index.ts",
    "type": "cell",
    "env": {
      "DATABASE_URL": "file:///app/data/db",
      "LOG_LEVEL": "info"
    }
  }
}
```

通过 `CellContext.env` 注入到后端 Cell：

```typescript
async onInit(ctx: CellContext): Promise<void> {
  const dbUrl = ctx.env.DATABASE_URL;
  const logLevel = ctx.env.LOG_LEVEL;
}
```

## 配置文件完整示例 (ditto.config.ts)

完整的 `ditto.config.ts`（教育场景示例）：

```typescript
import type { DittoConfig } from '@ditto/shared';

export const config: DittoConfig = {
  kernel: {
    id: 'edu-classroom',          // 教育场景实例 ID
    strictMode: false,            // 关闭严格模式
    dev: false,                   // 生产模式：严格按 manifest 授权
  },
  window: {
    defaultWidth: 1024,           // 教室投影仪默认分辨率
    defaultHeight: 768,
    minWidth: 320,                // 兼容老旧小屏设备
    minHeight: 240,
    titlebarHeight: 36,
    borderRadius: 8,
    animations: true,             // 教室 PC 性能够，开启动画
    snapEnabled: true,            // 启用窗口吸附，便于多窗口布局
    snapThreshold: 20,
  },
  taskbar: {
    height: 52,
    position: 'bottom',           // 底部任务栏，符合学生习惯
    autoHide: false,              // 始终显示，避免学生迷路
    blur: true,                   // 教室 PC 性能够，启用毛玻璃
  },
  desktop: {
    iconSize: 72,                 // 稍小图标，容纳更多应用
    iconGap: 8,
    columns: 0,                   // 自适应列数
    wallpaper: '/assets/classroom.jpg',  // 校园主题壁纸
  },
  theme: {
    defaultScheme: 'light',       // 浅色配色（投影仪更清晰）
    followSystem: false,          // 不跟随系统，固定浅色
    customTokens: {
      color: {
        primary: { '500': '#0066cc' },   // 学校品牌色
        surface: { base: '#fafafa' },
      },
      radius: { window: 12 },
    },
  },
  permissions: {
    autoGrantSystemApps: true,    // 系统应用自动授权
    persistDecisions: true,       // 持久化决策，避免重复弹窗
  },
  ipc: {
    requestTimeout: 10000,        // 默认 10 秒超时
    maxRetries: 0,                // 不重试（教学场景简单清晰）
  },
};
```

### 低端设备配置示例（树莓派）

```typescript
import type { DittoConfig } from '@ditto/shared';

export const config: DittoConfig = {
  kernel: {
    id: 'edu-rpi',
    strictMode: false,
    dev: false,
  },
  window: {
    defaultWidth: 800,
    defaultHeight: 600,
    minWidth: 320,
    minHeight: 240,
    titlebarHeight: 32,           // 缩小标题栏
    borderRadius: 4,              // 减小圆角，降低 GPU 负担
    animations: false,            // 关闭窗口动画
    snapEnabled: true,
    snapThreshold: 20,
  },
  taskbar: {
    height: 44,                   // 缩小任务栏
    position: 'bottom',
    autoHide: false,
    blur: false,                  // 关闭毛玻璃
  },
  desktop: {
    iconSize: 64,
    iconGap: 4,
    columns: 0,
    wallpaper: undefined,         // 不设壁纸，省内存
  },
  theme: {
    defaultScheme: 'light',       // 浅色渲染开销更低
    followSystem: false,          // 不监听媒体查询（省 CPU）
  },
  permissions: {
    autoGrantSystemApps: true,
    persistDecisions: true,
  },
  ipc: {
    requestTimeout: 15000,        // 树莓派处理慢，延长超时
    maxRetries: 1,
  },
};
```

::: tip 配合运行时降级
树莓派场景除上述配置外，启动后还需调用：

```typescript
import { getThemeEngine } from '@ditto/theme';
getThemeEngine().setAnimationPreset('none');
```

完全关闭 RAF 动画调度。
:::

### Kiosk 信息终端配置示例

```typescript
import type { DittoConfig } from '@ditto/shared';

export const config: DittoConfig = {
  kernel: {
    id: 'kiosk-display',
    strictMode: false,
    dev: false,
  },
  window: {
    defaultWidth: 1920,
    defaultHeight: 1080,
    minWidth: 1024,
    minHeight: 768,
    titlebarHeight: 0,            // Kiosk 模式无标题栏
    borderRadius: 0,              // 全屏无圆角
    animations: false,            // 信息终端无需动画
    snapEnabled: false,
    snapThreshold: 0,
  },
  taskbar: {
    height: 0,                    // 隐藏任务栏
    position: 'bottom',
    autoHide: true,
    blur: false,
  },
  desktop: {
    iconSize: 96,
    iconGap: 16,
    columns: 4,                   // 固定 4 列布局
    wallpaper: '/assets/kiosk-bg.jpg',
  },
  theme: {
    defaultScheme: 'dark',       // 信息终端深色更适合
    followSystem: false,
    customTokens: {
      color: {
        primary: { '500': '#0066cc' },   // 学校品牌色
      },
    },
  },
  permissions: {
    autoGrantSystemApps: true,
    persistDecisions: true,
  },
  ipc: {
    requestTimeout: 10000,
    maxRetries: 0,
  },
};
```

## 配置加载机制

### 前端 Kernel 配置

`createKernel(partial)` 内部调用 `mergeConfig(partial)`，与 `defaultConfig` 深合并：

```typescript
import { createKernel } from '@ditto/core';

// 仅覆盖需要修改的字段
const kernel = createKernel({
  kernel: { dev: true },
  theme: { defaultScheme: 'dark' },
});

// 等价于：
// const kernel = createKernel({
//   kernel: { id: 'ditto-kernel', strictMode: false, dev: true },
//   window: { /* 全部默认值 */ },
//   taskbar: { /* 全部默认值 */ },
//   ...
//   theme: { defaultScheme: 'dark', followSystem: true /* 默认 */ },
//   ...
// });
```

::: warning 不要直接修改 defaultConfig
`defaultConfig` 是共享对象，直接修改会影响所有后续 `createKernel` 调用。始终通过 `createKernel(partial)` 传参。
:::

### 主题配置应用流程

`apps/shell/src/main.ts` 启动时执行 `applyKernelThemeConfig`：

1. **应用 `customTokens`**：基于 `defaultScheme` 找到基底主题，创建名为 `ditto-custom` 的派生主题
2. **应用 `defaultScheme`**：若 `localStorage` 无保存主题（`ditto:theme`），按配置初始化
3. **应用 `followSystem`**：监听 `prefers-color-scheme` 媒体查询，实时切换 light/dark

```typescript
function applyKernelThemeConfig(kernel, themeEngine) {
  const themeConfig = kernel.config.theme;

  // 1) 应用 customTokens：创建为派生主题
  if (themeConfig.customTokens) {
    const baseScheme = themeConfig.defaultScheme;
    const baseTheme = themeEngine.getAvailableThemes()
      .find(t => t.colorScheme === baseScheme);
    if (baseTheme) {
      themeEngine.createTheme(
        'ditto-custom',
        `自定义 (${baseTheme.name})`,
        baseScheme,
        themeConfig.customTokens,
      );
    }
  }

  // 2) 默认配色方案：若 localStorage 无保存值，按配置切换
  try {
    const saved = localStorage.getItem('ditto:theme');
    if (!saved) {
      const target = themeEngine.getAvailableThemes()
        .find(t => t.colorScheme === themeConfig.defaultScheme);
      if (target) themeEngine.setTheme(target.id);
    }
  } catch { /* localStorage 不可用 */ }

  // 3) 跟随系统配色
  if (themeConfig.followSystem && window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystem = (isDark) => {
      const scheme = isDark ? 'dark' : 'light';
      const target = themeEngine.getAvailableThemes()
        .find(t => t.colorScheme === scheme);
      if (target) themeEngine.setTheme(target.id);
    };
    applySystem(mq.matches);
    if (typeof mq.addEventListener === 'function') {
      mq.addEventListener('change', e => applySystem(e.matches));
    } else if (typeof mq.addListener === 'function') {
      mq.addListener(e => applySystem(e.matches));
    }
  }
}
```

### 服务端环境变量加载

服务端在启动时通过 `process.env` 读取环境变量，见 `server/src/index.ts`：

```typescript
const appsDir = process.env.APPS_DIR ?? path.join(process.cwd(), 'data', 'apps');
const port = Number(process.env.PORT ?? 3001);

// CORS 配置
const corsOriginEnv = process.env.DITTO_CORS_ORIGIN;
const corsOrigin = corsOriginEnv
  ? corsOriginEnv.split(',').map(s => s.trim()).filter(Boolean)
  : '*';

// Market 数据源
app.route('/api/market', createMarketRoutes({
  cellManager,
  appsDir,
  testAppsDir: process.env.TEST_APPS_DIR ?? path.resolve(process.cwd(), '..', 'test-apps'),
  githubToken: process.env.GITHUB_TOKEN,
  localDataDir: process.env.MARKET_DATA_DIR,
}));
```

## 相关文档

- [部署概览](./index) — 部署总览与导航
- [生产部署](./production) — 环境变量在生产环境的完整配置示例
- [监控运维](./monitoring) — 服务端运行时监控端点
- [深度定制指南](../ui/customization) — 主题 Token、组件级覆盖
- [主题系统](../ui/theme) — ThemeTokens 与主题包
- [核心概念 Kernel](../concepts/kernel) — Kernel 启动流程
- [权限系统](../concepts/permission) — `permissions` 字段对应的权限模型
