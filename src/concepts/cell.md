# Cell 沙盒

Cell 是 Ditto 中应用的运行单元，提供隔离环境与 IPC 能力。

## 沙盒模式

Ditto 支持三种沙盒模式：

| 模式 | 描述 | 适用场景 |
|------|------|----------|
| `iframe-strict` | iframe 严格隔离，需要 origin | 第三方应用 |
| `trusted` | 信任模式，无隔离 | 内置系统应用 |
| `worker` | Web Worker 隔离（Phase 2） | 独立线程任务 |

## 创建 Cell

```typescript
// 启动 Cell
const cellId = await kernel.cellManager.startCell({
  appId: 'com.example.app',
  manifest: appManifest,
  origin: 'https://example.com',  // iframe-strict 必须
})

// 停止 Cell
await kernel.cellManager.stopCell(cellId)

// 暂停/恢复
await kernel.cellManager.pauseCell(cellId)
await kernel.cellManager.resumeCell(cellId)
```

## 前后端对称 Cell

应用可配置 `backend` 字段启动后端 Cell：

```json
{
  "backend": {
    "type": "cell",
    "entry": "backend/index.ts"
  }
}
```

前端通过 CellBridge 与后端通信，支持：
- 自动重连（指数退避）
- 心跳检测（ping/pong）
- 消息队列（确保顺序）

## CellRuntimeConfig.type

启动 Cell 时可指定运行时类型：

| 类型 | 沙盒 | 后端 Cell | 典型场景 |
|------|------|----------|----------|
| `iframe` | iframe-strict | ❌ | 简单前端应用 |
| `trusted` | trusted | ❌ | 内置系统应用 |
| `dit` | iframe-strict | ✅ | 前后端对称应用 |

## 与 AppManifest.type 的区别

`AppManifest.type` 描述应用分类（app/widget/plugin/theme/dit），决定打包扩展名。
`CellRuntimeConfig.type` 描述运行时沙盒。

两者独立：manifest.type='dit' 的应用通常以 CellRuntimeConfig.type='dit' 启动，但也可以以其他方式启动。

## 下一步

继续阅读 [IPC 通信](/concepts/ipc)。