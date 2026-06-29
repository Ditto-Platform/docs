# 第三步：配置你的机器人

这是整个部署流程中最重要的一步。你需要完成两件事：

1. **搭建协议端**（NapCatQQ）—— 让你的 QQ 号能被程序控制
2. **配置简儿的设置文件** —— 告诉简儿它叫什么名字、谁是它的主人、怎么连接协议端等等

## 一、搭建协议端（NapCatQQ）

### 什么是协议端？

简儿本身不会直接登录 QQ，它需要通过一个"协议端"来代为收发 QQ 消息。你可以把协议端理解成一个"翻译官"：

```
QQ 服务器 ⇋ 协议端（NapCatQQ）⇋ 简儿机器人
```

我们推荐使用 **NapCatQQ** 作为协议端，它稳定、易用、支持可视化配置。

::: danger 关于 Lagrange.OneBot（已过时）
过去简儿曾推荐 Lagrange.OneBot，但由于其签名服务器已经关停，该方案已失效。所有新用户请使用 NapCatQQ。
:::

### 安装并启动 NapCatQQ

详细的安装和配置教程请参考：👉 [NapCatQQ 使用教程](/NapCatQQ使用教程)

简单来说，你需要完成以下几件事情：

1. **下载并安装 NapCatQQ**
2. **启动 NapCatQQ，扫码登录你的机器人 QQ 号**
3. **在 NapCatQQ 的 WebUI 中添加一个 WebSocket 服务器**，配置如下：
   - 地址 (Host)：`127.0.0.1`
   - 端口 (Port)：`5004`（这个数字你需要记住，后面配置简儿时要用到）
   - 令牌 (Token): （这个字段**留空**）

完成后，NapCatQQ 就会开始监听这个端口，等待简儿来连接。

## 二、配置简儿

简儿提供了两种配置方式：**图形化配置向导**和**手动编辑配置文件**。

### 方式一：Jianer WebUI 图形化管理面板（推荐）

简儿附带了一个现代化的 Web 管理面板 **Jianer WebUI**，通过浏览器即可完成所有配置操作。

在简儿程序目录下，运行：

```shell
python app.py
```

启动后，在浏览器中打开 **`http://127.0.0.1:5000`** 即可访问 WebUI。

::: info 找不到 app.py？
如果你的分支目录中没有 `app.py` 文件，说明当前版本可能还未集成 WebUI，请使用下方的"手动配置"方式。
:::

**操作步骤：**

1. 在左侧导航菜单中，依次打开以下页面并填写信息：
   - **基本信息设置**：机器人名称、管理员 QQ、触发符号、登录 QQ 号
   - **AI 设置**：填写各 AI 模型的 API Key（可选，之后再配也行）
   - **高级设置**：确认连接 Host 和 Port（需与 NapCatQQ 的 WebSocket 端口一致）
2. 全部填完后，点击左侧导航的 **"核对并应用设置"**
3. 检查一遍 JSON 格式的配置预览，确认无误后点击 **"应用"** 按钮
4. 看到 **"已成功保存"** 提示时，配置就完成了

::: tip WebUI 功能远不止于此
除了基础配置，WebUI 还提供了 **AI 预设管理**、**插件中心**、**NapCat 一键部署**、**Jianer 进程管理** 等高级功能。详见 [WebUI 使用指南](/guide/webui)。
:::

::: tip 无桌面环境的 Linux 服务器怎么办？
WebUI 是基于 Web 的，你可以通过 SSH 隧道或者修改监听地址来远程访问。也可以先在本地电脑上使用 WebUI 完成配置，然后将 `config.json` 复制到服务器上。
:::

### 方式二：手动编辑配置文件

如果你更习惯直接编辑文件，或者没有图形界面可用，也可以手动创建和编辑配置文件。

#### config.json —— 机器人核心配置

这是简儿最核心的配置文件。在简儿程序根目录中创建（或打开已有的）`config.json` 文件，填入以下内容：

