# NapCatQQ 使用教程

NapCatQQ 是一个基于 QQ 官方版本的开源 QQ 机器人无头客户端（协议端），是目前非常稳定和活跃的协议框架。

::: tip 强烈推荐
由于 Lagrange.OneBot 的签名服务器已关停，**我们强烈推荐所有新老用户使用 NapCatQQ**。过去的关于 Lagrange 的教程均已标记为过时。NapCatQQ 配置简单，拥有可视化的 WebUI 管理界面。
:::

## 第一步：下载并安装 NapCatQQ

### Windows / Windows Server 用户

推荐使用 NapCat.Win 一键版本（无需提前安装 QQ）：

1. 前往 [NapCatQQ Releases](https://github.com/NapNeko/NapCatQQ/releases) 下载 `NapCat.Shell.Windows.OneKey.zip` 无头绿色版本
2. 解压到任意目录
3. 点击 `NapCatInstaller.exe` 等待自动化配置完成
4. 进入当前生成的 `NapCat.XXXX.Shell` 目录
5. 双击 `NapCatWinBootMain.exe` 即可启动


### Linux 用户（适用 Ubuntu 20+ / Debian 10+ / CentOS 9）

在终端中执行以下命令进行可视化交互安装：

```bash
curl -o napcat.sh https://nclatest.znin.net/NapNeko/NapCat-Installer/main/script/install.sh && bash napcat.sh
```

- 该脚本提供可视化的安装界面（TUI）。
- 您可以选择直接安装在 Shell 环境中（推荐），也可以选择 Docker 容器化安装。
- 安装途中只需按屏幕引导即可。

## 第二步：配置 NapCatQQ 返回 WebUI

### 1. 打开 WebUI

在 NapCatQQ 成功启动并登录 QQ 后，你可以通过 Web 浏览器访问管理面板。

| 部署环境 | 访问地址 |
| --- | --- |
| 本地部署 | `http://localhost:6099` |
| 服务器部署 | `http://你的服务器IP:6099` |

::: tip 关于端口
NapCat在您的服务器/电脑中运行时端口可能不为6099，请以NapCat日志给出的访问地址为准
:::

### 2. 登录 WebUI

请查看NapCatQQ文档


### 3. 配置 WebSocket 服务器

1. 登录 WebUI 后，在左侧菜单中找到 **网络配置**
2. 点击 **添加** 按钮
3. 选择 **WebSocket 服务器** 类型
4. 填写配置参数：

| 参数 | 值 | 说明 |
| --- | --- | --- |
| 名称 | 自定义 | 随便取个名字 |
| 地址 (Host) | `127.0.0.1` | 本地部署填此地址，服务器部署填NapCatQQ日志给出的访问地址(如果你的NapCatQQ和简儿在同一条服务器上，填`127.0.0.1`即可) |
| 端口 (Port) | `5004` | **必须**与简儿 `config.json` 中的 `Connection.port` 保持一致 |
| 令牌 (Token) |  | **必须留空**，此项不填任何值 |


## 第三步：启动简儿

完成 NapCatQQ 配置后，启动你的简儿 QQ 机器人：

```bash
python main.py
```

当看到控制台提示 **“成功建立连接”** 时，恭喜你！🎉 你已经成功建立了 NapCatQQ 与简儿之间的 WebSocket 连接。

## 故障排除

| 问题 | 解决方法 |
| --- | --- |
| 无法访问 WebUI | 检查 NapCatQQ 端口（默认6099）是否已被使用，或防火墙是否已放行 |
| 各种环境或依赖缺失 | 确保使用官方的一键脚本运行，或查阅 [NapCatQQ 官方文档](https://napneko.github.io/) 获取完整依赖链 |
| 连接简儿失败 | 检查 WebSocket 服务器地址和端口配置，确认 `config.json` 里是与 NapCat 填写的**完全相符**的配置，**确认 `Token` 一栏的值为空** |

如果你遇到了其他疑难杂症，可以加入 [QQ用户社区](https://qm.qq.com/q/2KOL5pDTFm) 获取进一步帮助。
