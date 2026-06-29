# Kernel 架构

Kernel 是 Ditto 的核心，负责服务编排、生命周期管理、IPC 通信。

## 创建 Kernel

Ditto 使用显式 `createKernel()` 创建内核实例：

```typescript
import { createKernel } from '@ditto/core'

const kernel = createKernel({
  kernel: { dev: true }  // dev 模式自动授权权限请求
})

await kernel.init()
```

::: warning 注意
已移除全局单例 `getKernel()`，所有组件通过 DI 获取 kernel：
```typescript
app.provide('kernel', kernel)
```
:::

## 服务注册

Kernel 内置 `ServiceRegistry`，使用工厂模式懒加载：

```typescript
kernel.serviceRegistry.register('clipboard', () => new ClipboardService())
kernel.serviceRegistry.register('search', () => new SearchService())
```

服务按注册顺序的逆序关闭，确保依赖关系正确。

## 生命周期编排

`LifecycleOrchestrator` 按阶段启动：

```
storage → events → ipc → permissions → services → cells → ready
```

单个阶段失败不会中断整体启动，错误会被记录并继续。

## 内核服务

| 服务 | 描述 |
|------|------|
| EventEmitter | 事件总线，支持 handler 错误隔离 |
| IPCBus | 跨 Cell 消息传递，严格来源验证 |
| PermissionManager | 权限申请，交互式确认对话框 |
| CellManager | Cell 启动/停止/暂停/恢复 |
| HotkeyService | 全局快捷键，capture-phase 捕获 |
| PowerService | 电源状态管理（锁屏/睡眠/重启） |
| DefaultAppsService | 默认应用关联（mime/scheme/extension） |