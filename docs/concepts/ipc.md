---
title: IPC 通信
description: Ditto IPCBus v2 详解，包含关键变更（origin 白名单、中间件链、handler 异常隔离、pending 清理）、IPCMessage 协议、onion 模式中间件示例、跨窗口桥接 connectBridge 与 handler 错误隔离。
---

# IPC 通信

IPC（Inter-Process Communication）是 Ditto 中跨 Cell 消息传递的核心机制。IPCBus v2 在原版基础上强化了安全与稳定性：严格 origin 白名单、中间件链迭代执行、handler 异常隔离、销毁时清理 pending request。

源码位置：`packages/core/src/ipc/bus.ts`

## IPCBus v2 关键变更

相比 v1，IPCBus v2 引入以下破坏性变更：

1. **connectBridge 强制 origin 白名单**：拒绝 `*`，必须 `http(s)://...`，否则抛 `IPC_BRIDGE_DISCONNECTED`
2. **中间件链迭代执行**（onion 模式）：避免递归栈溢出，支持中间件吞消息
3. **handler 异常隔离**：单个 handler 抛错触发 `ipc:handler-error` 事件，不影响其他 handler
4. **destroy 清理 pending**：销毁时所有 pending request 立即 reject，避免内存泄漏

::: danger 破坏性变更
- v1 接受 `'*'` 作为 origin，v2 强制拒绝。所有 `connectBridge` 调用必须更新为完整 origin。
- v1 中间件递归执行，深链路可能栈溢出；v2 改为迭代执行。
- 升级时需检查所有 `connectBridge(win, '*')` 调用并替换为真实 origin。
:::

## IPCMessage 消息类型

所有 IPC 消息遵循统一的 `IPCMessage` 协议，定义在 `packages/shared/src/cell-contract.ts`：

```typescript
export interface IPCMessage {
  id: string;
  type: 'request' | 'response' | 'event' | 'error';
  channel: string;
  source: string;
  target?: string;        // 'host' / appId / '*'
  payload: unknown;
  timestamp: number;
  requestId?: string;     // request/response 配对
}
```

### 字段说明

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | `string` | 消息唯一 ID（UUID） |
| `type` | `'request' \| 'response' \| 'event' \| 'error'` | 消息类型 |
| `channel` | `string` | 频道名（如 `fs:read` / `app:launch`） |
| `source` | `string` | 发送方 appId 或 `'host'` |
| `target` | `string?` | 接收方 appId / `'host'` / `'*'`（广播） |
| `payload` | `unknown` | 消息体 |
| `timestamp` | `number` | 发送时间戳（ms） |
| `requestId` | `string?` | request/response 配对 ID，用于异步响应 |

### 消息类型语义

| 类型 | 描述 | 是否需响应 |
|------|------|------------|
| `request` | 请求消息，需响应 | 是 |
| `response` | 对 `request` 的响应 | — |
| `event` | 单向事件通知 | 否 |
| `error` | 错误响应 | — |

::: tip target 路由规则
`target` 字段决定消息路由：

- `'host'`：发送给 kernel / shell
- 具体 appId：发送给指定 Cell
- `'*'`：广播给所有监听者

详见 [Cell 沙盒](./cell) 中的 CellBridge 与 IPCBus 协作关系。
:::

## 中间件链（onion 模式）

IPCBus v2 采用 onion 模式（类似 Koa 中间件）：每个中间件可在 `next(message)` 之前/之后插入逻辑，可吞掉消息（不调 `next`）。

### 注册中间件

```typescript
// 注册中间件
const unsubscribe = kernel.ipc.use((message, next) => {
  console.log('[before]', message.channel);
  next(message);                    // 传递给下一层
  console.log('[after]', message.channel);
});

// 中间件可吞消息（不调 next 则后续不执行）
kernel.ipc.use((message, next) => {
  if (message.channel === 'blocked') return;  // 吞掉
  next(message);
});
```

### 执行顺序

假设注册了两个中间件 A、B：

```
A:before → B:before → [handler] → B:after → A:after
```

典型 onion 语义：请求从外向内穿透，响应从内向外返回。

::: warning 中间件吞消息的副作用
如果中间件不调 `next(message)`，后续中间件与 handler 都不会执行。对于 `request` 类型消息，调用方会一直等待响应直到超时。

最佳实践：
- 吞掉 `request` 消息前应主动 `respond` 错误，避免调用方超时
- 吞掉 `event` 消息无副作用
- 在中间件中记录被吞掉的消息，便于调试
:::

### 中间件典型应用

#### 1. 日志中间件

```typescript
kernel.ipc.use((message, next) => {
  const start = Date.now();
  next(message);
  console.log(`[ipc] ${message.channel} ${Date.now() - start}ms`);
});
```

#### 2. 鉴权中间件

```typescript
kernel.ipc.use((message, next) => {
  // 检查 source 是否有权限发送到 target
  if (message.target === 'host' && !isTrustedApp(message.source)) {
    console.warn('[ipc] rejected:', message.source);
    return;  // 吞掉
  }
  next(message);
});
```

#### 3. 限流中间件

