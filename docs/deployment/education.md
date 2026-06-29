---
title: 教育场景部署
description: Ditto WebOS 教育场景部署指南——课堂教学、学生实验、机房管理、Kiosk 信息终端、低端设备、多用户权限与教学应用开发。
---

# 教育场景部署

Ditto WebOS 定位为通用 Web 操作系统框架，特别适用于教育场景：课堂教学、学生实验、机房管理、Kiosk 信息终端等。本指南介绍如何在不同教育场景中部署和定制 Ditto。

## 目录

1. [教育场景适配能力](#1-教育场景适配能力)
2. [低端设备部署（树莓派/老旧 PC）](#2-低端设备部署树莓派-老旧-pc)
3. [机房批量部署](#3-机房批量部署)
4. [Kiosk 信息终端模式](#4-kiosk-信息终端模式)
5. [多用户与权限管控](#5-多用户与权限管控)
6. [Chrome 80 兼容性](#6-chrome-80-兼容性)
7. [响应式与多设备](#7-响应式与多设备)
8. [无障碍支持](#8-无障碍支持)
9. [教学应用开发建议](#9-教学应用开发建议)

## 1. 教育场景适配能力

| 场景 | Ditto 能力 | 关键特性 |
|------|-----------|---------|
| 课堂教学演示 | PWA 离线、投影适配 | 单屏 + 响应式断点 |
| 学生实验 | 沙盒隔离、权限管控 | iframe-strict 沙盒 |
| 机房管理 | 多用户 Cell 隔离 | 服务端 CellInstance |
| Kiosk 信息终端 | 全屏模式、自动启动 | PWA standalone |
| 低端设备 | 动画降级、懒加载 | Chrome 78+ 兼容 |
| 特殊教育 | 无障碍、高对比度 | WCAG 媒体查询 |

::: tip 教育场景核心优势
- **零安装**：学生机只需 Chrome 80+ 浏览器，无需安装客户端
- **集中管理**：应用、主题、壁纸由服务器统一分发
- **隔离安全**：iframe-strict 沙盒 + 权限管控，防止学生越权
- **离线可用**：PWA 缓存让网络中断也能继续教学
:::

## 2. 低端设备部署（树莓派/老旧 PC）

### 2.1 硬件最低要求

| 设备 | CPU | RAM | 浏览器 | 体验 |
|------|-----|-----|--------|------|
| 树莓派 3B+ | ARM Cortex-A53 | 1GB | Chromium 78+ | 基础交互流畅 |
| 树莓派 4 | ARM Cortex-A72 | 2GB+ | Chromium 84+ | 完整体验 |
| 老旧 PC（10 年） | Intel Atom | 2GB | Chrome 80+ | 流畅 |
| 上网本（1024×600） | Intel Celeron | 1GB | Chrome 80+ | 可用 |

### 2.2 低端设备优化配置

```typescript
import { createKernel } from '@ditto/core';
import { getThemeEngine } from '@ditto/theme';

const kernel = createKernel({
  kernel: { id: 'edu-rpi', dev: false },
  window: {
    animations: false,          // 关闭窗口动画
    minWidth: 320,              // 兼容小屏
    minHeight: 240,
  },
  theme: {
    defaultScheme: 'light',     // 浅色渲染开销更低
    followSystem: false,        // 不监听媒体查询（省 CPU）
  },
});

await kernel.init();

// 切换到最低动画档
getThemeEngine().setAnimationPreset('none');
```

::: warning 关闭动画档位
低端设备务必执行 `setAnimationPreset('none')`，避免 RAF 调度浪费 CPU。同时设置 `window.animations: false` 关闭窗口拖拽 / 缩放动画。
:::

### 2.3 性能优化机制（已内置）

Ditto 已实现以下性能优化，无需额外配置：

- **懒加载**：4 个内置应用（文件/设置/关于/市场）使用 `defineAsyncComponent` 按需加载，减小首屏 bundle
- **iframe 延迟加载**：`loading="lazy"` + `content-visibility: auto`，屏幕外内容跳过渲染
- **动画降级**：`prefers-reduced-motion: reduce` 自动响应系统无障碍设置
- **Legacy bundle**：Vite `@vitejs/plugin-legacy` 产出 Chrome 78+ 兼容的 legacy bundle

### 2.4 树莓派部署步骤

```bash
# 1. 在开发机构建
pnpm --filter @ditto/shell build
# 产出 apps/shell/dist/

# 2. 服务端构建
cd server && pnpm build

# 3. 部署到树莓派
scp -r apps/shell/dist pi@rpi:/var/www/ditto/
scp -r server/dist pi@rpi:/opt/ditto-server/

# 4. 树莓派启动服务（PM2 守护）
ssh pi@rpi 'cd /opt/ditto-server && pm2 start dist/index.js --name ditto'
```

树莓派推荐使用 Raspberry Pi OS Lite + Chromium Kiosk 模式。

::: tip 树莓派推荐配置
- **系统**：Raspberry Pi OS Lite（无桌面环境，节省 RAM）
- **浏览器**：Chromium 84+（apt 安装）
- **GPU 内存**：`gpu_mem=128`（`/boot/config.txt`）
- **CPU 调度**：`ondemand` 或 `performance` governor
- **散热**：建议加装散热片，避免长时间运行降频
:::

## 3. 机房批量部署

### 3.1 架构

```
[教师机/服务器]
    ↓ HTTP/WS
[机房交换机]
    ↓
[学生机 1]  [学生机 2]  ...  [学生机 N]
(Chrome 80) (Chrome 80)      (Chrome 80)
```

所有学生机访问同一服务器，服务端通过 `CellInstance` 为每个用户隔离运行时数据。

### 3.2 服务器配置

```bash
# 服务器启动
PORT=3001 NODE_ENV=production node server/dist/index.js
```

::: tip 服务器硬件建议
- **CPU**：4 核以上（每 50 学生）
- **内存**：8GB（每 50 学生，按每用户 5 Cell × 128MB 估算）
- **磁盘**：SSD 50GB+
- **网络**：千兆内网，避免 HTTP/2 拥塞
:::

服务器提供：

- `/api/market/installed` — 已安装应用列表
- `/api/apps/:appId/frontend/` — 应用前端资源
- `/api/cell/:appId/*` — 应用后端 Cell API
- WebSocket — 实时通信

### 3.3 学生机配置

学生机只需 Chrome 80+ 浏览器，通过 GPO/策略统一配置：

- 启动页：`http://<服务器IP>:3001`
- 禁用地址栏（Kiosk 模式）
- 禁用下载/插件安装

::: warning Windows 组策略配置
通过 Windows GPO 统一推 Chrome 策略：

```
HKLM\SOFTWARE\Policies\Google\Chrome\
  - RestoreOnStartup = 4
  - RestoreOnStartupURLs = http://server:3001
  - URLBlacklist = chrome://*, chrome://settings
```

或使用 `master_preferences` 文件锁定启动页与扩展安装权限。
:::

### 3.4 应用分发

通过 Ditto Market 仓库（独立仓库）分发教学应用：

1. 教师在 Market 上架教学应用（`.dit` 包）
2. 学生机访问 Market 安装
3. 应用注册到 `appStore`，出现在开始菜单

::: tip 集中应用分发
- 服务器可在 `data/apps/` 预装应用包，所有学生共享
- 教师可用 `PUT /api/admin/quotas/user/:userId` 限制单个学生的应用数量
- 通过 `permissions.persistDecisions` 预设权限白名单，防止学生擅自安装
:::

## 4. Kiosk 信息终端模式

### 4.1 启用 Kiosk 模式

Ditto 的 PWA manifest 已配置 `display: standalone`，添加到主屏后全屏运行。

Chrome Kiosk 模式启动命令（Windows）：

```bash
chrome.exe --kiosk http://localhost:3001 --disable-translate --no-first-run
```

Linux / macOS：

```bash
chromium-browser --kiosk http://localhost:3001 --noerrdialogs --disable-translate
```

::: warning Kiosk 必备参数
- `--kiosk`：全屏无 UI
- `--disable-translate`：禁用翻译弹窗
- `--no-first-run` / `--noerrdialogs`：跳过首次运行向导与错误对话框
- `--incognito`（可选）：会话级缓存，重启清理
:::

### 4.2 Kiosk 定制

通过 `customTokens` 应用学校品牌色：

```typescript
const kernel = createKernel({
  desktop: { wallpaper: '/assets/kiosk-bg.jpg' },
  theme: {
    customTokens: {
      color: { primary: { '500': '#0066cc' } },  // 学校品牌色
    },
  },
});
```

### 4.3 自动启动

Windows 开机自启（注册表或任务计划）：

```powershell
# 任务计划：用户登录时启动 Chrome Kiosk
$action = New-ScheduledTaskAction -Execute "chrome.exe" -Argument "--kiosk http://localhost:3001"
$trigger = New-ScheduledTaskTrigger -AtLogOn
Register-ScheduledTask -TaskName "DittoKiosk" -Action $action -Trigger $trigger
```

Linux（systemd user service）：

```ini
# ~/.config/systemd/user/ditto-kiosk.service
[Unit]
Description=Ditto Kiosk
After=graphical.target

[Service]
ExecStart=/usr/bin/chromium-browser --kiosk http://localhost:3001 --noerrdialogs
Restart=always
RestartSec=3

[Install]
WantedBy=default.target
```

```bash
systemctl --user enable ditto-kiosk
systemctl --user start ditto-kiosk
```

::: tip Kiosk 屏保与电源管理
- 关闭屏幕保护：`xset s off` + `xset s noblank`（Linux X11）
- 关闭 DPMS：`xset -dpms`
- 防止屏幕进入睡眠：`systemd-inhibit --what=sleep`
:::

## 5. 多用户与权限管控

### 5.1 多用户 Cell 隔离

服务端 `AppCellManager` 为每个用户创建独立的 `CellInstance`：

- **shared 模式**：多用户共享一个 Cell（节省资源，适合只读应用）
- **exclusive 模式**：每用户独占 Cell（数据隔离，适合编辑类应用）

```typescript
// 服务端创建 Cell
const cell = await cellManager.createCell({
  appId: 'com.edu.notes',
  userId: 'student-001',
  replica: 'exclusive',
});
```

::: tip 模式选择建议
- **课件演示、视频播放** → `shared`（节省内存）
- **作业编辑、测验答题** → `exclusive`（数据隔离）
- **协作工具（共享文档）** → `shared` + WebSocket 同步
:::

### 5.2 权限白名单

通过 `PermissionManager` 预设权限决策：

```typescript
// 生产模式：未在 manifest 声明的权限默认拒绝
const kernel = createKernel({
  kernel: { dev: false },
  permissions: {
    autoGrantSystemApps: true,    // 系统应用自动授权
    persistDecisions: true,       // 持久化权限决策
  },
});
```

教师可在部署时预配置允许的应用白名单，学生无法安装未授权应用。

::: danger 生产环境必须 `dev: false`
开发模式 `dev: true` 会自动授权所有权限，教育场景务必关闭。否则学生应用可越权访问文件系统与网络。
:::

## 6. Chrome 80 兼容性

Ditto 完整支持 Chrome 80+（2020 年发布），确保老旧设备可用。

### 6.1 CSS 兼容

| 特性 | Chrome 支持版本 | Ditto 处理 |
|------|----------------|-----------|
| `inset: 0` | 87+ | 展开为 `top/right/bottom/left: 0` |
| flexbox `gap` | 84+ | PostCSS 插件自动添加 `> * + *` margin 回退 |
| `content-visibility` | 85+ | 旧版本自动降级（无性能优化但不报错） |

### 6.2 JS 兼容

- Vite `build.target: 'es2015'`（ES6 转译为 ES5 兼容）
- `@vitejs/plugin-legacy` 产出双 bundle：modern + legacy（Chrome 78+）
- `regenerator-runtime` polyfill 支持 async/await

### 6.3 验证

构建产出包含 `-legacy-*.js` 文件，即 legacy bundle。Chrome 80 会自动加载 legacy bundle。

```bash
# 检查 legacy bundle 是否存在
ls apps/shell/dist/assets/ | grep legacy
# 期望输出：index-legacy-*.js、polyfills-legacy-*.js
```

::: tip 详细兼容性矩阵
完整 Chrome 80 兼容性细节（包括 ES2020+ 语法、`Array.prototype.at()`、OPFS 等）请参考 [生产部署 → Chrome 80 兼容性说明](./production#chrome-80-兼容性说明)。
:::

## 7. 响应式与多设备

### 7.1 断点设计

Ditto 在 shell CSS 中定义了三档断点：

| 断点 | 范围 | 布局 |
|------|------|------|
| 桌面 | ≥ 1025px | 多窗口浮动 |
| 平板 | 769-1024px | 简化窗口 |
| 移动 | ≤ 768px | 单窗口 |

### 7.2 触摸设备

`useWindowStore` 自动检测 `pointer: coarse` 媒体查询，切换为触摸友好布局：

- 更大的点击区域
- 禁用悬停态
- 支持手势滑动

### 7.3 多分辨率

Ditto 使用相对单位（rem、%、vh/vw）布局，适配从 1024×600 到 4K 的各种分辨率。

::: tip 投影仪适配
- 1024×768（XGA）投影仪：自动进入「平板」断点
- 1920×1080（FHD）投影仪：进入「桌面」断点
- 配合 `taskbar.position: 'bottom'` 与 `taskbar.height: 52` 默认值即可
:::

## 8. 无障碍支持

### 8.1 WCAG 媒体查询

- **`prefers-reduced-motion: reduce`**：全局动画降级
- **`prefers-contrast: high`**：高对比度模式
- **`prefers-color-scheme: dark/light`**：`followSystem: true` 时跟随

### 8.2 ARIA 属性

核心组件已添加 ARIA 属性：

- `DStartMenu`：`role="dialog"` + `aria-label`
- `DDesktop` 图标：`role="button"` + `tabindex` + `aria-label`
- `DTaskbar`：`role="navigation"` + 动态 `aria-label`
- `DWidgetBoard`：关闭按钮 `aria-label`

### 8.3 键盘导航

所有交互元素支持 Tab 键焦点导航，符合 WCAG 2.1 AA 标准。

::: tip 特殊教育场景
- **视障学生**：开启系统读屏软件（NVDA / VoiceOver），ARIA 属性完整覆盖
- **运动障碍学生**：`prefers-reduced-motion` 自动降级动画，避免眩晕
- **色弱学生**：`prefers-contrast: high` 自动启用高对比度模式
:::

## 9. 教学应用开发建议

### 9.1 适合的教学应用类型

| 类型 | 示例 | Ditto 支持 |
|------|------|-----------|
| 课件演示 | PPT/白板 | iframe 应用 |
| 互动练习 | 测验/答题 | iframe + Cell 后端 |
| 协作工具 | 共享文档 | Cell WebSocket |
| 数据可视化 | 实验图表 | Widget 组件 |
| 主题皮肤 | 校园主题 | Theme 包（.ditz） |

### 9.2 开发流程

1. 参照 [第三方应用开发指南](../development/third-party) 创建应用
2. 编写 `manifest.json` 声明权限与窗口配置
3. 前端打包为静态资源，后端（可选）打包为 Cell 模块
4. 使用 Packager 打包为 `.dit` 文件
5. 上传到 Ditto Market 分发

### 9.3 教育场景权限最小化

教学应用应遵循最小权限原则：

```json
{
  "id": "com.edu.quiz",
  "permissions": [],
  "sandbox": "strict"
}
```

- 纯前端课件：`sandbox: "strict"`，无权限
- 需保存进度：`fs.write` 限定路径
- 需联网提交：`net.request` 限定域名

::: warning 教学应用安全红线
- ❌ 永远不要请求 `fs.*`（全路径）权限
- ❌ 永远不要请求 `kernel.shutdown` 权限
- ✅ 用 `sandbox: "strict"` 隔离学生应用
- ✅ 联网功能限定具体域名（`net.request` + 域名白名单）
:::

### 9.4 协作教学示例

利用 Cell WebSocket 实现教师 → 学生实时广播：

```typescript
// 教师端：广播题目到所有学生
const ws = new WebSocket('ws://server:3001/ws');
ws.send(JSON.stringify({
  type: 'auth',
  userId: 'teacher-001',
}));

ws.send(JSON.stringify({
  type: 'chat',
  channel: 'class-001',
  content: JSON.stringify({ kind: 'quiz', question: '...' }),
}));
```

```typescript
// 学生端：订阅频道接收
ws.send(JSON.stringify({ type: 'join', channel: 'class-001' }));
// onmessage 处理 chat 事件
```

::: tip 频道命名约定
- `class-{班级ID}`：班级群组
- `group-{小组ID}`：小组协作
- `private-{用户ID}`：私人消息
:::

## 相关文档

- [架构文档](../concepts/architecture) — Ditto WebOS 整体架构
- [第三方应用开发指南](../development/third-party) — 教学应用开发流程
- [主题系统](../ui/theme) — 校园主题与品牌定制
- [深度定制指南](../ui/customization) — 内核、动画、Token 定制
- [部署概览](./index) — 部署总览与导航
- [生产部署](./production) — Docker、nginx、PWA 部署详情
- [监控运维](./monitoring) — 多用户场景下的资源监控
