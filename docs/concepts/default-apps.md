---
title: 默认应用关联
description: Ditto 如何将文件类型、URL scheme 与扩展名映射到应用 ID，注册、查询、用户覆盖与优先级解析。
---

# 默认应用关联

Ditto 把「文件类型 / URL scheme / 文件扩展名」映射到应用 ID，类似桌面操作系统的「默认打开方式」。这套机制由内核服务 `DefaultAppsService`（基于 Pinia store）提供，三方应用可通过 SDK 声明自己的处理器，用户也可在「设置 → 默认应用」中覆盖系统默认。

## 设计目标

- **三方应用可声明自己的处理器**：通过 SDK 注册 mimeType / scheme / extension。
- **用户偏好优先**：用户可在「设置 → 默认应用」中覆盖系统默认。
- **持久化**：用户覆盖持久化到 localStorage，跨会话保留。
- **可移植**：纯 Pinia store，无副作用，可在测试中注入。

## 服务 API

源码：`packages/services/src/default-apps/store.ts`

```typescript
import { useDefaultAppsStore } from '@ditto/services'

const store = useDefaultAppsStore()
```

`DefaultAppsService` 是 Kernel 内置服务之一，由 `ServiceRegistry` 在启动阶段懒加载（详见 [Kernel 架构](./kernel)）。它本身是一个 Pinia store，因此可以直接在测试中实例化并注入 mock。

### 注册处理器

应用启动时（通常在 SDK 初始化或 `onMount` 中）调用：

```typescript
// 注册 mimeType 处理器（isDefault=true 表示声明为系统默认）
store.registerMimeHandler('text/markdown', 'com.ditto.editor', true)
store.registerMimeHandler('text/plain', 'com.ditto.editor', false)

// 注册 URL scheme 处理器
store.registerSchemeHandler('mailto', 'com.ditto.mail', true)
store.registerSchemeHandler('tel', 'com.ditto.dialer', true)

// 注册文件扩展名处理器
store.registerExtensionHandler('.md', 'com.ditto.editor', true)
store.registerExtensionHandler('.json', 'com.ditto.editor', false)
```

::: warning isDefault 的含义
`isDefault=true` 表示该应用**声明**为系统默认；但若多个应用都声明为默认，最后注册的胜出。
用户覆盖始终优先于应用声明。
:::

注册处理器 API 签名：

| 方法 | 签名 | 说明 |
|------|------|------|
| `registerMimeHandler` | `(mimeType: string, appId: string, isDefault?: boolean) => void` | 注册 mimeType 处理器 |
| `registerSchemeHandler` | `(scheme: string, appId: string, isDefault?: boolean) => void` | 注册 URL scheme 处理器 |
| `registerExtensionHandler` | `(extension: string, appId: string, isDefault?: boolean) => void` | 注册文件扩展名处理器 |

`isDefault` 参数默认为 `false`。

::: tip extension 命名约定
扩展名 key 统一带点号前缀（如 `.md`、`.json`），便于与无点号的 mimeType 区分。注册时若漏写点号，会被自动补全。
:::

### 查询处理器

文件管理器、邮件客户端等打开外部资源时调用：

```typescript
// 按 mimeType 查询
const handler = store.getHandlerForMime('text/markdown')
// => { appId: 'com.ditto.editor', userOverride: false }

// 按文件扩展名查询
const handler = store.getHandlerForExtension('.md')

// 按 URL scheme 查询
const handler = store.getHandlerForScheme('mailto')

if (handler) {
  // 启动应用并传递文件路径
  await appStore.launchApp(handler.appId, { openFile: '/path/to/file.md' })
} else {
  // 显示"无可用应用"对话框
  dialogStore.alert({ title: '无法打开', message: '没有应用可以处理此文件类型' })
}
```

查询 API 签名：

| 方法 | 签名 | 返回 |
|------|------|------|
| `getHandlerForMime` | `(mimeType: string) => Handler \| null` | 返回处理器或 null |
| `getHandlerForExtension` | `(extension: string) => Handler \| null` | 返回处理器或 null |
| `getHandlerForScheme` | `(scheme: string) => Handler \| null` | 返回处理器或 null |

