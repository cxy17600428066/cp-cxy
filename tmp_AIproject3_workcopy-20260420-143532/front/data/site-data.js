/**
 * Zhuoxi Group - Site Data Manager
 * Single data layer for frontend + admin.
 * localStorage persistence with schema migration, versions, logs and publish workflow.
 */

const STORAGE_KEY = "zhuoxi_site_data";
const SESSION_KEY = "zhuoxi_admin_session";
const VERSION_LIMIT = 20;
const LOG_LIMIT = 400;

const DEFAULT_SITE_PROFILE = {
  companyName: "卓希食品科技有限公司",
  companyShortName: "卓希集团",
  unifiedCode: "91310000MA00000000",
  icp: "沪ICP备20000000号-1",
  foodLicense: "SC00000000000000",
  publicSecurity: "沪公网安备31000000000000号",
  address: "中国（上海）浦东新区示范路88号",
  servicePhone: "400-888-8888",
  businessEmail: "biz@zhuoxi-hero.com",
  hrEmail: "hr@zhuoxi-hero.com",
  workingHours: "周一至周五 09:00-18:00",
  legalStatement:
    "本网站仅用于品牌展示与信息发布，产品信息请以实际销售页面为准。"
};

const DEFAULT_SEO = {
  title: "卓希集团 | 官方门户",
  description: "卓希集团官方信息门户，提供品牌、产品、新闻与合作信息。",
  keywords: "卓希,脱骨侠,休闲食品,无骨鸡爪",
  ogImage: "hero.png",
  canonical: ""
};

const DEFAULT_ROLES = [
  { key: "admin", label: "系统管理员", permissions: ["*"] },
  {
    key: "editor",
    label: "内容编辑",
    permissions: ["content.read", "content.write", "media.read", "media.write", "preview.use"]
  },
  {
    key: "reviewer",
    label: "审核员",
    permissions: ["content.read", "content.review", "preview.use", "publish.use"]
  }
];

const DEFAULT_USERS = [
  {
    id: "u_admin",
    username: "admin",
    password: "admin123",
    displayName: "系统管理员",
    role: "admin",
    status: "active"
  },
  {
    id: "u_editor",
    username: "editor",
    password: "editor123",
    displayName: "内容编辑",
    role: "editor",
    status: "active"
  },
  {
    id: "u_reviewer",
    username: "reviewer",
    password: "reviewer123",
    displayName: "内容审核",
    role: "reviewer",
    status: "active"
  }
];

function defaultVersion(item) {
  return {
    versionId: "v_" + Date.now().toString(36),
    at: new Date().toISOString(),
    note: "初始化版本",
    author: "system",
    snapshot: JSON.parse(JSON.stringify(item))
  };
}

function defaultLogs() {
  return [
    {
      id: "log_" + Date.now().toString(36),
      at: new Date().toISOString(),
      userId: "system",
      userName: "system",
      action: "SYSTEM_INIT",
      module: "system",
      targetId: "root",
      detail: "初始化站点数据"
    }
  ];
}

