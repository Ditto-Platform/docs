---
title: 权限系统
description: Ditto PermissionManager v2 详解，包含 capability-based 设计（Capability 联合类型）、dev / prod 模式对比、持久化机制、全局单例已删除的破坏性变更，以及 PermissionManager 完整 API。
---

# 权限系统

PermissionManager 是 Ditto 的权限管理核心，所有敏感操作需申请权限。v2 采用 capability-based 设计，权限类型从 string 改为 `Capability` 联合类型，支持编辑器自动补全与自定义扩展。

源码位置：`packages/core/src/permission/manager.ts` + `packages/shared/src/cell-contract.ts`

## capability-based 设计

权限类型从 string 改为 `Capability` 联合类型，支持编辑器自动补全：

```typescript
export type Capability =
  | 'fs:read'
  | 'fs:write'
  | 'net:fetch'
  | 'net:websocket'
  | 'clipboard:read'
  | 'clipboard:write'
  | 'notification:show'
  | 'window:multi'
  | 'window:fullscreen'
  | 'cell:backend'
  | 'cell:peer'
  | (string & {});  // 兜底允许自定义扩展
```

### 设计要点

- **细粒度 capability**：每个权限是一个具体的 capability（如 `fs:read` / `fs:write`），而非粗粒度的角色
- **联合类型 + 兜底**：常用 capability 枚举 + `(string & {})` 允许自定义扩展，编辑器自动补全常用项
- **命名空间**：使用 `namespace:action` 格式（如 `net:fetch`），便于按命名空间批量管理

::: tip 为什么用 `(string & {})`
`(string & {})` 是 TypeScript 的常见技巧，使得类型既包含已知字面量，又允许任意字符串。这样：

- 输入 `'fs:read'` 时编辑器自动补全
- 输入自定义权限（如 `'my-app:custom'`）不报错
- 类型检查仍能发现拼写错误（如果完全没匹配）

避免直接用 `string`，那样会失去自动补全。
:::

### 内置 Capability 列表

| Capability | 命名空间 | 含义 |
|------------|---------|------|
| `fs:read` | `fs` | 读取文件 |
| `fs:write` | `fs` | 写入文件 |
| `net:fetch` | `net` | 网络请求（fetch） |
| `net:websocket` | `net` | WebSocket 连接 |
| `clipboard:read` | `clipboard` | 读取剪贴板 |
| `clipboard:write` | `clipboard` | 写入剪贴板 |
| `notification:show` | `notification` | 发送系统通知 |
| `window:multi` | `window` | 多窗口 |
| `window:fullscreen` | `window` | 全屏模式 |
| `cell:backend` | `cell` | 启动后端 Cell |
| `cell:peer` | `cell` | 与其他 Cell 通信 |

## PermissionManager API

```typescript
export class PermissionManager {
  constructor(opts: { dev?: boolean; store?: PersistenceStore; storageKey?: string });

  async request(appId: string, capability: Capability): Promise<boolean>;
  grant(appId: string, capability: Capability): void;
  revoke(appId: string, capability: Capability): void;
  isGranted(appId: string, capability: Capability): boolean;
  loadFromStore(): void;
  saveToStore(): void;
}
```

### 方法说明

| 方法 | 说明 |
|------|------|
| `request(appId, capability)` | 请求权限，dev 模式自动授权，prod 模式默认拒绝 |
| `grant(appId, capability)` | 显式授权（无需用户确认） |
| `revoke(appId, capability)` | 撤销权限 |
| `isGranted(appId, capability)` | 查询权限是否已授权 |
| `loadFromStore()` | 从 PersistenceStore 加载已持久化的决策 |
| `saveToStore()` | 保存当前决策到 PersistenceStore |

### 获取 PermissionManager 实例

通过 kernel.services 或便捷属性访问：

```typescript
// 方式 1：便捷属性
const pm = kernel.permissions;

// 方式 2：通过 ServiceRegistry
const pm = kernel.services.resolve<PermissionManager>('permissions');
```

## dev / prod 模式

PermissionManager 在 dev 与 prod 模式下的行为差异显著：

| 模式 | 行为 | 适用场景 |
|------|------|---------|
| `dev: true` | manifest 声明即自动授权（console.warn 提示） | 开发期，避免阻塞 |
| `dev: false`（默认） | 默认拒绝，console.warn 提示 | 生产环境 |

### dev 模式行为

```typescript
const kernel = createKernel({
  kernel: { dev: true },  // 开启 dev 模式
});

// 在 dev 模式下，所有 manifest 声明的权限自动授权
// 控制台输出：
// [PermissionManager] dev mode: auto-grant 'fs:read' to 'com.ditto.notes'
// [PermissionManager] dev mode: auto-grant 'fs:write' to 'com.ditto.notes'
```

::: warning dev 模式的安全风险
dev 模式会自动授权所有 manifest 声明的权限，**不应在生产环境使用**。如果误将 `dev: true` 部署到生产：

- 所有应用自动获得所有声明权限
- 用户不会被询问
- 任何应用可读取其他应用的数据

生产构建应通过环境变量确保 `dev: false`：