`Handler` 类型：

```typescript
interface Handler {
  appId: string
  userOverride: boolean   // 是否来自用户覆盖（true 表示用户手动指定）
}
```

### 列出所有候选（「打开方式」菜单）

实现「打开方式」右键菜单时，列出所有可处理某类型的已注册应用：

```typescript
const candidates = store.listHandlersForMime('text/markdown')
// => ['com.ditto.editor', 'com.ditto.notes', 'com.ditto.preview']

// 显示"打开方式"菜单让用户选择
contextMenu.value = {
  visible: true,
  x: e.clientX,
  y: e.clientY,
  items: candidates.map(appId => {
    const manifest = appStore.apps.find(a => a.id === appId)
    return {
      label: manifest?.name ?? appId,
      icon: manifest?.icon,
      action: () => appStore.launchApp(appId, { openFile: path }),
    }
  }),
}
```

`listHandlers*` 系列方法返回所有已注册的 appId 数组（按注册时间倒序）。对应方法：

| 方法 | 签名 | 说明 |
|------|------|------|
| `listHandlersForMime` | `(mimeType: string) => string[]` | 列出所有处理该 mime 的应用 |
| `listHandlersForExtension` | `(extension: string) => string[]` | 列出所有处理该扩展名的应用 |
| `listHandlersForScheme` | `(scheme: string) => string[]` | 列出所有处理该 scheme 的应用 |

::: tip 用户覆盖与候选列表
`listHandlers*` 返回的列表**包含**被用户覆盖的应用。也就是说，被用户设为默认的应用会出现在列表中（且排在前面）。如果你只想显示「非默认」候选，可通过 `getHandlerForMime` 拿到当前默认后从列表中过滤。
:::

### 用户覆盖

「设置 → 默认应用」面板调用，让用户改变默认：

```typescript
// 用户把 .md 默认改为 com.ditto.notes
store.setUserOverride('ext', '.md', 'com.ditto.notes')

// 恢复应用声明的默认
store.clearUserOverride('ext', '.md')
```

用户覆盖 API：

| 方法 | 签名 | 说明 |
|------|------|------|
| `setUserOverride` | `(type: 'mime' \| 'scheme' \| 'ext', key: string, appId: string) => void` | 设置用户覆盖 |
| `clearUserOverride` | `(type: 'mime' \| 'scheme' \| 'ext', key: string) => void` | 清除用户覆盖 |

用户覆盖存储在 `localStorage`，key 格式为 `{type}:{key}`，例如 `mime:text/markdown`、`ext:.md`、`scheme:mailto`。

