# 类型定义

本页面介绍 Ditto TypeScript 类型定义。

## AppManifest

应用清单类型：

```typescript
interface AppManifest {
  id: string                    // 唯一标识，reverse-domain
  name: string                  // 显示名称
  version: string               // 版本号，semver
  description?: string          // 描述
  icon?: string                 // 图标（FontAwesome class 或 URL）
  type?: 'app' | 'widget' | 'plugin' | 'theme' | 'dit'  // 应用类型
  entry: string                 // 入口文件路径
  category?: string             // 分类
  sandbox: 'strict' | 'trusted' // 沙盒模式
  permissions: string[]         // 权限列表
  window: {
    width: number
    height: number
    minWidth?: number
    minHeight?: number
    resizable?: boolean
    maximizable?: boolean
  }
  backend?: {
    type: 'cell'
    entry: string
  }
  hooks?: {
    onStart?: string
    onPause?: string
    onResume?: string
    onStop?: string
  }
}
```

## AppInstance

应用实例类型：

```typescript
interface AppInstance {
  id: string
  appId: string
  windowId: string
  status: 'starting' | 'running' | 'stopping' | 'stopped'
  startedAt: number
}
```

## NotificationEntry

通知类型：

```typescript
interface NotificationEntry {
  id: string
  title: string
  body: string
  type: 'info' | 'success' | 'warning' | 'error'
  source: string
  timestamp: number
  read: boolean
  persistent: boolean
  icon?: string
  action?: () => void
}
```

## CellInstance

服务端 Cell 实例：

```typescript
interface CellInstance {
  id: string
  appId: string
  status: 'starting' | 'running' | 'paused' | 'stopping' | 'stopped'
  startedAt: number
  metadata: Record<string, unknown>
}
```

## IPCMessage

IPC 消息类型：

```typescript
interface IPCMessage {
  type: 'request' | 'response' | 'event' | 'stream'
  action: string
  payload: unknown
  meta: {
    sender: string
    target: string
    timestamp: number
  }
}
```

## ThemeTokens

主题令牌：

```typescript
interface ThemeTokens {
  colorScheme: 'light' | 'dark'
  colors: {
    primary: string
    background: string
    text: string
    border: string
    // ...
  }
  typography: {
    fontFamily: string
    fontSize: {
      base: string
      small: string
      large: string
    }
  }
  spacing: {
    base: string
    // ...
  }
}
```

## LayoutMode

窗口布局模式：

```typescript
type LayoutMode = 'floating' | 'tiling' | 'snap'
```

## AnimationPreset

动画档位：

```typescript
type AnimationPreset = 'none' | 'subtle' | 'normal' | 'expressive'
```

## 下一步

API 了解后，可进入 [UI & 主题](/ui/) 学习界面定制。