const SEED_DATA = {
  meta: { schemaVersion: 2, updatedAt: new Date().toISOString() },
  profile: JSON.parse(JSON.stringify(DEFAULT_SITE_PROFILE)),
  seo: {
    home: { ...DEFAULT_SEO, title: "脱骨侠集团 | 官方门户 — 予你无骨自由" },
    about: { ...DEFAULT_SEO, title: "关于我们 | 卓希集团" },
    news: { ...DEFAULT_SEO, title: "新闻中心 | 卓希集团" },
    products: { ...DEFAULT_SEO, title: "产品中心 | 脱骨侠" },
    contact: { ...DEFAULT_SEO, title: "联系我们 | 卓希集团" },
    privacy: { ...DEFAULT_SEO, title: "隐私政策 | 卓希集团" },
    terms: { ...DEFAULT_SEO, title: "使用条款 | 卓希集团" },
    careers: { ...DEFAULT_SEO, title: "加入我们 | 卓希集团" }
  },
  settings: {
    siteStatus: "online",
    enableCookieNotice: true,
    defaultPageSize: 10
  },
  auth: {
    users: JSON.parse(JSON.stringify(DEFAULT_USERS)),
    roles: JSON.parse(JSON.stringify(DEFAULT_ROLES))
  },
  logs: defaultLogs(),
  previewToken: "preview_" + Math.random().toString(36).slice(2, 8),
  mediaAssets: [],
  careers: [
    {
      id: "j1",
      title: "品牌设计师",
      department: "品牌中心",
      city: "上海",
      type: "全职",
      level: "中级",
      salary: "12k-20k",
      status: "published",
      responsibilities:
        "负责品牌主视觉、营销活动KV、包装视觉延展，保障输出质量与品牌一致性。",
      requirements:
        "3年以上品牌设计经验，熟练使用主流设计软件，具备食品行业经验优先。",
      process: "简历筛选 -> 专业面试 -> 终面 -> 发放Offer",
      contactEmail: "hr@zhuoxi-hero.com",
      order: 1,
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: [],
      updatedAt: "2026-04-20T00:00:00.000Z",
      updatedBy: "system"
    },
    {
      id: "j2",
      title: "区域渠道经理",
      department: "渠道发展部",
      city: "杭州",
      type: "全职",
      level: "高级",
      salary: "18k-30k",
      status: "published",
      responsibilities:
        "负责区域渠道拓展、经销商管理与销售目标达成，推进重点项目落地。",
      requirements:
        "5年以上快消渠道经验，具备大客户拓展能力与团队协同能力。",
      process: "简历筛选 -> 业务面试 -> 终面 -> 背调",
      contactEmail: "hr@zhuoxi-hero.com",
      order: 2,
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: [],
      updatedAt: "2026-04-20T00:00:00.000Z",
      updatedBy: "system"
    }
  ],
  carousel: [
    {
      id: "c1",
      src: "IMG_20240724_193055 (08073368).jpg",
      alt: "脱骨侠招牌鸡爪",
      order: 1,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c2",
      src: "picture/椒麻鸡杂-自己修图.png",
      alt: "脱骨侠椒麻鸡杂",
      order: 2,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c3",
      src: "picture/IMG_20240723_193744 (09809270).jpg",
      alt: "脱骨侠精选产品",
      order: 3,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c4",
      src: "picture/IMG_20240724_165402 (0EAECDD8).jpg",
      alt: "脱骨侠系列全家福",
      order: 4,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    }
  ],
  news: [
    {
      id: "n1",
      slug: "innovation-award-2026",
      title: "卓希集团荣获“年度最具创新零食品牌”，连续四年位列行业前列",
      category: "品牌资讯",
      categoryKey: "brand",
      date: "2026.04.12",
      excerpt:
        "在第十二届中国食品博览会上，卓希凭借独有工艺与产品矩阵，再次获得行业创新大奖。",
      detail:
        "在第十二届中国食品博览会上，卓希凭借其独有的入味工艺再次获得行业创新大奖。评审团认为，卓希在产品研发、供应链整合和品牌建设方面形成了完整的竞争壁垒。",
      emoji: "🏆",
      thumbClass: "thumb-amber",
      isFeatured: true,
      order: 1,
      status: "published",
      publishAt: "2026-04-12T08:00:00.000Z",
      seo: {
        title: "卓希集团创新大奖 | 新闻中心",
        description: "卓希集团荣获年度创新品牌大奖，持续领跑无骨鸡爪赛道。",
        keywords: "卓希,创新大奖,新闻",
        ogImage: "hero4.png"
      },
      author: "品牌公关部",
      source: "卓希集团",
      tags: ["品牌", "行业奖项"],
      versionHistory: []
    },
    {
      id: "n2",
      slug: "distributor-conference-2026",
      title: "卓希全球分销商大会圆满落幕，500位伙伴共绘蓝图",
      category: "活动报道",
      categoryKey: "event",
      date: "2026.03.20",
      excerpt:
        "来自全国及东南亚的核心合作伙伴齐聚，发布全年新品矩阵与渠道政策。",
      detail:
        "大会发布了2026年全线新品路线图，并推出了全新的渠道合作激励政策，覆盖线上电商、线下商超及新零售。",
      emoji: "📣",
      thumbClass: "thumb-brick",
      isFeatured: true,
      order: 2,
      status: "published",
      publishAt: "2026-03-20T08:00:00.000Z",
      seo: {
        title: "卓希分销商大会 | 新闻中心",
        description: "卓希举办全球分销商大会，发布2026新品与渠道策略。",
        keywords: "卓希,分销商大会,渠道",
        ogImage: "hero4.png"
      },
      author: "品牌公关部",
      source: "卓希集团",
      tags: ["渠道", "大会"],
      versionHistory: []
    },
    {
      id: "n3",
      slug: "lab-2-online",
      title: "脱骨实验室2.0上线，攻克多触感风味新逻辑",
      category: "产品研发",
      categoryKey: "product",
      date: "2026.02.15",
      excerpt: "研发中心扩容升级，聚焦多触感风味工程。",
      detail:
        "新实验室配备行业领先设备，重点推进软糯化骨与微观复配技术，为新品迭代提供研发能力支撑。",
      emoji: "🔬",
      thumbClass: "thumb-blue",
      isFeatured: true,
      order: 3,
      status: "published",
      publishAt: "2026-02-15T08:00:00.000Z",
      seo: {
        title: "脱骨实验室2.0上线 | 新闻中心",
        description: "卓希升级研发中心，持续推进风味技术创新。",
        keywords: "脱骨实验室,研发,卓希",
        ogImage: "hero4.png"
      },
      author: "研发中心",
      source: "卓希集团",
      tags: ["研发", "实验室"],
      versionHistory: []
    }
  ],
  products: [
    {
      id: "p1",
      slug: "chuanshi-red-oil",
      name: "川香红油",
      flavor: "经典爆款",
      categoryKey: "spicy",
      desc:
        "甄选优质辣椒与花椒，以秘制红油工艺入味，香辣过瘾、回味绵长。",
      image: "川香红油.png",
      badge: "经典爆款",
      specs: ["250g/袋", "麻辣鲜香"],
      link: "https://www.taobao.com",
      order: 1,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      nutrition: "能量 1200kJ/100g，蛋白质 18g/100g。",
      ingredients: "鸡爪、植物油、辣椒、花椒、食用盐、白砂糖。",
      scenes: "追剧、聚会、夜宵",
      faq: "开袋即食，建议冷藏后风味更佳。",
      seo: {
        title: "川香红油无骨鸡爪 | 卓希产品中心",
        description: "卓希经典川香红油口味，香辣鲜香，回味十足。",
        keywords: "川香红油,无骨鸡爪,卓希"
      },
      versionHistory: []
    },
    {
      id: "p2",
      slug: "sour-lemon",
      name: "酸辣柠檬",
      flavor: "鲜爽入魂",
      categoryKey: "sour",
      desc:
        "精选柠檬清香与酸辣平衡工艺，入口清爽，适合夏季和日常解腻。",
      image: "酸辣柠檬.png",
      badge: "鲜爽入魂",
      specs: ["250g/袋", "柠檬酸辣"],
      link: "https://www.taobao.com",
      order: 2,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      nutrition: "能量 1100kJ/100g，蛋白质 17g/100g。",
      ingredients: "鸡爪、柠檬汁、辣椒、食用盐、糖。",
      scenes: "办公、通勤、出游",
      faq: "建议开封后尽快食用。",
      seo: {
        title: "酸辣柠檬无骨鸡爪 | 卓希产品中心",
        description: "酸辣清爽风味，开袋即食，适合多场景食用。",
        keywords: "酸辣柠檬,无骨鸡爪,卓希"
      },
      versionHistory: []
    }
  ],
  legal: {
    privacy: {
      title: "隐私政策",
      effectiveDate: "2026-04-20",
      content:
        "我们仅在提供服务所必需的范围内收集和使用信息。我们不会在未经授权的情况下向第三方出售用户个人信息。"
    },
    terms: {
      title: "使用条款",
      effectiveDate: "2026-04-20",
      content:
        "本网站内容用于品牌信息展示。未经许可不得擅自转载、复制或用于商业用途。"
    }
  }
};

