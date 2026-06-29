---
title: 第三方应用开发
description: Ditto 应用类型区分、manifest.json 完整规范、.dit 打包格式（加密与签名）与从零创建 com.ditto.todo 示例应用。
---

# 第三方应用开发

本文档面向第三方应用开发者，详细说明如何基于 Ditto SDK 开发、打包、发布应用。

## 应用类型

Ditto 中存在两个相互独立的 `type` 概念，开发者需要区分清楚。

### 1. AppManifest.type — 应用分类（声明在 manifest.json）

应用在 manifest 中声明的"分类标签"，决定打包扩展名、UI 呈现方式与权限默认值：

| 类型 | 说明 | 打包扩展名 | 典型场景 |
|------|------|-----------|---------|
| `app` | 普通应用（默认） | `.dit` | 文件管理器、终端、编辑器 |
| `widget` | 桌面小组件 | `.ditx` | 时钟、天气、系统监视 |
| `plugin` | 后台插件（无独立窗口） | `.ditc` | 剪贴板增强、输入法 |
| `theme` | 主题包 | `.ditz` | Nord / Forest / Ocean |
| `dit` | 前后端对称 Cell 应用 | `.dit` | 需要后端逻辑的应用（如协作计数器） |

::: tip dit 是 app 的超集
`dit` 拥有前端 + 后端 Cell，运行时通过 `CellRuntimeConfig.type='dit'` 激活后端桥接。打包扩展名与 `app` 相同（`.dit`）。
:::

### 2. CellRuntimeConfig.type — 运行时沙盒类型（启动 Cell 时指定）

Shell 在启动 Cell 时根据运行时配置选择沙盒模式：

| 类型 | 说明 | 沙盒模式 | 后端 Cell | 典型场景 |
|------|------|---------|---------|---------|
| `native` | Vue 组件，shell 信任 | `shadow-trusted` | 否 | 内置应用（Settings、FileManager） |
| `web` | 远程 URL，iframe 加载 | `iframe-strict` | 否 | 现有 Web 应用接入 |
| `pwa` | PWA manifest 驱动 | `iframe-strict` | 否 | PWA 应用 |
| `dit` | 前后端对称 Cell | `iframe-strict` | 是 | 需要后端逻辑的应用（笔记、协作） |

**两者关系**：`manifest.type='dit'` 的应用通常以 `CellRuntimeConfig.type='dit'` 启动（由 Shell 根据 `backend.type==='cell'` 推断），但二者维度不同 — `manifest.type` 描述"这是什么应用"，`CellRuntimeConfig.type` 描述"这个应用在什么沙盒里运行"。

::: warning 类型选择建议
需要后端逻辑的新应用优先选择 `dit` 类型（manifest 与运行时均为 dit），可同时获得前后端能力与 Ditto 完整生态支持。
:::

## manifest.json 规范

每个 Ditto 应用必须包含 `manifest.json`，描述应用元信息、窗口配置、权限声明与后端配置。

### 完整字段说明

```typescript
interface AppManifest {
  // ─── 基础信息（必填）───
  id: string;              // 应用唯一 ID，格式如 com.ditto.notes（域名倒序）
  name: string;            // 显示名称
  version: string;         // 语义化版本号（如 1.0.0）
  entry: string;           // 前端入口（相对路径，如 frontend/index.html）

  // ─── 描述信息（可选）───
  description?: string;    // 一句话描述
  icon?: string;           // 图标（emoji 或图片路径）
  category?: string;       // 分类：productivity / utility / entertainment / education...
  type?: 'app' | 'widget' | 'plugin' | 'theme' | 'dit';  // 默认 'app'

  // ─── 沙盒与权限 ───
  sandbox: 'strict' | 'trusted';  // strict=iframe 隔离，trusted=Shadow DOM
  permissions: string[];          // 权限声明，见「权限声明」章节

  // ─── 窗口配置（必填）───
  window: {
    width: number;          // 默认宽度
    height: number;         // 默认高度
    minWidth?: number;      // 最小宽度（默认 320）
    minHeight?: number;     // 最小高度（默认 240）
    resizable?: boolean;    // 是否可调整大小
    maximizable?: boolean;  // 是否可最大化
    titlebar?: boolean;     // 是否显示标题栏
  };

  // ─── 后端 Cell 配置（dit 类型专用）───
  backend?: {
    entry: string;          // 后端入口（如 backend/index.ts）
    type: 'cell';           // 固定 'cell'
    port?: number;          // 端口（可选）
    healthCheck?: string;   // 健康检查路径（如 /health）
    env?: Record<string, string>;  // 环境变量注入
  };

  // ─── 国际化 ───
  i18n?: {
    default: string;        // 默认语言（如 'zh-CN'）
    supported: string[];    // 支持的语言列表
  };

  // ─── 依赖 ───
  dependencies?: Record<string, string>;  // 依赖的其他应用（如 { "com.ditto.auth": "^1.0.0" }）

  // ─── 安全 ───
  signature?: {             // 数字签名
    algorithm: string;      // 如 'ed25519'
    value: string;          // 签名值（base64）
    publicKey: string;      // 公钥（base64）
  };
  encryption?: {            // 加密元信息
    algorithm: 'aes-256-gcm';
    keyDerivation: 'pbkdf2';
    iterations: number;    // PBKDF2 迭代次数
    salt: string;           // 盐值（base64）
  };

  // ─── 兼容性 ───
  minDittoVersion?: string;  // 最低 Ditto 版本要求
}
```