```typescript
const kernel = createKernel({
  kernel: { dev: import.meta.env.DEV },  // 仅在 Vite dev 模式下为 true
});
```
:::

### prod 模式行为

在 prod 模式下：

- 默认拒绝所有未授权的权限请求
- 应用需通过 `requestPermission` 主动询问用户
- 用户确认后才会 `grant`

```typescript
// 应用 manifest 声明权限
{
  "id": "com.ditto.notes",
  "permissions": ["fs:read", "fs:write", "notification:show"]
}

// 应用代码中请求权限
const granted = await kernel.permissions.request('com.ditto.notes', 'fs:write');
if (!granted) {
  // 用户拒绝，降级处理
  showReadOnlyMode();
}
```

## 权限申请流程

完整的权限申请链路如下：

```
1. 应用 manifest 声明 permissions
   ↓
2. ClientCell.activate() 遍历 manifest.permissions
   ↓
3. 调用 requestPermission 回调
   ↓
4. PermissionManager.request(appId, capability)
   ↓
   ├─ dev 模式 → 自动 grant
   └─ prod 模式 → 询问用户（如有交互式回调）
       ↓
   ┌─ 用户同意 → grant + 持久化
   └─ 用户拒绝 → 不 grant + 持久化（避免重复询问）
```

::: tip 持久化避免重复询问
一旦用户做出决策（同意或拒绝），决策会被持久化。下次同一应用请求同一权限时，直接返回已记录的决策，不再弹出对话框。

用户可在系统设置中手动 `revoke` 权限，重新触发询问。
:::

## 持久化机制

权限决策通过 `PersistenceStore` 跨会话保留：

- **加载时机**：kernel `permissions` stage 调用 `loadFromStore()`
- **保存时机**：每次 `grant` / `revoke` 后调用 `saveToStore()`
- **存储 key**：`PermissionManager` 构造时通过 `storageKey` 指定（默认 `'ditto:permissions'`）

### 持久化结构

```typescript
// PersistenceStore 中的权限记录
{
  "com.example.app": {
    "fs:read": true,
    "fs:write": true,
    "notification:show": false
  },
  "com.ditto.notes": {
    "fs:read": true,
    "fs:write": true
  }
}
```

### 加载与保存

```typescript
// kernel init 时自动加载（permissions stage）
// 等价于：
kernel.permissions.loadFromStore();

// 应用可手动保存（通常不需要，grant/revoke 会自动保存）
kernel.permissions.saveToStore();
```

::: info 请求链路
完整的请求链路：

`ClientCell.activate` → 遍历 `manifest.permissions` → `requestPermission` 回调 → `PermissionManager.request`
:::

## 全局单例已删除（破坏性变更）

`getPermissionManager()` 已删除（破坏性变更），改用依赖注入：

```typescript
// ❌ 旧 API（已删除）
import { getPermissionManager } from '@ditto/core';
const pm = getPermissionManager();

// ✅ 新 API
const pm = kernel.permissions;          // 直接访问
// 或
const pm = kernel.services.resolve<PermissionManager>('permissions');
```

::: danger 破坏性变更
如果你的代码中仍有 `getPermissionManager()` 调用，升级到 v2 后会编译失败。需要：

1. 在所有调用处替换为 `kernel.permissions` 或 `kernel.services.resolve('permissions')`
2. 确保调用处能访问到 kernel 实例（通过 DI 或 props 传递）
3. 检查是否有全局缓存的旧 pm 实例，替换为通过 kernel 获取

此变更与 `getKernel()` 删除同步进行，统一去除全局单例，强制显式依赖注入。
:::

### 迁移示例

```typescript
// ❌ 旧代码
import { getPermissionManager } from '@ditto/core';

async function checkPermission(appId: string) {
  const pm = getPermissionManager();
  return pm.isGranted(appId, 'fs:read');
}

// ✅ 新代码
import { inject } from 'vue';

async function checkPermission(appId: string) {
  const kernel = inject('kernel');
  return kernel.permissions.isGranted(appId, 'fs:read');
}
```

## 完整使用示例

```typescript
import { createKernel } from '@ditto/core';
import { registerKernelServices } from '@ditto/services';

const kernel = createKernel({
  kernel: { id: 'my-kernel', dev: false },  // 生产模式
});

await kernel.init();
registerKernelServices(kernel);

const pm = kernel.permissions;

// 查询权限
if (!pm.isGranted('com.ditto.notes', 'fs:write')) {
  // 请求权限（prod 模式会询问用户）
  const granted = await pm.request('com.ditto.notes', 'fs:write');
  if (!granted) {
    throw new Error('用户拒绝 fs:write 权限');
  }
}

// 显式授权（如管理员操作）
pm.grant('com.ditto.notes', 'notification:show');

// 撤销权限
pm.revoke('com.ditto.notes', 'fs:write');

// 保存到 PersistenceStore（通常自动触发）
pm.saveToStore();
```

## 相关文档

- [架构概览](./)
- [Kernel 架构](./kernel)
- [Cell 沙盒](./cell)
- [IPC 通信](./ipc)
- [生命周期](./lifecycle)
- [开发指南 - 第三方应用开发](/development/third-party)
- [API 参考 - 前端 API](/api/client)
