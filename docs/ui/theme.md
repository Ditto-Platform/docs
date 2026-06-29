# 主题定制

本页面介绍 Ditto WebOS 的主题系统与自定义方法。

## 主题引擎

```typescript
import { getThemeEngine } from '@ditto/theme'

const themeEngine = getThemeEngine()
```

## 预设主题

Ditto 内置多个预设主题：

```typescript
const themes = themeEngine.getAvailableThemes()
// [
//   { id: 'default', name: '默认', colorScheme: 'light' },
//   { id: 'dark', name: '深色', colorScheme: 'dark' },
//   ...
// ]
```

切换主题：

```typescript
themeEngine.setTheme('dark')
```

## 深色/浅色模式

```typescript
// 获取当前模式
const scheme = themeEngine.getColorScheme()

// 切换模式
themeEngine.toggleColorScheme()
```

## CSS 变量

Ditto 使用 CSS 变量定义主题：

```css
:root {
  --ditto-color-primary-500: #72ffee;
  --ditto-color-background: #ffffff;
  --ditto-color-text: #2c3e50;
  --ditto-color-border: #eaecef;
  ...
}

.dark {
  --ditto-color-background: #1e1e1e;
  --ditto-color-text: #dddddd;
  --ditto-color-border: #444444;
  ...
}
```

## 自定义主题

创建自定义主题：

```typescript
const customTheme = {
  id: 'my-theme',
  name: '我的主题',
  colorScheme: 'light',
  colors: {
    primary: '#72ffee',
    background: '#ffffff',
    text: '#333333',
    // ...
  },
}

themeEngine.registerTheme(customTheme)
themeEngine.setTheme('my-theme')
```

## 动画档位

```typescript
// 设置动画档位
themeEngine.setAnimationPreset('normal')

//档位：none / subtle / normal / expressive
```

## 主题包

主题包是 `.ditz` 文件，包含：
- CSS 变量定义
- 图片资源（壁纸、图标）
- 配置文件

安装主题包：

```bash
ditto-cli install theme.ditz
```