### 完整示例

```json
{
  "id": "com.ditto.notes",
  "name": "Ditto Notes",
  "version": "0.1.0",
  "description": "轻量级 Markdown 笔记应用",
  "icon": "📝",
  "entry": "frontend/index.html",
  "category": "productivity",
  "sandbox": "trusted",
  "permissions": ["fs:read", "fs:write", "net:fetch"],
  "type": "app",
  "window": {
    "width": 720,
    "height": 540,
    "minWidth": 480,
    "minHeight": 360,
    "resizable": true,
    "maximizable": true
  },
  "backend": {
    "entry": "backend/index.ts",
    "type": "cell",
    "healthCheck": "/health"
  },
  "i18n": {
    "default": "zh-CN",
    "supported": ["zh-CN", "en-US"]
  },
  "minDittoVersion": "0.1.0"
}
```

### 字段校验规则

`Packager.validate()` 会检查以下规则：

- `id` 必填，且匹配 `/^[\w.-]+$/`（字母、数字、点、连字符、下划线）
- `name` / `version` / `entry` 必填
- `version` 推荐语义化版本（`/^\d+\.\d+\.\d+/`），不符会 warning
- `frontend/` 目录必须存在
- 声明 `backend` 时，`backend.entry` 必填，`backend/` 目录必须存在
- widget 类型 ID 建议以 `widget.` 开头
- theme 类型应包含 `tokens.json`

::: danger 常见校验失败
- `id` 包含非法字符（如空格、中文）→ 校验失败
- 声明了 `backend` 但没有 `backend/` 目录 → 校验失败
- `version` 写成 `1.0` 而非 `1.0.0` → 通过但产生 warning
:::

## .dit 打包格式

Ditto 应用通过 `Packager` 打包为 `.dit`（应用）/ `.ditx`（widget）/ `.ditc`（plugin）/ `.ditz`（theme）文件。

### 包结构

`.dit` 文件本质是 ZIP 压缩包，结构如下：

```text
my-app-1.0.0.dit
├── manifest.json          # 应用清单（必填）
├── frontend/              # 前端代码（必填）
│   ├── index.html
│   ├── assets/
│   └── ...
├── backend/               # 后端代码（dit 类型）
│   ├── index.ts
│   └── ...
├── icon.png               # 图标（可选）
├── encryption.meta        # 加密元信息（加密时生成）
└── signature.sig          # 签名文件（签名时生成）
```

### 打包

使用 CLI 打包（详见 [CLI 脚手架](/development/cli)）：

```bash
# 基础打包
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend

# 带加密
ditto pack --manifest ./manifest.json --frontend ./frontend --encrypt --password "your-password"

# 带签名
ditto pack --manifest ./manifest.json --frontend ./frontend --sign --private-key ./key.pem
```

或使用 API：

```typescript
import { Packager } from '@ditto/packager';

const packager = new Packager();

const outputPath = await packager.pack({
  type: 'app',
  manifest: myManifest,
  frontendDir: './frontend',
  backendDir: './backend',     // dit 类型
  iconPath: './icon.png',
  outputPath: './my-app-1.0.0.dit',
  encrypt: { password: 'secret', algorithm: 'aes-256-gcm' },
  sign: { privateKeyPath: './key.pem', algorithm: 'ed25519' },
});
```

