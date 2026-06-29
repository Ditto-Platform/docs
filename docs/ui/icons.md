---
title: 图标系统
description: FontAwesome 6 集成、DIcon 组件 API、三种模式自动识别与命名规范。
---

# 图标系统

Ditto 的图标系统基于 **FontAwesome 6 Free** 构建，并通过 `DIcon` 组件统一渲染。`DIcon` 自动识别三种输入模式（FontAwesome class / URL 图片 / emoji），使应用可以同时支持矢量图标、位图图标与 emoji，而无需切换组件。

## FontAwesome 6 集成

FontAwesome 6 Free 已内置在 `@ditto/ui` 中，使用时随组件库 CSS 一起加载：

```typescript
// 等价于
import '@fortawesome/fontawesome-free/css/all.min.css'
```

包含三种样式：

| 样式前缀 | 说明 | 图标数量 |
|---------|------|---------|
| `fa-solid` | 实心图标（默认） | 1500+ |
| `fa-regular` | 线性图标 | 200+ |
| `fa-brands` | 品牌图标（GitHub、Twitter 等） | 460+ |

::: tip Pro 版本
如需 FontAwesome Pro 图标，可在 Shell 入口覆盖 CSS 引入路径：

```typescript
import '@fortawesome/fontawesome-pro/css/all.min.css'
```

`DIcon` 不感知具体版本，只要 `fa-solid` 等 class 在 CSS 中存在即可正常工作。
:::

## DIcon 组件 API

源码：`packages/ui/src/components/d-icon/`

### 基本用法

```vue
<script setup>
import { DIcon } from '@ditto/ui'
</script>

<template>
  <!-- Solid 样式 -->
  <DIcon name="fa-solid fa-star" />

  <!-- Regular 样式 -->
  <DIcon name="fa-regular fa-heart" />

  <!-- Brands 样式 -->
  <DIcon name="fa-brands fa-github" />

  <!-- 自定义大小 -->
  <DIcon name="fa-solid fa-folder" size="32px" />

  <!-- 自定义颜色（覆盖主题色） -->
  <DIcon name="fa-solid fa-bell" color="#ef4444" />
</template>
```

### Props

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | `string` | — | **必填**，图标标识。三种模式自动识别 |
| `size` | `string \| number` | `'1em'` | 图标尺寸。字符串原样使用（如 `'32px'`、`'2rem'`），数字按 `px` 处理 |
| `color` | `string` | `currentColor` | 图标颜色，覆盖主题继承色 |
| `spin` | `boolean` | `false` | 是否旋转动画（适合 loading 图标） |
| `pulse` | `boolean` | `false` | 8 段旋转动画（FA 内置 `fa-pulse`） |
| `rotate` | `90 \| 180 \| 270` | — | 旋转角度 |
| `title` | `string` | — | 鼠标悬停 tooltip，同时作为无障碍 `aria-label` |

### 三种模式自动识别

`DIcon` 按以下规则**自动**判断 `name` 属于哪种模式，无需手动指定：

| 模式 | 识别规则 | 渲染方式 |
|------|---------|---------|
| **FontAwesome class** | 以 `fa-` 开头（如 `fa-solid fa-star`） | 渲染 `<i class="fa-solid fa-star">` |
| **URL 图片** | 以 `http://`、`https://`、`/`、`./`、`data:` 开头 | 渲染 `<img src="...">` |
| **Emoji** | 不满足上述条件，且为短字符串（≤ 4 个字符） | 渲染 `<span>` 包裹 emoji |

::: warning 识别优先级
按 **FA class → URL → emoji** 顺序判断。如果你的 emoji 恰好以 `/` 开头（极少见），会被误识别为 URL。此时建议改用 `<span>` 直接渲染。
:::

## 使用示例

### 在组件中使用

```vue
<template>
  <button class="my-btn">
    <DIcon name="fa-solid fa-save" size="16px" />
    <span>保存</span>
  </button>

  <div class="loading">
    <DIcon name="fa-solid fa-spinner" spin />
    <span>加载中...</span>
  </div>
</template>
```

### 在 manifest 中使用

应用 `manifest.json` 中的 `icon` 字段使用同样的识别规则：

```json
{
  "id": "com.example.app",
  "name": "我的应用",
  "icon": "fa-solid fa-star"
}
```

或在打包时使用 emoji 作为应用图标（适合快速原型）：

```json
{
  "icon": "📦"
}
```

也可使用远程 URL（适合需要动态更换图标的应用）：

```json
{
  "icon": "https://example.com/my-icon.svg"
}
```

### 在菜单项中使用

`DContextMenu`、`DStartMenu` 等组件的 `icon` 字段也使用同样的识别规则：

```typescript
const menuItems = [
  { label: '刷新', icon: 'fa-solid fa-rotate', action: 'refresh' },
  { label: '帮助', icon: '❓', action: 'help' },
  { label: '官网', icon: 'https://example.com/logo.png', action: 'open-site' },
]
```

## 常用图标速查

