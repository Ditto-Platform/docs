# 图标

本页面介绍 Ditto WebOS 的图标使用方法。

## FontAwesome 6

Ditto 内置 FontAwesome 6 Free：

```bash
# 已集成到 @ditto/ui
import '@fortawesome/fontawesome-free/css/all.min.css'
```

## DIcon 组件

```vue
<template>
  <!-- Solid 样式 -->
  <DIcon name="fa-solid fa-star" />
  
  <!-- Regular 样式 -->
  <DIcon name="fa-regular fa-heart" />
  
  <!-- Brands 样式 -->
  <DIcon name="fa-brands fa-github" />
  
  <!-- 自定义大小 -->
  <DIcon name="fa-solid fa-folder" size="32px" />
</template>
```

## 常用图标

| 图标 | class |
|------|-------|
| 文件夹 | `fa-solid fa-folder` |
| 文件 | `fa-solid fa-file` |
| 设置 | `fa-solid fa-gear` |
| 用户 | `fa-solid fa-user` |
| 锁 | `fa-solid fa-lock` |
| 通知 | `fa-solid fa-bell` |
| 搜索 | `fa-solid fa-magnifying-glass` |
| 关闭 | `fa-solid fa-xmark` |
| 添加 | `fa-solid fa-plus` |
| 删除 | `fa-solid fa-trash` |

## manifest.icon

应用 manifest 中使用 FontAwesome class：

```json
{
  "icon": "fa-solid fa-star"
}
```

## 完整图标库

访问 [FontAwesome 官网](https://fontawesome.com/icons) 查找更多图标。

## 自定义图标

也可使用 URL 图片：

```json
{
  "icon": "https://example.com/my-icon.svg"
}
```

或 emoji fallback：

```json
{
  "icon": "📦"
}
```

## 下一步

完成文档站学习，开始你的 Ditto 开发之旅！