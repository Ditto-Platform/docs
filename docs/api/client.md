# 前端 API

本页面介绍 Ditto 前端 SDK 与 Store API。

## SDK API

详见 [SDK 参考](/development/sdk)。

### fs

```typescript
import { fs } from '@ditto/sdk'

await fs.readFile('/path/to/file')
await fs.writeFile('/path/to/file', 'content')
await fs.deleteFile('/path/to/file')
await fs.listDir('/path/to/dir')
```

### notification

```typescript
import { notification } from '@ditto/sdk'

notification.push({
  title: '标题',
  body: '内容',
  type: 'info',
  persistent: false,
})
```

### clipboard

```typescript
import { clipboard } from '@ditto/sdk'

await clipboard.write('text')
const text = await clipboard.read()
```

### ipc

```typescript
import { ipc } from '@ditto/sdk'

ipc.send('event', { data: 'value' })
ipc.on('response', (payload) => { ... })
```

## Store API

### useAppStore

```typescript
const appStore = useAppStore()

// 注册应用
appStore.registerApp(manifest)

// 启动应用
await appStore.launchApp(appId)

// 停止应用
await appStore.terminateApp(instanceId)

// 获取应用列表
const apps = appStore.apps
const runningApps = appStore.runningApps
```

### useWindowStore

```typescript
const windowStore = useWindowStore()

// 打开窗口
windowStore.openWindow(manifest)

// 关闭窗口
windowStore.closeWindow(windowId)

// 最小化/最大化
windowStore.minimizeWindow(windowId)
windowStore.maximizeWindow(windowId)

// 设置布局模式
windowStore.setLayoutMode('floating')
```

### useDialogStore

```typescript
const dialogStore = useDialogStore()

// 打开对话框
const result = await dialogStore.open('confirm', {
  title: '确认',
  message: '确定要删除吗？',
  okText: '删除',
  cancelText: '取消',
})

if (result.confirmed) {
  // 用户确认
}
```

### useNotificationStore

```typescript
const notificationStore = useNotificationStore()

// 推送通知
notificationStore.pushNotification({
  title: '通知',
  body: '内容',
  type: 'info',
  source: 'system',
  persistent: false,
})

// 清除通知
notificationStore.clearNotification(notificationId)
notificationStore.clearAllNotifications()
```