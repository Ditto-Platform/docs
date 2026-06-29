# 第一步：下载简儿

在这一步中，你将把简儿的程序代码下载到你的电脑或服务器上。

## 你需要准备什么

- 一台能上网的电脑（Windows、macOS 或 Linux 均可）
- 如果你是在服务器上部署，你需要能通过 SSH 或远程桌面访问到服务器

## 方式一：直接下载压缩包（推荐新手）

如果你不熟悉 Git 或命令行操作，可以直接从 GitHub 下载压缩包：

1. 在浏览器中打开简儿的 GitHub 仓库页面：[https://github.com/SRInternet-Studio/Jianer_QQ_bot](https://github.com/SRInternet-Studio/Jianer_QQ_bot)
2. 点击绿色的 **Code** 按钮
3. 在弹出的菜单中，点击 **Download ZIP**
4. 下载完成后，把压缩包解压到你想要存放的目录下

::: tip 关于分支
GitHub 默认会下载 `main` 分支的代码。如果你想使用最新的 **NEXT 3 预览版**，你需要在页面左上角的分支选择器中切换到 `NEXT-PREVIEW` 分支，然后再点击 **Download ZIP**。
:::

## 方式二：通过 Release 下载（最推荐！）

简儿的每次重要更新或预览版发布时，都会在 Release 页面提供固定的代码包。如果你希望下载某个固定版本的代码，这是最适合的方法：

1. 在浏览器中打开[简儿的 GitHub Releases 页面](https://github.com/SRInternet-Studio/Jianer_QQ_bot/releases)
2. 找到最新的正式发行版（Latest release）或预发布版（Pre-release）
3. 在该版本说明最下面找到 **Assets** 区域，下载 `Jianer_Next_QQ_Bot.zip` 压缩包
4. 下载完成后，把压缩包解压到你想要存放的目录下

## 方式三：使用 Git 克隆（推荐有经验的用户）

如果你的电脑上已经安装了 [Git](https://git-scm.com/)，你可以用命令行克隆仓库：

```shell
git clone https://github.com/SRInternet-Studio/Jianer_QQ_bot.git
```

运行之后，当前目录下会出现一个叫 `Jianer_QQ_bot` 的文件夹，这就是简儿的程序目录。

### 切换到 NEXT 3 预览版

如果你需要使用最新的 NEXT 3 预览版本，请在克隆完成后执行：

```shell
cd Jianer_QQ_bot
git checkout NEXT-PREVIEW
```

::: info 什么是 NEXT 3 预览版？
NEXT 3 是简儿的下一个大版本，目前处于预览阶段。它在原来的基础上进行了大幅度的架构升级，新增了插件系统和 DeepSeek 等众多新功能。由于是预览版，可能存在少量不稳定的地方，但总体来说已经可以正常使用。**本文档的所有内容都基于 NEXT 3 预览版编写。**
:::

## 方式四：Fork 后再克隆（推荐开发者）

如果你打算在简儿的基础上做二次开发或者想长期保持更新，建议先 Fork 一份到你自己的 GitHub 账号下：

1. 登录你的 [GitHub 账号](https://github.com)
2. 打开简儿仓库页面：[https://github.com/SRInternet-Studio/Jianer_QQ_bot](https://github.com/SRInternet-Studio/Jianer_QQ_bot)
3. 点击右上角的 **Fork** 按钮，等待 Fork 完成
4. 在你自己的 Fork 仓库页面，复制你的仓库地址，使用 `git clone` 命令克隆到本地

这样做的好处是：你可以随时通过 Git 将官方仓库的更新合并到你自己的代码中，同时也能提交你自己的改动。

## 下载完成后

下载完成后，你应该有一个包含简儿所有文件的目录。可以打开这个目录确认一下，里面应该有 `main.py`、`plugins` 文件夹、`app.py`（WebUI 管理面板）等文件。

确认无误后，进入下一步：👉 [第二步：安装运行环境](/guide/install-deps)
