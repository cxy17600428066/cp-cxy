/**
 * Zhuoxi Group - Site Data Manager
 * Frontend/Admin shared storage layer (localStorage).
 */

const STORAGE_KEY = "zhuoxi_site_data";
const SESSION_KEY = "zhuoxi_admin_session";
const VERSION_LIMIT = 20;
const LOG_LIMIT = 400;

const DEFAULT_SEO = {
  title: "",
  description: "",
  keywords: "",
  ogImage: "hero.png",
  canonical: ""
};

const DEFAULT_PROFILE = {
  companyName: "卓希食品科技有限公司",
  companyShortName: "卓希集团",
  unifiedCode: "91310000MA00000000",
  icp: "沪ICP备00000000号-1",
  foodLicense: "SC00000000000000",
  publicSecurity: "沪公网安备31000000000000号",
  address: "中国（上海）浦东新区示范路88号",
  servicePhone: "400-888-8888",
  businessEmail: "biz@zhuoxi-hero.com",
  hrEmail: "hr@zhuoxi-hero.com",
  workingHours: "周一至周五 09:00-18:00",
  legalStatement: "本网站用于品牌信息展示，具体产品信息以实际销售页面为准。"
};

const DEFAULT_SETTINGS = {
  siteStatus: "online",
  enableCookieNotice: true,
  defaultPageSize: 10
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
    label: "内容审核",
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

function nowIso() {
  return new Date().toISOString();
}

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

function ensureArray(v) {
  return Array.isArray(v) ? v : [];
}

function defaultVersion(item, note = "INIT", author = "system") {
  const snapshot = deepClone(item);
  delete snapshot.versionHistory;
  return {
    versionId: "v_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
    at: nowIso(),
    note,
    author,
    snapshot
  };
}

function seedData() {
  return {
    meta: { schemaVersion: 2, updatedAt: nowIso() },
    profile: deepClone(DEFAULT_PROFILE),
    seo: {
      home: {
        ...DEFAULT_SEO,
        title: "脱骨侠集团 | 官方门户",
        description: "卓希集团官方门户，提供品牌、产品、新闻与合作信息。"
      },
      about: { ...DEFAULT_SEO, title: "关于我们 | 卓希集团" },
      news: { ...DEFAULT_SEO, title: "新闻中心 | 卓希集团" },
      products: { ...DEFAULT_SEO, title: "产品中心 | 卓希集团" },
      contact: { ...DEFAULT_SEO, title: "联系我们 | 卓希集团" },
      privacy: { ...DEFAULT_SEO, title: "隐私政策 | 卓希集团" },
      terms: { ...DEFAULT_SEO, title: "使用条款 | 卓希集团" },
      careers: { ...DEFAULT_SEO, title: "加入我们 | 卓希集团" }
    },
    settings: deepClone(DEFAULT_SETTINGS),
    auth: {
      users: deepClone(DEFAULT_USERS),
      roles: deepClone(DEFAULT_ROLES)
    },
    logs: [
      {
        id: "log_" + Date.now().toString(36),
        at: nowIso(),
        userId: "system",
        userName: "system",
        action: "SYSTEM_INIT",
        module: "system",
        targetId: "root",
        detail: "初始化站点数据"
      }
    ],
    previewToken: "preview_" + Math.random().toString(36).slice(2, 8),
    mediaAssets: [],
    legal: {
      privacy: {
        title: "隐私政策",
        effectiveDate: "2026-04-20",
        content:
          "我们仅在提供服务所必需的范围内收集和使用信息，不会在未经授权的情况下对外披露个人信息。"
      },
      terms: {
        title: "使用条款",
        effectiveDate: "2026-04-20",
        content: "本网站内容仅用于品牌信息展示，未经许可不得转载、复制或用于商业用途。"
      }
    },
    carousel: [
      {
        id: "c1",
        src: "IMG_20240724_193055 (08073368).jpg",
        alt: "脱骨侠招牌鸡爪",
        order: 1,
        status: "published",
        publishAt: nowIso(),
        versionHistory: []
      },
      {
        id: "c2",
        src: "picture/椒麻鸡杂-自己修图.png",
        alt: "脱骨侠产品图",
        order: 2,
        status: "published",
        publishAt: nowIso(),
        versionHistory: []
      },
      {
        id: "c3",
        src: "picture/IMG_20240723_193744 (09809270).jpg",
        alt: "脱骨侠精选产品",
        order: 3,
        status: "published",
        publishAt: nowIso(),
        versionHistory: []
      },
      {
        id: "c4",
        src: "picture/IMG_20240724_165402 (0EAECDD8).jpg",
        alt: "脱骨侠系列",
        order: 4,
        status: "published",
        publishAt: nowIso(),
        versionHistory: []
      }
    ],
    news: [
      {
        id: "n1",
        slug: "innovation-award-2026",
        title: "卓希集团荣获年度创新零食品牌",
        category: "品牌资讯",
        categoryKey: "brand",
        date: "2026.04.12",
        excerpt: "在行业展会上，卓希集团再次获得创新大奖。",
        detail: "卓希集团凭借产品创新、供应链能力与品牌建设获得认可。",
        emoji: "🏆",
        thumbClass: "thumb-amber",
        isFeatured: true,
        order: 1,
        status: "published",
        publishAt: nowIso(),
        seo: { ...DEFAULT_SEO, title: "卓希集团获创新大奖" },
        author: "品牌公关部",
        source: "卓希集团",
        tags: ["品牌", "奖项"],
        versionHistory: []
      },
      {
        id: "n2",
        slug: "distributor-conference-2026",
        title: "卓希全球分销商大会圆满落幕",
        category: "活动报道",
        categoryKey: "event",
        date: "2026.03.20",
        excerpt: "来自多地的合作伙伴齐聚，发布全年新品与渠道政策。",
        detail: "大会发布了2026新品路线图和渠道合作政策。",
        emoji: "📢",
        thumbClass: "thumb-brick",
        isFeatured: true,
        order: 2,
        status: "published",
        publishAt: nowIso(),
        seo: { ...DEFAULT_SEO, title: "卓希分销商大会" },
        author: "品牌公关部",
        source: "卓希集团",
        tags: ["大会", "渠道"],
        versionHistory: []
      },
      {
        id: "n3",
        slug: "lab-2-online",
        title: "脱骨实验室2.0正式上线",
        category: "产品研发",
        categoryKey: "product",
        date: "2026.02.15",
        excerpt: "研发中心扩容升级，聚焦多触感风味工程。",
        detail: "实验室升级后将持续支持新品开发与风味迭代。",
        emoji: "🔬",
        thumbClass: "thumb-blue",
        isFeatured: false,
        order: 3,
        status: "published",
        publishAt: nowIso(),
        seo: { ...DEFAULT_SEO, title: "脱骨实验室2.0上线" },
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
        desc: "精选辣椒与花椒，香辣过瘾。",
        image: "川香红油.png",
        badge: "经典爆款",
        specs: ["250g/袋", "麻辣鲜香"],
        link: "https://www.taobao.com",
        order: 1,
        status: "published",
        publishAt: nowIso(),
        nutrition: "能量1200kJ/100g，蛋白质18g/100g。",
        ingredients: "鸡爪、植物油、辣椒、花椒等。",
        scenes: "追剧、聚会、夜宵",
        faq: "开袋即食，冷藏后风味更佳。",
        seo: { ...DEFAULT_SEO, title: "川香红油无骨鸡爪" },
        versionHistory: []
      },
      {
        id: "p2",
        slug: "sour-lemon",
        name: "酸辣柠檬",
        flavor: "鲜爽入魂",
        categoryKey: "sour",
        desc: "柠檬清香与酸辣平衡，口感清爽。",
        image: "酸辣柠檬.png",
        badge: "鲜爽入魂",
        specs: ["250g/袋", "柠檬酸辣"],
        link: "https://www.taobao.com",
        order: 2,
        status: "published",
        publishAt: nowIso(),
        nutrition: "能量1100kJ/100g，蛋白质17g/100g。",
        ingredients: "鸡爪、柠檬汁、辣椒、盐等。",
        scenes: "办公、通勤、出游",
        faq: "开封后请尽快食用。",
        seo: { ...DEFAULT_SEO, title: "酸辣柠檬无骨鸡爪" },
        versionHistory: []
      }
    ],
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
        responsibilities: "负责品牌视觉、活动KV和包装延展。",
        requirements: "3年以上品牌设计经验，熟练使用主流设计软件。",
        process: "简历筛选 -> 专业面试 -> 终面 -> 发放Offer",
        contactEmail: "hr@zhuoxi-hero.com",
        order: 1,
        publishAt: nowIso(),
        versionHistory: []
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
        responsibilities: "负责区域渠道拓展、经销商管理与销售目标达成。",
        requirements: "5年以上快消渠道经验，具备大客户拓展能力。",
        process: "简历筛选 -> 业务面试 -> 终面 -> 背调",
        contactEmail: "hr@zhuoxi-hero.com",
        order: 2,
        publishAt: nowIso(),
        versionHistory: []
      }
    ]
  };
}