### 加密与签名

- **加密**：AES-256-GCM + PBKDF2（默认 100000 次迭代），仅加密代码文件（`.js/.ts/.html/.css/.mjs/.cjs`）
- **签名**：Ed25519 + SHA-256 哈希，生成 `signature.sig`（含 algorithm/value/publicKey）

::: tip 加密范围
加密只覆盖代码文件，`manifest.json` 与静态资源（图片、字体）不加密，便于宿主快速读取应用元信息。
:::

### 校验

```typescript
const result = await packager.validate('./my-app-1.0.0.dit', {
  checkDependencies: true,
  minDittoVersion: '0.1.0',
});

console.log(result.valid);      // true/false
console.log(result.errors);      // 错误列表
console.log(result.warnings);    // 警告列表
```

### 验证签名

```typescript
const verifyResult = await packager.verify('./my-app-1.0.0.dit');
console.log(verifyResult.verified);  // true/false
console.log(verifyResult.signer);     // 公钥（base64）
```

::: warning 签名验证时机
- 安装时由 `ditto install` 自动调用 `verify`
- 运行时由 Shell 在加载前再次校验，防止包被篡改
- 未签名的包可以运行，但会标记为"未验证来源"
:::

## 完整示例应用

下面从零创建一个 dit 类型的待办事项应用 `com.ditto.todo`。

### 1. 创建项目结构

```text
com.ditto.todo/
├── manifest.json
├── frontend/
│   └── index.html
└── backend/
    └── index.ts
```

::: tip 使用 CLI 快速创建
可使用 `ditto init com.ditto.todo --type dit` 一键生成上述结构，详见 [CLI 脚手架](/development/cli)。
:::

### 2. 编写 manifest.json

```json
{
  "id": "com.ditto.todo",
  "name": "Ditto Todo",
  "version": "1.0.0",
  "description": "简单的待办事项应用",
  "icon": "✅",
  "entry": "frontend/index.html",
  "category": "productivity",
  "sandbox": "strict",
  "permissions": ["fs:read", "fs:write", "cell:backend", "notification:show"],
  "type": "app",
  "window": {
    "width": 480,
    "height": 600,
    "minWidth": 360,
    "minHeight": 400,
    "resizable": true
  },
  "backend": {
    "entry": "backend/index.ts",
    "type": "cell",
    "healthCheck": "/health"
  },
  "minDittoVersion": "0.1.0"
}
```

### 3. 编写后端 Cell

```typescript
// backend/index.ts
import type { AppCellModule, CellContext, CellRouter } from '@ditto/shared';

interface Todo {
  id: string;
  text: string;
  done: boolean;
  createdAt: number;
}

const todos = new Map<string, Todo>();

const module: AppCellModule = {
  async onInit(ctx: CellContext): Promise<void> {
    ctx.logger.info('Todo backend initialized');
  },

  registerRoutes(router: CellRouter): void {
    router.get('/health', async (req, res) => {
      res.json({ status: 'ok', count: todos.size });
    });

    router.get('/todos', async (req, res) => {
      res.json({ todos: Array.from(todos.values()) });
    });

    router.post('/todos', async (req, res) => {
      const { text } = req.body as { text: string };
      const todo: Todo = {
        id: crypto.randomUUID(),
        text,
        done: false,
        createdAt: Date.now(),
      };
      todos.set(todo.id, todo);
      res.status(201).json(todo);
    });

    router.put('/todos/:id', async (req, res) => {
      const id = req.params.id;
      const todo = todos.get(id);
      if (!todo) {
        res.status(404).json({ error: 'Not found' });
        return;
      }
      todo.done = !todo.done;
      todos.set(id, todo);
      res.json(todo);
    });

    router.delete('/todos/:id', async (req, res) => {
      const id = req.params.id;
      todos.delete(id);
      res.status(204);
    });
  },
};

export default module;
```

