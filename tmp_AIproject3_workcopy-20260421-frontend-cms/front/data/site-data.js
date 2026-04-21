/**
 * Zhuoxi Site Data Center
 * Unified configurable data model for frontend + admin.
 */

const STORAGE_KEY = 'zhuoxi_site_data_v2';

function deepClone(value) {
    return JSON.parse(JSON.stringify(value));
}

function toSlug(input) {
    return String(input || '')
        .toLowerCase()
        .trim()
        .replace(/[\s_]+/g, '-')
        .replace(/[^a-z0-9-\u4e00-\u9fa5]/g, '')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function nowISO() {
    return new Date().toISOString();
}

function normalizeStatus(status) {
    const allowed = ['draft', 'review', 'published', 'archived'];
    return allowed.includes(status) ? status : 'published';
}

function isPublished(item) {
    return normalizeStatus(item?.status) === 'published';
}

const STATUS_LABELS = {
    draft: '草稿',
    review: '待审核',
    published: '已发布',
    archived: '已归档'
};

const ROLE_LABELS = {
    superAdmin: '超级管理员',
    editor: '编辑',
    viewer: '只读'
};

const CATEGORY_MAP = {
    brand: '品牌资讯',
    event: '活动报道',
    industry: '行业动态',
    global: '全球化',
    product: '产品研发'
};

const PRODUCT_CATEGORY_MAP = {
    all: '全部口味',
    spicy: '无骨系列',
    sour: '虎皮系列',
    fragrant: '老卤系列'
};

const SEED_DATA = {
    meta: {
        schemaVersion: 2,
        updatedAt: nowISO(),
        updatedBy: 'system'
    },
    auth: {
        users: [
            { id: 'u_admin', username: 'admin', password: 'admin123', role: 'superAdmin', name: '系统管理员' },
            { id: 'u_editor', username: 'editor', password: 'editor123', role: 'editor', name: '内容编辑' },
            { id: 'u_viewer', username: 'viewer', password: 'viewer123', role: 'viewer', name: '只读账号' }
        ],
        session: null
    },
    profile: {
        brandName: '卓希集团',
        brandNameEn: 'ZHUOXI GROUP',
        slogan: '全球鸡爪专家',
        heroBrandTitle: 'BONELESS MAN',
        heroBrandSubTitle: 'BRAND MANUAL',
        heroCalligraphyImage: 'hero_text.png',
        logo: 'brand_logo.png',
        logoAlt: '品牌 LOGO',
        navLogo: 'hero.png',
        navLogoAlt: '品牌标识',
        businessEmail: 'biz@zhuoxi-hero.com',
        hrEmail: 'hr@zhuoxi-hero.com',
        phone: '400-888-XXXX',
        companyName: '卓希食品科技有限公司',
        icp: '皖ICP备XXXXXXX号',
        sc: 'SCXXXXXXXXXXXX',
        social: {
            douyin: { icon: 'icon_douyin.png', url: 'https://www.douyin.com', qr: '微信图片_20260415143029_283_2.png' },
            xhs: { icon: 'icon_xhs.png', url: 'https://www.xiaohongshu.com', qr: '微信图片_20260415143029_283_2.png' },
            weibo: { icon: 'icon_weibo.png', url: 'https://weibo.com', qr: '微信图片_20260415143029_283_2.png' }
        }
    },
    seo: {
        pages: {
            index: {
                title: '卓希集团 | 官方门户',
                description: '卓希集团官方网站，聚焦无骨鸡爪产品与品牌创新。'
            },
            about: {
                title: '关于我们 | 卓希集团',
                description: '了解卓希集团的发展历程、企业文化与业务布局。'
            },
            news: {
                title: '新闻中心 | 卓希集团',
                description: '品牌资讯、行业动态、活动报道与产品研发新闻。'
            },
            products: {
                title: '产品中心 | 卓希集团',
                description: '浏览卓希集团无骨鸡爪产品矩阵与口味系列。'
            },
            contact: {
                title: '联系我们 | 卓希集团',
                description: '商务合作、招聘联系与渠道合作咨询。'
            },
            careers: {
                title: 'Join Us | ZHUOXI GROUP',
                description: 'View open roles and apply from this page.'
            },
            privacy: {
                title: '隐私政策 | 卓希集团',
                description: '卓希集团官网隐私政策说明。'
            },
            terms: {
                title: '使用条款 | 卓希集团',
                description: '卓希集团官网使用条款与免责声明。'
            }
        }
    },
    settings: {
        site: {
            defaultLocale: 'zh-CN',
            timezone: 'Asia/Shanghai',
            publicNewsPageSize: 6,
            publicProductPageSize: 9,
            showOnlyPublished: true
        },
        mediaBasePath: ''
    },
    legal: {
        privacyTitle: '隐私政策',
        privacyUpdatedAt: '2026-04-21',
        privacyContent: '我们重视并保护您的个人信息。您在本网站提交的信息仅用于商务联系与服务改进。',
        termsTitle: '使用条款',
        termsUpdatedAt: '2026-04-21',
        termsContent: '访问与使用本网站即表示您同意遵守相关法律法规与本条款约定。'
    },
    navigation: {
        topLinks: [
            { id: 'nav_index', label: '集团首页', href: 'index.html', key: 'index', order: 1, status: 'published' },
            { id: 'nav_about', label: '关于我们', href: 'about.html', key: 'about', order: 2, status: 'published' },
            { id: 'nav_news', label: '集团资讯', href: 'news.html', key: 'news', order: 3, status: 'published' },
            { id: 'nav_products', label: '产品介绍', href: 'products.html', key: 'products', order: 4, status: 'published' },
            { id: 'nav_contact', label: '联系我们', href: 'contact.html', key: 'contact', order: 5, status: 'published' },
            { id: 'nav_admin', label: '后台管理', href: 'admin.html', key: 'admin', order: 6, status: 'published' }
        ],
        externalLinks: [
            { id: 'ext_vn', label: '越南官网', href: 'https://gleeglee.zhuoxi.group/', order: 1, status: 'published' }
        ],
        footerGroups: [
            {
                id: 'f1',
                title: '了解卓希',
                order: 1,
                links: [
                    { label: '集团概况', href: 'about.html' },
                    { label: '发展历程', href: 'about.html#timeline' }
                ]
            },
            {
                id: 'f2',
                title: '新闻与产品',
                order: 2,
                links: [
                    { label: '媒体中心', href: 'news.html' },
                    { label: '主打产品', href: 'products.html' }
                ]
            },
            {
                id: 'f3',
                title: '合作与责任',
                order: 3,
                links: [
                    { label: '商务合作', href: 'contact.html' },
                    { label: '加入我们', href: 'careers.html' }
                ]
            }
        ]
    },
    pages: {
        index: {
            hero: {
                title: 'BONELESS MAN',
                subtitle: 'BRAND MANUAL',
                leftTagline: '全球鸡爪专家',
                rightTaglineTop: 'BONELESS',
                rightTaglineBottom: 'CHICKEN FEET',
                productSectionTitle: '核心爆品',
                productSectionDesc: '重新定义无骨鸡爪风味标准',
                productCTA: '浏览完整产品线',
                newsSectionTitle: '集团资讯'
            }
        },
        about: {
            hero: {
                eyebrow: 'ZHUOXI GROUP · EST. 2020',
                title: '卓希集团',
                titleHighlight: '全链路',
                subtitle: '国内首家无骨鸡爪全链路食品集团',
                image: 'factory.jpg'
            },
            kpis: [
                { id: 'k1', value: '20+', label: '覆盖省份', order: 1, status: 'published' },
                { id: 'k2', value: '20亿', label: '年GMV', order: 2, status: 'published' },
                { id: 'k3', value: '1亿', label: '累计热销（罐）', order: 3, status: 'published' },
                { id: 'k4', value: '200+', label: '专业员工', order: 4, status: 'published' }
            ],
            culture: [
                { id: 'c1', icon: '🎆', label: 'MISSION', title: '企业使命', body: '让每一份食品都成为放心的选择。', order: 1, status: 'published' },
                { id: 'c2', icon: '🔪', label: 'VISION', title: '发展愿景', body: '成为全球领先的肉制品专家。', order: 2, status: 'published' },
                { id: 'c3', icon: '🤵', label: 'VALUES', title: '核心价值观', body: '做实事、讲实话、守初心。', order: 3, status: 'published' }
            ],
            timeline: [
                { id: 't1', idx: '01', date: '2020.06', label: '建厂投产', title: '安徽工厂建成投产', body: '安徽现代化工厂正式建成投产。', badges: ['智能生产'], order: 1, status: 'published' },
                { id: 't2', idx: '02', date: '2021.10', label: '品牌上线', title: '脱骨侠品牌正式上线', body: '无骨鸡爪品类快速打开市场。', badges: ['无骨鸡爪'], order: 2, status: 'published' },
                { id: 't3', idx: '03', date: '2022.06', label: '集团化', title: '成立卓希食品', body: '整合品牌与渠道资源。', badges: ['集团化'], order: 3, status: 'published' }
            ]
        },
        products: {
            hero: {
                eyebrow: 'PREMIUM SHOWCASE',
                title: '大爆品带动',
                titleHighlight: '多品类矩阵',
                subtitle: '从经典柠檬到跨界联名，20+ 全线集结。',
                lineupImage: 'products_lineup.png'
            },
            ticker: [
                '18道 大师级脱骨工艺',
                '1.4亿 累计热销罐数',
                'No.1 全网销量冠军',
                '4连冠 全国销量第一',
                '20+ 爆款口味阵容',
                '14万吨 年产能全球第一'
            ],
            ctaTitle: '渠道合作 共赢未来',
            ctaDesc: '全系列产品现已在抖音、淘宝、京东全渠道开售。',
            ctaButton: '立即洽谈'
        },
        news: {
            headerEyebrow: 'MEDIA CENTER',
            headerTitle: '新闻中心',
            headerSubtitle: '品牌动态 · 行业洞察 · 企业资讯'
        },
        contact: {
            bizTitle: '商务合作',
            bizSubtitle: '全渠道合作 · 全球分销 · 媒体联系',
            careerTitle: '加入我们',
            careerDesc: '寻找敢于打破常规、有想法、做实事的同行者。',
            mascotImage: '喇叭脱脱.png',
            mascotAlt: '卓希吉祥物'
        },
        careers: {
            heroTitle: 'Join Us',
            heroDesc: 'We are looking for people who care about craft and execution.',
            sectionTitle: 'Open Positions',
            sectionDesc: 'The list below is synced from the admin careers module.',
            emptyText: 'No published positions yet.',
            applyPrefix: 'Apply',
            ctaLabel: 'Contact Business Team',
            ctaHref: 'contact.html#cooperative'
        }
    },
    modules: {
        carousel: [
            { id: 'ca1', src: 'IMG_20240724_193055 (08073368).jpg', alt: '轮播图1', order: 1, status: 'published' },
            { id: 'ca2', src: 'picture/椒麻鸡杂-自己修图.png', alt: '轮播图2', order: 2, status: 'published' },
            { id: 'ca3', src: 'picture/IMG_20240723_193744 (09809270).jpg', alt: '轮播图3', order: 3, status: 'published' }
        ],
        news: [
            {
                id: 'n1',
                slug: 'brand-innovation-award-2026',
                title: '集团荣获年度创新零食品牌',
                category: '品牌资讯',
                categoryKey: 'brand',
                date: '2026.04.12',
                excerpt: '凭借工艺创新与供应链能力，集团获得行业奖项。',
                detail: '在食品博览会上，卓希集团凭借产品创新能力获得年度创新奖。',
                emoji: '🏆',
                thumbClass: 'thumb-amber',
                isFeatured: true,
                coverImage: '',
                order: 1,
                status: 'published'
            },
            {
                id: 'n2',
                slug: 'global-distributor-conference-2026',
                title: '全球分销商大会圆满举行',
                category: '活动报道',
                categoryKey: 'event',
                date: '2026.03.20',
                excerpt: '与合作伙伴发布全年新品矩阵与渠道策略。',
                detail: '大会发布了 2026 年新品规划和渠道协同策略。',
                emoji: '📰',
                thumbClass: 'thumb-brick',
                isFeatured: true,
                coverImage: '',
                order: 2,
                status: 'published'
            },
            {
                id: 'n3',
                slug: 'lab-2-0-online',
                title: '脱骨实验室 2.0 正式上线',
                category: '产品研发',
                categoryKey: 'product',
                date: '2026.02.15',
                excerpt: '研发中心扩容，持续推进风味创新。',
                detail: '实验室完成扩建并导入自动化测试流程。',
                emoji: '🔬',
                thumbClass: 'thumb-blue',
                isFeatured: false,
                coverImage: '',
                order: 3,
                status: 'published'
            }
        ],
        products: [
            {
                id: 'p1',
                slug: 'chuanxiang-hongyou',
                name: '川香红油',
                flavor: '经典爆款',
                categoryKey: 'spicy',
                desc: '地道川味，香辣过瘾。',
                image: '川香红油.png',
                badge: '经典爆款',
                specs: ['250g/罐', '麻辣鲜香'],
                link: 'https://www.taobao.com/list/item/1009311407228.htm',
                heat: 4,
                bgClass: 'bg-red',
                order: 1,
                status: 'published'
            },
            {
                id: 'p2',
                slug: 'suanla-ningmeng',
                name: '酸辣柠檬',
                flavor: '鲜爽入魂',
                categoryKey: 'sour',
                desc: '清新果香，解腻神器。',
                image: '酸辣柠檬.png',
                badge: '鲜爽入魂',
                specs: ['250g/罐', '柠檬酸辣'],
                link: 'https://www.taobao.com/list/item/1009311407228.htm',
                heat: 2,
                bgClass: 'bg-lemon',
                order: 2,
                status: 'published'
            },
            {
                id: 'p3',
                slug: 'xiangla-paojiao',
                name: '香辣泡椒',
                flavor: '当家王牌',
                categoryKey: 'spicy',
                desc: '辣而不燥，回味悠长。',
                image: '香辣泡椒.png',
                badge: '当家王牌',
                specs: ['250g/罐', '泡椒香辣'],
                link: 'https://www.taobao.com/list/item/1009311407228.htm',
                heat: 5,
                bgClass: 'bg-spicy',
                order: 3,
                status: 'published'
            },
            {
                id: 'p4',
                slug: 'suanxiang-suantianla',
                name: '蒜香酸甜辣',
                flavor: '匠心工艺',
                categoryKey: 'fragrant',
                desc: '层次丰富，蒜香浓郁。',
                image: '蒜香酸甜辣.png',
                badge: '匠心工艺',
                specs: ['250g/罐', '蒜香复合'],
                link: 'https://www.taobao.com/list/item/1009311407228.htm',
                heat: 3,
                bgClass: 'bg-garlic',
                order: 4,
                status: 'published'
            }
        ],
        careers: [
            {
                id: 'job1',
                title: '品牌设计师',
                location: '合肥',
                type: '全职',
                summary: '负责品牌视觉与包装设计。',
                order: 1,
                status: 'published'
            }
        ]
    },
    workflow: {
        draftsEnabled: true,
        publishRequiresReview: false
    },
    logs: [],
    versions: []
};

class SiteDataManager {
    constructor() {
        this._data = null;
    }

    load() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) {
            this._data = deepClone(SEED_DATA);
            this._touchMeta('system');
            this.save();
            return this._data;
        }
        try {
            const parsed = JSON.parse(raw);
            this._data = this._migrate(parsed);
            this.save();
        } catch (error) {
            console.warn('SiteData load failed. Reset to seed.', error);
            this._data = deepClone(SEED_DATA);
            this._touchMeta('system');
            this.save();
        }
        return this._data;
    }

    save() {
        if (!this._data) this.load();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
    }

    getData() {
        if (!this._data) this.load();
        return this._data;
    }

    _touchMeta(user = 'system') {
        const data = this.getData();
        data.meta.updatedAt = nowISO();
        data.meta.updatedBy = user;
    }

    _appendLog(action, module, detail, user = 'system') {
        const data = this.getData();
        data.logs.unshift({
            id: SiteDataManager.generateId('log_'),
            action,
            module,
            detail,
            user,
            at: nowISO()
        });
        data.logs = data.logs.slice(0, 300);
    }

    _snapshot(reason = 'manual', user = 'system') {
        const data = this.getData();
        data.versions.unshift({
            id: SiteDataManager.generateId('ver_'),
            reason,
            user,
            createdAt: nowISO(),
            payload: deepClone({
                profile: data.profile,
                seo: data.seo,
                settings: data.settings,
                legal: data.legal,
                navigation: data.navigation,
                pages: data.pages,
                modules: data.modules
            })
        });
        data.versions = data.versions.slice(0, 50);
    }

    _migrate(oldData) {
        const merged = deepClone(SEED_DATA);
        if (!oldData || typeof oldData !== 'object') return merged;

        const hasV2 = oldData.meta && oldData.modules;
        if (hasV2) {
            const result = {
                ...merged,
                ...oldData,
                meta: {
                    ...merged.meta,
                    ...(oldData.meta || {}),
                    schemaVersion: 2
                },
                auth: {
                    ...merged.auth,
                    ...(oldData.auth || {})
                },
                profile: { ...merged.profile, ...(oldData.profile || {}) },
                seo: {
                    ...merged.seo,
                    ...(oldData.seo || {}),
                    pages: { ...merged.seo.pages, ...((oldData.seo || {}).pages || {}) }
                },
                settings: {
                    ...merged.settings,
                    ...(oldData.settings || {}),
                    site: { ...merged.settings.site, ...((oldData.settings || {}).site || {}) }
                },
                legal: { ...merged.legal, ...(oldData.legal || {}) },
                navigation: this._normalizeNavigation({
                    ...merged.navigation,
                    ...(oldData.navigation || {})
                }),
                pages: {
                    ...merged.pages,
                    ...(oldData.pages || {})
                },
                modules: {
                    carousel: this._normalizeItems(oldData.modules?.carousel || merged.modules.carousel, 'carousel'),
                    news: this._normalizeItems(oldData.modules?.news || merged.modules.news, 'news'),
                    products: this._normalizeItems(oldData.modules?.products || merged.modules.products, 'products'),
                    careers: this._normalizeItems(oldData.modules?.careers || merged.modules.careers, 'careers')
                },
                workflow: { ...merged.workflow, ...(oldData.workflow || {}) },
                logs: Array.isArray(oldData.logs) ? oldData.logs : [],
                versions: Array.isArray(oldData.versions) ? oldData.versions : []
            };
            return result;
        }

        const legacy = oldData;
        merged.modules.carousel = this._normalizeItems((legacy.carousel || []).map((item, idx) => ({
            id: item.id || SiteDataManager.generateId('ca'),
            src: item.src || '',
            alt: item.alt || '',
            order: item.order ?? idx + 1,
            status: 'published'
        })), 'carousel');

        merged.modules.news = this._normalizeItems((legacy.news || []).map((item, idx) => ({
            id: item.id || SiteDataManager.generateId('n'),
            slug: item.slug || toSlug(item.title || `news-${idx + 1}`),
            title: item.title || '',
            category: item.category || CATEGORY_MAP[item.categoryKey] || '品牌资讯',
            categoryKey: item.categoryKey || 'brand',
            date: item.date || '',
            excerpt: item.excerpt || '',
            detail: item.detail || '',
            emoji: item.emoji || '📰',
            thumbClass: item.thumbClass || 'thumb-amber',
            isFeatured: Boolean(item.isFeatured),
            coverImage: item.coverImage || '',
            order: item.order ?? idx + 1,
            status: 'published'
        })), 'news');

        merged.modules.products = this._normalizeItems((legacy.products || []).map((item, idx) => ({
            id: item.id || SiteDataManager.generateId('p'),
            slug: item.slug || toSlug(item.name || `product-${idx + 1}`),
            name: item.name || '',
            flavor: item.flavor || item.badge || '',
            categoryKey: item.categoryKey || 'all',
            desc: item.desc || '',
            image: item.image || '',
            badge: item.badge || '',
            specs: Array.isArray(item.specs) ? item.specs : [],
            link: item.link || '',
            heat: item.heat || 3,
            bgClass: item.bgClass || '',
            order: item.order ?? idx + 1,
            status: 'published'
        })), 'products');

        merged.navigation = this._normalizeNavigation(merged.navigation);
        return merged;
    }

    _normalizeNavigation(navigation) {
        const safeNav = {
            ...deepClone(SEED_DATA.navigation),
            ...(navigation || {})
        };
        const groups = Array.isArray(safeNav.footerGroups) ? safeNav.footerGroups : [];
        safeNav.footerGroups = groups.map((group) => {
            const links = Array.isArray(group.links) ? group.links : [];
            return {
                ...group,
                links: links.map((link) => {
                    if (link && link.href === 'contact.html#careers') {
                        return { ...link, href: 'careers.html' };
                    }
                    return link;
                })
            };
        });
        return safeNav;
    }

    _normalizeItems(items, module) {
        if (!Array.isArray(items)) return [];
        return items
            .map((item, idx) => {
                const cloned = { ...item };
                cloned.id = cloned.id || SiteDataManager.generateId(module.slice(0, 2));
                cloned.order = Number.isFinite(cloned.order) ? cloned.order : idx + 1;
                cloned.status = normalizeStatus(cloned.status || 'published');
                if (module === 'news') {
                    cloned.slug = cloned.slug || toSlug(cloned.title || cloned.id);
                    cloned.categoryKey = cloned.categoryKey || 'brand';
                    cloned.category = cloned.category || CATEGORY_MAP[cloned.categoryKey] || '品牌资讯';
                    cloned.thumbClass = cloned.thumbClass || 'thumb-amber';
                    cloned.emoji = cloned.emoji || '📰';
                    cloned.isFeatured = Boolean(cloned.isFeatured);
                }
                if (module === 'products') {
                    cloned.slug = cloned.slug || toSlug(cloned.name || cloned.id);
                    cloned.categoryKey = cloned.categoryKey || 'all';
                    cloned.specs = Array.isArray(cloned.specs) ? cloned.specs : [];
                    cloned.heat = Number.isFinite(cloned.heat) ? cloned.heat : 3;
                    cloned.bgClass = cloned.bgClass || '';
                }
                return cloned;
            })
            .sort((a, b) => a.order - b.order);
    }

    getProfile() {
        return this.getData().profile;
    }

    updateProfile(payload, user = 'system') {
        const data = this.getData();
        data.profile = { ...data.profile, ...payload };
        this._touchMeta(user);
        this._appendLog('update', 'profile', '更新站点资料', user);
        this._snapshot('update-profile', user);
        this.save();
    }

    getSeoPage(key) {
        return this.getData().seo.pages[key] || { title: '', description: '' };
    }

    updateSeoPage(key, payload, user = 'system') {
        const data = this.getData();
        data.seo.pages[key] = {
            ...(data.seo.pages[key] || {}),
            ...payload
        };
        this._touchMeta(user);
        this._appendLog('update', 'seo', `更新SEO: ${key}`, user);
        this._snapshot(`update-seo-${key}`, user);
        this.save();
    }

    getLegal() {
        return this.getData().legal;
    }

    updateLegal(payload, user = 'system') {
        const data = this.getData();
        data.legal = { ...data.legal, ...payload };
        this._touchMeta(user);
        this._appendLog('update', 'legal', '更新法务页面内容', user);
        this._snapshot('update-legal', user);
        this.save();
    }

    getNavigation() {
        return this.getData().navigation;
    }

    updateNavigation(payload, user = 'system') {
        const data = this.getData();
        data.navigation = this._normalizeNavigation({
            ...data.navigation,
            ...payload
        });
        this._touchMeta(user);
        this._appendLog('update', 'navigation', '更新导航与页脚', user);
        this._snapshot('update-navigation', user);
        this.save();
    }

    getPageConfig(pageKey) {
        return this.getData().pages[pageKey] || {};
    }

    updatePageConfig(pageKey, payload, user = 'system') {
        const data = this.getData();
        data.pages[pageKey] = {
            ...(data.pages[pageKey] || {}),
            ...payload
        };
        this._touchMeta(user);
        this._appendLog('update', `page:${pageKey}`, `更新页面配置 ${pageKey}`, user);
        this._snapshot(`update-page-${pageKey}`, user);
        this.save();
    }

    getModule(module, options = {}) {
        const data = this.getData();
        const items = data.modules[module] || [];
        const showOnlyPublished = options.publishedOnly ?? data.settings.site.showOnlyPublished;
        const normalized = this._normalizeItems(items, module);
        if (showOnlyPublished) {
            return normalized.filter(isPublished);
        }
        return normalized;
    }

    getModuleItem(module, id) {
        const items = this.getData().modules[module] || [];
        return items.find((item) => item.id === id) || null;
    }

    getModuleItemBySlug(module, slug) {
        const normalizedSlug = toSlug(slug);
        const items = this.getData().modules[module] || [];
        return items.find((item) => toSlug(item.slug) === normalizedSlug) || null;
    }

    saveModuleItem(module, payload, user = 'system') {
        const data = this.getData();
        if (!data.modules[module]) data.modules[module] = [];
        const items = data.modules[module];
        const id = payload.id || SiteDataManager.generateId(module.slice(0, 2));
        const idx = items.findIndex((item) => item.id === id);
        const normalizedPayload = { ...payload, id };
        if (module === 'news') {
            normalizedPayload.slug = toSlug(normalizedPayload.slug || normalizedPayload.title || id);
            normalizedPayload.categoryKey = normalizedPayload.categoryKey || 'brand';
            normalizedPayload.category = normalizedPayload.category || CATEGORY_MAP[normalizedPayload.categoryKey] || '品牌资讯';
            normalizedPayload.thumbClass = normalizedPayload.thumbClass || 'thumb-amber';
            normalizedPayload.emoji = normalizedPayload.emoji || '📰';
        }
        if (module === 'products') {
            normalizedPayload.slug = toSlug(normalizedPayload.slug || normalizedPayload.name || id);
            normalizedPayload.categoryKey = normalizedPayload.categoryKey || 'all';
            normalizedPayload.specs = Array.isArray(normalizedPayload.specs) ? normalizedPayload.specs : [];
            normalizedPayload.heat = Number.isFinite(normalizedPayload.heat) ? normalizedPayload.heat : 3;
        }
        normalizedPayload.status = normalizeStatus(normalizedPayload.status || 'draft');
        if (!Number.isFinite(normalizedPayload.order)) normalizedPayload.order = items.length + 1;
        if (idx >= 0) {
            items[idx] = { ...items[idx], ...normalizedPayload };
        } else {
            items.push(normalizedPayload);
        }
        data.modules[module] = this._normalizeItems(items, module);
        this._touchMeta(user);
        this._appendLog('save', module, `保存 ${module} 项 ${id}`, user);
        this._snapshot(`save-${module}`, user);
        this.save();
        return id;
    }

    deleteModuleItem(module, id, user = 'system') {
        const data = this.getData();
        const before = (data.modules[module] || []).length;
        data.modules[module] = (data.modules[module] || []).filter((item) => item.id !== id);
        if (data.modules[module].length !== before) {
            this._touchMeta(user);
            this._appendLog('delete', module, `删除 ${module} 项 ${id}`, user);
            this._snapshot(`delete-${module}`, user);
            this.save();
            return true;
        }
        return false;
    }

    updateModuleStatus(module, id, status, user = 'system') {
        const item = this.getModuleItem(module, id);
        if (!item) return false;
        item.status = normalizeStatus(status);
        this._touchMeta(user);
        this._appendLog('status', module, `状态更新 ${id} => ${item.status}`, user);
        this._snapshot(`status-${module}`, user);
        this.save();
        return true;
    }

    moveModuleItem(module, id, direction, user = 'system') {
        const items = this.getModule(module, { publishedOnly: false });
        const idx = items.findIndex((item) => item.id === id);
        const next = idx + direction;
        if (idx < 0 || next < 0 || next >= items.length) return false;
        const tmpOrder = items[idx].order;
        items[idx].order = items[next].order;
        items[next].order = tmpOrder;
        this.getData().modules[module] = this._normalizeItems(items, module);
        this._touchMeta(user);
        this._appendLog('sort', module, `排序调整 ${id}`, user);
        this._snapshot(`sort-${module}`, user);
        this.save();
        return true;
    }

    searchModule(module, query = '', options = {}) {
        const q = String(query || '').trim().toLowerCase();
        const page = Math.max(1, Number(options.page) || 1);
        const pageSize = Math.max(1, Number(options.pageSize) || 10);
        const status = options.status || 'all';
        const list = this.getModule(module, { publishedOnly: false }).filter((item) => {
            const statusMatch = status === 'all' ? true : normalizeStatus(item.status) === status;
            if (!statusMatch) return false;
            if (!q) return true;
            return Object.values(item).some((v) => String(v).toLowerCase().includes(q));
        });
        const total = list.length;
        const start = (page - 1) * pageSize;
        return {
            total,
            page,
            pageSize,
            items: list.slice(start, start + pageSize)
        };
    }

    getUsers() {
        return this.getData().auth.users || [];
    }

    getSession() {
        return this.getData().auth.session;
    }

    login(username, password) {
        const users = this.getUsers();
        const user = users.find((u) => u.username === username && u.password === password);
        if (!user) return null;
        this.getData().auth.session = {
            userId: user.id,
            username: user.username,
            role: user.role,
            name: user.name,
            loginAt: nowISO()
        };
        this._appendLog('auth', 'auth', `${username} 登录`, username);
        this.save();
        return this.getData().auth.session;
    }

    logout() {
        const session = this.getSession();
        this.getData().auth.session = null;
        this._appendLog('auth', 'auth', `${session?.username || 'unknown'} 退出`, 'system');
        this.save();
    }

    hasPermission(permission) {
        const session = this.getSession();
        const role = session?.role;
        if (!role) return false;
        const permissionMap = {
            superAdmin: ['read', 'write', 'publish', 'delete', 'settings', 'users'],
            editor: ['read', 'write', 'publish'],
            viewer: ['read']
        };
        return (permissionMap[role] || []).includes(permission);
    }

    getLogs(limit = 100) {
        return (this.getData().logs || []).slice(0, limit);
    }

    getVersions(limit = 20) {
        return (this.getData().versions || []).slice(0, limit);
    }

    restoreVersion(versionId, user = 'system') {
        const version = this.getData().versions.find((v) => v.id === versionId);
        if (!version?.payload) return false;
        const data = this.getData();
        data.profile = version.payload.profile;
        data.seo = version.payload.seo;
        data.settings = version.payload.settings;
        data.legal = version.payload.legal;
        data.navigation = version.payload.navigation;
        data.pages = version.payload.pages;
        data.modules = version.payload.modules;
        this._touchMeta(user);
        this._appendLog('restore', 'version', `恢复版本 ${versionId}`, user);
        this.save();
        return true;
    }

    exportJSON() {
        return JSON.stringify(this.getData(), null, 2);
    }

    importJSON(jsonString, user = 'system') {
        try {
            const parsed = JSON.parse(jsonString);
            this._data = this._migrate(parsed);
            this._touchMeta(user);
            this._appendLog('import', 'system', '导入站点数据', user);
            this._snapshot('import', user);
            this.save();
            return true;
        } catch (error) {
            console.error('Import failed:', error);
            return false;
        }
    }

    resetToDefault(user = 'system') {
        this._data = deepClone(SEED_DATA);
        this._touchMeta(user);
        this._appendLog('reset', 'system', '重置为默认数据', user);
        this._snapshot('reset', user);
        this.save();
    }

    getPublicNews() {
        return this.getModule('news', { publishedOnly: true });
    }

    getNews() {
        return this.getModule('news', { publishedOnly: false });
    }

    getFeaturedNews() {
        return this.getPublicNews().filter((item) => item.isFeatured);
    }

    getPublicProducts() {
        return this.getModule('products', { publishedOnly: true });
    }

    getProducts() {
        return this.getModule('products', { publishedOnly: false });
    }

    getPublicCarousel() {
        return this.getModule('carousel', { publishedOnly: true });
    }

    getCarousel() {
        return this.getModule('carousel', { publishedOnly: false });
    }

    getPublicCareers() {
        return this.getModule('careers', { publishedOnly: true });
    }

    getCareers() {
        return this.getModule('careers', { publishedOnly: false });
    }

    getNewsById(id) {
        return this.getModuleItem('news', id);
    }

    getProductById(id) {
        return this.getModuleItem('products', id);
    }

    getNewsBySlug(slug) {
        return this.getModuleItemBySlug('news', slug);
    }

    getProductBySlug(slug) {
        return this.getModuleItemBySlug('products', slug);
    }

    static generateId(prefix = 'id') {
        return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
    }
}

const siteData = new SiteDataManager();
window.SiteDataManager = SiteDataManager;
window.siteData = siteData;
window.STATUS_LABELS = STATUS_LABELS;
window.ROLE_LABELS = ROLE_LABELS;
window.CATEGORY_MAP = CATEGORY_MAP;
window.PRODUCT_CATEGORY_MAP = PRODUCT_CATEGORY_MAP;
window.toSlug = toSlug;
