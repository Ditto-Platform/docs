import { viteBundler } from '@vuepress/bundler-vite'
import { defaultTheme } from '@vuepress/theme-default'
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

  theme: defaultTheme({
    logo: '/logo.svg',
    repo: 'https://github.com/Ditto-Platform/Ditto_docs',
    docsRepo: 'https://github.com/Ditto-Platform/Ditto_docs',
    docsBranch: 'main',
    docsDir: 'src',
    editLink: true,
    lastUpdated: true,
    lastUpdatedText: '上次更新',
    contributors: true,
    contributorsText: '贡献者',

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
        { text: '快速开始', collapsible: false, children: [
          '/quick-start/',
          '/quick-start/installation',
          '/quick-start/basic-usage',
        ] },
      ],
      '/concepts/': [
        { text: '核心概念', collapsible: false, children: [
          '/concepts/',
          '/concepts/kernel',
          '/concepts/cell',
          '/concepts/ipc',
          '/concepts/permission',
          '/concepts/lifecycle',
        ] },
      ],
      '/development/': [
        { text: '开发指南', collapsible: false, children: [
          '/development/',
          '/development/third-party',
          '/development/sdk',
          '/development/cli',
          '/development/debugging',
        ] },
      ],
      '/deployment/': [
        { text: '部署运维', collapsible: false, children: [
          '/deployment/',
          '/deployment/production',
          '/deployment/education',
          '/deployment/configuration',
          '/deployment/monitoring',
        ] },
      ],
      '/api/': [
        { text: 'API 参考', collapsible: false, children: [
          '/api/',
          '/api/server',
          '/api/client',
          '/api/types',
        ] },
      ],
      '/ui/': [
        { text: 'UI & 主题', collapsible: false, children: [
          '/ui/',
          '/ui/components',
          '/ui/theme',
          '/ui/icons',
        ] },
      ],
    },

    // 主题色定制
    colorMode: 'auto',
    colorModeSwitch: true,
  }),
})