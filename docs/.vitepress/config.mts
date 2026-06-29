import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Ditto',
  description: 'Ditto WebOS 官方文档',
  
  // 主题色
  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#72ffee' }],
  ],
  
  // 主题配置
  themeConfig: {
    // Logo
    logo: '/logo.svg',
    
    // 站点标题
    siteTitle: 'Ditto',
    
    // 导航栏
    nav: [
      { text: '首页', link: '/' },
      { text: '快速开始', link: '/quick-start/' },
      { text: '核心概念', link: '/concepts/' },
      { text: '开发指南', link: '/development/' },
      { text: '部署运维', link: '/deployment/' },
      { text: 'API 参考', link: '/api/' },
      { text: 'UI & 主题', link: '/ui/' },
      { text: 'GitHub', link: 'https://github.com/Nevino2333/Ditto' },
    ],
    
    // 侧边栏
    sidebar: {
      '/quick-start/': [
        {
          text: '快速开始',
          items: [
            { text: '简介', link: '/quick-start/' },
            { text: '安装', link: '/quick-start/installation' },
            { text: '基本使用', link: '/quick-start/basic-usage' },
          ],
        },
      ],
      '/concepts/': [
        {
          text: '核心概念',
          items: [
            { text: '架构概览', link: '/concepts/' },
            { text: 'Kernel 架构', link: '/concepts/kernel' },
            { text: 'Cell 沙盒', link: '/concepts/cell' },
            { text: 'IPC 通信', link: '/concepts/ipc' },
            { text: '权限系统', link: '/concepts/permission' },
            { text: '生命周期', link: '/concepts/lifecycle' },
          ],
        },
      ],
      '/development/': [
        {
          text: '开发指南',
          items: [
            { text: '简介', link: '/development/' },
            { text: '第三方应用开发', link: '/development/third-party' },
            { text: 'SDK 参考', link: '/development/sdk' },
            { text: 'CLI 脚手架', link: '/development/cli' },
            { text: '调试技巧', link: '/development/debugging' },
          ],
        },
      ],
      '/deployment/': [
        {
          text: '部署运维',
          items: [
            { text: '简介', link: '/deployment/' },
            { text: '生产部署', link: '/deployment/production' },
            { text: '教育场景', link: '/deployment/education' },
            { text: '配置项', link: '/deployment/configuration' },
            { text: '监控运维', link: '/deployment/monitoring' },
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          items: [
            { text: '简介', link: '/api/' },
            { text: '服务端 API', link: '/api/server' },
            { text: '前端 API', link: '/api/client' },
            { text: '类型定义', link: '/api/types' },
          ],
        },
      ],
      '/ui/': [
        {
          text: 'UI & 主题',
          items: [
            { text: '简介', link: '/ui/' },
            { text: '组件库', link: '/ui/components' },
            { text: '主题定制', link: '/ui/theme' },
            { text: '图标', link: '/ui/icons' },
          ],
        },
      ],
    },
    
    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Nevino2333/Ditto' },
    ],
    
    // 页脚
    footer: {
      message: 'MIT Licensed',
      copyright: 'Copyright © 2024-present Ditto Platform',
    },
    
    // 编辑链接
    editLink: {
      pattern: 'https://github.com/Ditto-Platform/Ditto_docs/edit/main/docs/:path',
      text: '在 GitHub 上编辑此页',
    },
    
    // 最后更新时间
    lastUpdated: {
      text: '最后更新',
      formatOptions: {
        dateStyle: 'short',
        timeStyle: 'short',
      },
    },
    
    // 搜索
    search: {
      provider: 'local',
    },
    
    // 文档页脚
    docFooter: {
      prev: '上一页',
      next: '下一页',
    },
    
    // 大纲标题
    outline: {
      label: '页面导航',
    },
    
    // 返回顶部
    returnToTopLabel: '返回顶部',
    
    // 侧边栏菜单标签
    sidebarMenuLabel: '菜单',
    
    // 深色模式切换
    darkModeSwitchLabel: '主题',
    lightModeSwitchTitle: '切换到浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
  },
})