```typescript
const counters = new Map<string, number>();
kernel.ipc.use((message, next) => {
  const count = (counters.get(message.source) ?? 0) + 1;
  if (count > 100) {
    console.warn('[ipc] rate limited:', message.source);
    return;
  }
  counters.set(message.source, count);
  next(message);
});
```

## 跨窗口桥接 connectBridge

`connectBridge` 用于将 IPCBus 扩展到 iframe / popup 窗口，实现跨窗口通信：

```typescript
// 连接 iframe / popup 窗口
kernel.ipc.connectBridge(iframe.contentWindow, 'https://app-origin.com');

// 严格校验：origin 不能为 '*'
kernel.ipc.connectBridge(win, '*');  // ❌ 抛 IPC_BRIDGE_DISCONNECTED
```

::: danger origin 白名单强制
v2 中 `connectBridge` 的 origin 参数必须为完整 `http(s)://host[:port]` 形式，不接受 `'*'`。这是为了防止：

- 恶意 iframe 通过 `'*'` 伪造来源
- 跨域消息在不明来源下被错误处理

如果应用确实需要多 origin 通信，应为每个 origin 单独调用 `connectBridge`。
:::

### connectBridge 工作原理

```typescript
// 简化实现
connectBridge(window: Window, origin: string) {
  if (!origin || origin === '*') {
    throw new DittoError('IPC_BRIDGE_DISCONNECTED', 'origin must be explicit');
  }

  // 监听 message 事件，校验 origin
  window.addEventListener('message', (event) => {
    if (event.origin !== origin) return;       // 拒绝其他 origin
    if (event.data?.type !== DITTO_MSG_TYPE) return;
    this.dispatch(event.data.message);         // 派发到 IPCBus
  });
}
```

## handler 错误隔离

handler 异常被捕获，派发到 `ipc:handler-error` 频道，**不影响同一频道的其他 handler**：

```typescript
kernel.ipc.on('ipc:handler-error', (msg) => {
  console.error('Handler error on', msg.payload.channel, msg.payload.error);
});
```

### 错误隔离的语义

```typescript
// 同一频道注册多个 handler
kernel.ipc.on('fs:read', handlerA);  // 抛错
kernel.ipc.on('fs:read', handlerB);  // 仍会执行

// 当 fs:read 消息到达时：
// 1. handlerA 抛错 → 捕获 → 派发 ipc:handler-error
// 2. handlerB 正常执行
// 3. 调用方收到 handlerB 的响应
```

::: tip 错误隔离 vs 错误传播
错误隔离确保单个 handler 失败不会导致整个 IPC 系统崩溃。但要注意：

- handler 抛错后，调用方可能收不到该 handler 的响应（如果它本应响应）
- 多个 handler 中只有一个应响应 `request`，其他应只观察
- 监听 `ipc:handler-error` 做集中式错误上报
:::

## 基础用法

### 发送消息

```typescript
// 发送请求并等待响应
const response = await kernel.ipc.request('fs:read', {
  path: '/data/file.txt',
}, {
  target: 'host',
  timeout: 5000,
});

// 发送单向事件
kernel.ipc.emit('app:launched', { appId: 'com.ditto.notes' }, {
  target: '*',
});
```

### 监听消息

```typescript
// 监听特定频道
const unsubscribe = kernel.ipc.on('fs:read:response', (payload, meta) => {
  // meta.sender 验证来源
  if (meta.sender !== 'host') return;
  // 处理响应
});

// 取消监听
unsubscribe();
```

## 安全验证

所有跨窗口消息必须携带 `origin` 字段，IPCBus 会验证：

1. origin 与 Cell 注册信息匹配
2. origin 有权限发送该类型消息
3. `connectBridge` 注册的 origin 与 `event.origin` 一致

::: danger 安全警告
IPCBus v2 强制验证 origin，不再允许 `*` 通配符。所有 IFrameSandbox 必须显式设置 origin。如果发现以下情况，应视为安全漏洞：

- `connectBridge` 调用使用 `'*'`
- IFrameSandbox 构造时未提供 origin
- 沙盒配置中 `allowSameOrigin: true` 但应用来源不明
:::

## 销毁与清理

`IPCBus.destroy()` 触发以下清理：

1. 移除所有 bridge 的 message 监听
2. reject 所有 pending request（避免内存泄漏）
3. 清空 handlers 与 middlewares
4. 派发 `ipc:destroyed` 事件

```typescript
// 销毁 IPCBus
await kernel.ipc.destroy();

// 所有 pending request 立即 reject
// 所有 listeners 自动清理
```

::: warning pending request 的清理
v1 在 destroy 时不会清理 pending request，导致：
- 调用方的 `await ipc.request(...)` 永远 hang
- 闭包引用的 message 对象无法 GC

v2 在 destroy 时立即 reject 所有 pending request，错误类型为 `IPC_DESTROYED`。调用方应捕获此错误并做降级处理。
:::

## 相关文档

- [架构概览](./)
- [Kernel 架构](./kernel)
- [Cell 沙盒](./cell)
- [权限系统](./permission)
- [生命周期](./lifecycle)
- [开发指南 - SDK 参考](/development/sdk)
- [API 参考 - 前端 API](/api/client)
