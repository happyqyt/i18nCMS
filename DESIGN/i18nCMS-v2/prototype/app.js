const { createApp } = Vue;

const ALL_LANGUAGES = [
  { code: 'en', label: '英语' },
  { code: 'zh-Hans', label: '简体中文' },
  { code: 'zh-Hant', label: '繁体中文' },
  { code: 'ja', label: '日语' },
  { code: 'ko', label: '韩语' },
  { code: 'fr', label: '法语' },
  { code: 'de', label: '德语' },
  { code: 'es', label: '西班牙语' },
  { code: 'it', label: '意大利语' },
  { code: 'pt', label: '葡萄牙语' },
  { code: 'ru', label: '俄语' },
  { code: 'th', label: '泰语' },
];

let _id = 1;
const uid = (p = 'id') => `${p}_${_id++}_${Math.random().toString(36).slice(2, 6)}`;

// mkCopy(key, {en, 'zh-Hans', ja, ...}) 或 mkCopy(key, en, zh, ja) 两种写法都支持
function mkCopy(key, a, zh, ja) {
  const values = (a && typeof a === 'object') ? { ...a } : { en: a, 'zh-Hans': zh, ja };
  return { id: uid('c'), key, values };
}
function mkPage(name, screenshot, copies) { return { id: uid('pg'), name, screenshot, copies }; }

