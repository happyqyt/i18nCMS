export const SEED_FILES: Record<string, string> = {
  'README.md': `# VeSync 文案仓库（本地演示）

这个仓库由浏览器内的 isomorphic-git 初始化。

- \`locales/*.json\`：各语种文案
- \`groups.json\`：分组树（随版本快照）
- \`app.json\`：应用主数据（CMS 设计里不该进版本；这里放进来是为了对比 Git 的行为）

建议工作流：

1. 在 \`draft\` 分支改文案（对应 CMS 草稿）
2. commit 相当于打一个版本快照
3. tag 相当于锁定版本
4. merge 到 \`main\` 相当于发布
5. 从某个 commit 恢复文件到工作区，相当于回滚写入草稿
`,

  'app.json': `${JSON.stringify(
    {
      name: 'VeSync App',
      description: '浏览器 Git 引擎可行性演示用的虚拟应用',
      languages: ['en-US', 'zh-CN', 'ja-JP'],
      members: ['elin'],
      note: 'CMS 设计中名称/成员/语种是 App 级主数据，不随版本快照。Git commit 会把这个文件一并版本化。',
    },
    null,
    2,
  )}\n`,

  'groups.json': `${JSON.stringify(
    {
      groups: [
        { key: 'home', name: '首页', parent: null },
        { key: 'home.hero', name: '首屏', parent: 'home' },
        { key: 'settings', name: '设置', parent: null },
      ],
    },
    null,
    2,
  )}\n`,

  'locales/en-US.json': `${JSON.stringify(
    {
      home: {
        hero: {
          title: 'Clean air, quietly',
          cta: 'Shop now',
        },
        welcome: 'Welcome to VeSync',
      },
      settings: {
        title: 'Settings',
        language: 'Language',
      },
    },
    null,
    2,
  )}\n`,

  'locales/zh-CN.json': `${JSON.stringify(
    {
      home: {
        hero: {
          title: '安静地呼吸干净空气',
          cta: '立即选购',
        },
        welcome: '欢迎使用 VeSync',
      },
      settings: {
        title: '设置',
        language: '语言',
      },
    },
    null,
    2,
  )}\n`,

  'locales/ja-JP.json': `${JSON.stringify(
    {
      home: {
        hero: {
          title: '静かに、きれいな空気を',
          cta: '購入する',
        },
        welcome: 'VeSync へようこそ',
      },
      settings: {
        title: '設定',
        language: '言語',
      },
    },
    null,
    2,
  )}\n`,
}
