# SDK 参考

Ditto SDK 是前端应用与系统交互的桥梁。

## 安装

```bash
pnpm add @ditto/sdk
```

## API 模块

### fs - 文件系统

```typescript
import { fs } from '@ditto/sdk'

// 权限请求
await fs.requestPermission('read')
await fs.requestPermission('write')

// 读取文件
const content = await fs.readFile('/path/to/file')

// 写入文件
await fs.writeFile('/path/to/file', 'Hello World')

// 删除文件
await fs.deleteFile('/path/to/file')

// 列出目录
const files = await fs.listDir('/path/to/dir')
```

### notification - 通知

```typescript
import { notification } from '@ditto/sdk'

// 发送通知
notification.push({
  title: '通知标题',
  body: '通知内容',
  type: 'info',  // info/success/warning/error
  persistent: false,
})
```

### clipboard - 剪贴板

```typescript
import { clipboard } from '@ditto/sdk'

// 写入剪贴板
await clipboard.write('text content')

// 读取剪贴板
const text = await clipboard.read()
```

### net - 网络

```typescript
import { net } from '@ditto/sdk'

// 发起请求（需 net.request 权限）
const response = await net.fetch('https://api.example.com/data', {
  method: 'GET',
  headers: { 'Authorization': 'Bearer token' },
})
```

### ui - UI 控制

```typescript
import { ui } from '@ditto/sdk'

// 打开新窗口
ui.openWindow({
  url: 'https://example.com',
  title: '外部链接',
  width: 800,
  height: 600,
})

// 关闭当前窗口
ui.closeWindow()
```

### ipc - IPC 通信

```typescript
import { ipc } from '@ditto/sdk'

// 发送消息
ipc.send('custom:event', { data: 'value' })

// 监听消息
ipc.on('custom:response', (payload) => {
  console.log('Received:', payload)
})
```

### auth - 用户认证

```typescript
import { auth } from '@ditto/sdk'

// 获取当前用户
const user = await auth.getCurrentUser()

// 登录
await auth.login({ username: 'user', password: 'pass' })

// 登出
await auth.logout()
```

## CellBridge

用于与后端 Cell 通信：

```typescript
import { createCellBridge } from '@ditto/sdk'

const bridge = createCellBridge({
  appId: 'com.example.app',
  wsUrl: 'ws://localhost:3000/cell/com.example.app',
})

await bridge.connect()

// 发送并等待响应
const result = await bridge.request('action', { param: 'value' })

// 监听事件
bridge.on('event', (data) => console.log(data))
```

## 下一步

继续阅读 [CLI 脚手架](/development/cli)。