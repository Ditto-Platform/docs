---
title: 组件库
description: "@ditto/ui 组件库：DWindow、DTaskbar、DDesktop、DIcon 等组件清单与使用示例。"
---

# 组件库

`@ditto/ui` 是 Ditto WebOS 的官方 Vue 3 组件库，提供构建桌面体验所需的全部组件。所有组件都消费 `--ditto-*` CSS 变量，因此切换主题即对所有组件即时生效。

## 安装

```bash
pnpm add @ditto/ui
```

`@ditto/ui` 依赖 `@ditto/theme` 注入的 CSS 变量，使用前请确保已在 Shell 入口初始化 ThemeEngine：

```typescript
import { getThemeEngine } from '@ditto/theme'

// 首次调用即创建单例并应用保存的主题
getThemeEngine()
```

## 引入方式

### 全量引入

适合快速原型或后台管理界面：

```typescript
import { createApp } from 'vue'
import DittoUI from '@ditto/ui'
import '@ditto/ui/dist/style.css'
import App from './App.vue'

const app = createApp(App)
app.use(DittoUI)
app.mount('#app')
```

### 按需引入

推荐用于生产环境，配合 `unplugin-vue-components` 实现自动 tree-shaking：

```typescript
// vite.config.ts
import Components from 'unplugin-vue-components/vite'
import { DittoResolver } from '@ditto/ui/resolver'

export default {
  plugins: [
    Components({
      dts: true,
      resolvers: [DittoResolver()],
    }),
  ],
}
```

或手动按需引入：

```typescript
import { DWindow, DIcon, DDialog } from '@ditto/ui'
import '@ditto/ui/dist/components/d-window.css'
import '@ditto/ui/dist/components/d-icon.css'
import '@ditto/ui/dist/components/d-dialog.css'
```

::: tip 全量 vs 按需
| 维度 | 全量引入 | 按需引入 |
|------|---------|---------|
| 打包体积 | 较大（~120KB gzip） | 仅引入使用部分 |
| 开发体验 | 开箱即用，无需配置 | 需配置 resolver 或手动 import CSS |
| 适用场景 | 原型、内部工具 | 生产环境、面向性能场景 |

第三方应用由于运行在 iframe 沙盒中且通常只使用少量组件，**强烈推荐按需引入**。
:::

## 组件清单

### DWindow — 窗口容器

源码：`packages/ui/src/components/d-window/`

窗口容器组件，支持拖拽、缩放、最大化、最小化、边缘吸附。

```vue
<template>
  <DWindow :win="windowConfig" @close="onClose">
    <!-- 窗口内容 -->
    <p>这是窗口内容</p>
  </DWindow>
</template>

<script setup>
const windowConfig = {
  id: 'win-1',
  title: '我的窗口',
  icon: 'fa-solid fa-folder',
  x: 100,
  y: 100,
  width: 800,
  height: 600,
  state: 'normal',
}
</script>
```

主要 props：

| Prop | 类型 | 说明 |
|------|------|------|
| `win` | `Window` | 窗口配置对象 |
| `resizable` | `boolean` | 是否允许缩放，默认 `true` |
| `draggable` | `boolean` | 是否允许拖拽，默认 `true` |
| `minWidth` | `number` | 最小宽度（覆盖 DittoConfig） |

### DTaskbar — 任务栏

源码：`packages/ui/src/components/d-taskbar/`

桌面底部任务栏，展示已打开窗口的图标，支持点击切换、右键关闭。

```vue
<template>
  <DTaskbar :windows="openWindows" @click="onTaskClick" />
</template>
```

### DDesktop — 桌面区域

源码：`packages/ui/src/components/d-desktop/`

桌面图标网格与壁纸容器。

```vue
<template>
  <DDesktop
    :icons="desktopIcons"
    :wallpaper="wallpaperUrl"
    @icon-dblclick="onIconOpen"
  />
</template>
```

### DStartMenu — 开始菜单

源码：`packages/ui/src/components/d-start-menu/`

