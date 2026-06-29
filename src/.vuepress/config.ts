import { viteBundler } from '@vuepress/bundler-vite'
import { plumeTheme } from 'vuepress-theme-plume'
import { defineUserConfig } from 'vuepress/cli'

export default defineUserConfig({
  lang: 'zh-CN',
  title: 'Ditto',
  description: 'Ditto WebOS 官方文档',

  head: [
    ['link', { rel: 'icon', href: '/logo.svg' }],
    ['meta', { name: 'theme-color', content: '#72ffee' }],
  ],

  bundler: viteBundler(),

  theme: plumeTheme({
    // 主题色
    color: '#72ffee',
    
    // Logo
    logo: '/logo.svg',
    logoDark: '/logo.svg',
    
    // GitHub 配置
    repo: 'https://github.com/Ditto-Platform/Ditto_docs',
    docsRepo: 'https://github.com/Ditto-Platform/Ditto_docs',
    docsBranch: 'main',
    docsDir: 'src',
    
    // 编辑链接
    editLink: true,
    
    // 最后更新时间
    lastUpdated: true,
    
    // 贡献者
    contributors: true,

    // 导航栏
    navbar: [
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
          collapsible: true,
          children: [
            '/quick-start/',
            '/quick-start/installation',
            '/quick-start/basic-usage',
          ],
        },
      ],
      '/concepts/': [
        {
          text: '核心概念',
          collapsible: true,
          children: [
            '/concepts/',
            '/concepts/kernel',
            '/concepts/cell',
            '/concepts/ipc',
            '/concepts/permission',
            '/concepts/lifecycle',
          ],
        },
      ],
      '/development/': [
        {
          text: '开发指南',
          collapsible: true,
          children: [
            '/development/',
            '/development/third-party',
            '/development/sdk',
            '/development/cli',
            '/development/debugging',
          ],
        },
      ],
      '/deployment/': [
        {
          text: '部署运维',
          collapsible: true,
          children: [
            '/deployment/',
            '/deployment/production',
            '/deployment/education',
            '/deployment/configuration',
            '/deployment/monitoring',
          ],
        },
      ],
      '/api/': [
        {
          text: 'API 参考',
          collapsible: true,
          children: [
            '/api/',
            '/api/server',
            '/api/client',
            '/api/types',
          ],
        },
      ],
      '/ui/': [
        {
          text: 'UI & 主题',
          collapsible: true,
          children: [
            '/ui/',
            '/ui/components',
            '/ui/theme',
            '/ui/icons',
          ],
        },
      ],
    },

    // 插件配置（移除不支持的 markdownEnhance）
    plugins: {
      search: true,
      comment: false,
    },

    // 社交链接
    socialLinks: [
      { icon: 'github', link: 'https://github.com/Nevino2333/Ditto' },
    ],

    // 页脚
    footer: {
      message: 'MIT Licensed | Copyright © 2024-present Ditto Platform',
    },
  }),
})