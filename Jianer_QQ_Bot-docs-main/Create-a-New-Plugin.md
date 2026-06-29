# 创建新的插件

为了简儿原生功能的丰富性，提升开发者二次开发的便捷性，简儿于 2025.02 推出了全新的 **NEXT PREVIEW 分支**。此分支的原生功能实际是 2.0 版本的迭代，但本分支新增了插件兼容性，为广大开发者们提供了更友好的插件开发入口。

::: warning 稳定性提示
NEXT PREVIEW 分支是**预览分支**，插件兼容性有待评估，投入实际使用可能不会具有预期中的稳定性。请谨慎使用本分支产品，如有遇到 Bug，请立即反馈于 [Issue](https://github.com/SRInternet-Studio/Jianer_QQ_bot/issues/new)，感谢您的谅解与支持。
:::

## 0. 原理讲解（必看） {#principle}

你可以在简儿的根目录下找到 `plugins` 文件夹，这是插件的存放目录。

插件可以以以下形式在 `plugins` 文件夹中存在：

| 形式 | 说明 |
| --- | --- |
| `.py` 文件 | 单个文件形式的插件，直接放在 `plugins` 目录下 |
| `.pyw` 文件 | 单个文件形式的插件，直接放在 `plugins` 目录下 |
| 文件夹 | 多文件组合的插件，文件夹中必须包含入口文件 `setup.py` |

::: info 文件夹插件规则
- 文件夹直接放在 `plugins` 目录下
- 文件夹中必须包含 `setup.py` 作为入口文件
- 文件夹内部的子文件夹**不会**被识别为插件
- `setup.py` 与单个文件形式的插件具有相同的编写规范
:::

::: warning 关于插件存放路径
- 简儿的所有插件军存放在简儿根目录下的`plugins`文件夹下，简儿的插件加载器也默认会从这个目录下加载插件
- 不要把简儿的插件和NapCat的插件弄混了！NapCat的插件与简儿的插件并无任何关联
:::

### 插件的启用与禁用

无论任何形式的插件，当其文件名以 **`d_`** 开头时（如 `d_something.py`），将会被忽略加载，即为 **已禁用插件**。

你可以在群里方便地管理插件：

| 指令 | 功能 |
| --- | --- |
| `启用插件` | 使简儿加载某个插件 |
| `禁用插件` | 使简儿忽略加载某个插件 |
| `重载插件` | 重新从磁盘加载全部插件（无需重启） |
| `插件视角` | 查看插件运行报告、启用状态和加载失败原因 |

## 1. 开始制作 {#getting-started}

### 创建单个文件形式的插件

在 `plugins` 文件夹下，新建 `.py` 文件，文件名会作为插件名称。如 `Hello World.py`

### 创建文件夹形式的插件

在 `plugins` 文件夹下，新建文件夹，文件夹名称会作为插件名称。如 `Hello World`

在该文件夹下，新建 `setup.py` 文件作为入口文件。如果缺少该文件，插件将无法被正常加载。

`setup.py` 和单个文件形式的插件操作方法**完全相同**。

### 注册插件

这是一个示例：一个 `Hello World.py` 插件具有以下代码：

```python
TRIGGHT_KEYWORD = "你好，世界"
HELP_MESSAGE = "-你好，世界 —> 仅仅就是一句 Hello world 🤔？"

async def on_message(event, actions, Manager, Segments):
    await actions.send(
        group_id=event.group_id, 
        message=Manager.Message(Segments.Text("Hello, world! 🌍"))
    )
    return True
```

::: tip 🎉 仅需 5 行代码！
仅需 5 行代码即可完成开发一个可以发送消息的插件，可见简儿插件开发的高效性。
:::

**代码详解：**

#### `TRIGGHT_KEYWORD`

`str` 类型。插件的**触发关键词**，即当用户在群里发送的消息包含此关键词时，触发此插件。

在示例中，当用户发送包含"你好，世界"的消息时，此插件将会被触发。

#### `HELP_MESSAGE`

`str` 类型。插件的**帮助消息**。当用户在群里 @简儿 或者发送"帮助"时，展示的帮助文件中会包括此帮助消息文本。

#### `async def on_message()`

插件的**入口函数**，当插件被触发时，执行 `on_message()` 函数内部的代码。

::: danger 重要
此方法**必须异步**（使用 `async def`）。
:::

#### `return True`

阻断执行后续功能（此行**可选**）。当插件返回 `True` 时，简儿将停止执行后续的功能，防止多个具有相同触发关键词的功能一起被执行。

### 参数传入

`async def on_message()` 函数可以接受很多参数，各种各样的参数说明详见 [API 参考](/api-reference)。

直接将想要被传入的参数填写在函数的括号内即可：

```python
async def on_message(event, actions, Manager, Segments)
```

### 实现功能

`actions`：行动对象，用于操作机器人执行一系列操作。

`event`：当前已被触发的消息事件类型及事件内容。

**举例：发送消息**

```python
await actions.send(
    group_id=event.group_id, 
    message=Manager.Message(Segments.Text("Hello, world! 🌍"))
)
```

| 代码 | 说明 |
| --- | --- |
| `actions.send()` | 发送一条消息 |
| `event.group_id` | 获取当前群的群号码 |
| `Manager.Message` | 构造一条消息 |
| `Segments.Text` | 构造一段纯文本消息 |

`actions` 和 `event` 还可以实现许多功能，它们继承于 **OneBot v11** 框架：

- 📖 [actions API 文档](https://github.com/botuniverse/onebot-11/blob/master/api/public.md)
- 📖 [event 事件文档](https://github.com/botuniverse/onebot-11/blob/master/event/README.md)

恭喜你，你已经实现了自己的第一个插件！快去试试吧～ 🎉

## 2. 制作进阶 {#advanced}

### 读取配置文件

正常情况下，你能够在简儿的根目录下找到配置文件 `config.json`，包含了机器人的名称、触发关键词等信息。

如果要在插件中加载配置文件，我们需要用到来自 **HypeR 框架** 中的一个功能：

```python
from Hyper import Configurator

Configurator.cm = Configurator.ConfigManager(
    Configurator.Config(file="config.json").load_from_file()
)
```

接下来，仅需 1 行代码获取配置文件中的值：

```python
bot_name = Configurator.cm.get_cfg().others["bot_name"]  # 获取机器人名称
```

你可以在任意位置插入配置文件中的值。`config.json` 使用标准的 JSON 字典格式，你可以直接查看配置文件以了解更多详细信息。

### 永久触发插件

**永久触发插件** 是指这个插件将会接收这个 QQ 账号的所有事件，比如：

- 群聊事件（`GroupMessageEvent`）
- 私聊事件（`PrivateMessageEvent`）
- 加群事件（`GroupMemberIncreaseEvent`）
- 退群事件（`GroupMemberDecreaseEvent`）
- ……

只要 QQ 账号的状态发生改变，插件就会被立刻触发。

要查看所有事件类型，详见 [API 参考 - Events](/api-reference#events-事件类型模块)

如果你想要做一个 **永久触发插件**，仅需将 `TRIGGHT_KEYWORD` 改动一个值：

```python
TRIGGHT_KEYWORD = "Any"
```

将 `TRIGGHT_KEYWORD` 设置为 `Any`，无论发生什么事件插件都会被立刻执行。**这就要求插件自己去判断事件的类型以及用户的输入，并作出判定**。

::: details 📝 完整示例：通过私聊触发的 Hello World

```python
from Hyper import Configurator

Configurator.cm = Configurator.ConfigManager(
    Configurator.Config(file="config.json").load_from_file()
)  # 加载配置文件

TRIGGHT_KEYWORD = "Any"
EXPECTED_VALUE = f"{Configurator.cm.get_cfg().others['reminder']}你好，世界"
HELP_MESSAGE = f"{EXPECTED_VALUE} —> 仅仅就是一句 Hello world 🤔？"

async def on_message(event, actions, Events, Manager, Segments):
    if isinstance(event, Events.PrivateMessageEvent):  # 判断是否为私聊事件
        if str(event.message) == EXPECTED_VALUE:  # 判断消息内容
            await actions.send(
                group_id=event.group_id, 
                message=Manager.Message(Segments.Text("Hello, world! 🌍"))
            )
            return True  # 此行可选
```

:::

::: warning 注意
`return True` 将会阻断执行**其他所有功能**，请谨慎使用。
:::

## 3. 插件市场 {#plugin-market}

简儿 NEXT 3 支持从插件市场获取社区制作的插件。

🔗 [Jianer 插件索引](https://github.com/IntelliMarkets/Jianer_Plugins_Index)


欢迎社区开发者提交你的插件！
