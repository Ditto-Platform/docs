# CLI 脚手架

Ditto CLI 是命令行工具，用于创建、打包、发布应用。

## 安装

```bash
pnpm add -g @ditto/cli
```

## 命令

### ditto-cli create

创建新应用项目：

```bash
ditto-cli create <app-name> --template <template>
```

| 参数 | 描述 |
|------|------|
| `--template` | vue / react / vanilla |
| `--type` | app / widget / plugin / theme |
| `--with-backend` | 同时创建后端 Cell |

示例：

```bash
ditto-cli create my-counter --template vue --type dit --with-backend
```

### ditto-cli pack

打包应用为 `.dit` 文件：

```bash
ditto-cli pack <project-dir>
```

输出文件位于 `dist/<app-id>.dit`。

### ditto-cli publish

发布应用到 Market：

```bash
ditto-cli publish <package-file> --token <api-token>
```

需要 Ditto Market API Token。

### ditto-cli install

本地安装应用：

```bash
ditto-cli install <package-file>
```

应用会安装到 Ditto 的 `apps/installed/` 目录。

### ditto-cli dev

启动开发模式：

```bash
ditto-cli dev <project-dir>
```

会自动启动 Ditto Shell + 应用前端。

### ditto-cli validate

验证 manifest.json：

```bash
ditto-cli validate <project-dir>
```

检查字段完整性、格式正确性。

## 配置文件

CLI 支持配置文件 `ditto.config.json`：

```json
{
  "defaultTemplate": "vue",
  "marketApiUrl": "https://market.ditto.dev/api",
  "outputDir": "dist"
}
```

## 下一步

继续阅读 [调试技巧](/development/debugging)。