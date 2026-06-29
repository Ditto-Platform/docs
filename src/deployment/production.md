# 生产部署

本页面介绍 Ditto WebOS 的完整生产部署流程。

## 前端部署

### 构建

```bash
cd Ditto
pnpm run build
```

构建产物位于 `apps/shell/dist`，包含：
- `index.html` - 入口文件
- `assets/` - JS/CSS/图片
- `sw.js` - Service Worker
- `manifest.webmanifest` - PWA manifest

### 部署到 CDN/静态服务器

推荐使用：
- **GitHub Pages**：免费，适合演示
- **BytePlus Edge Pages**：国内加速，CDN 支持
- **Vercel**：自动部署，HTTPS 支持

### Nginx 配置

```nginx
server {
  listen 80;
  server_name ditto.example.com;
  
  root /var/www/ditto;
  index index.html;
  
  # SPA fallback
  location / {
    try_files $uri $uri/ /index.html;
  }
  
  # PWA 支持
  location /sw.js {
    add_header Cache-Control "no-cache";
  }
  
  location ~* \.(js|css|png|jpg|svg|woff2)$ {
    expires 30d;
    add_header Cache-Control "public";
  }
}
```

## 服务端部署

### Bun 安装

```bash
curl -fsSL https://bun.sh/install | bash
```

### 构建

```bash
cd server
bun install
bun run build
```

### 启动

```bash
bun run start
```

默认监听 `http://localhost:3000`。

### Docker 部署

```bash
docker-compose up -d
```

配置见 `server/docker-compose.yml`。

## 数据目录

服务端需要以下目录：

```
server/data/
├── apps/           # 预装应用 manifest
├── installed/      # 用户安装应用
├── reviews/        # 评论持久化
├── users/          # 用户数据
└── config.json     # 服务端配置
```

## HTTPS 配置

生产环境必须使用 HTTPS：

1. 获取 SSL 证书（Let's Encrypt 或商业证书）
2. Nginx 配置 HTTPS
3. WebSocket 使用 WSS 协议

## 下一步

阅读 [教育场景](/deployment/education)。