| 场景 | 图标 | class |
|------|------|-------|
| 文件夹 | <i class="fa-solid fa-folder"></i> | `fa-solid fa-folder` |
| 文件 | <i class="fa-solid fa-file"></i> | `fa-solid fa-file` |
| 设置 | <i class="fa-solid fa-gear"></i> | `fa-solid fa-gear` |
| 用户 | <i class="fa-solid fa-user"></i> | `fa-solid fa-user` |
| 锁 | <i class="fa-solid fa-lock"></i> | `fa-solid fa-lock` |
| 通知 | <i class="fa-solid fa-bell"></i> | `fa-solid fa-bell` |
| 搜索 | <i class="fa-solid fa-magnifying-glass"></i> | `fa-solid fa-magnifying-glass` |
| 关闭 | <i class="fa-solid fa-xmark"></i> | `fa-solid fa-xmark` |
| 添加 | <i class="fa-solid fa-plus"></i> | `fa-solid fa-plus` |
| 删除 | <i class="fa-solid fa-trash"></i> | `fa-solid fa-trash` |
| 编辑 | <i class="fa-solid fa-pen"></i> | `fa-solid fa-pen` |
| 保存 | <i class="fa-solid fa-floppy-disk"></i> | `fa-solid fa-floppy-disk` |
| 加载 | <i class="fa-solid fa-spinner"></i> | `fa-solid fa-spinner` |
| 主页 | <i class="fa-solid fa-house"></i> | `fa-solid fa-house` |
| 日期 | <i class="fa-solid fa-calendar"></i> | `fa-solid fa-calendar` |
| 时钟 | <i class="fa-solid fa-clock"></i> | `fa-solid fa-clock` |
| 音量 | <i class="fa-solid fa-volume-high"></i> | `fa-solid fa-volume-high` |
| 网络 | <i class="fa-solid fa-wifi"></i> | `fa-solid fa-wifi` |
| 电池 | <i class="fa-solid fa-battery-full"></i> | `fa-solid fa-battery-full` |
| GitHub | <i class="fa-brands fa-github"></i> | `fa-brands fa-github` |
| Chrome | <i class="fa-brands fa-chrome"></i> | `fa-brands fa-chrome` |

::: tip 完整图标库
访问 [FontAwesome 官网](https://fontawesome.com/icons) 查找更多图标，搜索后复制 `class` 字符串即可使用。
:::

## 命名规范

Ditto 内部使用以下命名约定，第三方应用可参考但不强制：

### FontAwesome class 命名

- **必须包含完整前缀**：`fa-solid fa-star` 而非仅 `fa-star`（v6 强制要求样式前缀）
- **使用 kebab-case**：图标名本身已是 kebab-case，如 `fa-magnifying-glass`、`fa-volume-high`
- **避免使用别名**：`fa-times` 是 v5 别名，v6 应使用 `fa-xmark`

### 应用图标命名

应用 `manifest.json` 中的 `icon` 字段建议遵循：

| 场景 | 推荐 | 示例 |
|------|------|------|
| 系统应用 | FA class | `"fa-solid fa-folder"` |
| 第三方应用 | FA class 或品牌 logo | `"fa-brands fa-twitter"` 或 `"https://cdn.example.com/logo.png"` |
| 临时原型 / 内部工具 | emoji | `"📦"` |
| 教育场景低龄应用 | emoji | `"🎨"`、`"🎵"` |

### 自定义图标资源

如需使用自有 SVG 图标但希望保持 DIcon 接口一致，建议：

1. 将 SVG 放在应用静态资源目录
2. `manifest.json` 中使用相对 URL：`"icon": "./icons/app.svg"`
3. DIcon 自动识别为 URL 模式并渲染 `<img>`

::: warning SVG 颜色继承
通过 `<img>` 加载的 SVG **不会**继承父元素的 `color`，因此无法通过 `color` prop 改变颜色。如需主题感知的矢量图标，建议：
- 使用 FontAwesome class 模式（依赖 FA 提供的 `currentColor` 继承）
- 或将 SVG inline 到 Vue 模板中，使用 `fill="currentColor"`

DIcon 的 URL 模式不支持颜色继承，但能确保图标始终可见，适合品牌 logo 等固定颜色的图标。
:::

## 自定义图标库

### 引入 FontAwesome Pro

如果项目已购买 FontAwesome Pro 授权，可在 Shell 中替换 CSS：

```typescript
// apps/shell/src/main.ts
import '@fortawesome/fontawesome-pro/css/all.min.css'

// 不再引入 free 版本
// import '@fortawesome/fontawesome-free/css/all.min.css'  // 注释掉
```

Pro 版本提供更多样式（`fa-light`、`fa-thin`、`fa-duotone`、`fa-sharp`），DIcon 自动识别以 `fa-` 开头的所有 class。

### 引入其他图标库

如需使用其他图标库（如 Material Icons），可直接在应用 CSS 中定义对应 class：

```css
.material-icons {
  font-family: 'Material Icons';
  font-weight: normal;
  font-style: normal;
  /* ... */
}
```

然后在 `DIcon` 中使用：

```vue
<DIcon name="material-icons home" />
```

::: warning 识别规则限制
DIcon 默认识别 `fa-` 开头为 FontAwesome。其他图标库的 class 需修改 DIcon 内部识别逻辑，或直接在模板中用 `<i :class="name">` 渲染。
:::

## 无障碍

DIcon 默认渲染 `<i>` 或 `<img>` 标签，无障碍访问时建议：

- 装饰性图标设置 `aria-hidden="true"`（DIcon 默认行为）
- 含义图标设置 `title` prop，会同时作为 `aria-label`

```vue
<DIcon name="fa-solid fa-bell" title="3 条未读通知" />
```

## 相关文档

- [UI & 主题](./)：三大支柱总览
- [组件库](./components)：DIcon 与其他组件的配合使用
- [主题定制](./theme)：通过 `--ditto-color-text-primary` 等变量控制图标颜色
- [FontAwesome 官网](https://fontawesome.com/icons)：完整图标库检索
