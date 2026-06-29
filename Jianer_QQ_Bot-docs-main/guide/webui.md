# Jianer WebUI 使用指南

Jianer WebUI 是简儿 QQ 机器人附带的**现代化本地管理面板**，提供图形化的配置、插件管理和运行控制功能。它基于 Vue 3 + Naive UI + Vite 构建，通过浏览器访问。

::: tip 替代旧版
Jianer WebUI 已取代旧版的 `SetupWizard.pyw`。如果你之前使用的是旧版设置向导，请升级到 Jianer Next3.1 以获取更丰富的功能。
:::

::: danger 关于WebUI稳定性
WebUI现在处于公测阶段，可能会有少许bug以及一些灵异事件,敬请见谅
:::

## 启动 WebUI

在简儿程序根目录下运行：

```shell
python app.py
```

启动后，在浏览器中访问 **`http://127.0.0.1:5000`** 即可打开 WebUI。

::: info 开发模式
如果你想以开发模式运行（支持热重载），可以分别启动前后端：
```shell
# 终端 1：启动 Flask 后端
python app.py

# 终端 2：启动 Vite 开发服务器
npm run dev
```
开发模式下前端地址为 `http://127.0.0.1:5174`，API 请求会自动代理到后端。
若您想在开发模式下运行,请访问[Jianer_SetupWizard](https://github.com/SRInternet-Studio/Jianer_SetupWizard)
:::

## 功能页面概览

WebUI 包含以下功能页面，通过左侧导航菜单切换：

| 页面 | 功能 | 对应配置 |
| --- | --- | --- |
| **欢迎** | 仪表盘首页，显示 NapCat 和 Jianer 的运行状态，快捷操作入口 | — |
| **基本信息设置** | 机器人中文名、英文名、管理员 QQ、触发符号、登录 QQ 号 | `config.json` |
| **AI 设置** | DeepSeek / OpenAI / Gemini 的 API Key，默认 AI 模式 | `config.json` |
| **AI 预设** | 管理 AI 人设和系统提示词，支持按用户绑定不同预设 | 预设文件 |
| **AI 语音回复** | EdgeTTS 语音配置（音色、语速、音量、音调） | `config.json` |
| **其他设置** | 口号、夸奖语、戳一戳拒绝语等 | `config.json` |
| **高级设置** | 连接 Host/Port、日志等级、黑名单 | `config.json` |
| **插件中心** | 从插件市场安装/卸载/启用/禁用/更新插件 | `plugins/` |
| **Jianer 管理** | 启动/停止简儿进程，配置启动命令和工作目录，查看实时日志 | `webui.json` |
| **NapCat 管理** | NapCat 部署安装、启动/停止、打开 WebUI、查看日志 | `webui.json` |
| **核对并应用设置** | 预览所有配置内容，一键保存到本地 | `config.json` |
| **关于** | 项目信息、版本说明和帮助链接 | — |

## 欢迎页

欢迎页是 WebUI 的仪表盘，提供：

- **NapCat 状态**：实时显示 NapCat 是否正在运行、安装路径，可快速打开 NapCat WebUI 或跳转到部署页面
- **Jianer 状态**：实时显示 Jianer 是否正在运行，可一键启动/停止
- **快捷操作卡片**：插件中心、基础设置、AI 配置、关于项目

## 基本信息设置

在这个页面配置机器人的基本属性：

- **机器人中文名**：填写你的机器人名称（**请勿使用"简儿"**）
- **机器人英文名**：填写英文名称
- **管理员 QQ**：即 `ROOT_User`，填写你自己的 QQ 号
- **触发提醒词**：群聊中触发机器人的前缀符号，默认为 `/`
- **登录 QQ 号**：机器人的 QQ 号

## AI 设置

配置各 AI 模型的 API Key 和默认模式：

- **DeepSeek Key**：DeepSeek 的 API Key
- **OpenAI Key**：ChatGPT 的 API Key
- **Gemini Key**：Google Gemini 的 API Key
- **默认模式**：选择默认的 AI 回复模型（DeepSeek / Google Gemini / ChatGPT-4 / ChatGPT-3.5）

::: tip 提示
API Key 只是选填项。如果你暂时不需要某个 AI 模型，留空即可。详见 [配置 AI 功能](/Configuring-AI-Functions)。
:::

## AI 预设管理

管理机器人在 AI 对话中使用的人设和角色：

- **新增预设**：点击右上角"新增预设"按钮创建
- **编辑预设**：设置预设名称、介绍信息和适用用户（QQ 号）
- **编辑内容**：点击"编辑内容"按钮，编辑完整的 AI 人设提示词
- **删除预设**：删除不需要的预设（默认预设 `Normal` 不可删除）
- **保存预设**：点击"保存预设"按钮保存所有修改

**可用变量**：在预设文本中可以使用以下模板变量：
- `{self.bot_name}` — 机器人的昵称
- `{self.event_user}` — 当前用户的昵称
- `{self.event_user_id}` — 当前用户的 QQ 号

## AI 语音回复设置

配置基于 EdgeTTS 的语音回复功能：

- **选择音色**：从可用的 TTS 音色列表中搜索并选择
- **语速调节**：调节语音播放速率（-100% ~ +100%）
- **音量调节**：调节语音播放音量
- **音调调节**：调节语音音调

## 其他设置

- **口号**：机器人的宣传标语列表
- **夸奖语**：当用户夸机器人时的回复列表
- **戳一戳拒绝语**：当用户戳一戳机器人时的拒绝语列表

## 高级设置

- **连接 Host**：简儿连接协议端的地址，本地部署填 `127.0.0.1`
- **连接 Port**：简儿连接协议端的端口，需与 NapCatQQ 的 WebSocket 端口一致
- **日志等级**：日志详细程度（DEBUG / TRACE / INFO / WARNING / ERROR / CRITICAL）
- **黑名单**：被机器人忽略的 QQ 号列表

## 插件中心

插件中心提供图形化的插件管理界面：

### 主要功能

- **浏览市场**：查看所有可用的远程插件列表
- **一键安装**：从插件市场直接安装插件到本地
- **启用 / 禁用**：开关已安装的插件
- **更新检查**：自动检测可更新的插件
- **卸载**：删除已安装的插件
- **查看详情**：查看插件的完整介绍、依赖和协议

### 插件中心设置

点击右上角"设置"按钮，可以配置：

- **GitHub Token**：配置 Personal Access Token 以提高 API 请求限额
- **PyPI 镜像**：配置 pip 国内镜像地址（如清华源 `https://pypi.tuna.tsinghua.edu.cn/simple`），加速插件依赖安装
- **GitHub 代理**：为中国大陆用户配置 GitHub 下载代理

## Jianer 管理

提供简儿机器人进程的完整生命周期管理：

### 运行控制

- **启动**：一键启动简儿主程序
- **停止**：一键停止简儿主程序

### 启动配置

- **启动命令**：默认为 `python main.py`，可根据需要修改
- **Shell**：选择命令执行的 Shell（自动 / cmd / PowerShell / bash）
- **工作目录**：简儿程序的所在目录
- **venv 路径**：Python 虚拟环境路径（如果使用了 venv）
- **一键安装 requirements**：自动运行 `pip install -r requirements.txt` 安装依赖


## NapCat 管理与部署

### 管理面板

- **运行状态**：实时显示 NapCat 是否在运行以及安装路径
- **启动 / 停止**：一键管理 NapCat 进程
- **打开 WebUI**：直接跳转到 NapCat 的 Web 管理界面
- **手动指定路径**：如果自动检测失败，手动指定 NapCat 安装目录
- **运行日志**：查看 NapCat 的实时运行日志

### 安装部署

支持多平台的 NapCat 一键部署：

| 平台 | 说明 |
| --- | --- |
| **Windows** | 自动下载 OneKey 安装包并运行安装器 |
| **Linux** | 使用 install.sh 脚本安装，支持 CLI、代理、强制安装等参数 |
| **macOS** | 使用 install.sh 脚本安装 |
| **Docker** | Docker 容器化安装，支持配置 QQ 号和运行模式 |
| **Termux** | 使用 install.termux.sh 安装 |

部署选项：
- **安装目录**：选择 NapCat 的安装路径
- **安装方式**：Shell 本机安装或 Docker 容器安装
- **代理设置**：选择下载代理（0 = 自动选择）
- **生成脚本**：生成安装脚本以供手动执行
- **开始安装**：直接在 WebUI 中执行自动化安装

## 核对并应用设置

在所有页面配置完成后，访问此页面：

1. 系统会以 JSON 格式展示你的所有配置内容
2. 仔细检查各项设置是否正确
3. 点击 **"应用"** 按钮保存配置到本地文件

::: warning 保存顺序
请先在各个功能页面完成配置，最后统一在此页面保存。插件中心和 Jianer 管理的配置是独立保存的，不受此页面影响。
:::

## 配置文件说明

WebUI 涉及的主要配置文件：

| 文件 | 用途 |
| --- | --- |
| `config.json` | 简儿核心配置（机器人名称、API Key、连接参数等） |
| `webui.json` | WebUI 自身配置（NapCat 路径、GitHub 代理、Jianer 启动配置等） |
| `prerequisites/` | 预设文件和运行时数据 |