::: warning 验证 appId 有效性
`setUserOverride` 不会校验 `appId` 是否已注册。若用户覆盖指向已卸载的应用，查询时会被自动忽略并回退到下一个候选（详见 [优先级解析](#优先级解析)）。
:::

### 注销应用

应用卸载时清理其所有注册：

```typescript
// 清理该应用注册的所有处理器
store.unregisterApp('com.ditto.editor')
```

| 方法 | 签名 | 说明 |
|------|------|------|
| `unregisterApp` | `(appId: string) => void` | 注销该应用的所有处理器 |

`unregisterApp` 会扫描所有三类（mime / scheme / ext）注册表，移除该 appId 的所有条目。但**不会**清除用户覆盖（因为用户覆盖可能仍指向其他应用），需要由调用方决定是否一并清理。

## 优先级解析

当查询某 mimeType 的处理器时，按以下顺序解析：

1. **用户覆盖**（`userOverrides['mime:text/markdown']`）—— 若存在且应用仍注册，使用之
2. **声明为系统默认**的应用（`isDefault=true`）—— 多个时取最后注册的
3. **最新注册**的应用（按 `registeredAt` 降序）

### 解析流程图

```
┌─────────────────────────────────┐
│  getHandlerForMime('text/md')   │
└────────────────┬────────────────┘
                 │
                 ▼
   ┌─────────────────────────────┐
   │ 1. 查找用户覆盖             │
   │  userOverrides['mime:text/md'] │
   └──────────────┬──────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
     存在                不存在
        │                   │
        ▼                   ▼
┌───────────────┐   ┌─────────────────────────┐
│ 验证 appId    │   │ 2. 查找 isDefault=true  │
│ 仍注册?       │   │    的应用（取最后注册）│
└───────┬───────┘   └────────────┬────────────┘
        │                        │
   ┌────┴────┐              ┌───┴────┐
  是         否            存在     不存在
   │         │              │        │
   ▼         ▼              ▼        ▼
 返回该 app  回退到 2   返回该 app  回退到 3
                         │
                         ▼
              ┌─────────────────────────┐
              │ 3. 取最新注册的应用     │
              │   （registeredAt 降序） │
              └────────────┬────────────┘
                          │
                  ┌───────┴────────┐
                有候选            无候选
                  │                │
                  ▼                ▼
            返回该 app         返回 null
```

### 解析示例

假设有如下注册顺序：

1. `com.ditto.editor` 注册 `text/markdown`，`isDefault=true`
2. `com.ditto.notes` 注册 `text/markdown`，`isDefault=false`
3. `com.ditto.preview` 注册 `text/markdown`，`isDefault=true`（最后注册且声明为默认）

| 查询 | 结果 | 原因 |
|------|------|------|
| `getHandlerForMime('text/markdown')` | `{ appId: 'com.ditto.preview', userOverride: false }` | 第 2 步：多个 `isDefault=true` 取最后注册的 |
| 用户调用 `setUserOverride('mime', 'text/markdown', 'com.ditto.notes')` 后查询 | `{ appId: 'com.ditto.notes', userOverride: true }` | 用户覆盖优先 |
| 卸载 `com.ditto.notes` 后查询 | `{ appId: 'com.ditto.preview', userOverride: false }` | 用户覆盖指向已卸载应用，回退到默认 |
| 卸载所有应用后查询 | `null` | 无候选 |

## 与 manifest 的关系

应用可在 `manifest.json` 中**声明**自己支持的文件类型（推荐做法，启动时由 SDK 自动注册）：

```json
{
  "id": "com.ditto.editor",
  "fileHandlers": [
    { "mimeType": "text/markdown", "extensions": [".md", ".markdown"], "isDefault": true },
    { "mimeType": "text/plain", "extensions": [".txt"], "isDefault": false },
    { "mimeType": "application/json", "extensions": [".json"], "isDefault": false }
  ]
}
```

`fileHandlers` 字段结构：

| 字段 | 类型 | 说明 |
|------|------|------|
| `mimeType` | `string` | 处理的 MIME 类型（如 `text/markdown`） |
| `extensions` | `string[]` | 关联的文件扩展名（含点号，如 `.md`） |
| `isDefault` | `boolean` | 是否声明为系统默认（可选，默认 `false`） |

SDK 在应用启动时读取 `fileHandlers` 字段并调用 `registerMimeHandler` / `registerExtensionHandler`。manifest 中的声明只是元信息，**实际注册发生在运行时**。

::: danger 当前状态
`fileHandlers` 字段当前为推荐规范，SDK 暂未自动注册。第三方应用应在 `onMount` 中显式调用 `registerMimeHandler` 等方法。

```typescript
import { onMounted } from 'vue'
import { useDefaultAppsStore } from '@ditto/sdk'

onMounted(() => {
  const store = useDefaultAppsStore()
  store.registerMimeHandler('text/markdown', 'com.ditto.editor', true)
  store.registerExtensionHandler('.md', 'com.ditto.editor', true)
})
```
:::

## 与浏览器 PWA file_handlers 的区别

浏览器原生 [File Handling API](https://developer.mozilla.org/docs/Web/Manifest/file_handlers) 只能在 PWA 安装后生效，且仅支持文件类型（不支持 URL scheme）。Ditto 的默认应用关联：

| 维度 | 浏览器 PWA | Ditto |
|------|-----------|-------|
| 生效条件 | PWA 安装后 | 无需安装，应用注册即生效 |
| 支持类型 | 仅文件 | mimeType / scheme / extension 三类 |
| 用户覆盖 | 不支持 | 支持「设置 → 默认应用」覆盖 |
| 「打开方式」菜单 | 不支持 | 支持，列出所有候选 |
| 运行环境 | 宿主浏览器 | Ditto 沙盒内（不污染宿主） |
| 跨会话持久化 | 不支持 | 用户覆盖持久化到 localStorage |

::: tip 为何不复用 PWA file_handlers
Ditto 应用运行在 iframe 沙盒中，并非传统 PWA，无法被宿主浏览器识别为可安装应用。因此需要自建一套类似但更强大的关联机制。如果你正在为 Ditto 编写应用，**不要**使用浏览器原生 `file_handlers`，应使用 SDK 的 `registerMimeHandler` 等 API。
:::

## 内置默认映射

Ditto 内置应用启动时注册的默认处理器（在 Shell `onMounted` 中）：

| 类型 | Key | 默认应用 |
|------|-----|---------|
| extension | `.md` | `com.ditto.editor` |
| extension | `.txt` | `com.ditto.editor` |
| extension | `.json` | `com.ditto.editor` |
| extension | `.js` | `com.ditto.editor` |
| extension | `.ts` | `com.ditto.editor` |
| extension | `.html` | `com.ditto.editor` |
| extension | `.css` | `com.ditto.editor` |
| mimeType | `text/*` | `com.ditto.editor` |
| mimeType | `application/json` | `com.ditto.editor` |

::: warning 抢占默认
第三方应用可通过 `isDefault=true` 抢占这些默认（最后注册的胜出），或通过 `setUserOverride` 让用户永久改变。

例如，第三方 Markdown 编辑器可以这样抢占 `.md` 默认：

```typescript
// 应用启动时
store.registerExtensionHandler('.md', 'com.example.markdown', true)
// 此时 .md 默认变为 com.example.markdown
```

但如果用户在设置中手动指定了其他应用，则用户覆盖始终胜出。
:::

## 测试

由于 `DefaultAppsStore` 是纯 Pinia store，可在测试中独立实例化：

```typescript
import { setActivePinia, createPinia } from 'pinia'
import { useDefaultAppsStore } from '@ditto/services'

beforeEach(() => {
  setActivePinia(createPinia())
})

test('user override takes precedence', () => {
  const store = useDefaultAppsStore()

  // 应用 A 声明默认
  store.registerMimeHandler('text/markdown', 'com.a', true)
  expect(store.getHandlerForMime('text/markdown')?.appId).toBe('com.a')

  // 用户覆盖为 B
  store.setUserOverride('mime', 'text/markdown', 'com.b')
  expect(store.getHandlerForMime('text/markdown')?.appId).toBe('com.b')
  expect(store.getHandlerForMime('text/markdown')?.userOverride).toBe(true)

  // 清除覆盖后回退到 A
  store.clearUserOverride('mime', 'text/markdown')
  expect(store.getHandlerForMime('text/markdown')?.appId).toBe('com.a')
})
```

::: tip localStorage 隔离
在 Node.js 测试环境中没有 `localStorage`，store 会自动降级为内存存储。在浏览器测试（如 Playwright）中，建议在 `beforeEach` 中清理 `localStorage`，避免跨用例污染。
:::

## 相关文档

- [Kernel 架构](./kernel)：DefaultAppsService 作为内核服务的注册时机
- [生命周期](./lifecycle)：应用启动时注册处理器的阶段
- [权限系统](./permission)：注册处理器无需权限，但启动应用传递文件路径需 `fs:read` 权限
- [组件库](/ui/components)：DContextMenu 可用于实现「打开方式」菜单
- [第三方应用开发](/development/third-party)：在应用 `onMount` 中注册处理器的完整示例
