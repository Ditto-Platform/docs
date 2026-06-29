# 监控运维

本页面介绍 Ditto WebOS 的性能监控与故障排查。

## 日志

### 前端日志

浏览器 Console 中查看：

```
[Ditto AppManager] Invalid manifest...
[Ditto IPCBus] Message from...
[Ditto PermissionManager] Request...
```

### 服务端日志

Bun 输出到 stdout：

```bash
bun run start
# 日志输出到控制台
```

生产环境建议使用 PM2 管理：

```bash
pm2 start server/index.ts --name ditto-server
pm2 logs ditto-server
```

## 性能监控

### 前端性能

Chrome DevTools Performance 面板分析：
- FPS 监控
- 内存使用
- CPU 占用

### 服务端性能

```bash
# Bun 内置性能监控
bun run start --inspect
```

## 常见故障

### 应用加载失败

原因：
- manifest.entry 路径错误
- CORS 配置缺失
- iframe origin 不匹配

解决：
```bash
# 检查构建产物
ls apps/shell/dist

# 检查 CORS 配置
curl -I https://ditto.example.com/api/market
```

### WebSocket 连接失败

原因：
- 未使用 WSS 协议（HTTPS 环境）
- 服务端未启动
- 网络防火墙阻拦

解决：
```typescript
// 使用 WSS
const wsUrl = 'wss://ditto.example.com/cell/...'
```

### 权限请求无限循环

原因：
- Kernel dev 模式但交互式 prompt 未注入
- 权限未在 manifest 中声明

解决：
```typescript
// 生产模式正确配置
kernel.permissionManager.setInteractivePrompt(async (perm) => {
  return await dialogStore.open('confirm', { ... }).confirmed
})
```

## 健康检查

服务端提供健康检查端点：

```bash
curl https://ditto.example.com/api/health
# { "status": "ok", "uptime": 3600 }
```