class SiteDataManager {
  constructor() {
    this._data = null;
    this._session = null;
  }

  load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this._data = raw ? JSON.parse(raw) : seedData();
    } catch (err) {
      console.warn("SiteDataManager load fallback:", err);
      this._data = seedData();
    }
    this._migrate();
    this._loadSession();
    this.save();
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

  _loadSession() {
    try {
      const raw = localStorage.getItem(SESSION_KEY);
      this._session = raw ? JSON.parse(raw) : null;
    } catch (err) {
      this._session = null;
    }
  }

  getSession() {
    if (!this._session) this._loadSession();
    return this._session;
  }

  isLoggedIn() {
    return Boolean(this.getSession() && this.getSession().user);
  }

  login(username, password) {
    const user = ensureArray(this.getData().auth.users).find(
      u => u.username === username && u.password === password && u.status === "active"
    );
    if (!user) return null;
    this._session = {
      token: "sess_" + Math.random().toString(36).slice(2, 10),
      loginAt: nowIso(),
      user: {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        role: user.role
      }
    };
    localStorage.setItem(SESSION_KEY, JSON.stringify(this._session));
    this.appendLog("AUTH_LOGIN", "auth", user.id, `${user.displayName} 登录后台`);
    return this._session;
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
    const s = this.getSession();
    if (!s || !s.user) return false;
    const role = ensureArray(this.getData().auth.roles).find(r => r.key === s.user.role);
    if (!role) return false;
    if (ensureArray(role.permissions).includes("*")) return true;
    return ensureArray(role.permissions).includes(permission);
  }

  getCurrentUserName() {
    const s = this.getSession();
    return s && s.user ? s.user.displayName : "system";
  }

  getProfile() {
    return this.getData().profile;
  }

  updateProfile(nextProfile) {
    this.getData().profile = { ...this.getProfile(), ...(nextProfile || {}) };
    this.save();
    this.appendLog("PROFILE_UPDATE", "profile", "profile", "更新站点信息");
  }

  getSeo(pageKey) {
    const data = this.getData();
    data.seo = data.seo || {};
    if (!data.seo[pageKey]) data.seo[pageKey] = { ...DEFAULT_SEO };
    return data.seo[pageKey];
  }

  updateSeo(pageKey, nextSeo) {
    this.getData().seo[pageKey] = { ...this.getSeo(pageKey), ...(nextSeo || {}) };
    this.save();
    this.appendLog("SEO_UPDATE", "seo", pageKey, `更新SEO: ${pageKey}`);
  }

  getSettings() {
    return this.getData().settings || {};
  }

  updateSettings(nextSettings) {
    this.getData().settings = { ...this.getSettings(), ...(nextSettings || {}) };
    this.save();
    this.appendLog("SETTINGS_UPDATE", "settings", "settings", "更新站点设置");
  }

  getLegal() {
    return this.getData().legal || {};
  }

  updateLegal(key, payload) {
    const data = this.getData();
    data.legal = data.legal || {};
    data.legal[key] = { ...(data.legal[key] || {}), ...(payload || {}) };
    this.save();
    this.appendLog("LEGAL_UPDATE", "legal", key, `更新法律条款: ${key}`);
  }

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

  getPublishedCarousel() {
    return this.getCarousel().filter(item => item.status === "published");
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
    const list = ensureArray(this.getData()[module]);
    return list.find(item => item.id === id) || null;
  }

  saveItem(module, item, operation = "UPDATE") {
    const data = this.getData();
    data[module] = ensureArray(data[module]);
    const list = data[module];
    const idx = list.findIndex(x => x.id === item.id);

    const nextItem = {
      ...item,
      updatedAt: nowIso(),
      updatedBy: this.getCurrentUserName(),
      versionHistory: ensureArray(item.versionHistory)
    };

    if (!nextItem.slug && nextItem.name) nextItem.slug = this._slugify(nextItem.name);
    if (!nextItem.slug && nextItem.title) nextItem.slug = this._slugify(nextItem.title);

    this._pushVersion(nextItem, operation);

    if (idx >= 0) list[idx] = nextItem;
    else list.push(nextItem);

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
    snapshot.id = id;
    snapshot.versionHistory = history;
    return this.saveItem(module, snapshot, "REVERT");
  }

  appendLog(action, module, targetId, detail) {
    const data = this.getData();
    data.logs = ensureArray(data.logs);
    const s = this.getSession();
    const userName = s && s.user ? s.user.displayName : "system";
    const userId = s && s.user ? s.user.id : "system";
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
      this._data = JSON.parse(jsonString);
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
    this._data = seedData();
    this._migrate();
    this.save();
    this.appendLog("SYSTEM_RESET", "system", "root", "重置站点数据");
  }

  search(module, keyword) {
    const list = ensureArray(this.getData()[module]);
    const key = String(keyword || "").trim().toLowerCase();
    if (!key) return list;
    return list.filter(item => JSON.stringify(item).toLowerCase().includes(key));
  }

  paginate(items, page = 1, size = 10) {
    const safeSize = Math.max(1, size);
    const safePage = Math.max(1, page);
    const total = items.length;
    const start = (safePage - 1) * safeSize;
    return {
      page: safePage,
      size: safeSize,
      total,
      pages: Math.max(1, Math.ceil(total / safeSize)),
      records: items.slice(start, start + safeSize)
    };
  }

  _migrate() {
    const data = this.getData();
    data.meta = data.meta || {};
    data.meta.schemaVersion = 2;
    data.meta.updatedAt = data.meta.updatedAt || nowIso();

    data.profile = { ...DEFAULT_PROFILE, ...(data.profile || {}) };
    data.settings = { ...DEFAULT_SETTINGS, ...(data.settings || {}) };
    data.auth = data.auth || {};
    data.auth.roles = ensureArray(data.auth.roles).length ? data.auth.roles : deepClone(DEFAULT_ROLES);
    data.auth.users = ensureArray(data.auth.users).length ? data.auth.users : deepClone(DEFAULT_USERS);
    data.seo = data.seo || {};
    data.logs = ensureArray(data.logs);
    data.mediaAssets = ensureArray(data.mediaAssets);
    data.legal = data.legal || deepClone(seedData().legal);
    data.previewToken = data.previewToken || ("preview_" + Math.random().toString(36).slice(2, 8));

    ["carousel", "news", "products", "careers"].forEach(module => {
      data[module] = ensureArray(data[module]).map(item => {
        const normalized = {
          ...item,
          status: item.status || "draft",
          publishAt: item.publishAt || null,
          updatedAt: item.updatedAt || nowIso(),
          updatedBy: item.updatedBy || "system",
          versionHistory: ensureArray(item.versionHistory)
        };
        if (!normalized.slug && normalized.name) normalized.slug = this._slugify(normalized.name);
        if (!normalized.slug && normalized.title) normalized.slug = this._slugify(normalized.title);
        if (!normalized.versionHistory.length) {
          normalized.versionHistory = [defaultVersion(normalized)];
        }
        return normalized;
      });
    });
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

  static generateId(prefix = "x") {
    return prefix + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  }
}

const siteData = new SiteDataManager();
