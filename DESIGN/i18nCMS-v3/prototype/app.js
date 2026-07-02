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
const DRAFT_VERSION_ID = 'draft';

function normalizeProjectVersions(project) {
  if (!project || !Array.isArray(project.versions)) return;
  project.versions.forEach(v => {
    if (v.locked == null) v.locked = false;
  });
}

// mkCopy(key, {en, 'zh-Hans', ja, ...}) 或 mkCopy(key, en, zh, ja) 两种写法都支持
function mkCopy(key, a, zh, ja) {
  const values = (a && typeof a === 'object') ? { ...a } : { en: a, 'zh-Hans': zh, ja };
  return { id: uid('c'), key, values };
}
function mkPage(name, screenshot, copies, children = []) {
  return { id: uid('pg'), name, key: name, screenshot, screenshotUrl: screenshot ? mockScreenshotUrl(name) : null, copies, children };
}
function mockScreenshotUrl(name) {
  const label = String(name).replace(/_/g, ' ');
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="390" height="844" viewBox="0 0 390 844"><rect fill="#eef2ff" width="390" height="844"/><rect fill="#fff" x="20" y="60" width="350" height="724" rx="16"/><rect fill="#f7f9fd" x="40" y="100" width="310" height="48" rx="8"/><rect fill="#e7ecfb" x="40" y="168" width="220" height="16" rx="4"/><rect fill="#e7ecfb" x="40" y="196" width="280" height="16" rx="4"/><rect fill="#e7ecfb" x="40" y="224" width="180" height="16" rx="4"/><text x="195" y="520" text-anchor="middle" font-family="system-ui,sans-serif" font-size="22" fill="#4f6ef7">${label}</text><text x="195" y="552" text-anchor="middle" font-family="system-ui,sans-serif" font-size="13" fill="#8a94a8">分组截图预览</text></svg>`;
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

const PROJECTS = [
  {
    id: uid('p'), name: 'VeSync App', color: '#4f6ef7',
    description: '智能家居 App 全端多语言文案，覆盖登录、首页、设备控制、设置等。',
    languages: ['en', 'zh-Hans', 'ja'],
    members: [{ name: 'Vision', role: '系统管理员' }, { name: 'Amy', role: '系统成员' }, { name: 'Tom', role: '系统成员' }, { name: 'Lin', role: '系统成员' }],
    versions: [
      { id: uid('v'), name: 'v3', createdAt: '2026-06-10 14:20', author: 'Vision', note: '新增设备控制分组文案', locked: false },
      { id: uid('v'), name: 'v2', createdAt: '2026-05-22 09:11', author: 'Amy', note: '首页改版文案', locked: true },
      { id: uid('v'), name: 'v1', createdAt: '2026-04-30 18:02', author: 'Vision', note: '初始版本', locked: true },
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
      ], [
        mkPage('home_banner', true, [
          mkCopy('Banner_Title', 'Limited time offer', '限时优惠', '期間限定オファー'),
          mkCopy('Banner_Sub', 'Up to 30% off select devices', '指定设备低至 7 折', '対象デバイス最大30%オフ'),
          mkCopy('Banner_Cta', 'Shop now', '立即选购', '今すぐ購入'),
        ]),
        mkPage('home_recommend', false, [
          mkCopy('Recommend_Title', 'Recommended for you', '为你推荐', 'おすすめ'),
          mkCopy('Recommend_More', 'See more', '查看更多', 'もっと見る'),
        ]),
      ]),
      mkPage('device', false, [
        mkCopy('Power_On', 'Power On', '开机', '電源オン'),
        mkCopy('Power_Off', 'Power Off', '关机', '電源オフ'),
        mkCopy('Fan_Speed', 'Fan Speed', '风速', '風量'),
        mkCopy('Mode', 'Mode', '模式', 'モード'),
        mkCopy('Auto_Mode', 'Auto', '自动', '自動'),
        mkCopy('Sleep_Mode', 'Sleep', '睡眠', 'スリープ'),
        mkCopy('Filter_Life', 'Filter life: {percent}%', '滤芯寿命：{percent}%', 'フィルター寿命：{percent}%'),
        mkCopy('Replace_Filter', 'Time to replace the filter', '该更换滤芯了', 'フィルターの交換時期です'),
        mkCopy('Child_Lock', 'Child Lock', '童锁', 'チャイルドロック'),
        mkCopy('Night_Light', 'Night Light', '夜灯', 'ナイトライト'),
        mkCopy('Firmware_Update', 'Firmware update available', '有可用的固件更新', 'ファームウェアの更新があります'),
        mkCopy('Device_Offline', 'Device is offline', '设备已离线', 'デバイスはオフラインです'),
      ], [
        mkPage('device_control', true, [
          mkCopy('Speed_Low', 'Low', '低速', '弱'),
          mkCopy('Speed_Mid', 'Medium', '中速', '中'),
          mkCopy('Speed_High', 'High', '高速', '強'),
        ], [
          mkPage('device_control_advanced', false, [
            mkCopy('Oscillation', 'Oscillation', '左右摆动', '首振り'),
            mkCopy('Display_Brightness', 'Display brightness', '屏幕亮度', '画面の明るさ'),
          ]),
        ]),
        mkPage('device_schedule', false, [
          mkCopy('Add_Schedule', 'Add schedule', '添加日程', 'スケジュール追加'),
          mkCopy('Repeat', 'Repeat', '重复', '繰り返し'),
          mkCopy('Timer', 'Timer', '定时', 'タイマー'),
        ]),
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
      ], [
        mkPage('settings_account', true, [
          mkCopy('Edit_Profile', 'Edit profile', '编辑资料', 'プロフィール編集'),
          mkCopy('Change_Password', 'Change password', '修改密码', 'パスワード変更'),
          mkCopy('Bind_Email', 'Bind email', '绑定邮箱', 'メール連携'),
        ]),
        mkPage('settings_about', false, [
          mkCopy('Terms', 'Terms of Service', '服务条款', '利用規約'),
          mkCopy('Privacy_Policy', 'Privacy Policy', '隐私政策', 'プライバシーポリシー'),
          mkCopy('App_Version', 'App version {version}', '应用版本 {version}', 'アプリバージョン {version}'),
        ]),
      ]),
    ],
    // 直接挂在系统下、未归属任何分组的文案
    copies: [
      mkCopy('App_Name', 'VeSync', 'VeSync', 'VeSync'),
      mkCopy('Brand_Slogan', 'Smart living, simplified', '智享生活，化繁为简', 'スマートな暮らしを、もっとシンプルに'),
      mkCopy('Global_Ok', 'OK', '好的', 'OK'),
      mkCopy('Global_Unknown_Error', 'Something went wrong', '出错了，请稍后重试', '問題が発生しました'),
      mkCopy('Copyright', '© 2026 VeSync. All rights reserved.', '© 2026 VeSync 版权所有', '© 2026 VeSync 無断転載禁止'),
    ],
  },
  {
    id: uid('p'), name: 'Official Website', color: '#19b576',
    description: '品牌官网营销文案，包含 Banner、产品介绍、FAQ、Footer。',
    languages: ['en', 'zh-Hans', 'zh-Hant', 'ja', 'ko', 'fr', 'de', 'es', 'it', 'pt', 'ru', 'th'],
    members: [{ name: 'Amy', role: '系统管理员' }, { name: 'Vision', role: '系统成员' }],
    versions: [{ id: uid('v'), name: 'v1', createdAt: '2026-06-01 10:00', author: 'Amy', note: '官网首发', locked: false }],
    pages: [
      mkPage('common', false, [
        mkCopy('Learn_More', { en: 'Learn more', 'zh-Hans': '了解更多', 'zh-Hant': '了解更多', ja: '詳細はこちら', ko: '자세히 보기', fr: 'En savoir plus', de: 'Mehr erfahren', es: 'Saber más', it: 'Scopri di più', pt: 'Saiba mais', ru: 'Подробнее', th: 'เรียนรู้เพิ่มเติม' }),
        mkCopy('Buy_Now', { en: 'Buy now', 'zh-Hans': '立即购买', 'zh-Hant': '立即購買', ja: '今すぐ購入', ko: '지금 구매', fr: 'Acheter', de: 'Jetzt kaufen', es: 'Comprar ahora', it: 'Acquista ora', pt: 'Comprar agora', ru: 'Купить сейчас', th: 'ซื้อเลย' }),
        mkCopy('Contact_Us', { en: 'Contact us', 'zh-Hans': '联系我们', 'zh-Hant': '聯絡我們', ja: 'お問い合わせ', ko: '문의하기', fr: 'Nous contacter', de: 'Kontakt', es: 'Contáctenos', it: 'Contattaci', pt: 'Fale conosco', ru: 'Связаться с нами', th: 'ติดต่อเรา' }),
        mkCopy('Subscribe', { en: 'Subscribe', 'zh-Hans': '订阅', 'zh-Hant': '訂閱', ja: '購読する', ko: '구독하기', fr: "S'abonner", de: 'Abonnieren', es: 'Suscribirse', it: 'Iscriviti', pt: 'Inscrever-se', ru: 'Подписаться', th: 'สมัครรับข่าวสาร' }),
      ]),
      mkPage('banner', true, [
        mkCopy('Slogan', { en: 'Breathe better, live better', 'zh-Hans': '畅享每一次呼吸', 'zh-Hant': '暢享每一次呼吸', ja: 'より良い呼吸を', ko: '더 나은 호흡, 더 나은 삶', fr: 'Mieux respirer, mieux vivre', de: 'Besser atmen, besser leben', es: 'Respira mejor, vive mejor', it: 'Respira meglio, vivi meglio', pt: 'Respire melhor, viva melhor', ru: 'Дышите лучше, живите лучше', th: 'หายใจดีขึ้น ใช้ชีวิตดีขึ้น' }),
        mkCopy('Hero_Sub', { en: 'Smart air purifiers for every home', 'zh-Hans': '为每个家庭打造的智能空气净化器', 'zh-Hant': '為每個家庭打造的智能空氣淨化器', ja: 'すべての家庭のためのスマート空気清浄機', ko: '모든 가정을 위한 스마트 공기청정기', fr: 'Purificateurs intelligents pour chaque maison', de: 'Intelligente Luftreiniger für jedes Zuhause', es: 'Purificadores inteligentes para cada hogar', it: 'Purificatori d’aria intelligenti per ogni casa', pt: 'Purificadores de ar inteligentes para cada casa', ru: 'Умные очистители воздуха для каждого дома', th: 'เครื่องฟอกอากาศอัจฉริยะสำหรับทุกบ้าน' }),
        mkCopy('Shop_Collection', { en: 'Shop the collection', 'zh-Hans': '选购系列产品', 'zh-Hant': '選購系列產品', ja: 'コレクションを見る', ko: '컬렉션 둘러보기', fr: 'Voir la collection', de: 'Kollektion ansehen', es: 'Ver la colección', it: 'Esplora la collezione', pt: 'Ver a coleção', ru: 'Смотреть коллекцию', th: 'เลือกซื้อคอลเลกชัน' }),
      ]),
      mkPage('faq', false, [
        mkCopy('FAQ_Title', { en: 'Frequently Asked Questions', 'zh-Hans': '常见问题', 'zh-Hant': '常見問題', ja: 'よくある質問', ko: '자주 묻는 질문', fr: 'Questions fréquentes', de: 'Häufige Fragen', es: 'Preguntas frecuentes', it: 'Domande frequenti', pt: 'Perguntas frequentes', ru: 'Часто задаваемые вопросы', th: 'คำถามที่พบบ่อย' }),
        mkCopy('FAQ_Shipping', { en: 'How long does shipping take?', 'zh-Hans': '配送需要多长时间？', 'zh-Hant': '配送需要多長時間？', ja: '配送にはどのくらいかかりますか？', ko: '배송은 얼마나 걸리나요?', fr: 'Quel est le délai de livraison ?', de: 'Wie lange dauert der Versand?', es: '¿Cuánto tarda el envío?', it: 'Quanto tempo richiede la spedizione?', pt: 'Quanto tempo leva o envio?', ru: 'Сколько занимает доставка?', th: 'การจัดส่งใช้เวลานานเท่าใด?' }),
        mkCopy('FAQ_Warranty', { en: 'What is the warranty policy?', 'zh-Hans': '保修政策是怎样的？', 'zh-Hant': '保固政策是怎樣的？', ja: '保証ポリシーは？', ko: '보증 정책은 어떻게 되나요?', fr: 'Quelle est la garantie ?', de: 'Wie lautet die Garantie?', es: '¿Cuál es la garantía?', it: 'Qual è la politica di garanzia?', pt: 'Qual é a política de garantia?', ru: 'Какова гарантийная политика?', th: 'นโยบายการรับประกันเป็นอย่างไร?' }),
        mkCopy('FAQ_Return', { en: 'Can I return my order?', 'zh-Hans': '我可以退货吗？', 'zh-Hant': '我可以退貨嗎？', ja: '返品はできますか？', ko: '주문을 반품할 수 있나요?', fr: 'Puis-je retourner ma commande ?', de: 'Kann ich zurückgeben?', es: '¿Puedo devolver mi pedido?', it: 'Posso restituire il mio ordine?', pt: 'Posso devolver meu pedido?', ru: 'Могу ли я вернуть заказ?', th: 'ฉันสามารถคืนสินค้าได้หรือไม่?' }),
      ]),
    ],
  },
  {
    id: uid('p'), name: 'Admin Dashboard', color: '#f0a020',
    description: '后台管理系统文案，含菜单、表格、表单提示。',
    languages: ['en', 'zh-Hans'],
    members: [{ name: 'Tom', role: '系统管理员' }],
    versions: [{ id: uid('v'), name: 'v1', createdAt: '2026-06-05 16:40', author: 'Tom', note: '后台初版', locked: false }],
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
  {
    id: uid('p'), name: 'Marketing Snippets', color: '#9b59f7',
    description: '无分组的轻量系统：营销短文案直接挂在系统下，适合零散的 Push / Banner 文案。',
    languages: ['en', 'zh-Hans', 'ja'],
    members: [{ name: 'Amy', role: '系统管理员' }],
    versions: [{ id: uid('v'), name: 'v1', createdAt: '2026-06-20 11:30', author: 'Amy', note: '初始营销文案', locked: false }],
    // 该系统没有任何分组，文案直接挂在系统下
    pages: [],
    copies: [
      mkCopy('Push_Welcome', 'Welcome to VeSync!', '欢迎使用 VeSync！', 'VeSyncへようこそ！'),
      mkCopy('Push_Promo', 'Flash sale starts now', '限时闪购开始啦', 'タイムセール開催中'),
      mkCopy('Push_Reorder', 'Time to reorder your filter', '该补购滤芯啦', 'フィルターの再注文時期です'),
      mkCopy('Banner_Newsletter', 'Subscribe for 10% off', '订阅立享 9 折', '購読で10%オフ'),
      mkCopy('Banner_AppRate', 'Enjoying the app? Rate us!', '喜欢这款 App？给我们评分吧！', 'アプリは気に入りましたか？評価してください！'),
      mkCopy('Sms_Code', 'Your code is {code}', '您的验证码是 {code}', '認証コードは {code} です'),
    ],
  },
];

PROJECTS.forEach(normalizeProjectVersions);

const app = createApp({
  provide() {
    return {
      tree: {
        openPage: (pg) => this.openPage(pg),
        openCopies: (pg) => this.openCopies(pg),
        addChild: (pg) => this.openCreatePage(pg),
        editPage: (pg) => this.openEditPage(pg),
        deletePage: (pg) => this.deletePage(pg),
        previewScreenshot: (pg) => this.previewScreenshot(pg),
        isEditable: () => this.isVersionEditable,
      },
    };
  },
  data() {
    return {
      view: 'projects',
      allLanguages: ALL_LANGUAGES,
      projects: PROJECTS,
      DRAFT_VERSION_ID,
      currentProject: null,
      currentPage: null,
      currentVersion: DRAFT_VERSION_ID,

      projectSearch: '',
      copySearch: '',
      searchScope: 'page',
      projectOverviewCollapsed: true,
      copyPage: 1,
      pageSize: 10,
      selectedCopies: [],
      editingKeyId: null,
      copyViewKey: '',

      // modals
      showProjectModal: false,
      projectForm: { id: null, name: '', description: '', languages: ['en'], membersText: '' },
      showPageModal: false,
      pageForm: { id: null, name: '', key: '', uploaded: false, parentId: null, parentName: '' },
      showCopies: false,
      copiesModalPage: null,
      ocrLoading: false,
      ocrResult: [],
      showRich: false,
      richCtx: { row: null, lang: 'en', value: '' },
      showImport: false,
      importFormat: 'JSON',
      importLang: '',
      importLoaded: false,
      importPreview: [],
      importFiles: {},
      dragLang: '',
      showExport: false,
      exportFormat: 'JSON',
      exportScope: 'full',
      exportChecked: {},
      showExportMenu: false,
      showExportScopePicker: false,
      exportScopePickerVersion: null,
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
      // 文案查重
      showDedup: false,
      dedupProject: null,
      dedupLoading: false,
      dedupGroups: [],
      dedupScope: 'project', // 'project' | 'selected'
      dedupSelectedIds: [],
      // 查重结果 · 覆盖本系统文案
      showDedupOverwrite: false,
      dedupOverwriteSource: null,
      dedupOverwriteGroup: null,
      dedupOverwriteSelected: [],
      showAddLang: false,
      addLangCode: '',
      showLangSettings: false,
      showScreenshotPreview: false,
      screenshotPreview: { url: '', title: '' },
      confirm: { show: false, title: '', message: '', ok: () => {}, okLabel: '', danger: true },
      toastMsg: '',
    };
  },
  computed: {
    filteredProjects() {
      const q = this.projectSearch.trim().toLowerCase();
      return this.projects.filter(p => !q || p.name.toLowerCase().includes(q));
    },
    pageTreeRoots() {
      if (!this.currentProject) return [this.projectCopyNode];
      return [this.projectCopyNode, ...(this.currentProject.pages || [])];
    },
    projectCopyNode() {
      if (!this.currentProject) return { id: '', name: '/', key: '', screenshot: false, copies: [], children: [], projectLevel: true };
      if (!this.currentProject.copies) this.currentProject.copies = [];
      return {
        id: 'projcopies_' + this.currentProject.id,
        name: '/',
        key: '',
        screenshot: false,
        copies: this.currentProject.copies,
        children: [],
        projectLevel: true,
      };
    },
    availableToAdd() {
      if (!this.currentProject) return [];
      return this.allLanguages.filter(l => !this.currentProject.languages.includes(l.code));
    },
    pageOptions() {
      if (!this.currentProject) return [];
      return this.flattenPages(this.currentProject.pages).map(o => ({
        id: o.page.id,
        page: o.page,
        depth: o.depth,
        label: '　'.repeat(o.depth) + (o.depth ? '└ ' : '') + o.page.name,
      }));
    },
    moveTargets() {
      if (!this.currentProject) return [];
      return [{ id: '__project__', label: '📦 ' + this.currentProject.name + '（系统文案 · 直挂系统下）' }, ...this.pageOptions];
    },
    pageSwitchOptions() {
      if (!this.currentProject) return [];
      const root = { id: this.projectCopyNode.id, depth: 0, projectLevel: true, label: '📦 ' + this.currentProject.name + '（系统级文案）' };
      const pages = this.flattenPages(this.currentProject.pages).map(o => ({
        id: o.page.id,
        depth: o.depth + 1,
        projectLevel: false,
        label: '　'.repeat(o.depth + 1) + '📄 ' + o.page.name, //└ 
      }));
      return [root, ...pages];
    },
    currentPageKeyChain() {
      if (!this.currentPage || this.currentPage.projectLevel || !this.currentProject) return [];
      const path = this.findPagePath(this.currentPage.id, this.currentProject.pages) || [];
      return path.map(p => (p.key || p.name || '').trim()).filter(Boolean);
    },
    currentPageKeyPrefix() {
      return this.currentPageKeyChain.join('.');
    },
    currentPageId: {
      get() { return this.currentPage ? this.currentPage.id : ''; },
      set(id) {
        if (!id) return;
        if (id === this.projectCopyNode.id) { this.openPage(this.projectCopyNode); return; }
        const pg = this.findPageById(id);
        if (pg) this.openPage(pg);
      },
    },
    allExportCopies() {
      if (!this.currentProject) return [];
      return [...((this.currentProject.copies) || []), ...this.pageOptions.flatMap(o => o.page.copies)];
    },
    filteredCopies() {
      if (!this.currentPage || !this.currentProject) return [];
      const q = this.copySearch.trim().toLowerCase();
      const match = (c) => !q || c.key.toLowerCase().includes(q) ||
        Object.values(c.values).some(v => (v || '').toLowerCase().includes(q));
      if (this.searchScope === 'page') return this.currentPage.copies.filter(match);
      const pool = this.searchScope === 'project'
        ? this.flattenProjectCopies(this.currentProject)
        : this.projects.flatMap(p => this.flattenProjectCopies(p));
      return pool.filter(match);
    },
    copyTableColspan() {
      if (!this.currentProject) return 2;
      let n = 2 + this.currentProject.languages.length;
      if (this.searchScope === 'project') n += 1;
      if (this.searchScope === 'all') n += 2;
      return n;
    },
    totalCopyPages() { return Math.max(1, Math.ceil(this.filteredCopies.length / this.pageSize)); },
    pagedCopies() {
      const s = (this.copyPage - 1) * this.pageSize;
      return this.filteredCopies.slice(s, s + this.pageSize);
    },
    importedLangLabels() {
      return Object.keys(this.importFiles).filter(l => l !== '__all__').map(l => this.langLabel(l)).join('、');
    },
    pageNumbers() {
      const total = this.totalCopyPages;
      const cur = this.copyPage;
      if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
      const items = [1];
      if (cur > 4) items.push('...');
      const start = Math.max(2, cur - 2);
      const end = Math.min(total - 1, cur + 2);
      for (let i = start; i <= end; i++) items.push(i);
      if (cur < total - 3) items.push('...');
      items.push(total);
      return items;
    },
    allSelected() {
      return this.pagedCopies.length > 0 && this.pagedCopies.every(c => this.selectedCopies.includes(c.id));
    },
    selectedIncludesOtherProject() {
      if (!this.selectedCopies.length || !this.currentProject || this.searchScope !== 'all') return false;
      const ids = new Set(this.selectedCopies);
      return this.projects
        .flatMap(p => this.flattenProjectCopies(p))
        .some(r => ids.has(r.id) && r._projectId !== this.currentProject.id);
    },
    exportDefaultLang() {
      if (!this.currentProject) return 'en';
      const langs = this.currentProject.languages;
      return langs.includes('en') ? 'en' : (langs[0] || 'en');
    },
    exportAllChecked() {
      if (!this.currentProject) return false;
      const all = this.allExportCopies;
      return all.length > 0 && all.every(c => this.exportChecked[c.id]);
    },
    exportSomeChecked() {
      if (!this.currentProject) return false;
      return this.allExportCopies.some(c => this.exportChecked[c.id]);
    },
    isDraftVersion() {
      return this.isDraftVersionId(this.currentVersion);
    },
    isViewingVersion() {
      return !!this.currentProject && !this.isDraftVersionId(this.currentVersion);
    },
    activeVersion() {
      if (!this.currentProject || this.isDraftVersionId(this.currentVersion)) return null;
      return this.findVersionById(this.currentVersion);
    },
    isCurrentVersionLocked() {
      const v = this.activeVersion;
      return !!(v && v.locked === true);
    },
    isVersionEditable() {
      if (this.isCurrentVersionLocked) return false;
      return this.isDraftVersion || !!this.activeVersion;
    },
    canExport() { return this.isViewingVersion && !!this.activeVersion; },
    canLockVersion() { return this.isViewingVersion && !!this.activeVersion && !this.isCurrentVersionLocked; },
    exportScopeLabel() { return this.exportScope === 'delta' ? '导出修改' : '导出全量'; },
  },
  watch: {
    copySearch() { this.copyPage = 1; },
    searchScope() { this.copyPage = 1; this.selectedCopies = []; },
    currentVersion(id) {
      if (this.currentProject) this.currentProject._viewVersionId = String(id);
      this.validateCurrentVersion();
    },
    currentProject(p) {
      if (!p) return;
      normalizeProjectVersions(p);
      const saved = p._viewVersionId;
      if (saved != null && saved !== this.currentVersion) {
        this.currentVersion = this.isDraftVersionId(saved) ? DRAFT_VERSION_ID : String(saved);
      }
      this.validateCurrentVersion();
    },
  },
  mounted() {
    const d = new URLSearchParams(location.search).get('demo');
    if (d === 'copies') { this.openProject(this.projects[0]); this.openPage(this.currentProject.pages[2]); }
    else if (d === 'versions') { this.openProject(this.projects[0]); this.view = 'versions'; }
    else if (d === 'pages') { this.openProject(this.projects[0]); }
    else if (d === 'import') { this.openProject(this.projects[0]); this.openPage(this.currentProject.pages[1]); this.openImport(); this.pickLangFile(this.importLang || 'en'); }
    else if (d === 'diff') { this.openProject(this.projects[0]); this.view = 'versions'; this.openRollback(this.currentProject.versions[1]); }
    else if (d === 'export') { this.openProject(this.projects[0]); this.currentVersion = String(this.currentProject.versions[0]?.id || DRAFT_VERSION_ID); this.pickExportMode('full'); }
    this._onDocClick = (e) => {
      if (this.showExportMenu && !e.target.closest('.export-dropdown')) this.showExportMenu = false;
    };
    document.addEventListener('click', this._onDocClick);
  },
  beforeUnmount() {
    document.removeEventListener('click', this._onDocClick);
  },
  methods: {
    versionReadonlyTip() {
      return this.isCurrentVersionLocked
        ? '当前版本已锁定，不可编辑'
        : '当前为只读模式，请切换至草稿或未锁定版本';
    },
    isDraftVersionId(id) {
      const v = String(id ?? '');
      return !v || v === DRAFT_VERSION_ID;
    },
    findVersionById(id) {
      if (!this.currentProject || this.isDraftVersionId(id)) return null;
      const vid = String(id);
      return this.currentProject.versions.find(v => String(v.id) === vid) || null;
    },
    validateCurrentVersion() {
      if (!this.currentProject) return;
      if (this.isDraftVersionId(this.currentVersion)) {
        if (this.currentVersion !== DRAFT_VERSION_ID) this.currentVersion = DRAFT_VERSION_ID;
        return;
      }
      if (!this.findVersionById(this.currentVersion)) {
        this.currentVersion = DRAFT_VERSION_ID;
      }
    },
    resolveProjectViewVersionId(project) {
      if (!project) return DRAFT_VERSION_ID;
      const saved = project._viewVersionId;
      if (this.isDraftVersionId(saved)) return DRAFT_VERSION_ID;
      return project.versions.some(v => String(v.id) === String(saved)) ? String(saved) : DRAFT_VERSION_ID;
    },
    onVersionSelect() {
      this.validateCurrentVersion();
    },
    langLabel(code) { const l = this.allLanguages.find(x => x.code === code); return l ? l.label : code; },
    countCopiesIn(list) { return list.reduce((n, pg) => n + pg.copies.length + (pg.children ? this.countCopiesIn(pg.children) : 0), 0); },
    countCopies(p) { return (p.copies ? p.copies.length : 0) + this.countCopiesIn(p.pages); },
    countPagesIn(list) { return list.reduce((n, pg) => n + 1 + (pg.children ? this.countPagesIn(pg.children) : 0), 0); },
    countPages(p) { return this.countPagesIn(p.pages || []); },
    toast(msg) { this.toastMsg = msg; clearTimeout(this._t); this._t = setTimeout(() => this.toastMsg = '', 2000); },

    // page tree helpers
    flattenPages(list, depth = 0, acc = []) {
      list.forEach(pg => { acc.push({ page: pg, depth }); if (pg.children && pg.children.length) this.flattenPages(pg.children, depth + 1, acc); });
      return acc;
    },
    findPageById(id, list) {
      list = list || (this.currentProject ? this.currentProject.pages : []);
      for (const pg of list) {
        if (pg.id === id) return pg;
        if (pg.children && pg.children.length) { const f = this.findPageById(id, pg.children); if (f) return f; }
      }
      return null;
    },
    findPagePath(id, list, trail = []) {
      for (const pg of (list || [])) {
        const next = [...trail, pg];
        if (pg.id === id) return next;
        if (pg.children && pg.children.length) {
          const f = this.findPagePath(id, pg.children, next);
          if (f) return f;
        }
      }
      return null;
    },
    fullKeyOf(row) {
      const leaf = (row.key || '').trim();
      const prefix = row._keyPrefix != null ? row._keyPrefix : this.currentPageKeyPrefix;
      return prefix ? (prefix + '.' + leaf) : leaf;
    },
    copyKeyPrefix(row) {
      if (row._keyPrefix != null) return row._keyPrefix;
      return this.currentPageKeyPrefix;
    },
    copyRowEditable(row) {
      if (!this.isVersionEditable) return false;
      if (this.searchScope !== 'all') return true;
      return row._projectId === this.currentProject.id;
    },
    flattenProjectCopies(project) {
      if (!project) return [];
      const rows = [];
      const projPageId = 'projcopies_' + project.id;
      (project.copies || []).forEach(c => {
        rows.push(this.scopeCopyRow(c, project, projPageId, '（系统级文案）', ''));
      });
      const walk = (pg, prefixKeys) => {
        const keys = [...prefixKeys, (pg.key || pg.name || '').trim()].filter(Boolean);
        const keyPrefix = keys.join('.');
        const pageChain = this.pageChainDisplay(project, pg.id);
        pg.copies.forEach(c => rows.push(this.scopeCopyRow(c, project, pg.id, pageChain, keyPrefix)));
        (pg.children || []).forEach(ch => walk(ch, keys));
      };
      (project.pages || []).forEach(pg => walk(pg, []));
      return rows;
    },
    scopeCopyRow(c, project, pageId, pageChain, keyPrefix) {
      return {
        id: c.id,
        key: c.key,
        values: c.values,
        _pageId: pageId,
        _pageChain: pageChain,
        _keyPrefix: keyPrefix,
        _projectId: project.id,
        _projectName: project.name,
      };
    },
    goToPage(p) {
      let n = parseInt(p, 10);
      if (isNaN(n)) return;
      n = Math.min(this.totalCopyPages, Math.max(1, n));
      this.copyPage = n;
    },
    jumpToPage(e) { this.goToPage(e.target.value); e.target.value = this.copyPage; },
    changePageSize(e) { this.pageSize = parseInt(e.target.value, 10) || 20; this.copyPage = 1; },
    startEditKey(row) { if (!this.copyRowEditable(row)) return; this.editingKeyId = row.id; },
    stopEditKey() { this.editingKeyId = null; },
    copyFullKey(row) {
      const text = '$t("' + this.fullKeyOf(row) + '")';
      const done = () => this.toast('已复制：' + text);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(done).catch(() => this.fallbackCopy(text, done));
      } else {
        this.fallbackCopy(text, done);
      }
    },
    fallbackCopy(text, done) {
      const ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); done && done(); } catch (e) {}
      document.body.removeChild(ta);
    },
    removePageNode(id, list) {
      list = list || this.currentProject.pages;
      const i = list.findIndex(p => p.id === id);
      if (i !== -1) { list.splice(i, 1); return true; }
      for (const p of list) { if (p.children && this.removePageNode(id, p.children)) return true; }
      return false;
    },

    // navigation
    goProjects() { this.view = 'projects'; this.currentProject = null; this.currentPage = null; this.currentVersion = DRAFT_VERSION_ID; },
    goToPages() {
      this.view = 'pages';
      this.currentPage = null;
      this.selectedCopies = [];
      this.editingKeyId = null;
      this.searchScope = 'page';
      this.copySearch = '';
    },
    openProject(p) {
      this.currentProject = p;
      normalizeProjectVersions(p);
      this.currentVersion = this.resolveProjectViewVersionId(p);
      this.goToPages();
      this.projectOverviewCollapsed = true;
    },
    openPage(pg) {
      this.searchScope = 'page';
      this.editingKeyId = null;
      this.copyPage = 1;
      this.selectedCopies = [];
      this.copySearch = '';
      this.copyViewKey = pg.id + '_' + Date.now();
      this.currentPage = pg;
      this.view = 'copies';
    },
    pageThumbUrl(pg) {
      if (!pg || !pg.screenshot || pg.projectLevel) return '';
      if (!pg.screenshotUrl) pg.screenshotUrl = mockScreenshotUrl(pg.name || pg.key);
      return pg.screenshotUrl;
    },
    previewScreenshot(pg) {
      if (!pg.screenshot || pg.projectLevel) return;
      const url = pg.screenshotUrl || mockScreenshotUrl(pg.name || pg.key);
      if (!pg.screenshotUrl) pg.screenshotUrl = url;
      this.screenshotPreview = { url, title: pg.name };
      this.showScreenshotPreview = true;
    },
    openProjectCopies() { this.openPage(this.projectCopyNode); },

    // project CRUD
    openCreateProject() { this.projectForm = { id: null, name: '', description: '', languages: ['en'], membersText: 'Vision' }; this.showProjectModal = true; },
    openEditProject(p) { this.projectForm = { id: p.id, name: p.name, description: p.description, languages: [...p.languages], membersText: p.members.map(m => m.name).join(', ') }; this.showProjectModal = true; },
    saveProject() {
      const f = this.projectForm;
      if (!f.name.trim()) { this.toast('请填写系统名称'); return; }
      const members = f.membersText.split(',').map(s => s.trim()).filter(Boolean).map((name, i) => ({ name, role: i === 0 ? '系统管理员' : '系统成员' }));
      if (f.id) {
        const p = this.projects.find(x => x.id === f.id);
        Object.assign(p, { name: f.name, description: f.description, languages: f.languages.length ? f.languages : ['en'], members });
        this.toast('系统已更新');
      } else {
        const colors = ['#4f6ef7', '#19b576', '#f0a020', '#9b59f7', '#ef4d4d'];
        this.projects.unshift({
          id: uid('p'), name: f.name, description: f.description || '—',
          color: colors[Math.floor(Math.random() * colors.length)],
          languages: f.languages.length ? f.languages : ['en'], members,
          versions: [], pages: [{ id: uid('pg'), name: 'common', key: 'common', screenshot: false, copies: [], children: [] }],
          _viewVersionId: DRAFT_VERSION_ID,
        });
        this.toast('系统已创建（默认含 common 分组）');
      }
      this.showProjectModal = false;
    },
    confirmDeleteProject(p) {
      this.confirm = { show: true, title: '删除系统', message: `确定删除「${p.name}」？系统及其全部文案将被硬删除，不可恢复。`, ok: () => { this.projects = this.projects.filter(x => x.id !== p.id); this.confirm.show = false; this.toast('系统已删除'); } };
    },

    // language
    addLanguage() { if (!this.addLangCode) return; this.currentProject.languages.push(this.addLangCode); this.currentProject.pages.forEach(pg => pg.copies.forEach(c => c.values[this.addLangCode] = '')); this.addLangCode = ''; this.showAddLang = false; this.toast('语种已新增'); },
    removeLanguage(code) {
      if (this.currentProject.languages.length <= 1) { this.toast('至少保留一个语种'); return; }
      this.confirm = { show: true, title: '删除语种', message: `删除「${this.langLabel(code)}」后，该语种下所有文案将被删除。`, ok: () => { this.currentProject.languages = this.currentProject.languages.filter(l => l !== code); this.currentProject.pages.forEach(pg => pg.copies.forEach(c => delete c.values[code])); this.confirm.show = false; this.toast('语种已删除'); } };
    },

    // page CRUD
    openCreatePage(parent) {
      if (!this.isVersionEditable) { this.toast(this.versionReadonlyTip()); return; }
      this.pageForm = { id: null, name: '', key: '', uploaded: false, parentId: parent ? parent.id : null, parentName: parent ? parent.name : '' };
      this.ocrResult = []; this.ocrLoading = false; this.showPageModal = true;
    },
    openEditPage(pg) {
      if (!this.isVersionEditable) { this.toast(this.versionReadonlyTip()); return; } this.pageForm = { id: pg.id, name: pg.name, key: pg.key || '', uploaded: pg.screenshot, parentId: null, parentName: '' }; this.ocrResult = []; this.ocrLoading = false; this.showPageModal = true; },
    closePageModal() { this.showPageModal = false; },
    openCopies(pg) { this.copiesModalPage = pg; this.showCopies = true; },
    manageCopiesFromModal() { const pg = this.copiesModalPage; this.showCopies = false; this.openPage(pg); },
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
      if (!this.isVersionEditable) return;
      if (!this.pageForm.name.trim()) { this.toast('请填写分组名称'); return; }
      if (!this.pageForm.key.trim()) { this.toast('请填写分组 Key'); return; }
      const copies = this.ocrResult.filter(o => o.pick).map(o => mkCopy(this.genKey(o.text), o.text, '', ''));
      if (this.pageForm.id) {
        const pg = this.findPageById(this.pageForm.id);
        pg.name = this.pageForm.name.trim();
        pg.key = this.pageForm.key.trim();
        pg.screenshot = this.pageForm.uploaded;
        pg.screenshotUrl = this.pageForm.uploaded ? mockScreenshotUrl(this.pageForm.name.trim()) : null;
        if (copies.length) pg.copies.push(...copies);
        this.showPageModal = false;
        this.toast(copies.length ? `分组已更新，新增 ${copies.length} 条文案` : '分组已更新');
        return;
      }
      const newPage = { id: uid('pg'), name: this.pageForm.name.trim(), key: this.pageForm.key.trim(), screenshot: this.pageForm.uploaded, screenshotUrl: this.pageForm.uploaded ? mockScreenshotUrl(this.pageForm.name.trim()) : null, copies, children: [] };
      if (this.pageForm.parentId) {
        const parent = this.findPageById(this.pageForm.parentId);
        if (!parent.children) parent.children = [];
        parent.children.push(newPage);
        this.showPageModal = false;
        this.toast(copies.length ? `已在「${parent.name}」下新增子分组，录入 ${copies.length} 条文案` : `已在「${parent.name}」下新增子分组`);
      } else {
        this.currentProject.pages.push(newPage);
        this.showPageModal = false;
        this.toast(copies.length ? `顶层分组已创建，录入 ${copies.length} 条文案` : '顶层分组已创建');
      }
    },
    deletePage(pg) {
      const childCount = pg.children ? this.countPagesIn(pg.children) : 0;
      const copyCount = pg.copies.length + (pg.children ? this.countCopiesIn(pg.children) : 0);
      const extra = childCount ? `及其 ${childCount} 个子分组` : '';
      this.confirm = {
        show: true, title: '删除分组',
        message: `确定删除分组「${pg.name}」${extra}（共 ${copyCount} 条文案）？此操作不可恢复。`,
        ok: () => {
          this.removePageNode(pg.id);
          if (this.currentPage && this.currentPage.id === pg.id) { this.currentPage = null; this.view = 'pages'; }
          this.confirm.show = false; this.toast('分组已删除');
        },
      };
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
      if (!this.isVersionEditable) return;
      const row = { id: uid('c'), key: '', values: {} };
      this.currentProject.languages.forEach(l => row.values[l] = '');
      this.currentPage.copies.unshift(row);
      this.copyPage = 1;
      this.toast('新增空行，输入英文后将自动生成 Key');
    },
    deleteCopy(row) {
      const i = this.currentPage.copies.findIndex(c => c.id === row.id);
      if (i !== -1) this.currentPage.copies.splice(i, 1);
      this.toast('已删除');
    },
    bulkDelete() {
      if (this.selectedIncludesOtherProject) return;
      this.confirm = { show: true, title: '批量删除', message: `确定删除选中的 ${this.selectedCopies.length} 条文案？（硬删除）`, ok: () => {
        const ids = new Set(this.selectedCopies);
        if (this.searchScope === 'page') {
          for (let i = this.currentPage.copies.length - 1; i >= 0; i--) {
            if (ids.has(this.currentPage.copies[i].id)) this.currentPage.copies.splice(i, 1);
          }
        } else {
          const pool = this.searchScope === 'project'
            ? this.flattenProjectCopies(this.currentProject)
            : this.projects.flatMap(p => this.flattenProjectCopies(p));
          pool.filter(r => ids.has(r.id)).forEach(r => {
            const proj = this.projects.find(p => p.id === r._projectId);
            this.removeCopyFromProject(proj, r.id, r._pageId);
          });
        }
        this.selectedCopies = []; this.confirm.show = false; this.toast('已批量删除');
      } };
    },
    toggleAll(e) {
      if (e.target.checked) { this.pagedCopies.forEach(c => { if (!this.selectedCopies.includes(c.id)) this.selectedCopies.push(c.id); }); }
      else { const ids = this.pagedCopies.map(c => c.id); this.selectedCopies = this.selectedCopies.filter(id => !ids.includes(id)); }
    },

    // rich text
    openRich(row, lang) { this.richCtx = { row, lang, value: row.values[lang] || '' }; this.showRich = true; },
    saveRich() { this.showRich = false; this.toast('富文本已应用（演示）'); },

    // import
    openImport() {
      if (!this.isVersionEditable) return;
      this.importLoaded = false; this.importPreview = [];
      this.importFormat = 'JSON';
      this.importFiles = {};
      this.dragLang = '';
      this.importLang = this.currentProject.languages.includes('en') ? 'en' : (this.currentProject.languages[0] || '');
      this.showImport = true;
    },
    selectImportFormat(f) { this.importFormat = f; this.importLoaded = false; this.importFiles = {}; },
    // per-language upload (JSON)
    pickLangFile(lang) {
      const name = lang + '.json';
      this.importFiles = { ...this.importFiles, [lang]: name };
      this.buildImportPreview();
    },
    onDropLangFile(lang, e) {
      this.dragLang = '';
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      const name = f ? f.name : (lang + '.json');
      this.importFiles = { ...this.importFiles, [lang]: name };
      this.buildImportPreview();
    },
    removeLangFile(lang) {
      const copy = { ...this.importFiles };
      delete copy[lang];
      this.importFiles = copy;
      if (!Object.keys(this.importFiles).length) { this.importLoaded = false; this.importPreview = []; }
      else this.buildImportPreview();
    },
    // single-file upload (Excel / CSV)
    loadImportPreview() {
      this.importFiles = { __all__: 'data.' + this.importFormat.toLowerCase() };
      this.buildImportPreview();
    },
    onDropSingleFile(e) {
      this.dragLang = '';
      const f = e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0];
      this.importFiles = { __all__: f ? f.name : ('data.' + this.importFormat.toLowerCase()) };
      this.buildImportPreview();
    },
    buildImportPreview() {
      this.importLoaded = true;
      const pages = this.currentProject.pages;
      this.importPreview = [
        { page: (pages[0]?.name || 'common'), items: [
          { key: 'New_Banner_Title', value: 'Summer Sale', type: 'add', pick: true },
          { key: 'Sign_In', value: 'Log in', type: 'upd', pick: true },
        ] },
        { page: (pages[1]?.name || 'home'), items: [
          { key: 'Add_Device', value: 'Add a device', type: 'upd', pick: true },
        ] },
      ];
    },
    doImport() {
      this.showImport = false;
      if (this.importFormat === 'JSON') {
        const langs = Object.keys(this.importFiles).map(l => this.langLabel(l)).join('、');
        this.toast(`已导入 ${langs} 语种文案（演示）`);
      } else {
        this.toast(`已导入 ${this.importFormat} 全部语种文案（演示）`);
      }
    },

    // export
    toggleExportMenu() { this.showExportMenu = !this.showExportMenu; },
    pickExportMode(scope) {
      this.showExportMenu = false;
      this.openExport(scope);
    },
    openExportMenuForVersion(v) {
      this.exportScopePickerVersion = v;
      this.showExportScopePicker = true;
    },
    confirmExportScope(scope) {
      const v = this.exportScopePickerVersion;
      this.showExportScopePicker = false;
      this.exportScopePickerVersion = null;
      if (v) {
        this.currentVersion = String(v.id);
        this.view = 'pages';
      }
      this.openExport(scope);
    },
    openExport(scope = 'full') {
      this.exportScope = scope;
      this.exportFormat = 'JSON';
      const checked = {};
      const all = this.allExportCopies;
      if (scope === 'delta') {
        all.forEach((c, i) => { checked[c.id] = i < Math.min(4, all.length); });
      } else {
        all.forEach(c => { checked[c.id] = true; });
      }
      this.exportChecked = checked;
      this.showExport = true;
    },
    isExportPageChecked(pg) { return pg.copies.length > 0 && pg.copies.every(c => this.exportChecked[c.id]); },
    isExportPageIndeterminate(pg) { return pg.copies.some(c => this.exportChecked[c.id]) && !pg.copies.every(c => this.exportChecked[c.id]); },
    toggleExportPage(pg, e) { pg.copies.forEach(c => this.exportChecked[c.id] = e.target.checked); },
    toggleExportAll(e) { this.allExportCopies.forEach(c => this.exportChecked[c.id] = e.target.checked); },
    doExport() {
      const n = Object.values(this.exportChecked).filter(Boolean).length;
      const scopeLabel = this.exportScopeLabel;
      this.showExport = false;
      if (this.exportFormat === 'JSON') {
        const langs = this.currentProject.languages.length;
        this.toast(`已${scopeLabel} ${n} 条文案 · JSON（每语种 1 个文件，共 ${langs} 个）（演示）`);
      } else {
        this.toast(`已${scopeLabel} ${n} 条文案 · Excel（演示）`);
      }
    },

    // version
    lockCurrentVersion() {
      const v = this.activeVersion;
      if (!v || v.locked === true) return;
      this.lockVersion(v);
    },
    lockVersion(v) {
      if (!v || v.locked === true) return;
      this.confirm = {
        show: true,
        title: '锁定版本',
        danger: false,
        okLabel: '确认锁定',
        message: `确定锁定版本「${v.name}」？锁定后该版本将不可再修改。`,
        ok: () => {
          v.locked = true;
          this.confirm.show = false;
          this.toast(`版本 ${v.name} 已锁定`);
        },
      };
    },
    openTagVersion() {
      if (!this.isDraftVersion) return;
      const next = (this.currentProject.versions[0]?.name || 'v0').replace('v', '');
      this.tagForm = { name: 'v' + (parseInt(next) + 1), note: '' };
      this.showTagVersion = true;
    },
    saveTagVersion() {
      this.currentProject.versions.unshift({ id: uid('v'), name: this.tagForm.name, createdAt: new Date().toLocaleString('zh-CN', { hour12: false }).slice(0, 16), author: 'Vision', note: this.tagForm.note || '—', locked: false });
      this.showTagVersion = false;
      this.toast(`已新建版本 ${this.tagForm.name}（快照已存档）`);
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
    viewVersion(v) {
      this.currentVersion = String(v.id);
      this.goToPages();
      this.toast(`正在查看 ${v.name}${v.locked ? '（已锁定 · 只读）' : '（可编辑）'}`);
    },
    doRollback() { this.showDiff = false; this.toast(`已回滚到 ${this.diffVersion.name}（按 id 增删改）`); },

    // migrate / copy
    defaultMoveTarget() { return this.currentProject.pages[0] ? this.currentProject.pages[0].id : '__project__'; },
    openMigrate() { if (this.selectedIncludesOtherProject) return; this.moveMode = 'migrate'; this.moveCount = this.selectedCopies.length; this.moveTarget = this.defaultMoveTarget(); this.showMove = true; },
    openCopyTo() { this.moveMode = 'copy'; this.moveCount = this.selectedCopies.length; this.moveTarget = this.defaultMoveTarget(); this.showMove = true; },
    quickCopyTo(row) { this.moveMode = 'copy'; this.moveCount = 1; this._singleRow = row; this.moveTarget = this.defaultMoveTarget(); this.showMove = true; },
    doMove() {
      const targetName = this.moveTarget === '__project__'
        ? `${this.currentProject.name} · 系统文案`
        : (this.findPageById(this.moveTarget)?.name || '分组');
      const verb = this.moveMode === 'migrate' ? '迁移' : '复制';
      this.showMove = false; this.selectedCopies = []; this._singleRow = null;
      this.toast(`已${verb} ${this.moveCount} 条文案到「${targetName}」`);
    },

    // ============ 文案查重 ============
    // 给定系统，返回其分组的树级选项（含各级分组 Key 链），用于复制目标下拉
    projectPageOptions(project) {
      if (!project) return [];
      const walk = (list, depth, prefixKeys) => {
        let acc = [];
        (list || []).forEach(pg => {
          const keys = [...prefixKeys, (pg.key || pg.name || '').trim()].filter(Boolean);
          acc.push({ id: pg.id, depth, name: pg.name, chain: keys.join('.') , label: '　'.repeat(depth) + '📄 ' + pg.name });
          if (pg.children && pg.children.length) acc = acc.concat(walk(pg.children, depth + 1, keys));
        });
        return acc;
      };
      const root = { id: 'projcopies_' + project.id, depth: 0, name: '系统级文案', chain: '', label: '📦 ' + project.name + '（系统级文案）' };
      return [root, ...walk(project.pages, 1, [])];
    },
    // 某个分组在其所在系统内的链式展示（分组 / 子分组，不含系统名）
    pageChainDisplay(project, pageId) {
      if (!project) return '';
      if (('projcopies_' + project.id) === pageId) return '（系统级文案）';
      const path = this.findPagePath(pageId, project.pages) || [];
      return path.map(p => p.name).join(' / ');
    },
    // 定位某条文案在系统中的第一个所属分组（用于构造 demo 行）
    locateCopy(project, key) {
      const walk = (pg) => {
        const c = pg.copies.find(x => x.key === key);
        if (c) return { copy: c, pageId: pg.id };
        for (const ch of (pg.children || [])) { const f = walk(ch); if (f) return f; }
        return null;
      };
      for (const pg of (project.pages || [])) { const f = walk(pg); if (f) return f; }
      const pc = (project.copies || []).find(x => x.key === key);
      if (pc) return { copy: pc, pageId: 'projcopies_' + project.id };
      return null;
    },
    // 构造一行 demo：来自 project 的某条文案，可覆盖英文值使同组一致
    dedupRow(project, key, isOwn, enOverride) {
      const found = this.locateCopy(project, key);
      if (!found) return null;
      const values = { ...found.copy.values };
      if (enOverride != null) values.en = enOverride;
      return {
        id: found.copy.id + '_' + found.pageId + '_' + uid('r'),
        copyId: found.copy.id,
        key: found.copy.key,
        values,
        projectId: project.id,
        projectName: project.name,
        pageId: found.pageId,
        pageChain: this.pageChainDisplay(project, found.pageId),
        isOwn,
      };
    },
    openDedup(project) {
      this.dedupScope = 'project';
      this.dedupSelectedIds = [];
      this.runDedup(project);
    },
    openDedupSelected() {
      if (!this.selectedCopies.length) return;
      this.dedupScope = 'selected';
      this.dedupSelectedIds = [...this.selectedCopies];
      this.runDedup(this.currentProject);
    },
    runDedup(project) {
      this.dedupProject = project;
      this.showDedup = true;
      this.dedupLoading = true;
      this.dedupGroups = [];
      // 模拟接口：只返回存在重复的文案，重复项彼此相邻，按组组织
      setTimeout(() => {
        let groups = this.buildDedupGroups(project);
        if (this.dedupScope === 'selected') {
          // 缩减范围：只保留包含所勾选文案的重复组，且组内至少还有一条其它重复项
          const sel = new Set(this.dedupSelectedIds);
          groups = groups
            .filter(grp => grp.rows.some(r => r.isOwn && sel.has(r.copyId)))
            .filter(grp => grp.rows.length > 1);
        }
        this.dedupGroups = groups;
        this.dedupLoading = false;
      }, 600);
    },
    buildDedupGroups(project) {
      const byName = (n) => this.projects.find(p => p.name === n);
      const vesync = byName('VeSync App');
      const site = byName('Official Website');
      const admin = byName('Admin Dashboard');
      const g = (rows) => ({ id: uid('grp'), rows: rows.filter(Boolean) });

      // 需求6：Marketing Snippets 无重复
      if (project.name === 'Marketing Snippets') return [];

      // 需求5：VeSync App 多组重复（组内英文一致）
      if (project.name === 'VeSync App') {
        return [
          // 组1：本系统 2 条（不同分组）+ 其它系统 1 条，英文均为 "Delete"
          g([
            this.dedupRow(vesync, 'Delete', true, 'Delete'),
            this.dedupRow(vesync, 'Delete_User', true, 'Delete'),
            this.dedupRow(admin, 'Export', false, 'Delete'),
          ]),
          // 组2：本系统 1 条 + 其它系统 1 条，英文均为 "Settings"
          g([
            this.dedupRow(vesync, 'Settings', true, 'Settings'),
            this.dedupRow(site, 'Contact_Us', false, 'Settings'),
          ]),
          // 组3：本系统 2 条（分属不同分组 home / device_schedule）+ 其它系统 2 条（分属不同系统），英文均为 "Add"
          g([
            this.dedupRow(vesync, 'Add_Device', true, 'Add'),
            this.dedupRow(vesync, 'Add_Schedule', true, 'Add'),
            this.dedupRow(admin, 'Add_User', false, 'Add'),
            this.dedupRow(site, 'Subscribe', false, 'Add'),
          ]),
        ].filter(grp => grp.rows.length > 1);
      }

      // 其它系统：构造一组（本系统 1 条 + 其它系统 1 条，英文一致）作为通用演示
      const others = this.projects.filter(p => p.id !== project.id);
      const ownFirst = this.firstCopyKey(project);
      const other = others[0];
      const otherFirst = other && this.firstCopyKey(other);
      const en = 'Save';
      return [
        g([
          ownFirst && this.dedupRow(project, ownFirst, true, en),
          other && otherFirst && this.dedupRow(other, otherFirst, false, en),
        ]),
      ].filter(grp => grp.rows.length > 1);
    },
    firstCopyKey(project) {
      const walk = (pg) => { if (pg.copies[0]) return pg.copies[0].key; for (const ch of (pg.children || [])) { const f = walk(ch); if (f) return f; } return null; };
      for (const pg of (project.pages || [])) { const f = walk(pg); if (f) return f; }
      return (project.copies && project.copies[0]) ? project.copies[0].key : null;
    },
    // 语种列 = 本系统所有语种
    dedupLangs() {
      if (!this.dedupProject) return [];
      return [...this.dedupProject.languages];
    },
    dedupGroupTone(index) {
      return 'dd-grp-tone-' + (index % 4);
    },
    // 组内本系统条目数（用于控制删除按钮显示）
    ownCountInGroup(group) { return group.rows.filter(r => r.isOwn).length; },
    dedupOwnRowsForOverwrite() {
      if (!this.dedupOverwriteGroup) return [];
      return this.dedupOverwriteGroup.rows.filter(r => r.isOwn);
    },
    findCopyInProject(project, copyId, pageId) {
      if (!project) return null;
      if (('projcopies_' + project.id) === pageId) {
        return (project.copies || []).find(c => c.id === copyId) || null;
      }
      const walk = (pg) => {
        if (pg.id === pageId) return pg.copies.find(c => c.id === copyId) || null;
        for (const ch of (pg.children || [])) { const f = walk(ch); if (f) return f; }
        return null;
      };
      for (const pg of (project.pages || [])) { const f = walk(pg); if (f) return f; }
      return null;
    },
    removeCopyFromProject(project, copyId, pageId) {
      if (!project) return false;
      if (('projcopies_' + project.id) === pageId) {
        const list = project.copies || [];
        const i = list.findIndex(c => c.id === copyId);
        if (i !== -1) { list.splice(i, 1); return true; }
        return false;
      }
      const walk = (pg) => {
        if (pg.id === pageId) {
          const i = pg.copies.findIndex(c => c.id === copyId);
          if (i !== -1) { pg.copies.splice(i, 1); return true; }
          return false;
        }
        for (const ch of (pg.children || [])) { if (walk(ch)) return true; }
        return false;
      };
      for (const pg of (project.pages || [])) { if (walk(pg)) return true; }
      return false;
    },
    applyDedupOverwrite(sourceRow, targetRows) {
      const project = this.dedupProject;
      if (!project || !sourceRow) return;
      const langs = project.languages;
      targetRows.forEach(tr => {
        const copy = this.findCopyInProject(project, tr.copyId, tr.pageId);
        if (copy) langs.forEach(l => { copy.values[l] = sourceRow.values[l] ?? ''; });
        langs.forEach(l => { tr.values[l] = sourceRow.values[l] ?? ''; });
      });
      this.toast(`已将「${sourceRow.key}」覆盖到 ${targetRows.length} 条本系统文案`);
    },
    openDedupCopy(row, group) {
      if (row.isOwn) return;
      const ownRows = group.rows.filter(r => r.isOwn);
      if (!ownRows.length) return;
      if (ownRows.length === 1) {
        const target = ownRows[0];
        this.confirm = {
          show: true,
          title: '覆盖文案',
          danger: false,
          okLabel: '确认覆盖',
          message: `将「${row.projectName}」系统的文案「${row.values.en || row.key}」覆盖到本系统「${target.pageChain}」下？覆盖后本系统文案各语种内容将替换为其它系统的对应内容。`,
          ok: () => {
            this.applyDedupOverwrite(row, [target]);
            this.confirm.show = false;
          },
        };
        return;
      }
      this.dedupOverwriteSource = row;
      this.dedupOverwriteGroup = group;
      this.dedupOverwriteSelected = [];
      this.showDedupOverwrite = true;
    },
    doDedupOverwrite() {
      if (!this.dedupOverwriteSource || !this.dedupOverwriteGroup) return;
      if (!this.dedupOverwriteSelected.length) {
        this.toast('请至少勾选一条本系统文案');
        return;
      }
      const targets = this.dedupOverwriteGroup.rows.filter(r => this.dedupOverwriteSelected.includes(r.id));
      this.applyDedupOverwrite(this.dedupOverwriteSource, targets);
      this.showDedupOverwrite = false;
      this.dedupOverwriteSource = null;
      this.dedupOverwriteGroup = null;
      this.dedupOverwriteSelected = [];
    },
    confirmDedupDelete(group, row) {
      this.confirm = {
        show: true,
        title: '删除文案',
        danger: true,
        okLabel: '确认删除',
        message: `确定删除「${row.key}」（${row.projectName} / ${row.pageChain}）？该文案将被硬删除，不可恢复。`,
        ok: () => {
          this.removeCopyFromProject(this.dedupProject, row.copyId, row.pageId);
          group.rows = group.rows.filter(r => r.id !== row.id);
          this.dedupGroups = this.dedupGroups.filter(g => g.rows.length > 1);
          this.confirm.show = false;
          this.toast('文案已删除');
        },
      };
    },
  },
});

// Recursive page tree node
app.component('page-tree-node', {
  name: 'page-tree-node',
  props: {
    node: { type: Object, required: true },
    depth: { type: Number, default: 0 },
    parentKey: { type: String, default: '' },
    langLabel: { type: Function, required: true },
  },
  inject: ['tree'],
  data() { return { open: true }; },
  computed: {
    hasChildren() { return this.node.children && this.node.children.length > 0; },
    fullKey() { return this.parentKey && this.node.key ? (this.parentKey + '.' + this.node.key) : (this.node.key || ''); },
  },
  template: `
    <div class="ptree-item">
      <div class="ptree-row" :class="{'project-level': node.projectLevel}" :style="{paddingLeft:(depth*24+12)+'px'}" @click="tree.openPage(node)">
        <button v-if="hasChildren" class="ptree-toggle" @click.stop="open=!open">{{ open ? '▾' : '▸' }}</button>
        <span v-else class="ptree-toggle ghost"></span>
        <span v-if="!node.projectLevel" class="ptree-thumb" :class="{noimg:!node.screenshot, previewable:node.screenshot}" :title="node.screenshot ? '点击查看大图' : '无截图'" @click.stop="node.screenshot && tree.previewScreenshot(node)">
          <img v-if="node.screenshot && node.screenshotUrl" :src="node.screenshotUrl" :alt="node.name + ' 截图'" />
          <template v-else>{{ node.screenshot ? '🖼️' : '–' }}</template>
        </span>
        <span v-else class="ptree-thumb placeholder" aria-hidden="true"></span>
        <div class="ptree-info">
          <span class="ptree-name">{{ node.name }}</span>
        </div>
        <span class="ptree-count"><b>{{ node.copies.length }}</b> 文案</span>
        <div v-if="!node.projectLevel && tree.isEditable()" class="ptree-actions" @click.stop>
          <button class="btn xs" title="在此分组下新增子分组" @click="tree.addChild(node)">＋ 子分组</button>
          <button class="icon-btn sm" title="编辑分组" @click="tree.editPage(node)">✏️</button>
          <button class="icon-btn sm danger" title="删除分组" @click="tree.deletePage(node)">🗑️</button>
        </div>
        <div v-else class="ptree-actions placeholder" aria-hidden="true"></div>
      </div>
      <div v-if="hasChildren && open" class="ptree-children">
        <page-tree-node v-for="c in node.children" :key="c.id" :node="c" :depth="depth+1" :parent-key="fullKey" :lang-label="langLabel" />
      </div>
    </div>
  `,
});

app.directive('focus', { mounted(el) { const input = el.tagName === 'INPUT' ? el : el.querySelector('input'); input && input.focus(); } });

app.mount('#app');