const PROJECTS = [
  {
    id: uid('p'), name: 'VeSync App', color: '#4f6ef7',
    description: '智能家居 App 全端多语言文案，覆盖登录、首页、设备控制、设置等。',
    languages: ['en', 'zh-Hans', 'ja'],
    members: [{ name: 'Vision', role: '项目管理员' }, { name: 'Amy', role: '项目成员' }, { name: 'Tom', role: '项目成员' }, { name: 'Lin', role: '项目成员' }],
    versions: [
      { id: uid('v'), name: 'v3', createdAt: '2026-06-10 14:20', author: 'Vision', note: '新增设备控制页文案' },
      { id: uid('v'), name: 'v2', createdAt: '2026-05-22 09:11', author: 'Amy', note: '首页改版文案' },
      { id: uid('v'), name: 'v1', createdAt: '2026-04-30 18:02', author: 'Vision', note: '初始版本' },
    ],
    pages: [
      mkPage('common', false, [
        mkCopy('Confirm', 'Confirm', '确认', '確認'),
        mkCopy('Cancel', 'Cancel', '取消', 'キャンセル'),
        mkCopy('Save', 'Save', '保存', '保存'),
        mkCopy('Delete', 'Delete', '删除', '削除'),
        mkCopy('Edit', 'Edit', '编辑', '編集'),
        mkCopy('Done', 'Done', '完成', '完了'),
        mkCopy('Next', 'Next', '下一步', '次へ'),
        mkCopy('Back', 'Back', '返回', '戻る'),
        mkCopy('Retry', 'Retry', '重试', '再試行'),
        mkCopy('Loading', 'Loading...', '加载中...', '読み込み中...'),
        mkCopy('Network_Error', 'Network error, please try again', '网络错误，请重试', 'ネットワークエラー、再試行してください'),
        mkCopy('Success_Toast', 'Operation successful', '操作成功', '操作に成功しました'),
        mkCopy('Yes', 'Yes', '是', 'はい'),
        mkCopy('No', 'No', '否', 'いいえ'),
      ]),
      mkPage('login', true, [
        mkCopy('Welcome_Back', 'Welcome back', '欢迎回来', 'おかえりなさい'),
        mkCopy('Sign_In', 'Sign in', '登录', 'ログイン'),
        mkCopy('Sign_Up', 'Sign up', '注册', '新規登録'),
        mkCopy('Email', 'Email', '邮箱', 'メールアドレス'),
        mkCopy('Password', 'Password', '密码', 'パスワード'),
        mkCopy('Email_Hint', 'Enter your email', '请输入邮箱', 'メールアドレスを入力'),
        mkCopy('Password_Hint', 'Enter your password', '请输入密码', 'パスワードを入力'),
        mkCopy('Forgot_Password', 'Forgot password?', '忘记密码？', 'パスワードをお忘れですか？'),
        mkCopy('Remember_Me', 'Remember me', '记住我', 'ログイン状態を保持'),
        mkCopy('Or_Continue_With', 'Or continue with', '或使用以下方式登录', 'または次で続行'),
        mkCopy('Agree_Terms', 'I agree to the Terms of Service', '我已阅读并同意服务条款', '利用規約に同意します'),
        mkCopy('Invalid_Email', 'Please enter a valid email', '请输入有效的邮箱地址', '有効なメールアドレスを入力してください'),
        mkCopy('Login_Failed', 'Incorrect email or password', '邮箱或密码错误', 'メールアドレスまたはパスワードが正しくありません'),
      ]),
      mkPage('home', true, [
        mkCopy('Hello_User', 'Hello, {user_name}', '你好，{user_name}', 'こんにちは、{user_name}'),
        mkCopy('My_Devices', 'My Devices', '我的设备', 'マイデバイス'),
        mkCopy('Add_Device', 'Add Device', '添加设备', 'デバイスを追加'),
        mkCopy('All_Devices', 'All Devices', '全部设备', 'すべてのデバイス'),
        mkCopy('Favorites', 'Favorites', '收藏', 'お気に入り'),
        mkCopy('No_Devices', 'No devices yet, tap + to add one', '暂无设备，点击 + 添加', 'デバイスがありません。+ をタップして追加'),
        mkCopy('Device_Count', '{count} devices online', '{count} 台设备在线', '{count} 台のデバイスがオンライン'),
        mkCopy('Good_Morning', 'Good morning', '早上好', 'おはようございます'),
        mkCopy('Good_Evening', 'Good evening', '晚上好', 'こんばんは'),
        mkCopy('Weather_Today', "Today's air quality is good", '今日空气质量良好', '本日の空気品質は良好です'),
        mkCopy('Quick_Actions', 'Quick Actions', '快捷操作', 'クイック操作'),
        mkCopy('View_All', 'View all', '查看全部', 'すべて表示'),
      ]),
      mkPage('device', false, [
        mkCopy('Power_On', 'Power On', '开机', '電源オン'),
        mkCopy('Power_Off', 'Power Off', '关机', '電源オフ'),
        mkCopy('Fan_Speed', 'Fan Speed', '风速', '風量'),
        mkCopy('Mode', 'Mode', '模式', 'モード'),
        mkCopy('Auto_Mode', 'Auto', '自动', '自動'),
        mkCopy('Sleep_Mode', 'Sleep', '睡眠', 'スリープ'),
        mkCopy('Timer', 'Timer', '定时', 'タイマー'),
        mkCopy('Schedule', 'Schedule', '日程', 'スケジュール'),
        mkCopy('Filter_Life', 'Filter life: {percent}%', '滤芯寿命：{percent}%', 'フィルター寿命：{percent}%'),
        mkCopy('Replace_Filter', 'Time to replace the filter', '该更换滤芯了', 'フィルターの交換時期です'),
        mkCopy('Child_Lock', 'Child Lock', '童锁', 'チャイルドロック'),
        mkCopy('Night_Light', 'Night Light', '夜灯', 'ナイトライト'),
        mkCopy('Firmware_Update', 'Firmware update available', '有可用的固件更新', 'ファームウェアの更新があります'),
        mkCopy('Device_Offline', 'Device is offline', '设备已离线', 'デバイスはオフラインです'),
      ]),
      mkPage('settings', true, [
        mkCopy('Settings', 'Settings', '设置', '設定'),
        mkCopy('Account', 'Account', '账户', 'アカウント'),
        mkCopy('Notifications', 'Notifications', '通知', '通知'),
        mkCopy('Language', 'Language', '语言', '言語'),
        mkCopy('Privacy', 'Privacy', '隐私', 'プライバシー'),
        mkCopy('About', 'About', '关于', 'について'),
        mkCopy('Log_Out', 'Log out', '退出登录', 'ログアウト'),
        mkCopy('Log_Out_Confirm', 'Are you sure you want to log out?', '确定要退出登录吗？', 'ログアウトしてもよろしいですか？'),
        mkCopy('Dark_Mode', 'Dark Mode', '深色模式', 'ダークモード'),
        mkCopy('Version_Info', 'Version {version}', '版本 {version}', 'バージョン {version}'),
        mkCopy('Clear_Cache', 'Clear cache', '清除缓存', 'キャッシュを削除'),
        mkCopy('Contact_Support', 'Contact support', '联系客服', 'サポートに問い合わせる'),
      ]),
    ],
  },
  {
    id: uid('p'), name: 'Official Website', color: '#19b576',
    description: '品牌官网营销文案，包含 Banner、产品介绍、FAQ、Footer。',
    languages: ['en', 'zh-Hans', 'ja', 'fr', 'de', 'es'],
    members: [{ name: 'Amy', role: '项目管理员' }, { name: 'Vision', role: '项目成员' }],
    versions: [{ id: uid('v'), name: 'v1', createdAt: '2026-06-01 10:00', author: 'Amy', note: '官网首发' }],
    pages: [
      mkPage('common', false, [
        mkCopy('Learn_More', { en: 'Learn more', 'zh-Hans': '了解更多', ja: '詳細はこちら', fr: 'En savoir plus', de: 'Mehr erfahren', es: 'Saber más' }),
        mkCopy('Buy_Now', { en: 'Buy now', 'zh-Hans': '立即购买', ja: '今すぐ購入', fr: 'Acheter', de: 'Jetzt kaufen', es: 'Comprar ahora' }),
        mkCopy('Contact_Us', { en: 'Contact us', 'zh-Hans': '联系我们', ja: 'お問い合わせ', fr: 'Nous contacter', de: 'Kontakt', es: 'Contáctenos' }),
        mkCopy('Subscribe', { en: 'Subscribe', 'zh-Hans': '订阅', ja: '購読する', fr: "S'abonner", de: 'Abonnieren', es: 'Suscribirse' }),
      ]),
      mkPage('banner', true, [
        mkCopy('Slogan', { en: 'Breathe better, live better', 'zh-Hans': '畅享每一次呼吸', ja: 'より良い呼吸を', fr: 'Mieux respirer, mieux vivre', de: 'Besser atmen, besser leben', es: 'Respira mejor, vive mejor' }),
        mkCopy('Hero_Sub', { en: 'Smart air purifiers for every home', 'zh-Hans': '为每个家庭打造的智能空气净化器', ja: 'すべての家庭のためのスマート空気清浄機', fr: 'Purificateurs intelligents pour chaque maison', de: 'Intelligente Luftreiniger für jedes Zuhause', es: 'Purificadores inteligentes para cada hogar' }),
        mkCopy('Shop_Collection', { en: 'Shop the collection', 'zh-Hans': '选购系列产品', ja: 'コレクションを見る', fr: 'Voir la collection', de: 'Kollektion ansehen', es: 'Ver la colección' }),
      ]),
      mkPage('faq', false, [
        mkCopy('FAQ_Title', { en: 'Frequently Asked Questions', 'zh-Hans': '常见问题', ja: 'よくある質問', fr: 'Questions fréquentes', de: 'Häufige Fragen', es: 'Preguntas frecuentes' }),
        mkCopy('FAQ_Shipping', { en: 'How long does shipping take?', 'zh-Hans': '配送需要多长时间？', ja: '配送にはどのくらいかかりますか？', fr: 'Quel est le délai de livraison ?', de: 'Wie lange dauert der Versand?', es: '¿Cuánto tarda el envío?' }),
        mkCopy('FAQ_Warranty', { en: 'What is the warranty policy?', 'zh-Hans': '保修政策是怎样的？', ja: '保証ポリシーは？', fr: 'Quelle est la garantie ?', de: 'Wie lautet die Garantie?', es: '¿Cuál es la garantía?' }),
        mkCopy('FAQ_Return', { en: 'Can I return my order?', 'zh-Hans': '我可以退货吗？', ja: '返品はできますか？', fr: 'Puis-je retourner ma commande ?', de: 'Kann ich zurückgeben?', es: '¿Puedo devolver mi pedido?' }),
      ]),
    ],
  },
  {
    id: uid('p'), name: 'Admin Dashboard', color: '#f0a020',
    description: '后台管理系统文案，含菜单、表格、表单提示。',
    languages: ['en', 'zh-Hans'],
    members: [{ name: 'Tom', role: '项目管理员' }],
    versions: [{ id: uid('v'), name: 'v1', createdAt: '2026-06-05 16:40', author: 'Tom', note: '后台初版' }],
    pages: [
      mkPage('common', false, [
        mkCopy('Dashboard', 'Dashboard', '仪表盘'),
        mkCopy('Search', 'Search', '搜索'),
        mkCopy('Export', 'Export', '导出'),
        mkCopy('Import', 'Import', '导入'),
        mkCopy('Operation', 'Operation', '操作'),
        mkCopy('Status', 'Status', '状态'),
        mkCopy('Created_At', 'Created at', '创建时间'),
        mkCopy('No_Data', 'No data', '暂无数据'),
      ]),
      mkPage('users', true, [
        mkCopy('User_List', 'User List', '用户列表'),
        mkCopy('Add_User', 'Add User', '新增用户'),
        mkCopy('Username', 'Username', '用户名'),
        mkCopy('Role', 'Role', '角色'),
        mkCopy('Disable_User', 'Disable user', '禁用用户'),
        mkCopy('Delete_User_Confirm', 'Delete this user permanently?', '确定永久删除该用户？'),
      ]),
    ],
  },
];