::: warning 后端 Cell 完整开发
`AppCellModule` 接口、`CellContext` 注入、`CellRouter` 路由注册的完整说明见 [调试技巧 — 后端 Cell 开发](/development/debugging#后端-cell-开发)。
:::

### 4. 编写前端

```html
<!-- frontend/index.html -->
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Ditto Todo</title>
  <style>
    body { font-family: -apple-system, sans-serif; margin: 0; padding: 16px; }
    .todo-item { display: flex; align-items: center; gap: 8px; padding: 8px 0; border-bottom: 1px solid #eee; }
    .done { text-decoration: line-through; color: #999; }
    button { cursor: pointer; }
  </style>
</head>
<body>
  <div id="app">
    <h1>✅ Ditto Todo</h1>
    <form id="add-form">
      <input id="todo-input" placeholder="添加待办..." />
      <button type="submit">添加</button>
    </form>
    <div id="todo-list"></div>
  </div>

  <script type="module">
    import { createApp, ref, onMounted } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';
    import { DittoSDK, useDittoCell, useDittoUI, useDittoApp } from 'https://unpkg.com/@ditto/sdk/dist/index.js';

    const App = {
      setup() {
        const { cellGet, cellPost, cellPut, cellDelete } = useDittoCell();
        const { showNotification } = useDittoUI();
        const { registerApp, ready } = useDittoApp();

        const todos = ref([]);
        const newText = ref('');

        registerApp({ id: 'com.ditto.todo', name: 'Ditto Todo', version: '1.0.0' });

        async function loadTodos() {
          const result = await cellGet('com.ditto.todo', '/todos');
          todos.value = result.todos;
        }

        async function addTodo() {
          if (!newText.value.trim()) return;
          await cellPost('com.ditto.todo', '/todos', { text: newText.value });
          newText.value = '';
          await loadTodos();
          showNotification('已添加', '待办事项已创建', 'success');
        }

        async function toggleTodo(id) {
          await cellPut(`com.ditto.todo`, `/todos/${id}`, {});
          await loadTodos();
        }

        async function deleteTodo(id) {
          await cellDelete('com.ditto.todo', `/todos/${id}`);
          await loadTodos();
        }

        onMounted(() => {
          loadTodos();
          ready();
        });

        return { todos, newText, addTodo, toggleTodo, deleteTodo };
      },
      template: `
        <div>
          <h1>✅ Ditto Todo</h1>
          <form @submit.prevent="addTodo">
            <input v-model="newText" placeholder="添加待办..." />
            <button type="submit">添加</button>
          </form>
          <div v-for="todo in todos" :key="todo.id" class="todo-item">
            <input type="checkbox" :checked="todo.done" @change="toggleTodo(todo.id)" />
            <span :class="{ done: todo.done }">{{ todo.text }}</span>
            <button @click="deleteTodo(todo.id)">删除</button>
          </div>
        </div>
      `,
    };

    const app = createApp(App);
    app.use(DittoSDK);
    app.mount('#app');
  </script>
</body>
</html>
```

::: tip 前端 SDK 详解
上面用到的 `useDittoCell` / `useDittoUI` / `useDittoApp` 等 composable 的完整 API 签名见 [SDK 参考](/development/sdk)。
:::

### 5. 打包

```bash
# 使用 CLI
ditto pack --manifest ./manifest.json --frontend ./frontend --backend ./backend --output ./com.ditto.todo-1.0.0.dit

# 或使用 API
import { Packager } from '@ditto/packager';
const packager = new Packager();
await packager.pack({
  type: 'app',
  manifest: require('./manifest.json'),
  frontendDir: './frontend',
  backendDir: './backend',
  outputPath: './com.ditto.todo-1.0.0.dit',
});
```

### 6. 安装到服务端

```bash
# CLI 安装
ditto install ./com.ditto.todo-1.0.0.dit --server http://localhost:3001

# 或手动放置到 server/data/apps/com.ditto.todo/
```

服务端目录结构（注意 ID 中的点会被替换为下划线）：

```text
server/data/apps/com_ditto_todo/
├── manifest.json
├── frontend/
│   └── index.html
└── backend/
    └── index.ts
```

::: danger 安装目录命名规则
应用 ID 中的 `.` 必须替换为 `_` 作为目录名，例如 `com.ditto.todo` → `com_ditto_todo`。否则服务端扫描时无法正确识别应用。
:::

## 相关文档

- [开发指南](/development/)
- [SDK 参考](/development/sdk)
- [CLI 脚手架](/development/cli)
- [调试技巧](/development/debugging)
- [核心概念 — Cell 沙盒](/concepts/cell)
- [核心概念 — 权限系统](/concepts/permission)
