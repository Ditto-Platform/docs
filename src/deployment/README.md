# 部署运维

本章节介绍 Ditto WebOS 的生产部署与运维管理。

## 目录

- [生产部署](/deployment/production) - 完整部署流程
- [教育场景](/deployment/education) - 学校/培训机构部署指南
- [配置项](/deployment/configuration) - 系统配置详解
- [监控运维](/deployment/monitoring) - 性能监控与故障排查

## 部署架构

生产环境推荐架构：

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   CDN       │────│   Nginx     │────│   Server    │
│ (静态资源)  │    │ (反向代理)  │    │  (Bun/Hono) │
└─────────────┘    └─────────────┘    └─────────────┘
                         │
                         ↓
                   ┌─────────────┐
                   │   Shell     │
                   │  (Vue SPA)  │
                   └─────────────┘
```

## 下一步

阅读 [生产部署](/deployment/production)。