---
title: 监控运维
description: Ditto WebOS 监控运维指南——健康检查、Cell 状态、/api/admin/metrics、资源配额、流量整形、弹性扩缩与日志查看。
---

# 监控运维

本页面介绍 Ditto WebOS 的性能监控、故障排查与日常运维。Ditto 服务端提供完整的 admin API 用于实时查看 Cell 状态、资源使用、流量整形与弹性扩缩状态。

## 目录

- [健康检查端点](#健康检查端点)
- [Cell 状态监控](#cell-状态监控)
- [系统指标（/api/admin/metrics）](#系统指标-api-admin-metrics)
- [资源配额与限流](#资源配额与限流)
- [流量整形](#流量整形)
- [弹性扩缩配置](#弹性扩缩配置)
- [日志查看](#日志查看)
- [Docker 日志](#docker-日志)
- [常见故障排查](#常见故障排查)

## 健康检查端点

Ditto 服务端提供两个层级的健康检查端点。

### 全局健康检查

```bash
curl http://localhost:3001/api/health
```

响应示例：

```json
{
  "status": "ok",
  "timestamp": 1735500000000,
  "cells": {
    "total": 12,
    "running": 8,
    "hibernated": 4
  },
  "resources": {
    "totalQuotas": 12,
    "totalUsers": 5,
    "totalApps": 3,
    "overallMemoryMB": 412,
    "overallCpuPercent": 32
  }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `status` | `string` | 始终为 `"ok"`，服务端可用即返回 |
| `timestamp` | `number` | 当前时间戳（ms） |
| `cells.total` | `number` | Cell 总数（含运行 + 休眠） |
| `cells.running` | `number` | 运行中 Cell 数 |
| `cells.hibernated` | `number` | 休眠 Cell 数 |
| `resources.totalQuotas` | `number` | 已分配配额数 |
| `resources.totalUsers` | `number` | 活跃用户数 |
| `resources.totalApps` | `number` | 活跃应用数 |
| `resources.overallMemoryMB` | `number` | 总内存占用（MB） |
| `resources.overallCpuPercent` | `number` | 总 CPU 占比 |

::: tip 用于负载均衡健康探测
`/api/health` 响应快、不依赖外部服务，适合配置到 nginx / Kubernetes 的健康探测：

```nginx
location /health {
    proxy_pass http://server:3001/api/health;
}
```

```yaml
# Kubernetes liveness/readiness probe
livenessProbe:
  httpGet:
    path: /api/health
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 30
```
:::

### Cell 子系统健康检查

```bash
# 全局 Cell 子系统健康
curl http://localhost:3001/api/cell/health

# 单个应用 Cell 状态
curl http://localhost:3001/api/cell/com.ditto.notes/health
```

## Cell 状态监控

通过 `/api/admin/cells` 端点查看所有 Cell 实例状态。

### 列出全部 Cell

```bash
curl http://localhost:3001/api/admin/cells
```

响应：

```json
{
  "cells": [
    {
      "cellId": "cell-001",
      "appId": "com.ditto.notes",
      "status": "running",
      "userIds": ["alice"],
      "createdAt": 1735500000000,
      "lastActivityAt": 1735500600000
    }
  ],
  "total": 1,
  "running": 1,
  "hibernated": 0,
  "error": 0
}
```

| 状态 | 含义 |
|------|------|
| `running` | 运行中，可正常处理请求 |
| `hibernated` | 冬眠，等待唤醒 |
| `error` | 异常，需排查日志 |

### Cell 详情（含资源指标）

```bash
curl http://localhost:3001/api/admin/cells/cell-001
```

```json
{
  "cellId": "cell-001",
  "appId": "com.ditto.notes",
  "status": "running",
  "userIds": ["alice"],
  "createdAt": 1735500000000,
  "lastActivityAt": 1735500600000,
  "memoryUsageMB": 64,
  "cpuUsage": 5,
  "requestCount": 128
}
```

### Cell 自定义指标

```bash
curl http://localhost:3001/api/admin/cells/cell-001/metrics
```

```json
{
  "cellId": "cell-001",
  "appId": "com.ditto.notes",
  "memoryUsageMB": 64,
  "cpuUsage": 5,
  "requestCount": 128,
  "customMetrics": {
    "activeNotes": 12,
    "dbSize": "2.4MB"
  }
}
```

`customMetrics` 由应用通过 `recordMetric()` 自定义上报，便于追踪业务指标。

### Cell 生命周期管理

通过 admin API 控制 Cell 生命周期：

```bash
# 唤醒休眠的 Cell
curl -X POST http://localhost:3001/api/admin/cells/cell-001/start

# 停止并销毁 Cell
curl -X POST http://localhost:3001/api/admin/cells/cell-001/stop

# 强制休眠 Cell（释放内存）
curl -X POST http://localhost:3001/api/admin/cells/cell-001/hibernate
```

::: warning admin 端点无鉴权
当前 `/api/admin/*` 未强制鉴权，生产部署建议在 nginx 前置网关层加权限校验：

```nginx
location /api/admin/ {
    # 仅允许内网访问
    allow 10.0.0.0/8;
    deny all;
    proxy_pass http://server:3001;
}
```
:::

## 系统指标（/api/admin/metrics）

`/api/admin/metrics` 是综合监控端点，整合 Cell、资源、流量与弹性扩缩状态。

```bash
curl http://localhost:3001/api/admin/metrics
```

响应结构：

```json
{
  "timestamp": 1735500600000,
  "cells": {
    "total": 12,
    "running": 8,
    "hibernated": 4,
    "error": 0
  },
  "resources": {
    "totalQuotas": 12,
    "totalUsers": 5,
    "totalApps": 3,
    "overallMemoryMB": 412,
    "overallCpuPercent": 32
  },
  "traffic": {
    "totalApps": 3,
    "totalRequests": 15420,
    "totalThrottled": 23,
    "throttleRate": 0.0015
  },
  "scaler": {
    "config": {
      "highLoadThreshold": 0.8,
      "lowLoadThreshold": 0.3,
      "checkIntervalMs": 30000,
      "hibernateAfterMs": 900000,
      "wakeTimeoutMs": 3000,
      "maxMemoryMB": 1024,
      "maxCpuPercent": 80
    },
    "overallCpu": 32,
    "overallMemoryMB": 412,
    "loadInfo": [
      {
        "appId": "com.ditto.notes",
        "userId": "alice",
        "lastActivityAt": 1735500600000,
        "cpuUsage": 5,
        "memoryUsageMB": 64,
        "requestCount": 128
      }
    ]
  },
  "appMetrics": {
    "com.ditto.notes": { "activeNotes": 12 }
  }
}
```

::: tip 监控集成
将 `/api/admin/metrics` 接入 Prometheus / Grafana：

1. 编写 exporter 调用该端点，转换为 Prometheus 格式
2. 设置 scrape interval 为 30s（与 `scaler.checkIntervalMs` 对齐）
3. 关键指标：`overallMemoryMB`、`overallCpu`、`throttleRate`、`cells.hibernated`

或直接使用 Grafana 的 JSON API 数据源，配置 URL 指向 `/api/admin/metrics`。
:::

## 资源配额与限流

Ditto 通过 `ResourceQuotaManager` 为每个 `(appId, userId)` 维护独立配额，防止单个应用耗尽资源。

### 默认配额

```typescript
const DEFAULT_CELL_QUOTA = {
  memoryMB: 128,          // 单 Cell 最大内存
  cpuPercent: 10,         // CPU 占比
  maxConnections: 100,    // 最大并发连接数
  storageGB: 1,           // 存储上限
};

const DEFAULT_USER_LIMITS = {
  maxCells: 5,            // 单用户最多 5 个 Cell
  maxMemoryMB: 640,       // 单用户总内存 640MB
};
```

### 查看配额使用

```bash
curl http://localhost:3001/api/admin/quotas
```

```json
{
  "quotas": [
    {
      "appId": "com.ditto.notes",
      "userId": "alice",
      "quota": {
        "memoryMB": 128,
        "cpuPercent": 10,
        "maxConnections": 100,
        "storageGB": 1
      },
      "usage": {
        "memoryMB": 64,
        "cpuPercent": 5,
        "connections": 12,
        "storageGB": 0.2
      },
      "requestCount": 128,
      "lastRequestAt": 1735500600000
    }
  ],
  "stats": {
    "totalQuotas": 12,
    "totalUsers": 5,
    "totalApps": 3,
    "overallMemoryMB": 412,
    "overallCpuPercent": 32
  },
  "total": 12
}
```

### 调整应用配额

```bash
# 给 com.ditto.heavy 提高内存上限到 256MB
curl -X PUT http://localhost:3001/api/admin/quotas/app/com.ditto.heavy \
  -H "Content-Type: application/json" \
  -d '{"memoryMB": 256, "cpuPercent": 20}'
```

### 调整用户限额

```bash
# 给 alice 提升 Cell 数量上限到 10
curl -X PUT http://localhost:3001/api/admin/quotas/user/alice \
  -H "Content-Type: application/json" \
  -d '{"maxCells": 10, "maxMemoryMB": 1280}'
```

### 超配额响应

请求超过配额时返回 `429` 并附带 `X-Quota-Usage` 头：

```http
HTTP/1.1 429 Too Many Requests
X-Quota-Usage: 105
Content-Type: application/json

{
  "error": "Resource quota exceeded",
  "appId": "com.ditto.notes",
  "usagePercent": 105
}
```

::: warning 配额检查时机
配额检查在 `/api/cell/*` 中间件中执行：

1. `trafficShaper.checkRate(appId)` 限流检查
2. `quotaManager.isOverQuota(appId, userId)` 配额检查
3. 通过后 `quotaManager.recordRequest(appId, userId)` 记录请求
4. 下游处理完成后 `releaseConnection` 释放连接计数

应用级代理 `/api/cell/:appId/proxy/*` 会在 Cell 路由匹配前再做一次限流检查。
:::

## 流量整形

`TrafficShaper` 按应用优先级调度请求，防止单个高 RPS 应用挤占其他应用。

### 优先级与默认 RPS

| 优先级 | 默认 maxRPS | 适用场景 |
|--------|-----------|---------|
| `system` | 1000 | 系统应用（com.ditto.*） |
| `high` | 500 | 焦点应用、关键业务 |
| `normal` | 200 | 默认 |
| `low` | 50 | 后台任务、低优先级 |

### 查看流量统计

```bash
curl http://localhost:3001/api/admin/traffic
```

```json
{
  "apps": [
    {
      "appId": "com.ditto.notes",
      "priority": "normal",
      "maxRequestsPerSecond": 200,
      "currentRPS": 12,
      "requestCount": 0,
      "windowStart": 1735500600000,
      "totalRequests": 15420,
      "throttledRequests": 23,
      "lastRequestAt": 1735500600000
    }
  ],
  "overall": {
    "totalApps": 3,
    "totalRequests": 15420,
    "totalThrottled": 23,
    "throttleRate": 0.0015
  }
}
```

### 调整应用优先级

```bash
# 降低低优先级应用
curl -X PUT http://localhost:3001/api/admin/traffic/com.ditto.background/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "low"}'

# 提升关键应用
curl -X PUT http://localhost:3001/api/admin/traffic/com.ditto.critical/priority \
  -H "Content-Type: application/json" \
  -d '{"priority": "high"}'
```

### 自动优先级调整

`TrafficShaper.autoAdjustPriorities(focusedAppId)` 实现自动调度：

- 焦点应用自动升为 `high`
- 非焦点应用降为 `normal`
- 限流比例 > 30% 的 `low` 应用继续降速到 25 RPS

::: tip 流量整形场景
- **教育机房**：教师应用 `system` 优先级，学生应用 `normal`
- **Kiosk 终端**：核心展示应用 `high`，后台同步 `low`
- **多租户**：付费用户 `high`，免费用户 `normal`/`low`
:::

### 限流响应

请求超限时返回 `429` 并附带 `Retry-After` 与 `X-RateLimit-Limit` 头：

```http
HTTP/1.1 429 Too Many Requests
Retry-After: 1
X-RateLimit-Limit: 200
Content-Type: application/json

{
  "error": "Too many requests",
  "retryAfterMs": 800,
  "appId": "com.ditto.notes"
}
```

## 弹性扩缩配置

`ElasticScaler` 周期性检查整体负载，自动休眠空闲 Cell、唤醒活动 Cell，并在高负载时触发限速。

### 默认配置

```typescript
const DEFAULT_SCALER_CONFIG = {
  highLoadThreshold: 0.8,    // CPU 负载达 80% 触发高负载处理
  lowLoadThreshold: 0.3,     // CPU 负载低于 30% 触发低负载清理
  checkIntervalMs: 30000,    // 30 秒检查一次
  hibernateAfterMs: 900000, // 15 分钟空闲后休眠
  wakeTimeoutMs: 3000,       // 唤醒超时 3 秒
  maxMemoryMB: 1024,         // 总内存上限
  maxCpuPercent: 80,         // 总 CPU 上限
};
```

### 查看扩缩配置

```bash
curl http://localhost:3001/api/admin/scaler/config
```

```json
{
  "highLoadThreshold": 0.8,
  "lowLoadThreshold": 0.3,
  "checkIntervalMs": 30000,
  "hibernateAfterMs": 900000,
  "wakeTimeoutMs": 3000,
  "maxMemoryMB": 1024,
  "maxCpuPercent": 80
}
```

### 动态调整配置

```bash
# 缩短休眠时间到 5 分钟，提高内存上限
curl -X PUT http://localhost:3001/api/admin/scaler/config \
  -H "Content-Type: application/json" \
  -d '{
    "hibernateAfterMs": 300000,
    "maxMemoryMB": 2048,
    "maxCpuPercent": 90
  }'
```

### 查看整体负载

```bash
curl http://localhost:3001/api/admin/scaler/load
```

```json
{
  "overallCpu": 32,
  "overallMemoryMB": 412,
  "loadInfo": [
    {
      "appId": "com.ditto.notes",
      "userId": "alice",
      "lastActivityAt": 1735500600000,
      "cpuUsage": 5,
      "memoryUsageMB": 64,
      "requestCount": 128
    }
  ]
}
```

### 扩缩工作流程

`ElasticScaler.check()` 每 30 秒执行一次：

1. **同步指标**：从 Cell 实例拉取最新 CPU、内存、请求数
2. **判断负载**：计算整体 CPU / 内存
3. **高负载处理**（CPU > 80% 或 内存 > 1024MB）：
   - 超配额应用触发 `onThrottle`（降为 `low` 优先级）
   - 休眠前 30% 空闲 Cell（idle > 7.5 分钟）
4. **低负载处理**（CPU < 30%）：
   - 休眠所有空闲超过 15 分钟的 Cell

::: tip 弹性扩缩与冬眠区别
- **冬眠（Hibernation）**：保留 Cell 实例，仅停止执行，可快速唤醒
- **销毁（Destroy）**：完全释放资源，下次访问时重新创建

冬眠的 Cell 在 `getCellsByApp()` 中仍可见，状态为 `hibernated`。
:::

## 日志查看

### 前端日志

浏览器 Console 中查看，常见前缀：

```
[Ditto AppManager] Invalid manifest...
[Ditto IPCBus] Message from...
[Ditto PermissionManager] Request...
[Ditto ThemeEngine] Apply theme...
[Ditto WindowStore] Create window...
```

::: tip 调试模式
开发环境设置 `kernel.dev: true`，所有模块输出 verbose 日志。生产环境 `dev: false` 默认仅输出 warn 与 error。
:::

### 服务端日志（stdout）

服务端使用 `hono/logger` 中间件，所有 HTTP 请求输出到 stdout：

```bash
bun run src/index.ts
# 启动日志：
🦎 Ditto Server starting on port 3001...
🦎 Ditto Server running at http://localhost:3001
📡 WebSocket endpoint at ws://localhost:3001/ws
📦 Apps directory: /path/to/server/data/apps

# 请求日志：
GET /api/health 200 0.5ms
POST /api/cell/com.ditto.notes/start 200 12ms
GET /api/admin/metrics 200 8ms
```

### 日志重定向

生产环境建议重定向到日志文件并轮转：

```bash
# 直接重定向
bun run src/index.ts > /var/log/ditto/server.log 2>&1

# 使用 logrotate（/etc/logrotate.d/ditto）
/var/log/ditto/*.log {
    daily
    rotate 30
    compress
    missingok
    notifempty
    copytruncate
}
```

systemd 自动管理 stdout/stderr：

```ini
[Service]
StandardOutput=append:/var/log/ditto/server.log
StandardError=append:/var/log/ditto/error.log
```

### PM2 日志管理

```bash
# 启动并指定日志路径
pm2 start server/dist/index.js --name ditto-server \
  --output /var/log/ditto/out.log \
  --error /var/log/ditto/err.log

# 查看日志
pm2 logs ditto-server --lines 100

# 日志轮转
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 50M
pm2 set pm2-logrotate:retain 30
```

## Docker 日志

### 查看容器日志

```bash
# 实时跟踪日志
docker-compose logs -f server
docker-compose logs -f web

# 最近 100 行
docker-compose logs --tail 100 server

# 指定时间范围
docker-compose logs --since 10m server
docker-compose logs --since 2026-01-01T00:00:00 server
```

### 单独容器查看

```bash
# 列出所有容器
docker ps

# 查看指定容器日志
docker logs -f ditto-server-1
docker logs --tail 200 ditto-web-1
```

### Docker 日志驱动

`docker-compose.yml` 推荐配置日志驱动：

```yaml
services:
  server:
    image: oven/bun:1
    logging:
      driver: json-file
      options:
        max-size: "50m"
        max-file: "10"
```

::: tip 日志聚合
生产环境推荐使用 Docker 日志驱动对接 ELK / Loki：

```yaml
logging:
  driver: fluentd
  options:
    fluentd-address: localhost:24224
    tag: ditto.server
```

或使用 `loki` 驱动直接发送到 Grafana Loki。
:::

## 常见故障排查

### 应用加载失败

**症状**：应用图标点击后白屏，Console 报 `manifest.entry` 404。

**排查**：

```bash
# 1. 检查应用目录结构
ls server/data/apps/com_ditto_calc/
# 应包含 manifest.json 与 frontend/

# 2. 验证 manifest 字段
cat server/data/apps/com_ditto_calc/manifest.json | jq .entry
# 应为 "frontend/index.html"

# 3. 检查构建产物
ls apps/shell/dist/

# 4. 检查 CORS 配置
curl -I https://ditto.example.com/api/market/installed
```

**解决**：
- `manifest.entry` 路径错误 → 修正为相对于应用目录的路径
- CORS 缺失 → 设置 `DITTO_CORS_ORIGIN` 白名单
- iframe origin 不匹配 → 检查 nginx 反向代理配置

### WebSocket 连接失败

**症状**：实时通信失效，Cell IPC 不工作。

**排查**：

```bash
# 1. 验证 WS 端点
curl -i -N \
  -H "Connection: Upgrade" \
  -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" \
  -H "Sec-WebSocket-Key: test" \
  http://localhost:3001/ws

# 期望返回 101 Switching Protocols
```

**常见原因**：
- ❌ HTTPS 环境下使用 `ws://` 而非 `wss://`
- ❌ nginx 未设置 `proxy_read_timeout 86400`，60s 后断开
- ❌ nginx 未设置 `Upgrade` / `Connection` 头
- ❌ 防火墙阻拦 WebSocket 协议

**解决**：

```typescript
// 使用 WSS
const wsUrl = 'wss://ditto.example.com/ws';
```

### 权限请求无限循环

**症状**：应用反复弹出权限确认对话框。

**原因**：
- Kernel `dev` 模式但交互式 prompt 未注入
- 权限未在 manifest 中声明

**解决**：

```typescript
// 生产模式正确配置
const kernel = createKernel({
  kernel: { dev: false },
  permissions: { persistDecisions: true },
});

// 注入交互式 prompt（如果需要用户确认）
kernel.permissionManager.setInteractivePrompt(async (perm) => {
  return await dialogStore.open('confirm', { /* ... */ }).confirmed;
});
```

### Cell 启动失败

**症状**：`POST /api/cell/:appId/start` 返回错误。

**排查**：

```bash
# 1. 查看应用是否已安装
curl http://localhost:3001/api/admin/installed-apps

# 2. 查看配额是否超限
curl http://localhost:3001/api/admin/quotas

# 3. 查看服务端日志
docker-compose logs --tail 50 server | grep -i "cell"
```

**常见原因**：
- 用户已达 `maxCells` 上限 → 关闭其他应用或调整 `setUserLimits`
- 应用 manifest `backend.entry` 路径错误
- 应用后端 Cell 初始化抛异常 → 查看服务端日志

### 429 Too Many Requests

**症状**：客户端频繁收到 429 错误。

**排查**：

```bash
# 查看流量统计
curl http://localhost:3001/api/admin/traffic

# 查看 throttleRate
curl http://localhost:3001/api/admin/metrics | jq .traffic
```

**解决**：

```bash
# 提升应用优先级
curl -X PUT http://localhost:3001/api/admin/traffic/com.ditto.notes/priority \
  -d '{"priority": "high"}'

# 或调整用户配额
curl -X PUT http://localhost:3001/api/admin/quotas/user/alice \
  -d '{"maxCells": 10}'
```

::: tip 客户端退避策略
客户端收到 429 时应读取 `Retry-After` 头，按指数退避重试：

```typescript
async function fetchWithRetry(url, opts, retries = 3) {
  for (let i = 0; i < retries; i++) {
    const res = await fetch(url, opts);
    if (res.status !== 429) return res;
    const retryAfter = Number(res.headers.get('Retry-After') ?? 1);
    await new Promise(r => setTimeout(r, retryAfter * 1000 * Math.pow(2, i)));
  }
  throw new Error('Max retries exceeded');
}
```
:::

## 运维检查清单

部署后建议执行以下检查：

```bash
# 1. 健康检查
curl -fsS http://localhost/api/health | jq .status
# 期望: "ok"

# 2. Cell 状态
curl -fsS http://localhost/api/admin/cells | jq '{total, running, hibernated, error}'
# 期望: error = 0

# 3. 资源使用
curl -fsS http://localhost/api/admin/metrics | jq .resources
# 关注: overallMemoryMB、overallCpuPercent

# 4. 流量整形
curl -fsS http://localhost/api/admin/traffic | jq .overall
# 关注: throttleRate（应 < 0.05）

# 5. 弹性扩缩状态
curl -fsS http://localhost/api/admin/scaler/load | jq '{overallCpu, overallMemoryMB}'
# 关注: 是否接近 maxMemoryMB / maxCpuPercent

# 6. 已安装应用
curl -fsS http://localhost/api/admin/installed-apps | jq '.apps[] | {id, version, runningCells}'
# 关注: 应用是否正常运行

# 7. WebSocket 连通性
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: test" \
  http://localhost/ws 2>&1 | head -1
# 期望: HTTP/1.1 101 Switching Protocols
```

::: tip 自动化巡检
将上述命令封装为脚本，配合 cron / systemd timer 定期执行，异常时发送告警（邮件 / Webhook / Slack）：

```bash
#!/bin/bash
# /opt/ditto/healthcheck.sh
HEALTH=$(curl -fsS http://localhost/api/health | jq -r .status)
if [ "$HEALTH" != "ok" ]; then
  curl -X POST -d "Ditto server unhealthy" https://hooks.slack.com/...
fi
```
:::

## 相关文档

- [部署概览](./index) — 部署总览与导航
- [生产部署](./production) — Docker、nginx、systemd 部署详情
- [配置项](./configuration) — 资源配额默认值与环境变量
- [教育场景](./education) — 多用户场景下的运维考量
- [API 参考](../api/) — 完整 admin API 端点列表
- [核心概念 Cell](../concepts/cell) — Cell 沙盒与冬眠机制
