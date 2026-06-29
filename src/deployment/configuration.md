# 配置项

本页面介绍 Ditto WebOS 的系统配置。

## 前端配置

### Kernel 配置

```typescript
createKernel({
  kernel: { dev: true }  // dev: 开发模式，自动授权权限
})
```

### 主题配置

```typescript
getThemeEngine().setTheme('default')
getThemeEngine().setAnimationPreset('normal')
```

动画档位：

| 档位 | 描述 | 适用设备 |
|------|------|----------|
| `none` | 无动画 | 树莓派、老旧 PC |
| `subtle` | 微妙动画 | 低端设备 |
| `normal` | 标准动画 | 主流设备 |
| `expressive` | 丰富动画 | 高性能设备 |

### 窗口配置

```typescript
windowStore.setLayoutMode('floating')  // floating / tiling / snap
```

## 服务端配置

### config.json

```json
{
  "port": 3000,
  "cors": {
    "origins": ["https://ditto.example.com"],
    "methods": ["GET", "POST", "PUT", "DELETE"]
  },
  "market": {
    "dataDir": "./data",
    "githubRepo": "Nevino2233/Ditto_Market"
  },
  "auth": {
    "jwtSecret": "your-secret-key",
    "sessionExpiry": 3600
  }
}
```

### CORS 配置

生产环境需配置 CORS：

```json
{
  "cors": {
    "origins": ["https://ditto.example.com"],
    "credentials": true
  }
}
```

### Market 数据源

Market 应用数据来源优先级：

1. 本地 override（`MARKET_DATA_DIR` 环境变量）
2. GitHub 仓库（`Nevino2233/Ditto_Market`）
3. DEMO_* 常量硬编码

## 默认应用关联

```typescript
defaultAppsService.register({
  mime: 'text/plain',
  scheme: 'file',
  extension: 'txt',
  handler: 'com.ditto.texteditor',
  isDefault: true,
})
```

优先级：`userOverrides > isDefault > latest-registered`

## 下一步

阅读 [监控运维](/deployment/monitoring)。