```json
{
    "owner": [
      0
    ],
    "black_list": [
    ],
    "silents": [
    ],
    "Connection": {
      "mode": "FWS",
      "host": "127.0.0.1",
      "port": 5004,
      "listener_host": "127.0.0.1",
      "listener_port": 5003,
      "retries": 5,
      "satori_token": ""
    },
    "Log_level": "DEBUG",
    "protocol": "OneBot",
    "Others": {
      "gemini_key": "",
      "openai_key": "",
      "deepseek_key": "",
      "default_mode": "Ds", 
      "bot_name": "简儿",
      "bot_name_en": "Jianer",
      "ROOT_User": [""],
      "Auto_approval": [""],
      "reminder": "~",
      "slogan": "简单 可爱 个性 全知",
      "TTS": {
        "voiceColor": "zh-CN-XiaoyiNeural",
        "rate": "+0%",
        "volume": "+0%",
        "pitch": "+0Hz"
      },
      "compliment": [
        "啊！老……老公，别怎么说啦，人……人家好害羞的啦，人家还会努力的(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ",
        "啊~老公~你不要这么夸人家啦~〃∀〃",
        "唔……谢……谢谢老公啦🥰~"
      ],
      "poke_rejection_phrases": [
         "呜哇——！(╥﹏╥) 戳得人家头发都翘起来啦！",
         "喵嗷！(ﾟДﾟ≡ﾟдﾟ) 再戳就要炸毛了哦！",
         "噗噜噗噜~(。-`ω´-) 戳漏气了怎么办！"
      ]
    },
    "uin": 0
}
```

**下面逐条说明你需要修改的地方：**

#### 必须修改的配置

| 配置项 | 怎么填 |
| --- | --- |
| `owner` | 把 `0` 改成你的机器人 QQ 号。例如：`[1234567890]` |
| `uin` | 同样填写你的机器人 QQ 号。例如：`1234567890` |
| `Others.bot_name` | 给你的机器人取一个中文名字（**不能叫"简儿"**，详见下方声明） |
| `Others.bot_name_en` | 给你的机器人取一个英文名字 |
| `Others.ROOT_User` | 填写你自己（机器人主人）的 QQ 号。例如：`["9876543210"]`。**强烈建议填写**，否则你无法使用管理指令 |

#### 连接相关配置

| 配置项 | 说明 |
| --- | --- |
| `Connection.host` | NapCatQQ 运行的地址。如果简儿和 NapCatQQ 在同一台机器上，就填 `127.0.0.1` |
| `Connection.port` | NapCatQQ 中 WebSocket 服务器的端口号。**必须**和你在 NapCatQQ WebUI 中设置的端口保持一致，默认 `5004` |

#### 可选配置

| 配置项 | 说明 | 默认值 |
| --- | --- | --- |
| `black_list` | 黑名单。列表中 QQ 号发送的消息会被机器人忽略 | 空 |
| `silents` | 静默群列表。机器人在这些群中不会主动说话 | 空 |
| `Log_level` | 日志详细程度。可选：`DEBUG`（最详细）、`TRACE`、`INFO`、`WARNING`、`ERROR`、`CRITICAL` | `DEBUG` |
| `Others.reminder` | 触发符号。用户发送消息时以此符号开头，机器人才会响应。例如设为 `~` 后，用户需要发送 `~帮助` 才能触发"帮助"功能 | `~` |
| `Others.slogan` | 机器人的宣传标语，会在部分场景中展示 | `简单 可爱 个性 全知` |
| `Others.default_mode` | 默认的 AI 回复模型。可选：`DeepSeek`、`Google Gemini`、`ChatGPT-4`、`ChatGPT-3.5` | `DeepSeek` |
| `Others.Auto_approval` | 加群自动审批。当机器人是群管理员时，如果入群申请的答案匹配这个列表中的内容，就自动通过 | 空 |
| `Others.gemini_key` | Google Gemini 的 API Key，留空则不启用 Gemini | 空 |
| `Others.openai_key` | ChatGPT 的 API Key，留空则不启用 ChatGPT | 空 |
| `Others.deepseek_key` | DeepSeek 的 API Key，留空则不启用 DeepSeek | 空 |
| `Others.TTS` | EdgeTTS 语音回复相关设置（音色、语速、音量、音调） | 见上方默认值 |
| `Others.compliment` | 当用户夸机器人时的回复列表。可以随意自定义 | 见上方默认值 |
| `Others.poke_rejection_phrases` | 当用户戳一戳机器人时的拒绝语列表 | 空 |

::: tip 关于 AI 功能
AI 功能的 API Key 不是必填项。如果你现在还不需要 AI 对话功能，可以全部留空，之后再按需配置。详见 [配置 AI 功能](/Configuring-AI-Functions)。
:::

#### 定时群发消息（可选）

如果你希望机器人每天在固定时间往群里发一条消息（比如提醒大家吃饭、早安问候等），可以配置这个功能。

在简儿程序根目录中创建 `timing_message.ini` 文件，写入内容，格式为：

```
发送时间⊕消息内容
```

用特殊字符 `⊕` 将时间和内容隔开。时间格式为 24 小时制的 `hh:mm`。例如：

```ini
08:00⊕早上好！新的一天开始啦，一起加油吧 (ง •̀_•́)ง
11:45⊕各位 这个点也该吃了吧？(♡>𖥦<)/♥
22:00⊕该睡觉啦！晚安 🌙
```

如果你有些群不想收到定时消息，可以创建 `blacklist.Sr` 文件，一行写一个要屏蔽的群号。

#### 权限组用户配置（可选）

简儿有三个权限等级：ROOT_User > Super_User > Manage_User。在部署阶段，你只需要确保 `config.json` 中的 `ROOT_User` 填写了你自己的 QQ 号即可。

其余权限组的配置可以之后在群里通过指令完成，也可以手动编辑：

- `Manage_User.ini` —— 一行一个 QQ 号，拥有基础管理权限
- `Super_User.ini` —— 一行一个 QQ 号，拥有高级管理权限

详见：👉 [配置用户组](/Configure-User-Group)

## 配置完成

到这里，你已经完成了配置工作！接下来就可以启动简儿了。

👉 [第四步：启动并使用](/guide/launch)