createApp({
  data() {
    return {
      view: 'projects',
      allLanguages: ALL_LANGUAGES,
      projects: PROJECTS,
      currentProject: null,
      currentPage: null,
      currentVersion: 'draft',

      projectSearch: '',
      copySearch: '',
      searchScope: 'page',
      copyPage: 1,
      pageSize: 8,
      selectedCopies: [],

      // modals
      showProjectModal: false,
      projectForm: { id: null, name: '', description: '', languages: ['en'], membersText: '' },
      showPageModal: false,
      pageForm: { name: '', uploaded: false },
      ocrLoading: false,
      ocrResult: [],
      showRich: false,
      richCtx: { row: null, lang: 'en', value: '' },
      showImport: false,
      importFormat: 'JSON',
      importLoaded: false,
      importPreview: [],
      showExport: false,
      exportFormat: 'JSON',
      exportSplit: false,
      showTagVersion: false,
      tagForm: { name: '', note: '' },
      showDiff: false,
      diffMode: 'diff',
      diffVersion: null,
      diffData: [],
      showMove: false,
      moveMode: 'migrate',
      moveTarget: null,
      moveCount: 0,
      showAddLang: false,
      addLangCode: '',
      showLangSettings: false,
      confirm: { show: false, title: '', message: '', ok: () => {} },
      toastMsg: '',
    };
  },
  computed: {
    filteredProjects() {
      const q = this.projectSearch.trim().toLowerCase();
      return this.projects.filter(p => !q || p.name.toLowerCase().includes(q));
    },
    availableToAdd() {
      if (!this.currentProject) return [];
      return this.allLanguages.filter(l => !this.currentProject.languages.includes(l.code));
    },
    filteredCopies() {
      if (!this.currentPage) return [];
      const q = this.copySearch.trim().toLowerCase();
      if (!q) return this.currentPage.copies;
      return this.currentPage.copies.filter(c =>
        c.key.toLowerCase().includes(q) ||
        Object.values(c.values).some(v => (v || '').toLowerCase().includes(q))
      );
    },
    totalCopyPages() { return Math.max(1, Math.ceil(this.filteredCopies.length / this.pageSize)); },
    pagedCopies() {
      const s = (this.copyPage - 1) * this.pageSize;
      return this.filteredCopies.slice(s, s + this.pageSize);
    },
    allSelected() {
      return this.pagedCopies.length > 0 && this.pagedCopies.every(c => this.selectedCopies.includes(c.id));
    },
  },
  watch: {
    copySearch() { this.copyPage = 1; },
  },
  mounted() {
    const d = new URLSearchParams(location.search).get('demo');
    if (d === 'copies') { this.openProject(this.projects[0]); this.openPage(this.currentProject.pages[2]); }
    else if (d === 'versions') { this.openProject(this.projects[0]); this.view = 'versions'; }
    else if (d === 'pages') { this.openProject(this.projects[0]); }
    else if (d === 'import') { this.openProject(this.projects[0]); this.openPage(this.currentProject.pages[1]); this.openImport(); this.loadImportPreview(); }
    else if (d === 'diff') { this.openProject(this.projects[0]); this.view = 'versions'; this.openRollback(this.currentProject.versions[1]); }
    else if (d === 'export') { this.openProject(this.projects[0]); this.openExport(); }
  },
  methods: {
    langLabel(code) { const l = this.allLanguages.find(x => x.code === code); return l ? l.label : code; },
    countCopies(p) { return p.pages.reduce((n, pg) => n + pg.copies.length, 0); },
    toast(msg) { this.toastMsg = msg; clearTimeout(this._t); this._t = setTimeout(() => this.toastMsg = '', 2000); },

    // navigation
    goProjects() { this.view = 'projects'; this.currentProject = null; this.currentPage = null; },
    openProject(p) { this.currentProject = p; this.currentPage = null; this.view = 'pages'; this.currentVersion = 'draft'; },
    openPage(pg) { this.currentPage = pg; this.view = 'copies'; this.copyPage = 1; this.selectedCopies = []; this.copySearch = ''; },

    // project CRUD
    openCreateProject() { this.projectForm = { id: null, name: '', description: '', languages: ['en'], membersText: 'Vision' }; this.showProjectModal = true; },
    openEditProject(p) { this.projectForm = { id: p.id, name: p.name, description: p.description, languages: [...p.languages], membersText: p.members.map(m => m.name).join(', ') }; this.showProjectModal = true; },
    saveProject() {
      const f = this.projectForm;
      if (!f.name.trim()) { this.toast('请填写项目名称'); return; }
      const members = f.membersText.split(',').map(s => s.trim()).filter(Boolean).map((name, i) => ({ name, role: i === 0 ? '项目管理员' : '项目成员' }));
      if (f.id) {
        const p = this.projects.find(x => x.id === f.id);
        Object.assign(p, { name: f.name, description: f.description, languages: f.languages.length ? f.languages : ['en'], members });
        this.toast('项目已更新');
      } else {
        const colors = ['#4f6ef7', '#19b576', '#f0a020', '#9b59f7', '#ef4d4d'];
        this.projects.unshift({
          id: uid('p'), name: f.name, description: f.description || '—',
          color: colors[Math.floor(Math.random() * colors.length)],
          languages: f.languages.length ? f.languages : ['en'], members,
          versions: [], pages: [{ id: uid('pg'), name: 'common', screenshot: false, copies: [] }],
        });
        this.toast('项目已创建（默认含 common 页面）');
      }
      this.showProjectModal = false;
    },
    confirmDeleteProject(p) {
      this.confirm = { show: true, title: '删除项目', message: `确定删除「${p.name}」？项目及其全部文案将被硬删除，不可恢复。`, ok: () => { this.projects = this.projects.filter(x => x.id !== p.id); this.confirm.show = false; this.toast('项目已删除'); } };
    },

    // language
    addLanguage() { if (!this.addLangCode) return; this.currentProject.languages.push(this.addLangCode); this.currentProject.pages.forEach(pg => pg.copies.forEach(c => c.values[this.addLangCode] = '')); this.addLangCode = ''; this.showAddLang = false; this.toast('语种已新增'); },
    removeLanguage(code) {
      if (this.currentProject.languages.length <= 1) { this.toast('至少保留一个语种'); return; }
      this.confirm = { show: true, title: '删除语种', message: `删除「${this.langLabel(code)}」后，该语种下所有文案将被删除。`, ok: () => { this.currentProject.languages = this.currentProject.languages.filter(l => l !== code); this.currentProject.pages.forEach(pg => pg.copies.forEach(c => delete c.values[code])); this.confirm.show = false; this.toast('语种已删除'); } };
    },

    // page CRUD
    openCreatePage() { this.pageForm = { name: '', uploaded: false }; this.ocrResult = []; this.ocrLoading = false; this.showPageModal = true; },
    closePageModal() { this.showPageModal = false; },
    runOcr() {
      this.ocrLoading = true;
      setTimeout(() => {
        this.ocrLoading = false;
        this.ocrResult = [
          { text: 'Settings', pick: true }, { text: 'Notifications', pick: true },
          { text: 'Account', pick: true }, { text: 'Log out', pick: false },
          { text: 'Version 2.4.1', pick: false },
        ];
      }, 900);
    },
    savePage() {
      if (!this.pageForm.name.trim()) { this.toast('请填写页面名称'); return; }
      const copies = this.ocrResult.filter(o => o.pick).map(o => mkCopy(this.genKey(o.text), o.text, '', ''));
      this.currentProject.pages.push({ id: uid('pg'), name: this.pageForm.name, screenshot: this.pageForm.uploaded, copies });
      this.showPageModal = false;
      this.toast(copies.length ? `页面已创建，录入 ${copies.length} 条文案` : '页面已创建');
    },
    renamePage(pg) { const n = prompt('页面名称', pg.name); if (n && n.trim()) { pg.name = n.trim(); this.toast('已重命名'); } },
    deletePage(pg) {
      if (this.currentProject.pages.length <= 1) { this.toast('至少保留一个页面'); return; }
      this.confirm = { show: true, title: '删除页面', message: `确定删除页面「${pg.name}」及其 ${pg.copies.length} 条文案？`, ok: () => { this.currentProject.pages = this.currentProject.pages.filter(x => x.id !== pg.id); this.confirm.show = false; this.toast('页面已删除'); } };
    },

    // copy CRUD
    genKey(text) {
      let k = (text || '').slice(0, 16).replace(/[^\w\s]|_/g, '').trim().replace(/\s+/g, '_');
      if (!k) k = 'key';
      const exists = this.currentProject.pages.some(pg => pg.copies.some(c => c.key === k));
      if (exists) k = `${k}_${Math.random().toString(36).slice(2, 4)}`;
      return k;
    },
    addCopyRow() {
      const row = { id: uid('c'), key: '', values: {} };
      this.currentProject.languages.forEach(l => row.values[l] = '');
      this.currentPage.copies.unshift(row);
      this.copyPage = 1;
      this.toast('新增空行，输入英文后将自动生成 Key');
    },
    deleteCopy(row) { this.currentPage.copies = this.currentPage.copies.filter(c => c.id !== row.id); this.toast('已删除'); },
    bulkDelete() {
      this.confirm = { show: true, title: '批量删除', message: `确定删除选中的 ${this.selectedCopies.length} 条文案？（硬删除）`, ok: () => { this.currentPage.copies = this.currentPage.copies.filter(c => !this.selectedCopies.includes(c.id)); this.selectedCopies = []; this.confirm.show = false; this.toast('已批量删除'); } };
    },
    toggleAll(e) {
      if (e.target.checked) { this.pagedCopies.forEach(c => { if (!this.selectedCopies.includes(c.id)) this.selectedCopies.push(c.id); }); }
      else { const ids = this.pagedCopies.map(c => c.id); this.selectedCopies = this.selectedCopies.filter(id => !ids.includes(id)); }
    },

    // rich text
    openRich(row, lang) { this.richCtx = { row, lang, value: row.values[lang] || '' }; this.showRich = true; },
    saveRich() { this.showRich = false; this.toast('富文本已应用（演示）'); },

    // import
    openImport() { this.importLoaded = false; this.importPreview = []; this.importFormat = 'JSON'; this.showImport = true; },
    loadImportPreview() {
      this.importLoaded = true;
      this.importPreview = [
        { page: this.currentPage.name + '（当前页面）', items: [
          { key: 'New_Banner_Title', value: 'Summer Sale', type: 'add', pick: true },
          { key: 'Sign_In', value: 'Log in', type: 'upd', pick: true },
        ] },
        { page: 'home', items: [
          { key: 'Add_Device', value: 'Add a device', type: 'upd', pick: true },
        ] },
      ];
    },
    doImport() { this.showImport = false; this.toast('已导入所选文案（演示）'); },

    // export
    openExport() { this.exportFormat = 'JSON'; this.exportSplit = false; this.showExport = true; },
    doExport() { this.showExport = false; this.toast(`已导出 ${this.exportFormat}${this.exportFormat === 'JSON' && this.exportSplit ? '（按语种拆分）' : ''}（演示）`); },

    // version
    openTagVersion() {
      const next = (this.currentProject.versions[0]?.name || 'v0').replace('v', '');
      this.tagForm = { name: 'v' + (parseInt(next) + 1), note: '' };
      this.showTagVersion = true;
    },
    saveTagVersion() {
      this.currentProject.versions.unshift({ id: uid('v'), name: this.tagForm.name, createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16), author: 'Vision', note: this.tagForm.note || '—' });
      this.showTagVersion = false;
      this.toast(`已生成版本 ${this.tagForm.name}（快照已存档）`);
    },
    openDiff(v) { this.diffMode = 'diff'; this.diffVersion = v; this.diffData = this.mockDiff(); this.showDiff = true; },
    openRollback(v) { this.diffMode = 'rollback'; this.diffVersion = v; this.diffData = this.mockDiff(); this.showDiff = true; },
    mockDiff() {
      return [
        { key: 'Welcome_Back', old: 'Welcome back', new: 'Hello again', type: 'upd' },
        { key: 'New_Promo', old: '', new: 'Limited offer', type: 'add' },
        { key: 'Old_Tip', old: 'Deprecated tip', new: '', type: 'del' },
        { key: 'Sign_In', old: 'Sign in', new: 'Log in', type: 'upd' },
      ];
    },
    viewVersion(v) { this.toast(`正在查看 ${v.name}（只读，不可修改）`); this.currentVersion = v.id; this.view = 'pages'; },
    doRollback() { this.showDiff = false; this.toast(`已回滚到 ${this.diffVersion.name}（按 id 增删改）`); },

    // migrate / copy
    openMigrate() { this.moveMode = 'migrate'; this.moveCount = this.selectedCopies.length; this.moveTarget = this.currentProject.pages[0].id; this.showMove = true; },
    openCopyTo() { this.moveMode = 'copy'; this.moveCount = this.selectedCopies.length; this.moveTarget = this.currentProject.pages[0].id; this.showMove = true; },
    quickCopyTo(row) { this.moveMode = 'copy'; this.moveCount = 1; this._singleRow = row; this.moveTarget = this.currentProject.pages[0].id; this.showMove = true; },
    doMove() {
      const target = this.currentProject.pages.find(p => p.id === this.moveTarget);
      const verb = this.moveMode === 'migrate' ? '迁移' : '复制';
      this.showMove = false; this.selectedCopies = []; this._singleRow = null;
      this.toast(`已${verb} ${this.moveCount} 条文案到「${target.name}」`);
    },
  },
}).mount('#app');
