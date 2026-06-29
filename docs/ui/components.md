# 组件库

本页面介绍 Ditto UI 组件库的使用方法。

## 安装

```bash
pnpm add @ditto/ui
```

## DIcon

统一图标渲染组件，支持三种模式：

```vue
<template>
  <!-- FontAwesome class -->
  <DIcon name="fa-solid fa-star" />
  
  <!-- URL 图片 -->
  <DIcon name="https://example.com/icon.svg" />
  
  <!-- Emoji fallback -->
  <DIcon name="📦" />
</template>
```

## DWindow

窗口容器组件：

```vue
<template>
  <DWindow :win="windowConfig" @close="onClose">
    <!-- 窗口内容 -->
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

## DDialog

对话框组件：

```vue
<template>
  <DDialog :visible="visible" :type="type" @confirm="onConfirm" @cancel="onCancel">
    <!-- 自定义内容 -->
  </DDialog>
</template>
```

使用 dialogStore：

```typescript
const dialogStore = useDialogStore()

const result = await dialogStore.open('confirm', {
  title: '确认删除',
  message: '确定要删除这个文件吗？',
  okText: '删除',
  cancelText: '取消',
})
```

## DContextMenu

右键菜单组件：

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

## DNotificationCenter

通知中心面板：

```vue
<template>
  <DNotificationCenter />
</template>
```

使用 notificationStore：

```typescript
const notificationStore = useNotificationStore()

notificationStore.pushNotification({
  title: '消息',
  body: '内容',
  type: 'info',
  source: 'system',
  persistent: false,
})
```

## DControlCenter

控制中心面板（亮度、音量、电源）：

```vue
<template>
  <DControlCenter />
</template>
```

## DLockScreen

锁屏界面：

```vue
<template>
  <DLockScreen :locked="isLocked" @unlock="onUnlock" />
</template>
```

## DTaskSwitcher

任务切换器（Alt+Tab）：

```vue
<template>
  <DTaskSwitcher />
</template>
```

## DGlobalSearch

全局搜索面板：

```vue
<template>
  <DGlobalSearch />
</template>
```