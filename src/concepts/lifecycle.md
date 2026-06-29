# 生命周期

本页面介绍 Ditto 中应用（Cell）的生命周期管理。

## AppCellManager API

Ditto 使用 `AppCellManager` 管理应用生命周期：

```typescript
// 启动应用
await kernel.cellManager.startCell(appId, options)

// 停止应用
await kernel.cellManager.stopCell(appId)

// 暂停应用（保留状态）
await kernel.cellManager.pauseCell(appId)

// 恢复应用
await kernel.cellManager.resumeCell(appId)
```

::: warning 注意
Shell 层的 `appStore.launchApp()` 只负责开窗，未调用 `kernel.cellManager.startCell()`。
这是当前架构缺陷，后续版本会修复。
:::

## ClientCell 状态机

客户端 Cell 使用 TRANSITIONS 状态机：

```
         ┌─────┐
         │ IDLE│
         └─────┘
            │ start()
            ↓
         ┌─────┐
         │STARTING│
         └─────┘
            │ ready
            ↓
         ┌─────┐
         │RUNNING│←───────┐
         └─────┘         │ resume()
            │ pause()    │
            ↓            │
         ┌─────┐         │
         │PAUSED │────────┘
         └─────┘
            │ stop()
            ↓
         ┌─────┐
         │STOPPED│
         └─────┘
```

## 服务端 CellInstance

服务端 CellInstance 对应 ClientCell，状态对称：

```typescript
interface CellInstance {
  id: string
  appId: string
  status: 'starting' | 'running' | 'paused' | 'stopping' | 'stopped'
  startedAt: number
  metadata: Record<string, unknown>
}
```

## 生命周期钩子

应用可注册生命周期钩子：

```typescript
// manifest 中声明
{
  "hooks": {
    "onStart": "hooks/start.ts",
    "onPause": "hooks/pause.ts",
    "onResume": "hooks/resume.ts",
    "onStop": "hooks/stop.ts"
  }
}
```

## 系统级生命周期

Ditto 启动流程：

```
storage → events → ipc → permissions → services → cells → ready
```

Ditto 关闭流程（逆序）：

```
cells → services → permissions → ipc → events → storage
```

## 下一步

生命周期理解后，可进入 [开发指南](/development/) 学习第三方应用开发。