点击任务栏开始按钮弹出的应用启动面板。

```vue
<template>
  <DStartMenu :apps="allApps" :visible="visible" @launch="onLaunch" />
</template>
```

### DContextMenu — 右键菜单

源码：`packages/ui/src/components/d-context-menu/`

```vue
<template>
  <DContextMenu :items="menuItems" @select="onSelect" />
</template>

<script setup>
const menuItems = [
  { label: '刷新', icon: 'fa-solid fa-rotate', action: 'refresh' },
  { label: '新建', icon: 'fa-solid fa-plus', action: 'create' },
  { type: 'separator' },
  { label: '设置', icon: 'fa-solid fa-gear', action: 'settings' },
]
</script>
```

菜单项结构：

```typescript
interface MenuItem {
  label?: string         // 显示文本，separator 类型可省略
  icon?: string          // FontAwesome class / URL / emoji
  action?: string        // 选择时回调的标识
  disabled?: boolean
  type?: 'separator'     // 分隔符
  children?: MenuItem[]  // 子菜单
}
```

### DNotification — 通知气泡

源码：`packages/ui/src/components/d-notification/`

单条通知气泡，通常由 `notificationStore` 自动渲染，无需手动使用。

```vue
<template>
  <DNotification :notification="notif" @close="onClose" />
</template>
```

### DNotificationCenter — 通知中心

源码：`packages/ui/src/components/d-notification-center/`

从屏幕边缘滑入的通知中心面板，聚合所有通知历史。

```vue
<template>
  <DNotificationCenter />
</template>
```

通过 `notificationStore` 推送通知：

```typescript
import { useNotificationStore } from '@ditto/stores'

const notificationStore = useNotificationStore()

notificationStore.pushNotification({
  title: '消息',
  body: '内容',
  type: 'info',           // 'info' | 'success' | 'warning' | 'error'
  source: 'system',
  persistent: false,        // true 时不会自动消失
})
```

### DControlCenter — 控制中心

源码：`packages/ui/src/components/d-control-center/`

系统控制中心面板，包含亮度、音量、电源等快捷开关。

```vue
<template>
  <DControlCenter />
</template>
```

### DLockScreen — 锁屏

源码：`packages/ui/src/components/d-lock-screen/`

锁屏界面，覆盖整个屏幕并要求解锁。

```vue
<template>
  <DLockScreen :locked="isLocked" @unlock="onUnlock" />
</template>

<script setup>
const isLocked = ref(false)

function onUnlock() {
  // 验证密码 / 指纹后调用
  isLocked.value = false
}
</script>
```

### DTaskSwitcher — 任务切换器

源码：`packages/ui/src/components/d-task-switcher/`

Alt+Tab 调出的全屏任务切换器。

```vue
<template>
  <DTaskSwitcher />
</template>
```

DTaskSwitcher 内部监听全局键盘事件，无需手动绑定 Alt+Tab。

### DGlobalSearch — 全局搜索

源码：`packages/ui/src/components/d-global-search/`

类似 macOS Spotlight 的全局搜索面板。

```vue
<template>
  <DGlobalSearch />
</template>
```

### DCalendarPanel — 日历面板

源码：`packages/ui/src/components/d-calendar-panel/`

日历组件，可独立使用或嵌入到通知中心。

```vue
<template>
  <DCalendarPanel v-model="selectedDate" :events="events" />
</template>

<script setup>
import { ref } from 'vue'

const selectedDate = ref(new Date())
const events = [
  { date: '2026-06-29', title: '项目评审' },
]
</script>
```

### DWidgetBoard — 桌面小组件面板

源码：`packages/ui/src/components/d-widget-board/`

桌面小组件容器，可放置天气、时钟、待办等小部件。

```vue
<template>
  <DWidgetBoard :widgets="widgets" />
</template>
```

### DDialog — 对话框

源码：`packages/ui/src/components/d-dialog/`

模态对话框组件，支持 `alert` / `confirm` / `prompt` 三种类型。底层由 `dialogStore` 管理。

