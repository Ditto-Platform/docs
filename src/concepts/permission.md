# 权限系统

PermissionManager 是 Ditto 的权限管理核心，所有敏感操作需申请权限。

## 权限类型

Ditto 定义了以下常用权限：

| 权限 | 描述 |
|------|------|
| `fs.read` | 读取文件 |
| `fs.write` | 写入文件 |
| `net.request` | 网络请求 |
| `clipboard.read` | 读取剪贴板 |
| `clipboard.write` | 写入剪贴板 |
| `notification` | 发送通知 |
| `geolocation` | 获取位置 |
| `camera` | 访问摄像头 |
| `microphone` | 访问麦克风 |
| `storage` | 本地存储 |

## 权限申请流程

1. **应用声明权限**：在 `manifest.permissions` 中声明
2. **用户确认**：首次使用时弹出确认对话框
3. **权限记录**：确认后记录到 PermissionStore
4. **后续使用**：已授权的权限自动通过

```typescript
// 应用 manifest
{
  "permissions": ["fs.read", "fs.write", "notification"]
}

// 代码中请求权限
await kernel.permissionManager.requestPermission('fs.write')
```

## 开发模式 vs 生产模式

| 模式 | 权限处理 | 适用场景 |
|------|----------|----------|
| `dev: true` | 自动授权所有请求 | 开发调试 |
| `dev: false` | 交互式确认，未声明权限拒绝 | 生产环境 |

::: warning 注意
生产模式下，未在 manifest 中声明的权限请求会被直接拒绝，不会弹出确认对话框。
:::

## 交互式确认对话框

生产模式需要注入交互式回调：

```typescript
kernel.permissionManager.setInteractivePrompt(async (permission, context) => {
  // 返回对话框结果
  const result = await dialogStore.open('confirm', {
    title: '权限请求',
    message: `"${context.appName}" 需要申请 "${permission}" 权限`,
    okText: '允许',
    cancelText: '拒绝',
  })
  return result.confirmed
})
```

## 权限存储

授权记录持久化到 localStorage：

```typescript
// PermissionStore 结构
{
  "com.example.app": {
    "fs.read": true,
    "fs.write": true,
    "notification": false
  }
}
```

## 下一步

继续阅读 [生命周期](/concepts/lifecycle)。