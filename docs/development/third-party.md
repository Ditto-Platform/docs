# 第三方应用开发

本页面详细介绍如何为 Ditto 开发第三方应用。

## 使用 CLI 创建项目

```bash
npx ditto-cli create my-app --template vue
```

CLI 会生成以下结构：

```
my-app/
├── manifest.json       # 应用清单
├── frontend/           # 前端代码
│   ├── index.html
│   ├── src/
│   │   ├── App.vue
│   │   └── main.ts
│   └── vite.config.ts
├── backend/            # 后端代码（可选）
│   ├── index.ts
│   └── package.json
└── README.md
```

## manifest.json 配置

```json
{
  "id": "com.example.my-app",
  "name": "我的应用",
  "version": "1.0.0",
  "description": "一个示例应用",
  "icon": "fa-solid fa-star",
  "type": "app",
  "entry": "frontend/index.html",
  "category": "utility",
  "sandbox": "strict",
  "permissions": ["fs.read", "fs.write", "notification"],
  "window": {
    "width": 800,
    "height": 600,
    "minWidth": 400,
    "minHeight": 300,
    "resizable": true,
    "maximizable": true
  },
  "backend": {
    "type": "cell",
    "entry": "backend/index.ts"
  }
}
```

### 字段说明

| 字段 | 必填 | 描述 |
|------|------|------|
| `id` | ✅ | 应用唯一标识，reverse-domain 格式 |
| `name` | ✅ | 显示名称 |
| `version` | ✅ | 版本号，semver 格式 |
| `icon` | ❌ | 图标，支持 FontAwesome class 或 URL |
| `sandbox` | ✅ | `strict` 或 `trusted` |
| `permissions` | ❌ | 权限列表 |
| `window` | ✅ | 窗口配置 |
| `backend` | ❌ | 后端 Cell 配置 |

## 前端开发

前端可以是任何框架，只需在 `entry` 指定的 HTML 中引入 SDK：

```typescript
import { createCellBridge, fs, notification } from '@ditto/sdk'

// 连接后端 Cell
const bridge = createCellBridge({ appId: 'com.example.my-app' })
await bridge.connect()

// 请求文件读取权限
await fs.requestPermission('read')

// 读取文件
const content = await fs.readFile('/data/config.json')

// 发送通知
notification.push({
  title: '操作完成',
  body: '文件已保存',
})
```

## 后端开发

后端 Cell 基于 TypeScript，运行在 Bun/Hono：

```typescript
import { CellRouter } from '@ditto/core'

const router = new CellRouter()

router.on('increment', async (payload, context) => {
  const count = context.state.get('count') || 0
  context.state.set('count', count + payload.value)
  return { count: count + payload.value }
})

export default router
```

## 打包发布

```bash
# 打包为 .dit 文件
npx ditto-cli pack my-app

# 发布到 Market（需要账号）
npx ditto-cli publish my-app.dit
```

## 示例应用

参考 [server/data/apps](https://github.com/Nevino2333/Ditto/tree/main/server/data/apps) 中的 17 个示例应用。