```vue
<template>
  <DDialog :visible="visible" :type="type" @confirm="onConfirm" @cancel="onCancel">
    <!-- 自定义内容 -->
  </DDialog>
</template>
```

通过 `dialogStore` 调用（推荐方式，自动管理堆叠与焦点陷阱）：

```typescript
import { useDialogStore } from '@ditto/stores'

const dialogStore = useDialogStore()

// confirm
const result = await dialogStore.open('confirm', {
  title: '确认删除',
  message: '确定要删除这个文件吗？',
  okText: '删除',
  cancelText: '取消',
})

// alert
await dialogStore.open('alert', {
  title: '提示',
  message: '操作成功',
})

// prompt
const name = await dialogStore.open('prompt', {
  title: '重命名',
  defaultValue: '未命名',
  placeholder: '请输入新名称',
})
```

### DIcon — 统一图标组件

源码：`packages/ui/src/components/d-icon/`

`DIcon` 是 Ditto 的统一图标渲染组件，自动识别三种输入模式（FontAwesome class / URL / emoji）。详见 [图标系统](./icons)。

```vue
<template>
  <DIcon name="fa-solid fa-star" size="24px" />
</template>
```

## 完整使用示例

以下是一个组合使用多个组件的桌面入口示例：

```vue
<template>
  <div class="desktop-shell">
    <!-- 桌面与壁纸 -->
    <DDesktop :icons="desktopIcons" :wallpaper="wallpaper" />

    <!-- 任务栏 -->
    <DTaskbar :windows="windows" @start-click="showStartMenu = true">
      <template #start-button>
        <DIcon name="fa-solid fa-grid-2" size="20px" />
      </template>
    </DTaskbar>

    <!-- 开始菜单 -->
    <DStartMenu
      :apps="apps"
      :visible="showStartMenu"
      @launch="onLaunch"
      @close="showStartMenu = false"
    />

    <!-- 全局面板 -->
    <DNotificationCenter />
    <DControlCenter />
    <DGlobalSearch />
    <DTaskSwitcher />
    <DDialog />
    <DContextMenu />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import {
  DDesktop, DTaskbar, DStartMenu, DNotificationCenter,
  DControlCenter, DGlobalSearch, DTaskSwitcher,
  DDialog, DContextMenu, DIcon,
} from '@ditto/ui'
import '@ditto/ui/dist/style.css'

const showStartMenu = ref(false)
const windows = ref([])
const desktopIcons = ref([])
const apps = ref([])
const wallpaper = ref('/wallpapers/default.jpg')

function onLaunch(app) {
  // 启动应用并打开窗口
  windows.value.push({
    id: `${app.id}-${Date.now()}`,
    title: app.name,
    icon: app.icon,
    x: 100, y: 100,
    width: 800, height: 600,
    state: 'normal',
  })
}
</script>
```

## 样式定制

所有组件都通过 `--ditto-*` CSS 变量呈现视觉，因此可通过修改主题实现全局换肤。如需对单个组件定制视觉，使用 ThemeEngine 的组件级覆盖：

```typescript
import { getThemeEngine } from '@ditto/theme'

// 让 DDialog 使用紫色主色
getThemeEngine().setComponentOverride('dialog', {
  color: { primary: { 500: '#8b5cf6' } },
  radius: { window: '16px' },
})
```

详见 [主题定制 → 组件级覆盖](./theme#组件级覆盖)。

## 浏览器兼容性

`@ditto/ui` 目标浏览器为 Chrome 80+，已通过 polyfill 适配老旧浏览器：

- `ResizeObserver` polyfill
- `IntersectionObserver` polyfill
- `:focus-visible` polyfill

无需手动引入 polyfill，Shell 入口已统一注入。

## 相关文档

- [UI & 主题](./)：三大支柱总览
- [主题定制](./theme)：CSS 变量与组件级覆盖
- [图标系统](./icons)：DIcon 自动识别模式
- [SDK 参考](/development/sdk)：在第三方应用中使用组件
