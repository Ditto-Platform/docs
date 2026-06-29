# IPC 通信

IPC（Inter-Process Communication）是 Ditto 中跨 Cell 消息传递的核心机制。

## IPCBus 架构

IPCBus v2 采用严格来源验证：

```typescript
// 发送消息
ipcBus.send('fs.read', { path: '/data/file.txt' }, {
  origin: 'com.example.app',  // 必须与 Cell origin 匹配
  target: 'server'            // 目标：server / kernel / other-cell
})

// 监听消息
ipcBus.on('fs.read:response', (payload, meta) => {
  // meta.sender 验证来源
  if (meta.sender !== 'server') return
  // 处理响应
})
```

## CellBridge

前端 Cell 通过 CellBridge 与后端 Cell 通信：

```typescript
// 客户端
import { createCellBridge } from '@ditto/sdk'

const bridge = createCellBridge({
  appId: 'com.ditto.counter',
  wsUrl: 'ws://localhost:3000/cell/com.ditto.counter',
})

bridge.connect()
bridge.send('increment', { value: 1 })
bridge.on('count:updated', (data) => {
  console.log('New count:', data.count)
})

// 断线重连（自动）
bridge.on('disconnected', () => console.log('Disconnected'))
bridge.on('reconnected', () => console.log('Reconnected'))
```

## 消息类型

| 类型 | 描述 |
|------|------|
| `request` | 请求消息，需响应 |
| `response` | 响应消息 |
| `event` | 单向事件通知 |
| `stream` | 流式数据（实时同步） |

## 安全验证

所有消息必须携带 `origin` 字段，IPCBus 会验证：

1. origin 与 Cell 注册信息匹配
2. origin 有权限发送该类型消息

::: danger 安全警告
IPCBus v2 强制验证 origin，不再允许 `*` 通配符。所有 IFrameSandbox 必须显式设置 origin。
:::

## 下一步

继续阅读 [权限系统](/concepts/permission)。