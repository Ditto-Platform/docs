import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Ditto',
  description: 'Ditto WebOS 官方文档',
  lastUpdated: true,
  base: '/',
  ignoreDeadLinks: true,
  
  head: [
    ['link', { rel: 'icon', href: '/logo.png' }],
    ['meta', { name: 'theme-color', content: '#00dfd9' }],
    ['meta', { name: 'og:type', content: 'website' }],
    ['meta', { name: 'og:title', content: 'Ditto WebOS 文档' }],
    ['meta', { name: 'og:description', content: '开源 · 轻量 · 易于定制 —— 支持 Chrome 80、树莓派、教育场景的 Web 端操作系统' }],
  ],
  
  themeConfig: {
    logo: '/logo.png',
    siteTitle: 'Ditto 文档',
    
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
          modal: {
            noResultsText: '无法找到相关结果',
            resetButtonTitle: '清除查询条件',
            footer: { selectText: '选择', navigateText: '切换', closeText: '关闭' }
          }
        }
      }
    },
    
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/quick-start/' },
      {
        text: '核心概念',
        items: [
          { text: '架构概览', link: '/concepts/' },
          { text: 'Kernel 架构', link: '/concepts/kernel' },
          { text: 'Cell 沙盒', link: '/concepts/cell' },
          { text: 'IPC 通信', link: '/concepts/ipc' },
          { text: '权限系统', link: '/concepts/permission' },
          { text: '生命周期', link: '/concepts/lifecycle' },
          { text: '默认应用关联', link: '/concepts/default-apps' },
        ]
      },
      {
        text: '开发指南',
        items: [
          { text: '第三方应用开发', link: '/development/third-party' },
          { text: 'SDK 参考', link: '/development/sdk' },
          { text: 'CLI 脚手架', link: '/development/cli' },
          { text: '调试技巧', link: '/development/debugging' },
        ]
      },
      {
        text: '部署运维',
        items: [
          { text: '生产部署', link: '/deployment/production' },
          { text: '教育场景', link: '/deployment/education' },
          { text: '配置项', link: '/deployment/configuration' },
          { text: '监控运维', link: '/deployment/monitoring' },
        ]
      },
      {
        text: 'API 参考',
        items: [
          { text: '服务端 API', link: '/api/server' },
          { text: '前端 API', link: '/api/client' },
          { text: '类型定义', link: '/api/types' },
        ]
      },
      { text: 'GitHub', link: 'https://github.com/Nevino2333/Ditto' },
    ],
    
    sidebar: [
      {
        text: '快速开始',
        collapsed: false,
        items: [
          { text: '简介', link: '/quick-start/' },
          { text: '安装', link: '/quick-start/installation' },
          { text: '基本使用', link: '/quick-start/basic-usage' },
        ]
      },
      {
        text: '核心概念',
        collapsed: false,
        items: [
          { text: '架构概览', link: '/concepts/' },
          { text: 'Kernel 架构', link: '/concepts/kernel' },
          { text: 'Cell 沙盒', link: '/concepts/cell' },
          { text: 'IPC 通信', link: '/concepts/ipc' },
          { text: '权限系统', link: '/concepts/permission' },
          { text: '生命周期', link: '/concepts/lifecycle' },
          { text: '默认应用关联', link: '/concepts/default-apps' },
        ]
      },
      {
        text: '开发指南',
        collapsed: false,
        items: [
          { text: '简介', link: '/development/' },
          { text: '第三方应用开发', link: '/development/third-party' },
          { text: 'SDK 参考', link: '/development/sdk' },
          { text: 'CLI 脚手架', link: '/development/cli' },
          { text: '调试技巧', link: '/development/debugging' },
        ]
      },
      {
        text: '部署运维',
        collapsed: false,
        items: [
          { text: '简介', link: '/deployment/' },
          { text: '生产部署', link: '/deployment/production' },
          { text: '教育场景', link: '/deployment/education' },
          { text: '配置项', link: '/deployment/configuration' },
          { text: '监控运维', link: '/deployment/monitoring' },
        ]
      },
      {
        text: 'API 参考',
        collapsed: false,
        items: [
          { text: '简介', link: '/api/' },
          { text: '服务端 API', link: '/api/server' },
          { text: '前端 API', link: '/api/client' },
          { text: '类型定义', link: '/api/types' },
        ]
      },
      {
        text: 'UI & 主题',
        collapsed: false,
        items: [
          { text: '简介', link: '/ui/' },
          { text: '组件库', link: '/ui/components' },
          { text: '主题定制', link: '/ui/theme' },
          { text: '图标', link: '/ui/icons' },
        ]
      },
    ],
    
    editLink: {
      pattern: 'https://github.com/Ditto-Platform/Ditto_docs/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页'
    },
    
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Nevino2333/Ditto' }
    ],
    
    footer: {
      message: '基于 <a href="https://github.com/Nevino2333/Ditto/blob/main/LICENSE">MIT 协议</a> 开源',
      copyright: 'Copyright © 2024-present <a href="https://github.com/Nevino2333">Ditto Platform</a>'
    },
    
    outline: {
      level: [2, 3],
      label: '页面导航'
    },
    
    lastUpdated: {
      text: '最后更新于',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short'
      }
    },
    
    docFooter: {
      prev: '上一页',
      next: '下一页'
    },
    
    returnToTopLabel: '回到顶部',
    sidebarMenuLabel: '菜单',
    darkModeSwitchLabel: '主题',
  }
})