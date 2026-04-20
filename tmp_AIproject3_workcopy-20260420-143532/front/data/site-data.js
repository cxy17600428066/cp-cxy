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
  companyName: "鍗撳笇椋熷搧绉戞妧鏈夐檺鍏徃",
  companyShortName: "鍗撳笇闆嗗洟",
  unifiedCode: "91310000MA00000000",
  icp: "娌狪CP澶?0000000鍙?1",
  foodLicense: "SC00000000000000",
  publicSecurity: "娌叕缃戝畨澶?1000000000000鍙?,
  address: "涓浗锛堜笂娴凤級娴︿笢鏂板尯绀鸿寖璺?8鍙?,
  servicePhone: "400-888-8888",
  businessEmail: "biz@zhuoxi-hero.com",
  hrEmail: "hr@zhuoxi-hero.com",
  workingHours: "鍛ㄤ竴鑷冲懆浜?09:00-18:00",
  legalStatement:
    "鏈綉绔欎粎鐢ㄤ簬鍝佺墝灞曠ず涓庝俊鎭彂甯冿紝浜у搧淇℃伅璇蜂互瀹為檯閿€鍞〉闈负鍑嗐€?
};

const DEFAULT_SEO = {
  title: "鍗撳笇闆嗗洟 | 瀹樻柟闂ㄦ埛",
  description: "鍗撳笇闆嗗洟瀹樻柟淇℃伅闂ㄦ埛锛屾彁渚涘搧鐗屻€佷骇鍝併€佹柊闂讳笌鍚堜綔淇℃伅銆?,
  keywords: "鍗撳笇,鑴遍渚?浼戦棽椋熷搧,鏃犻楦＄埅",
  ogImage: "hero.png",
  canonical: ""
};

const DEFAULT_ROLES = [
  { key: "admin", label: "绯荤粺绠＄悊鍛?, permissions: ["*"] },
  {
    key: "editor",
    label: "鍐呭缂栬緫",
    permissions: ["content.read", "content.write", "media.read", "media.write", "preview.use"]
  },
  {
    key: "reviewer",
    label: "瀹℃牳鍛?,
    permissions: ["content.read", "content.review", "preview.use", "publish.use"]
  }
];

const DEFAULT_USERS = [
  {
    id: "u_admin",
    username: "admin",
    password: "admin123",
    displayName: "绯荤粺绠＄悊鍛?,
    role: "admin",
    status: "active"
  },
  {
    id: "u_editor",
    username: "editor",
    password: "editor123",
    displayName: "鍐呭缂栬緫",
    role: "editor",
    status: "active"
  },
  {
    id: "u_reviewer",
    username: "reviewer",
    password: "reviewer123",
    displayName: "鍐呭瀹℃牳",
    role: "reviewer",
    status: "active"
  }
];

function defaultVersion(item) {
  return {
    versionId: "v_" + Date.now().toString(36),
    at: new Date().toISOString(),
    note: "鍒濆鍖栫増鏈?,
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
      detail: "鍒濆鍖栫珯鐐规暟鎹?
    }
  ];
}

