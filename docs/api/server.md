# 服务端 API

本页面介绍 Ditto 服务端 HTTP + WebSocket 接口。

## HTTP API

基础路径：`/api`

### Market 相关

| 端点 | 方法 | 描述 |
|------|------|------|
| `/apps` | GET | 获取应用列表 |
| `/apps/:appId` | GET | 获取应用详情 |
| `/apps/:appId/icon` | GET | 获取应用图标 |
| `/apps/:appId/reviews` | GET | 获取应用评论 |
| `/apps/:appId/reviews` | POST | 添加评论 |
| `/installed` | GET | 获取已安装应用列表 |
| `/installed/:appId` | GET | 获取已安装应用详情 |
| `/apps/uninstall/:appId` | DELETE | 卸载应用 |

### 示例

```bash
# 获取应用列表
curl https://ditto.example.com/api/apps

# 获取应用详情
curl https://ditto.example.com/api/apps/com.ditto.counter

# 安装应用
curl -X POST https://ditto.example.com/api/apps/install \
  -H "Content-Type: application/json" \
  -d '{"appId": "com.example.app"}'

# 卸载应用
curl -X DELETE https://ditto.example.com/api/apps/uninstall/com.example.app
```

### 响应格式

```json
{
  "id": "com.ditto.counter",
  "name": "计数器",
  "version": "1.0.0",
  "description": "一个简单计数器",
  "icon": "fa-solid fa-plus",
  "permissions": [],
  "downloadUrl": "/apps/com.ditto.counter/download",
  "rating": 4.5,
  "reviewsCount": 10
}
```

## WebSocket API

### Cell WebSocket

路径：`/cell/:appId`

连接后可发送/接收消息：

```typescript
// 客户端发送
{ "type": "request", "action": "increment", "payload": { "value": 1 } }

// 服务端响应
{ "type": "response", "action": "increment", "payload": { "count": 2 } }

// 服务端推送
{ "type": "event", "action": "count:updated", "payload": { "count": 2 } }
```

### 心跳

```typescript
// 客户端发送 ping
{ "type": "ping" }

// 服务端响应 pong
{ "type": "pong" }
```

## 错误响应

```json
{
  "error": "NOT_FOUND",
  "message": "App com.example.notexist not found",
  "statusCode": 404
}
```