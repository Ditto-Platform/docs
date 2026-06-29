# 调试技巧

本页面介绍 Ditto 应用的调试方法。

## 开发模式启动

```bash
ditto-cli dev <project-dir>
```

或手动启动：

```bash
# 启动 Ditto Shell
cd Ditto && pnpm run dev

# 启动应用前端（独立）
cd my-app/frontend && pnpm run dev
```

## Chrome DevTools

由于应用运行在 iframe 中，调试需要：

1. 打开 Chrome DevTools (`F12`)
2. 切换到「Sources」面板
3. 在左侧找到 iframe 节点（通常是应用 ID）
4. 选择 iframe 内的脚本文件
5. 设置断点、查看 console

::: tip 快捷方式
在 DevTools 顶部下拉框中直接选择 iframe context。
:::

## Console 日志

应用内可使用标准 console 方法：

```typescript
console.log('Info message')
console.warn('Warning message')
console.error('Error message')
```

日志会输出到 iframe 的 console context。

## IPC 消息调试

使用 IPCBus 的 debug 模式：

```typescript
ipcBus.setDebug(true)  // 打印所有消息
```

或在 SDK 中：

```typescript
ipc.setDebug(true)
```

## 权限调试

开发模式下权限自动授权，无需确认。

生产模式测试权限流程：

```typescript
kernel.permissionManager.setInteractivePrompt(async (perm) => {
  console.log('[Permission Request]', perm)
  return true  // 或 false
})
```

## 后端 Cell 调试

后端运行在 Bun，直接使用 Bun 的调试功能：

```bash
bun run --inspect backend/index.ts
```

然后 attach Chrome DevTools 到 Bun 进程。

## 常见问题

### 应用加载空白

检查：
1. `manifest.entry` 路径正确
2. 前端构建产物位于正确目录
3. iframe origin 设置正确

### IPC 消息不响应

检查：
1. `manifest.permissions` 包含所需权限
2. IPCBus origin 验证通过
3. 后端 Cell 已启动

### 权限请求被拒绝

检查：
1. 权限已在 manifest 中声明
2. Kernel 处于生产模式 (`dev: false`)
3. 用户未在对话框中拒绝