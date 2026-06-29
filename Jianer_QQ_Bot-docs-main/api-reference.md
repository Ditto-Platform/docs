# API 参考

本文档详细列出了插件开发时可供调用的参数、模块和类型。所有位于 `main.py` 中的变量、类型、方法等都可以作为参数被传递给插件的 `on_message()` 函数。

::: tip 格式说明
本文格式：**参数名**: `参考值`（非实际提供值，仅供参考，大部分参数有相应注解注意甄别）
:::

## 变量

### 基础变量

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 1 | `__name__` | `'__main__'` | 运行模块名称 |
| 2 | `__file__` | `'/root/Jianer/main.py'` | 简儿主程序的入口文件路径 |
| 3 | `bot_name` | `'简儿'` | 机器人的名称 |
| 4 | `bot_name_en` | `'Jianer'` | 机器人的英文名称 |
| 5 | `version_name` | `'3.0-NextPreviewUltra'` | 简儿的项目版本号 |
| 6 | `reminder` | `'-'` | 机器人的触发关键词（符号） |
| 7 | `PLUGIN_FOLDER` | `'plugins'` | 插件存放的目录名称 |

### 消息相关

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 8 | `user_message` | `'-你好呀'` | 用户发送的消息 |
| 9 | `order` | `'你好呀'` | 用户发送的消息（不包含触发关键词） |
| 10 | `event_user` | `'简儿'` | 发送消息的用户昵称 |

### AI 相关

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 11 | `EnableNetwork` | `'Pixmap'` | 当前 AI 回复模式。`Pixmap` = 读图（Gemini），`Normal` = ChatGPT 3.5，`Net` = ChatGPT 4o mini |
| 12 | `user_lists` | `{}` | ChatGPT 系列模型的用户上下文，键名为用户QQ号 |
| 13 | `sys_prompt` | `'你叫简儿……'` | 机器人当前的 AI 回复预设 |
| 14 | `key` | `''` | Google Gemini 模型的 API Key |
| 15 | `generation_config` | 见下方 | Google Gemini 模型的回复生成配置 |
| 16 | `model` | `genai.GenerativeModel(...)` | Google Gemini 模型实例 |
| 17 | `tools` | `[]` | Google Gemini 模型可用的工具列表 |
| 18 | `gptsovitsoff` | `'False'` | 是否启用 TTS 语音回复功能 |

Gemini `generation_config` 的默认配置：

```python
{
    'temperature': 1,
    'top_p': 0.95,
    'top_k': 64,
    'max_output_tokens': 8192,
    'response_mime_type': 'text/plain'
}
```

### 运行时状态

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 19 | `second_start` | `65536` | 机器人累计运行时长（秒） |
| 20 | `in_timing` | `True` | 是否已进入事件循环（启动完成后为 `True`） |
| 21 | `generating` | `False` | 是否正在从 Pixiv 生成图片 |
| 22 | `emoji_send_count` | `12.34` | Emoji 复述功能的计时器（间隔 15 秒） |
| 23 | `cooldowns` | `{}` | **ACG 生图** 的个人冷却时间列表 |
| 24 | `cooldowns1` | `{}` | **Pixiv 生图** 的个人冷却时间列表 |

### 权限相关

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 25 | `ROOT_User` | `['123456789']` | ROOT 用户组列表（字符串QQ号） |
| 26 | `Super_User` | `['123456789']` | Super 用户组列表 |
| 27 | `Manage_User` | `['123456789']` | Manage 用户组列表 |
| 28 | `sisters` | `['0987654321']` | 使用 "做我姐姐吧" 预设的用户列表 |
| 29 | `jhq` | `['987654321']` | 使用《工作细胞》预设的用户列表 |

### 插件信息

| # | 参数名 | 参考值 | 说明 |
| --- | --- | --- | --- |
| 30 | `loaded_plugins` | `['SoGood_54c9...', ...]` | 已加载成功的插件（名称 + UUID） |
| 31 | `disabled_plugins` | `[]` | 已禁用的插件 |
| 32 | `failed_plugins` | `[]` | 加载失败的插件（名称 + 失败原因） |

## 模块

### 内置与第三方库

插件可以直接使用以下已经导入的模块，无需重复 `import`：