const SEED_DATA = {
  meta: { schemaVersion: 2, updatedAt: new Date().toISOString() },
  profile: JSON.parse(JSON.stringify(DEFAULT_SITE_PROFILE)),
  seo: {
    home: { ...DEFAULT_SEO, title: "鑴遍渚犻泦鍥?| 瀹樻柟闂ㄦ埛 鈥?浜堜綘鏃犻鑷敱" },
    about: { ...DEFAULT_SEO, title: "鍏充簬鎴戜滑 | 鍗撳笇闆嗗洟" },
    news: { ...DEFAULT_SEO, title: "鏂伴椈涓績 | 鍗撳笇闆嗗洟" },
    products: { ...DEFAULT_SEO, title: "浜у搧涓績 | 鑴遍渚? },
    contact: { ...DEFAULT_SEO, title: "鑱旂郴鎴戜滑 | 鍗撳笇闆嗗洟" },
    privacy: { ...DEFAULT_SEO, title: "闅愮鏀跨瓥 | 鍗撳笇闆嗗洟" },
    terms: { ...DEFAULT_SEO, title: "浣跨敤鏉℃ | 鍗撳笇闆嗗洟" },
    careers: { ...DEFAULT_SEO, title: "鍔犲叆鎴戜滑 | 鍗撳笇闆嗗洟" }
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
      title: "鍝佺墝璁捐甯?,
      department: "鍝佺墝涓績",
      city: "涓婃捣",
      type: "鍏ㄨ亴",
      level: "涓骇",
      salary: "12k-20k",
      status: "published",
      responsibilities:
        "璐熻矗鍝佺墝涓昏瑙夈€佽惀閿€娲诲姩KV銆佸寘瑁呰瑙夊欢灞曪紝淇濋殰杈撳嚭璐ㄩ噺涓庡搧鐗屼竴鑷存€с€?,
      requirements:
        "3骞翠互涓婂搧鐗岃璁＄粡楠岋紝鐔熺粌浣跨敤涓绘祦璁捐杞欢锛屽叿澶囬鍝佽涓氱粡楠屼紭鍏堛€?,
      process: "绠€鍘嗙瓫閫?-> 涓撲笟闈㈣瘯 -> 缁堥潰 -> 鍙戞斁Offer",
      contactEmail: "hr@zhuoxi-hero.com",
      order: 1,
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: [],
      updatedAt: "2026-04-20T00:00:00.000Z",
      updatedBy: "system"
    },
    {
      id: "j2",
      title: "鍖哄煙娓犻亾缁忕悊",
      department: "娓犻亾鍙戝睍閮?,
      city: "鏉窞",
      type: "鍏ㄨ亴",
      level: "楂樼骇",
      salary: "18k-30k",
      status: "published",
      responsibilities:
        "璐熻矗鍖哄煙娓犻亾鎷撳睍銆佺粡閿€鍟嗙鐞嗕笌閿€鍞洰鏍囪揪鎴愶紝鎺ㄨ繘閲嶇偣椤圭洰钀藉湴銆?,
      requirements:
        "5骞翠互涓婂揩娑堟笭閬撶粡楠岋紝鍏峰澶у鎴锋嫇灞曡兘鍔涗笌鍥㈤槦鍗忓悓鑳藉姏銆?,
      process: "绠€鍘嗙瓫閫?-> 涓氬姟闈㈣瘯 -> 缁堥潰 -> 鑳岃皟",
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
      alt: "鑴遍渚犳嫑鐗岄浮鐖?,
      order: 1,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c2",
      src: "picture/椒麻鸡杂-自己修图.png",
      alt: "鑴遍渚犳楹婚浮鏉?,
      order: 2,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c3",
      src: "picture/IMG_20240723_193744 (09809270).jpg",
      alt: "鑴遍渚犵簿閫変骇鍝?,
      order: 3,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      versionHistory: []
    },
    {
      id: "c4",
      src: "picture/IMG_20240724_165402 (0EAECDD8).jpg",
      alt: "鑴遍渚犵郴鍒楀叏瀹剁",
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
      title: "鍗撳笇闆嗗洟鑽ｈ幏鈥滃勾搴︽渶鍏峰垱鏂伴浂椋熷搧鐗屸€濓紝杩炵画鍥涘勾浣嶅垪琛屼笟鍓嶅垪",
      category: "鍝佺墝璧勮",
      categoryKey: "brand",
      date: "2026.04.12",
      excerpt:
        "鍦ㄧ鍗佷簩灞婁腑鍥介鍝佸崥瑙堜細涓婏紝鍗撳笇鍑€熺嫭鏈夊伐鑹轰笌浜у搧鐭╅樀锛屽啀娆¤幏寰楄涓氬垱鏂板ぇ濂栥€?,
      detail:
        "鍦ㄧ鍗佷簩灞婁腑鍥介鍝佸崥瑙堜細涓婏紝鍗撳笇鍑€熷叾鐙湁鐨勫叆鍛冲伐鑹哄啀娆¤幏寰楄涓氬垱鏂板ぇ濂栥€傝瘎瀹″洟璁や负锛屽崜甯屽湪浜у搧鐮斿彂銆佷緵搴旈摼鏁村悎鍜屽搧鐗屽缓璁炬柟闈㈠舰鎴愪簡瀹屾暣鐨勭珵浜夊鍨掋€?,
      emoji: "馃弳",
      thumbClass: "thumb-amber",
      isFeatured: true,
      order: 1,
      status: "published",
      publishAt: "2026-04-12T08:00:00.000Z",
      seo: {
        title: "鍗撳笇闆嗗洟鍒涙柊澶у | 鏂伴椈涓績",
        description: "鍗撳笇闆嗗洟鑽ｈ幏骞村害鍒涙柊鍝佺墝澶у锛屾寔缁璺戞棤楠ㄩ浮鐖禌閬撱€?,
        keywords: "鍗撳笇,鍒涙柊澶у,鏂伴椈",
        ogImage: "hero4.png"
      },
      author: "鍝佺墝鍏叧閮?,
      source: "鍗撳笇闆嗗洟",
      tags: ["鍝佺墝", "琛屼笟濂栭」"],
      versionHistory: []
    },
    {
      id: "n2",
      slug: "distributor-conference-2026",
      title: "鍗撳笇鍏ㄧ悆鍒嗛攢鍟嗗ぇ浼氬渾婊¤惤骞曪紝500浣嶄紮浼村叡缁樿摑鍥?,
      category: "娲诲姩鎶ラ亾",
      categoryKey: "event",
      date: "2026.03.20",
      excerpt:
        "鏉ヨ嚜鍏ㄥ浗鍙婁笢鍗椾簹鐨勬牳蹇冨悎浣滀紮浼撮綈鑱氾紝鍙戝竷鍏ㄥ勾鏂板搧鐭╅樀涓庢笭閬撴斂绛栥€?,
      detail:
        "澶т細鍙戝竷浜?026骞村叏绾挎柊鍝佽矾绾垮浘锛屽苟鎺ㄥ嚭浜嗗叏鏂扮殑娓犻亾鍚堜綔婵€鍔辨斂绛栵紝瑕嗙洊绾夸笂鐢靛晢銆佺嚎涓嬪晢瓒呭強鏂伴浂鍞€?,
      emoji: "馃摚",
      thumbClass: "thumb-brick",
      isFeatured: true,
      order: 2,
      status: "published",
      publishAt: "2026-03-20T08:00:00.000Z",
      seo: {
        title: "鍗撳笇鍒嗛攢鍟嗗ぇ浼?| 鏂伴椈涓績",
        description: "鍗撳笇涓惧姙鍏ㄧ悆鍒嗛攢鍟嗗ぇ浼氾紝鍙戝竷2026鏂板搧涓庢笭閬撶瓥鐣ャ€?,
        keywords: "鍗撳笇,鍒嗛攢鍟嗗ぇ浼?娓犻亾",
        ogImage: "hero4.png"
      },
      author: "鍝佺墝鍏叧閮?,
      source: "鍗撳笇闆嗗洟",
      tags: ["娓犻亾", "澶т細"],
      versionHistory: []
    },
    {
      id: "n3",
      slug: "lab-2-online",
      title: "鑴遍瀹為獙瀹?.0涓婄嚎锛屾敾鍏嬪瑙︽劅椋庡懗鏂伴€昏緫",
      category: "浜у搧鐮斿彂",
      categoryKey: "product",
      date: "2026.02.15",
      excerpt: "鐮斿彂涓績鎵╁鍗囩骇锛岃仛鐒﹀瑙︽劅椋庡懗宸ョ▼銆?,
      detail:
        "鏂板疄楠屽閰嶅琛屼笟棰嗗厛璁惧锛岄噸鐐规帹杩涜蒋绯寲楠ㄤ笌寰澶嶉厤鎶€鏈紝涓烘柊鍝佽凯浠ｆ彁渚涚爺鍙戣兘鍔涙敮鎾戙€?,
      emoji: "馃敩",
      thumbClass: "thumb-blue",
      isFeatured: true,
      order: 3,
      status: "published",
      publishAt: "2026-02-15T08:00:00.000Z",
      seo: {
        title: "鑴遍瀹為獙瀹?.0涓婄嚎 | 鏂伴椈涓績",
        description: "鍗撳笇鍗囩骇鐮斿彂涓績锛屾寔缁帹杩涢鍛虫妧鏈垱鏂般€?,
        keywords: "鑴遍瀹為獙瀹?鐮斿彂,鍗撳笇",
        ogImage: "hero4.png"
      },
      author: "鐮斿彂涓績",
      source: "鍗撳笇闆嗗洟",
      tags: ["鐮斿彂", "瀹為獙瀹?],
      versionHistory: []
    }
  ],
  products: [
    {
      id: "p1",
      slug: "chuanshi-red-oil",
      name: "宸濋绾㈡补",
      flavor: "缁忓吀鐖嗘",
      categoryKey: "spicy",
      desc:
        "鐢勯€変紭璐ㄨ荆妞掍笌鑺辨锛屼互绉樺埗绾㈡补宸ヨ壓鍏ュ懗锛岄杈ｈ繃鐦俱€佸洖鍛崇坏闀裤€?,
      image: "川香红油.png",
      badge: "缁忓吀鐖嗘",
      specs: ["250g/琚?, "楹昏荆椴滈"],
      link: "https://www.taobao.com",
      order: 1,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      nutrition: "鑳介噺 1200kJ/100g锛岃泲鐧借川 18g/100g銆?,
      ingredients: "楦＄埅銆佹鐗╂补銆佽荆妞掋€佽姳妞掋€侀鐢ㄧ洂銆佺櫧鐮傜硸銆?,
      scenes: "杩藉墽銆佽仛浼氥€佸瀹?,
      faq: "寮€琚嬪嵆椋燂紝寤鸿鍐疯棌鍚庨鍛虫洿浣炽€?,
      seo: {
        title: "宸濋绾㈡补鏃犻楦＄埅 | 鍗撳笇浜у搧涓績",
        description: "鍗撳笇缁忓吀宸濋绾㈡补鍙ｅ懗锛岄杈ｉ矞棣欙紝鍥炲懗鍗佽冻銆?,
        keywords: "宸濋绾㈡补,鏃犻楦＄埅,鍗撳笇"
      },
      versionHistory: []
    },
    {
      id: "p2",
      slug: "sour-lemon",
      name: "閰歌荆鏌犳",
      flavor: "椴滅埥鍏ラ瓊",
      categoryKey: "sour",
      desc:
        "绮鹃€夋煚妾竻棣欎笌閰歌荆骞宠　宸ヨ壓锛屽叆鍙ｆ竻鐖斤紝閫傚悎澶忓鍜屾棩甯歌В鑵汇€?,
      image: "酸辣柠檬.png",
      badge: "椴滅埥鍏ラ瓊",
      specs: ["250g/琚?, "鏌犳閰歌荆"],
      link: "https://www.taobao.com",
      order: 2,
      status: "published",
      publishAt: "2026-04-20T00:00:00.000Z",
      nutrition: "鑳介噺 1100kJ/100g锛岃泲鐧借川 17g/100g銆?,
      ingredients: "楦＄埅銆佹煚妾眮銆佽荆妞掋€侀鐢ㄧ洂銆佺硸銆?,
      scenes: "鍔炲叕銆侀€氬嫟銆佸嚭娓?,
      faq: "寤鸿寮€灏佸悗灏藉揩椋熺敤銆?,
      seo: {
        title: "閰歌荆鏌犳鏃犻楦＄埅 | 鍗撳笇浜у搧涓績",
        description: "閰歌荆娓呯埥椋庡懗锛屽紑琚嬪嵆椋燂紝閫傚悎澶氬満鏅鐢ㄣ€?,
        keywords: "閰歌荆鏌犳,鏃犻楦＄埅,鍗撳笇"
      },
      versionHistory: []
    }
  ],
  legal: {
    privacy: {
      title: "闅愮鏀跨瓥",
      effectiveDate: "2026-04-20",
      content:
        "鎴戜滑浠呭湪鎻愪緵鏈嶅姟鎵€蹇呴渶鐨勮寖鍥村唴鏀堕泦鍜屼娇鐢ㄤ俊鎭€傛垜浠笉浼氬湪鏈粡鎺堟潈鐨勬儏鍐典笅鍚戠涓夋柟鍑哄敭鐢ㄦ埛涓汉淇℃伅銆?
    },
    terms: {
      title: "浣跨敤鏉℃",
      effectiveDate: "2026-04-20",
      content:
        "鏈綉绔欏唴瀹圭敤浜庡搧鐗屼俊鎭睍绀恒€傛湭缁忚鍙笉寰楁搮鑷浆杞姐€佸鍒舵垨鐢ㄤ簬鍟嗕笟鐢ㄩ€斻€?
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
    this.appendLog("AUTH_LOGIN", "auth", user.id, `${user.displayName} 鐧诲綍鍚庡彴`);
    return session;
  }

  logout() {
    const s = this.getSession();
    if (s && s.user) {
      this.appendLog("AUTH_LOGOUT", "auth", s.user.id, `${s.user.displayName} 閫€鍑哄悗鍙癭);
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
    this.appendLog("PROFILE_UPDATE", "profile", "profile", "鏇存柊绔欑偣鍩虹淇℃伅");
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
    this.appendLog("SEO_UPDATE", "seo", pageKey, `鏇存柊椤甸潰SEO: ${pageKey}`);
  }

  getSettings() {
    return this.getData().settings;
  }

  updateSettings(nextSettings) {
    const data = this.getData();
    data.settings = { ...data.settings, ...nextSettings };
    this.save();
    this.appendLog("SETTINGS_UPDATE", "settings", "settings", "鏇存柊绔欑偣璁剧疆");
  }

  getLegal() {
    return this.getData().legal;
  }

  updateLegal(key, payload) {
    const data = this.getData();
    data.legal = data.legal || {};
    data.legal[key] = { ...(data.legal[key] || {}), ...payload };
    this.save();
    this.appendLog("LEGAL_UPDATE", "legal", key, `鏇存柊娉曞緥鏉℃: ${key}`);
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

  getPublishedCarousel() {
    return this.getCarousel().filter(item => item.status === "published");
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
    this.appendLog(`${module.toUpperCase()}_${operation}`, module, nextItem.id, `淇濆瓨${module}鍐呭`);
    return nextItem;
  }

  deleteItem(module, id) {
    const data = this.getData();
    data[module] = ensureArray(data[module]).filter(item => item.id !== id);
    this.save();
    this.appendLog(`${module.toUpperCase()}_DELETE`, module, id, `鍒犻櫎${module}鍐呭`);
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
      this.appendLog("SYSTEM_IMPORT", "system", "root", "瀵煎叆绔欑偣鏁版嵁");
      return true;
    } catch (err) {
      console.error("Import failed:", err);
      return false;
    }
  }

  resetToDefault() {
    this._data = deepClone(SEED_DATA);
    this.save();
    this.appendLog("SYSTEM_RESET", "system", "root", "閲嶇疆涓洪粯璁ゆ暟鎹?);
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
