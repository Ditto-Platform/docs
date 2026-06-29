---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "简儿"
  text: "NEXT 3"
  tagline: 开源 · 模块化 · 易于配置 —— 基于 OneBot v11 的新一代 QQ 群机器人
  image:
    src: /tx.png
    alt: 简儿 QQ 机器人
  actions:
    - theme: brand
      text: 🚀 快速开始
      link: /faststart
    - theme: alt
      text: 📖 使用指南
      link: /guide/daily-use
    - theme: alt
      text: GitHub
      link: https://github.com/SRInternet-Studio/Jianer_QQ_bot

features:
  - icon: 🤖
    title: 多模型 AI 对话
    details: 原生支持 DeepSeek、Google Gemini、ChatGPT 等主流模型。按用户分别存储预设和上下文，支持角色扮演与 EdgeTTS 语音回复。
    link: /Configuring-AI-Functions
    linkText: 配置 AI →
  - icon: 🎨
    title: 丰富的娱乐功能
    details: ACG 动漫生图、Pixiv 搜图、名人名言（文字转图片）、大头照、Hitokoto 一言等原生插件，为你的群聊增添无穷乐趣。
    link: /guide/daily-use
    linkText: 了解功能 →
  - icon: 🛡️
    title: 全面的群管工具
    details: 撤回、禁言、踢人、退群、定时群发消息、加群自动审批、QQ 号核验等功能一应俱全，让群管理轻松高效。
    link: /Configure-User-Group
    linkText: 了解权限 →
  - icon: 🧩
    title: 强大的插件系统
    details: 基于 HypeR_Bot 框架，功能全面插件化。仅需 5 行代码即可开发一个插件，支持热重载、启用/禁用管理和插件市场。
    link: /Create-a-New-Plugin
    linkText: 开发插件 →
  - icon: ⚡
    title: 灵活的协议适配
    details: 官方推荐使用稳定强大的 NapCatQQ 作为主流协议端（Lagrange.OneBot 已过时）。通过 WebSocket 连接，适配 Windows 和 Linux 全平台部署。
    link: /NapCatQQ使用教程
    linkText: 协议配置 →
  - icon: 🌟
    title: 更多特色功能
    details: 入群欢迎、定时群发消息、runcommand 执行系统命令、Jianer WebUI 图形化管理面板、NapCat 一键部署、三级权限用户组管理……持续更新中！
    link: /guide/webui
    linkText: WebUI 指南 →
---