| 模块 | 说明 |
| --- | --- |
| `asyncio` | 异步 I/O |
| `datetime` | 日期时间处理 |
| `os` | 操作系统接口 |
| `sys` | 系统相关 |
| `random` | 随机数 |
| `re` | 正则表达式 |
| `base64` | Base64 编解码 |
| `time` | 时间操作 |
| `threading` | 多线程 |
| `subprocess` | 子进程管理 |
| `requests` | HTTP 请求 |
| `aiohttp` | 异步 HTTP |
| `OpenAI` | OpenAI 客户端类 |
| `Image` | PIL 图片处理 |
| `io` | I/O 流 |
| `psutil` | 系统信息 |
| `GPUtil` | GPU 信息 |
| `emoji` | Emoji 处理 |
| `paramiko` | SSH 连接 |
| `Configurator` | HypeR 框架配置管理器 |
| `platform` | 平台信息 |
| `traceback` | 异常追踪 |
| `inspect` | 代码内省 |
| `importlib` | 动态导入 |
| `uuid` | UUID 生成 |
| `urllib` | URL 处理 |

### HypeR 框架模块

#### `Listener` 事件监听模块

用于监听和处理事件。详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#listener-%E6%A8%A1%E5%9D%97)

#### `Events` 事件类型模块

用于判断当前触发的事件类型，具有以下子类：

| 事件类型 | 说明 |
| --- | --- |
| `Events.MessageEvent` | 消息事件（基类） |
| `Events.PrivateMessageEvent` | 私聊消息事件 |
| `Events.GroupMessageEvent` | 群聊消息事件 |
| `Events.NoticeEvent` | 通知事件（基类） |
| `Events.GroupFileUploadEvent` | 群文件上传事件 |
| `Events.GroupAdminEvent` | 群管理员变动事件 |
| `Events.GroupMemberDecreaseEvent` | 群成员减少（退群）事件 |
| `Events.GroupMemberIncreaseEvent` | 群成员增加（入群）事件 |
| `Events.GroupMuteEvent` | 群禁言事件 |
| `Events.FriendAddEvent` | 好友添加事件 |
| `Events.GroupRecallEvent` | 群消息撤回事件 |
| `Events.FriendRecallEvent` | 好友消息撤回事件 |
| `Events.NotifyEvent` | 通知事件 |
| `Events.GroupEssenceEvent` | 群精华消息事件 |
| `Events.MessageReactionEvent` | 消息回应（表情回复）事件 |
| `Events.RequestEvent` | 请求事件（基类） |
| `Events.GroupAddInviteEvent` | 加群/邀请入群事件 |

详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#events-%E6%A8%A1%E5%9D%97)

#### `Logger` 日志模块

用于在插件中输出日志。详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#logger-py)

#### `Manager` 消息内容模块

用于构造消息内容：
- `Manager.Message` — 表示一条消息

详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#manager-%E6%A8%A1%E5%9D%97)

#### `Segments` 消息类型模块

用于构造不同类型的消息段：

| 类型 | 说明 |
| --- | --- |
| `Segments.Text` | 纯文本消息 |
| `Segments.At` | @某人 |
| `Segments.Image` | 图片消息 |
| `Segments.Video` | 视频消息 |
| `Segments.Reply` | 回复消息 |

详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#segments-%E6%A8%A1%E5%9D%97)

#### `Logic` 逻辑模块

详见 [HypeR_Bot 文档](https://harcicyang.github.io/hyper-bot/more/classes.html#logic-py)

## 类型

### `plugins`

```python
'plugins': [
    <module 'HelloWorld_9704e6...' from '/root/Jianer/plugins/HelloWorld.py'>
]
```

已加载的插件模块列表。可以直接调用其中的插件，实现 **插件调用其他插件** 的效果。但请注意传参规范，详见 `main.py` 中的 `execute_plugin` 方法。

### `event`

当前已被触发的消息事件类型。通过判断其是 `Events` 的哪一个子类可以判断当前用户正在执行什么操作。

可以 [在这里](https://github.com/botuniverse/onebot-11/blob/master/event/README.md) 找到它的更多使用方式。

### `actions`

行动对象，用于操作机器人执行各种操作，例如：
- `actions.send()` — 向群内发送消息

可以 [在这里](https://github.com/botuniverse/onebot-11/blob/master/api/public.md) 找到更多 API。

::: info 💡 开发者须知
本文当中提及的内容涵盖大部分开发者可能用到的参数用途指引，但这些并不是全部。**所有位于 `main.py` 中的变量、类型、方法等都可以作为参数被传递**，开发者们，你们发挥的时间到啦（๑✧∀✧๑）☀！
:::
