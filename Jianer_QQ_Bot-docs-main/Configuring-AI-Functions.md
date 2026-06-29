# 配置 AI 功能

简儿 NEXT 3 原生支持 **OpenAI ChatGPT**、**Google Gemini** 和 **DeepSeek** 三大 AI 模型。这些模型有不同的请求方式，可能需要用户进行额外的配置。本文将指引你如何配置 AI 功能。

::: tip 提示
在 QQ 群中 @简儿 可以查看当前已启用的 AI 模型和更详细的帮助内容。
:::

## 配置 OpenAI ChatGPT

### 1. 完成安装环境

确保已经安装 OpenAI 库，可以在终端中输入以下命令以检查可用性：
```shell
pip show openai
```

如果已经安装，但是版本号小于 1.60.2 ，可以通过以下命令更新 OpenAI 库：
```shell
pip install --upgrade openai>=1.60.2 
```

如果提示 Error 可以通过以下命令安装 OpenAI 库：
```shell
pip install openai>=1.60.2 
```

如果提示网络问题，请使用镜像安装：
```shell
pip install openai>=1.60.2 -i https://pypi.tuna.tsinghua.edu.cn/simple
```

安装完成后即已经完成安装环境。

### 2. 填写 API Key

你需要 API Key 才能正常使用 ChatGPT 。我们使用了国内的中转 API 提供商提供的 ChatGPT 中转 API，因此用户**无需挂上代理**。

同时，我们的中转 API 提供商正在发放免费的 API Key ，您可以 [在这里直接免费获取](https://github.com/popjane/free_chatgpt_api) 。

获取到 API Key 之后，在 Jianer WebUI 的 **"AI 设置"** 页面填写，或者手动编辑 `config.json` 中的 `Others.openai_key` 字段。

成功应用设置后，你就可以开启你的 ChatGPT 畅聊之旅啦！

## 配置 DeepSeek

::: info 新功能
DeepSeek 是简儿 NEXT 3 新增支持的国产大模型，无需代理即可在中国大陆使用。
:::

### 1. 获取 API Key

1. 访问 [DeepSeek 官方平台](https://platform.deepseek.com/)
2. 注册并登录你的账号
3. 在控制台中创建 API Key
4. 复制并妥善保管你的 API Key

### 2. 填写 API Key

获取到 API Key 之后，在 Jianer WebUI 的 **"AI 设置"** 页面填写，或者手动编辑 `config.json` 中的 `Others.deepseek_key` 字段。

::: tip
DeepSeek 兼容 OpenAI API 格式，如果你使用的是第三方中转服务（如 OneAPI），也可以通过 OpenAI 的配置项来调用。
:::

## 配置 Google Gemini

### 1. 完成安装环境

确保已经安装 google-generativeai 库，可以在终端中输入以下命令以检查可用性：
```shell
pip show google-generativeai
```

如果已经安装，但是版本号不是 0.7.2 ，可以通过以下命令替换 google-generativeai 库：
```shell
pip uninstall google-generativeai
pip install google-generativeai==0.7.2
```

如果提示 Error 可以通过以下命令安装 google-generativeai 库：
```shell
pip install google-generativeai==0.7.2
```

如果提示网络问题，请使用镜像安装：
```shell
pip install google-generativeai==0.7.2 -i https://pypi.tuna.tsinghua.edu.cn/simple
```

安装完成后即已经完成安装环境。

### 3. 获取 API Key

1. **登录 Google 账户**

   登录到 [Google 主页](https://www.google.com/)，右上角有个注册按钮。

2. **访问 "Google AI Studio"**

   您可以 [在此处](https://ai.google.dev/) 找到该登陆页面。然后，点击 "Gemini API" 标签或点击 "了解有关 Gemini API 的更多信息" 按钮。

3. **点击 "在 Google AI Studio 获取 API 密钥"**

   点击页面中央的按钮获取 API 密钥。

4. **审批服务条款**

   页面会弹出一个窗口，要求您选择是否同意 Google API 服务条款和 Gemini API 附加服务条款。

   勾选第一个方框，其它方框也可以选择性勾选，然后点击继续。

5. **创建 API 密钥**

   点击 "创建 API 密钥"，然后选择在新项目中或通过现有项目创建。

   ::: warning
   一定要将此 API 密钥存储在安全的位置，以防止未经授权的访问。
   如果您无法访问Google，请考虑科学上网
   :::

### 4. 填写 API Key

获取到 API Key 之后，在 Jianer WebUI 的 **"AI 设置"** 页面填写，或者手动编辑 `config.json` 中的 `Others.gemini_key` 字段。

成功应用设置后，你就可以开启你的 Gemini 畅聊之旅啦！

## AI 模型对比

| 特性 | ChatGPT | Google Gemini | DeepSeek |
| --- | --- | --- | --- |
| 是否需要代理 | ❌ 不需要（使用中转） | ✅ 需要（中国大陆） | ❌ 不需要 |
| 免费额度 | 通过中转可免费获取 | 免费 API 额度 | 有免费额度 |
| 语音回复 | ❌ | ❌ | ❌ |
| 图片识别 | ❌ | ✅ 支持读图 | ❌ |
| 上下文管理 | ✅ 按用户分别存储 | ✅ 按用户分别存储 | ✅ 按用户分别存储 |

::: info EdgeTTS 语音回复
简儿支持基于 **EdgeTTS** 的 AI 语音回复功能，这是全局功能，与使用哪个 AI 模型无关。可以在 `config.json` 中的 `Others.TTS` 字段进行音色、语速、音量和音调的配置。
:::

## 是否支持更多 AI 模型？

简儿 NEXT 3 已经支持 **DeepSeek**、**ChatGPT** 和 **Google Gemini** 三大模型。

此外，任何兼容 OpenAI API 格式的服务（如 OneAPI、各种本地模型等）理论上都可以通过 OpenAI 配置项来接入。

也欢迎各位大佬们更改简儿的代码！(๑•̀ㅂ•́)و✧

