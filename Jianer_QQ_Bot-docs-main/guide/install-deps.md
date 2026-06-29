# 第二步：安装运行环境

简儿是一个 Python 程序，因此你需要先在电脑或服务器上安装 Python 和相关依赖库，才能运行它。

## 安装 Python

### 版本要求

| 简儿版本 | Python 要求 | 推荐版本 |
| --- | --- | --- |
| 简儿 2 / 简儿 3（旧版） | Python >= **3.9** , < **3.14** | **3.12.x** |
| 简儿 NEXT 3（带有 NEXT 字样） | Python > **3.11** , < **3.14** | **3.12.x** |

::: danger 版本不符会怎样？
如果你使用了过低版本的 Python 来运行 NEXT 3，程序会直接报错退出，提示类似 `SyntaxError: f-string: unmatched '['` 的错误——这是因为 NEXT 3 使用了较新的 Python 语法特性（如嵌套 f-string），只有 Python 3.12 及以上才支持。
:::

### Windows 用户

1. 前往 [Python 官方网站](https://www.python.org/downloads/) 下载最新版 Python 安装程序

   > 如果你无法前往官方网站，也可以直接点击这里 [下载 Python 3.12.7](https://mirrors.aliyun.com/python-release/windows/python-3.12.7-amd64.exe)

2. 运行安装程序时，**务必勾选** "Add Python to PATH"（添加 Python 到系统环境变量）这个选项
3. 点击 "Install Now" 完成安装

安装完成后，打开"命令提示符"（按 `Win + R`，输入 `cmd` 回车），输入以下命令验证安装是否成功：

```shell
python --version
```

如果看到输出了 Python 的版本号（例如 `Python 3.12.x`），说明安装成功。

::: tip 如果提示 "python 不是内部或外部命令"
这说明 Python 没有被添加到系统 PATH 中。你可以：
- 重新运行安装程序，选择 "Modify"，确保勾选了 "Add Python to PATH"
- 或者手动将 Python 安装路径添加到系统环境变量中
:::

### macOS 用户

macOS 通常预装了 Python，但版本可能较旧。推荐通过 [Homebrew](https://brew.sh/) 安装最新版：

```shell
brew install python@3.12
```

安装完成后验证：

```shell
python3 --version
```

### Linux 用户

大多数 Linux 发行版的包管理器中都有 Python。以 Ubuntu/Debian 为例：

```shell
sudo apt update
sudo apt install python3 python3-pip
```

安装完成后验证：

```shell
python3 --version
```

::: info 关于 python 和 python3 命令
在 Windows 上，通常使用 `python` 命令；在 macOS 和 Linux 上，通常使用 `python3` 命令。本文档后续统一使用 `python`，如果你是 macOS/Linux 用户，请自行替换为 `python3`。
:::

## 安装简儿的依赖库

简儿依赖一系列第三方 Python 库（例如网络通信用的 `aiohttp`、AI 对话用的 `openai` 等）。这些依赖库都列在了项目根目录下的 `requirements.txt` 文件中。

打开终端（Windows 请打开"命令提示符"或"PowerShell"），进入简儿的程序目录，运行以下命令安装所有依赖：

```shell
pip install -r requirements.txt
```

::: tip 国内用户加速安装
如果你身处中国大陆，从默认的 PyPI 源下载可能会很慢甚至超时。建议使用国内镜像源来加速安装：

```shell
pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple
```
:::

::: warning 预览版可能的依赖遗漏
部分预览版分支的 `requirements.txt` 可能存在遗漏。如果安装完成后运行简儿时仍然报错（提示 `ModuleNotFoundError: No module named 'xxx'`），你需要根据错误信息手动安装缺失的库：

```shell
pip install xxx
```

将 `xxx` 替换为报错信息中提到的库名即可。
:::

## 验证安装

安装完成后，你可以进入简儿的程序目录，尝试运行以下命令来检验环境是否就绪：

```shell
python main.py
```

如果此时你还没有配置机器人和协议端，程序会提示连接失败或配置文件缺失——这是正常的！能看到简儿尝试启动（而不是直接报 `ImportError` 或 `SyntaxError`），就说明 Python 和依赖库已经安装到位了。

按 `Ctrl + C` 退出程序，进入下一步：👉 [第三步：配置你的机器人](/guide/configure)