function nowIso() {
  return new Date().toISOString();
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

class SiteDataManager {
  constructor() {
    this._data = null;
    this._session = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        this._data = JSON.parse(raw);
      } else {
        this._data = deepClone(SEED_DATA);
        this.save();
      }
    } catch (err) {
      console.warn("SiteDataManager: load failed, fallback to seed.", err);
      this._data = deepClone(SEED_DATA);
      this.save();
    }

    this._migrate();
    this._loadSession();
    return this._data;
  }

  save() {
    if (!this._data) return;
    this._data.meta = this._data.meta || {};
    this._data.meta.schemaVersion = 2;
    this._data.meta.updatedAt = nowIso();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
  }

  getData() {
    if (!this._data) this.load();
    return this._data;
  }

  getSession() {
    if (!this._session) this._loadSession();
    return this._session;
  }

  isLoggedIn() {
    const s = this.getSession();
    return Boolean(s && s.user);
  }

  login(username, password) {
    const user = this.getData().auth.users.find(
      u => u.username === username && u.password === password && u.status === "active"
    );
    if (!user) return null;
    const session = {
      token: "sess_" + Math.random().toString(36).slice(2, 10),
      loginAt: nowIso(),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    };
    this._session = session;
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    this.appendLog("AUTH_LOGIN", "auth", user.id, `${user.displayName} 登录后台`);
    return session;
  }

  logout() {
    const s = this.getSession();
    if (s && s.user) {
      this.appendLog("AUTH_LOGOUT", "auth", s.user.id, `${s.user.displayName} 退出后台`);
    }
    this._session = null;
    localStorage.removeItem(SESSION_KEY);
  }

  hasPermission(permission) {
    const session = this.getSession();
    if (!session || !session.user) return false;
    const role = this.getData().auth.roles.find(r => r.key === session.user.role);
    if (!role) return false;
    if (role.permissions.includes("*")) return true;
    return role.permissions.includes(permission);
  }

  getCurrentUserName() {
    const session = this.getSession();
    return session && session.user ? session.user.displayName : "system";
  }

  getProfile() {
    return this.getData().profile;
  }

  updateProfile(nextProfile) {
    const data = this.getData();
    data.profile = { ...data.profile, ...nextProfile };
    this.save();
    this.appendLog("PROFILE_UPDATE", "profile", "profile", "更新站点基础信息");
  }

  getSeo(pageKey) {
    const data = this.getData();
    data.seo = data.seo || {};
    if (!data.seo[pageKey]) data.seo[pageKey] = deepClone(DEFAULT_SEO);
    return data.seo[pageKey];
  }

  updateSeo(pageKey, seo) {
    const data = this.getData();
    data.seo[pageKey] = { ...this.getSeo(pageKey), ...seo };
    this.save();
    this.appendLog("SEO_UPDATE", "seo", pageKey, `更新页面SEO: ${pageKey}`);
  }

  getSettings() {
    return this.getData().settings;
  }

  updateSettings(nextSettings) {
    const data = this.getData();
    data.settings = { ...data.settings, ...nextSettings };
    this.save();
    this.appendLog("SETTINGS_UPDATE", "settings", "settings", "更新站点设置");
  }

  getLegal() {
    return this.getData().legal;
  }

  updateLegal(key, payload) {
    const data = this.getData();
    data.legal = data.legal || {};
    data.legal[key] = { ...(data.legal[key] || {}), ...payload };
    this.save();
    this.appendLog("LEGAL_UPDATE", "legal", key, `更新法律条款: ${key}`);
  }

  // ===== Content Collections =====
  getCarousel() {
    return ensureArray(this.getData().carousel).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getNews() {
    return ensureArray(this.getData().news).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getProducts() {
    return ensureArray(this.getData().products).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getCareers() {
    return ensureArray(this.getData().careers).sort((a, b) => (a.order || 0) - (b.order || 0));
  }

  getPublishedNews() {
    return this.getNews().filter(item => item.status === "published");
  }

  getPublishedProducts() {
    return this.getProducts().filter(item => item.status === "published");
  }

  getPublishedCareers() {
    return this.getCareers().filter(item => item.status === "published");
  }

  getNewsById(id) {
    return this.getNews().find(n => n.id === id) || null;
  }

  getNewsBySlug(slug) {
    return this.getNews().find(n => n.slug === slug) || null;
  }

  getProductById(id) {
    return this.getProducts().find(p => p.id === id) || null;
  }

  getProductBySlug(slug) {
    return this.getProducts().find(p => p.slug === slug) || null;
  }

  getCareerById(id) {
    return this.getCareers().find(j => j.id === id) || null;
  }

  getItemByModule(module, id) {
    const data = this.getData();
    const list = ensureArray(data[module]);
    return list.find(item => item.id === id) || null;
  }

  saveItem(module, item, operation = "UPDATE") {
    const data = this.getData();
    data[module] = ensureArray(data[module]);
    const idx = data[module].findIndex(x => x.id === item.id);

    const nextItem = {
      ...item,
      updatedAt: nowIso(),
      updatedBy: this.getCurrentUserName(),
      versionHistory: ensureArray(item.versionHistory)
    };

    this._pushVersion(nextItem, operation);

    if (idx >= 0) data[module][idx] = nextItem;
    else data[module].push(nextItem);

    this.save();
    this.appendLog(`${module.toUpperCase()}_${operation}`, module, nextItem.id, `保存${module}内容`);
    return nextItem;
  }

  deleteItem(module, id) {
    const data = this.getData();
    data[module] = ensureArray(data[module]).filter(item => item.id !== id);
    this.save();
    this.appendLog(`${module.toUpperCase()}_DELETE`, module, id, `删除${module}内容`);
  }

  updateStatus(module, id, status) {
    const item = this.getItemByModule(module, id);
    if (!item) return null;
    item.status = status;
    if (status === "published") item.publishAt = nowIso();
    if (status === "archived") item.archiveAt = nowIso();
    return this.saveItem(module, item, "STATUS");
  }

  revertVersion(module, id, versionId) {
    const item = this.getItemByModule(module, id);
    if (!item) return null;
    const history = ensureArray(item.versionHistory);
    const version = history.find(v => v.versionId === versionId);
    if (!version) return null;
    const snapshot = deepClone(version.snapshot);
    snapshot.versionHistory = history;
    return this.saveItem(module, snapshot, "REVERT");
  }

  appendLog(action, module, targetId, detail) {
    const data = this.getData();
    data.logs = ensureArray(data.logs);
    const session = this.getSession();
    const userName = session && session.user ? session.user.displayName : "system";
    const userId = session && session.user ? session.user.id : "system";
    data.logs.unshift({
      id: "log_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      at: nowIso(),
      userId,
      userName,
      action,
      module,
      targetId,
      detail
    });
    data.logs = data.logs.slice(0, LOG_LIMIT);
    this.save();
  }

  getLogs() {
    return ensureArray(this.getData().logs);
  }

  getMediaAssets() {
    return ensureArray(this.getData().mediaAssets);
  }

  upsertMediaAsset(asset) {
    const data = this.getData();
    data.mediaAssets = ensureArray(data.mediaAssets);
    const idx = data.mediaAssets.findIndex(m => m.path === asset.path);
    const next = {
      path: asset.path,
      title: asset.title || "",
      tags: ensureArray(asset.tags),
      usage: ensureArray(asset.usage),
      updatedAt: nowIso()
    };
    if (idx >= 0) data.mediaAssets[idx] = { ...data.mediaAssets[idx], ...next };
    else data.mediaAssets.push(next);
    this.save();
  }

  exportJSON() {
    return JSON.stringify(this.getData(), null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this._data = parsed;
      this._migrate();
      this.save();
      this.appendLog("SYSTEM_IMPORT", "system", "root", "导入站点数据");
      return true;
    } catch (err) {
      console.error("Import failed:", err);
      return false;
    }
  }

  resetToDefault() {
    this._data = deepClone(SEED_DATA);
    this.save();
    this.appendLog("SYSTEM_RESET", "system", "root", "重置为默认数据");
  }

  search(module, keyword) {
    const key = (keyword || "").trim().toLowerCase();
    const list = ensureArray(this.getData()[module]);
    if (!key) return list;
    return list.filter(item => JSON.stringify(item).toLowerCase().includes(key));
  }

  paginate(items, page = 1, size = 10) {
    const total = items.length;
    const safeSize = Math.max(1, size);
    const safePage = Math.max(1, page);
    const start = (safePage - 1) * safeSize;
    return {
      page: safePage,
      size: safeSize,
      total,
      pages: Math.max(1, Math.ceil(total / safeSize)),
      records: items.slice(start, start + safeSize)
    };
  }

  static generateId(prefix = "x") {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }

  _loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      this._session = raw ? JSON.parse(raw) : null;
    } catch (err) {
      this._session = null;
    }
  }

  _migrate() {
    const data = this._data || {};
    data.meta = data.meta || { schemaVersion: 2, updatedAt: nowIso() };
    data.profile = { ...DEFAULT_SITE_PROFILE, ...(data.profile || {}) };
    data.settings = { siteStatus: "online", enableCookieNotice: true, defaultPageSize: 10, ...(data.settings || {}) };
    data.seo = data.seo || {};
    Object.keys(SEED_DATA.seo).forEach(key => {
      data.seo[key] = { ...SEED_DATA.seo[key], ...(data.seo[key] || {}) };
    });
    data.auth = data.auth || {};
    data.auth.roles = ensureArray(data.auth.roles).length ? data.auth.roles : deepClone(DEFAULT_ROLES);
    data.auth.users = ensureArray(data.auth.users).length ? data.auth.users : deepClone(DEFAULT_USERS);
    data.logs = ensureArray(data.logs).length ? data.logs : defaultLogs();
    data.legal = data.legal || deepClone(SEED_DATA.legal);
    data.previewToken = data.previewToken || ("preview_" + Math.random().toString(36).slice(2, 8));
    data.mediaAssets = ensureArray(data.mediaAssets);
    ["carousel", "news", "products", "careers"].forEach(module => {
      data[module] = ensureArray(data[module]);
      data[module] = data[module].map(item => {
        const normalized = {
          status: item.status || "draft",
          publishAt: item.publishAt || null,
          versionHistory: ensureArray(item.versionHistory),
          updatedAt: item.updatedAt || nowIso(),
          updatedBy: item.updatedBy || "system",
          ...item
        };
        if (!normalized.slug && normalized.name) {
          normalized.slug = this._slugify(normalized.name);
        }
        if (!normalized.slug && normalized.title) {
          normalized.slug = this._slugify(normalized.title);
        }
        if (!normalized.seo) normalized.seo = deepClone(DEFAULT_SEO);
        if (!normalized.versionHistory.length) {
          normalized.versionHistory = [defaultVersion(normalized)];
        }
        return normalized;
      });
    });
    this._data = data;
  }

  _pushVersion(item, note) {
    const snapshot = deepClone(item);
    delete snapshot.versionHistory;
    item.versionHistory = ensureArray(item.versionHistory);
    item.versionHistory.unshift({
      versionId: "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
      at: nowIso(),
      note,
      author: this.getCurrentUserName(),
      snapshot
    });
    item.versionHistory = item.versionHistory.slice(0, VERSION_LIMIT);
  }

  _slugify(text) {
    return String(text || "")
      .trim()
      .toLowerCase()
      .replace(/[^\w\u4e00-\u9fa5\- ]+/g, "")
      .replace(/\s+/g, "-")
      .replace(/\-+/g, "-")
      .slice(0, 80);
  }
}

const siteData = new SiteDataManager();

