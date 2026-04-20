/**
 * Zhuoxi Group — Site Data Manager
 * Shared data layer for admin config and frontend rendering.
 * Persists to localStorage, supports JSON import/export.
 */

const STORAGE_KEY = 'zhuoxi_site_data';

// ════════════════════════════════════
// SEED DATA — extracted from current hardcoded pages
// ════════════════════════════════════

const SEED_DATA = {
    carousel: [
        { id: 'c1', src: 'IMG_20240724_193055 (08073368).jpg', alt: '脱骨侠招牌鸡爪', order: 1 },
        { id: 'c2', src: 'picture/椒麻鸡杂-自己修图.png', alt: '脱骨侠椒麻鸡杂', order: 2 },
        { id: 'c3', src: 'picture/IMG_20240723_193744 (09809270).jpg', alt: '脱骨侠精选产品', order: 3 },
        { id: 'c4', src: 'picture/IMG_20240724_165402 (0EAECDD8).jpg', alt: '脱骨侠系列全家福', order: 4 }
    ],

    news: [
        {
            id: 'n1',
            title: '集团荣获"年度最具创新零食品牌"，脱骨侠连续四年销量第一',
            category: '品牌资讯',
            categoryKey: 'brand',
            date: '2026.04.12',
            excerpt: '在第十二届中国食品博览会上，卓希凭借独有的低温慢煮入味工艺及极致爽感产品矩阵，再度蝉联业界最高创新荣誉，成为无骨鸡爪赛道名副其实的行业标杆。',
            detail: '在第十二届食品博览会上，卓希凭借其独有的 18 道入味工艺再次蝉联全场最大规模创新大奖，确立无骨赛道绝对壁垒。评审团一致认为，卓希集团在产品研发、供应链整合、品牌建设三大维度均展现出行业领先水平。',
            emoji: '🏆',
            thumbClass: 'thumb-amber',
            isFeatured: true,
            order: 1
        },
        {
            id: 'n2',
            title: '卓希全球分销商大会圆满落幕，500位合作伙伴共绘蓝图',
            category: '活动报道',
            categoryKey: 'event',
            date: '2026.03.20',
            excerpt: '来自全国及东南亚的核心分销商齐聚，发布全年新品矩阵及渠道激励政策。',
            detail: '来自全国各地的 500 位核心合作伙伴齐聚一堂，共绘千亿级"无骨零食"商业蓝图。大会发布了2026年全线新品路线图，并推出全新的渠道合作激励政策，覆盖线上电商、线下商超、新零售等全渠道。',
            emoji: '🎤',
            thumbClass: 'thumb-brick',
            isFeatured: true,
            order: 2
        },
        {
            id: 'n3',
            title: '脱骨实验室 2.0 正式上线，攻克多触感风味新逻辑',
            category: '产品研发',
            categoryKey: 'product',
            date: '2026.02.15',
            excerpt: '研发中心再次扩容，千万级自动化实验室升级，新一代风味系统即将与消费者见面。',
            detail: '研发中心总面积扩容至万平，重点攻关"软糯化骨"与"微观复配"的多触感风味逻辑。新实验室配备了行业领先的风味分析设备和智能化生产模拟系统。',
            emoji: '🔬',
            thumbClass: 'thumb-blue',
            isFeatured: true,
            order: 3
        },
        {
            id: 'n4',
            title: '新年特供限量贺岁礼盒首发售罄，20万套抢空',
            category: '品牌资讯',
            categoryKey: 'brand',
            date: '2026.01.05',
            excerpt: '开创性推出全矩阵风味盲盒，受到一线城市年轻白领热烈追捧，首发当日即告售罄。',
            detail: '开创性推出全矩阵风味盲盒，受到一线城市年轻白领热烈追捧。礼盒涵盖全线6大口味，附赠限量版品牌周边，首发当日即告售罄，创下品牌单日销售新纪录。',
            emoji: '🎁',
            thumbClass: 'thumb-amber',
            isFeatured: false,
            order: 4
        },
        {
            id: 'n5',
            title: '越南 gleeglee 品牌及工厂正式落地，开启全球化运营',
            category: '全球化',
            categoryKey: 'global',
            date: '2025.12.12',
            excerpt: '与亚太最大商超形成战略同盟，集团全球输出按下快车道加速键。',
            detail: '越南 gleeglee 品牌及工厂正式落地，标志着卓希集团全球化战略迈出关键一步。与亚太最大商超形成战略同盟，集团全球输出按下快车道加速键。',
            emoji: '🌏',
            thumbClass: 'thumb-purple',
            isFeatured: false,
            order: 5
        },
        {
            id: 'n6',
            title: '安徽 70,000㎡超级工厂落成，全球鸡爪产能第一',
            category: '行业动态',
            categoryKey: 'industry',
            date: '2025.11.03',
            excerpt: '年产能达14万吨，成为全球最大规模鸡爪食品生产基地，树立行业生产新标准。',
            detail: '安徽超级工厂正式落成投产，总占地面积达70,000平方米，年产能高达14万吨，成为全球最大规模鸡爪食品生产基地。',
            emoji: '🏆',
            thumbClass: 'thumb-dark',
            isFeatured: false,
            order: 6
        },
        {
            id: 'n7',
            title: '卓希集团受邀参加 2025 中国食品工业博览会并发表主旨演讲',
            category: '活动报道',
            categoryKey: 'event',
            date: '2025.09.18',
            excerpt: '集团CEO分享"极致爽感"产品研发方法论，演讲视频全网播放量突破500万。',
            detail: '集团CEO在博览会上发表了题为"极致爽感——无骨鸡爪品类的创新方法论"的主旨演讲，分享了从原材料筛选到工艺创新的全链路思考。',
            emoji: '🎤',
            thumbClass: 'thumb-brick',
            isFeatured: false,
            order: 7
        },
        {
            id: 'n8',
            title: '三大国际认证落地，FSSC22000 · HACCP · ISO9001 全线覆盖',
            category: '产品研发',
            categoryKey: 'product',
            date: '2025.07.20',
            excerpt: '马商食品完成三大国际食品安全及质量管理体系认证，为全球化出口奠定合规基础。',
            detail: '马商食品完成FSSC22000、HACCP、ISO9001三大国际食品安全及质量管理体系认证，为全球化出口奠定了坚实的合规基础。',
            emoji: '🔬',
            thumbClass: 'thumb-blue',
            isFeatured: false,
            order: 8
        },
        {
            id: 'n9',
            title: '年销售额突破 20 亿，累计热销 5000 万罐刷新纪录',
            category: '品牌资讯',
            categoryKey: 'brand',
            date: '2025.06.01',
            excerpt: '连续两年蝉联全网无骨鸡爪销量第一，脱骨侠成为中国零食赛道超级品牌。',
            detail: '脱骨侠品牌年销售额突破20亿元人民币，累计热销超过5000万罐，连续两年蝉联全网无骨鸡爪销量第一。',
            emoji: '📈',
            thumbClass: 'thumb-green',
            isFeatured: false,
            order: 9
        }
    ],

    products: [
        {
            id: 'p1', name: '川香红油', flavor: '经典爆款',
            categoryKey: 'spicy',
            desc: '严选二荆条辣椒与汉源花椒，以秘制红油工艺入骨三分，辣而不燥，鲜香劲爽。',
            image: '川香红油.png', badge: '经典爆款',
            specs: ['250g/罐', '麻辣鲜香'],
            link: 'https://www.taobao.com/list/item/1009311407228.htm?spm=a21wu.11804641.shop-content.53.6b6132168kY1DJ',
            order: 1
        },
        {
            id: 'p2', name: '酸辣柠檬', flavor: '鲜爽入魂',
            categoryKey: 'sour',
            desc: '精选云南黄柠檬鲜榨汁，酸爽回味中隐藏着恰到好处的微辣刺激。',
            image: '麻辣藤椒.png', badge: '鲜爽入魂',
            specs: ['250g/罐', '藤椒鲜麻'],
            link: 'https://www.taobao.com/list/item/1009311407228.htm?spm=a21wu.11804641.shop-content.53.6b6132168kY1DJ',
            order: 2
        },
        {
            id: 'p3', name: '香辣泡椒', flavor: '当家王牌',
            categoryKey: 'spicy',
            desc: '传统四川泡椒工艺，爽辣酸香交织，开袋即食，停不下来。',
            image: '酸辣柠檬.png', badge: '当家王牌',
            specs: ['250g/罐', '柠檬酸辣'],
            link: 'https://www.taobao.com/list/item/1009311407228.htm?spm=a21wu.11804641.shop-content.53.6b6132168kY1DJ',
            order: 3
        },
        {
            id: 'p4', name: '蒜香酸甜辣', flavor: '匠心工艺',
            categoryKey: 'fragrant',
            desc: '低温油浸蒜蓉工艺，酸甜辣三重口感叠加，蒜香浓郁不刺鼻。',
            image: '蒜香酸甜辣.png', badge: '匠心工艺',
            specs: ['250g/罐', '蒜香复合'],
            link: 'https://www.taobao.com/list/item/1009311407228.htm?spm=a21wu.11804641.shop-content.53.6b6132168kY1DJ',
            order: 4
        },
        {
            id: 'p5', name: '香辣泡椒', flavor: '地道风味',
            desc: '爽利酸辣 · 回味无穷',
            image: '香辣泡椒.png', badge: '地道风味',
            specs: ['250g/罐', '泡椒风味'],
            link: 'https://www.taobao.com/list/item/1009311407228.htm?spm=a21wu.11804641.shop-content.53.6b6132168kY1DJ',
            order: 5
        }
    ]
};

// ════════════════════════════════════
// SiteDataManager
// ════════════════════════════════════

class SiteDataManager {
    constructor() {
        this._data = null;
    }

    /** Load data from localStorage, or seed if empty */
    load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (raw) {
                this._data = JSON.parse(raw);
                // Ensure all keys exist (migration safety)
                if (!this._data.carousel) this._data.carousel = SEED_DATA.carousel;
                if (!this._data.news) this._data.news = SEED_DATA.news;
                if (!this._data.products) this._data.products = SEED_DATA.products;
            } else {
                this._data = JSON.parse(JSON.stringify(SEED_DATA));
                this.save();
            }
        } catch (e) {
            console.warn('SiteDataManager: Failed to load, using seed data.', e);
            this._data = JSON.parse(JSON.stringify(SEED_DATA));
            this.save();
        }
        return this._data;
    }

    /** Save current data to localStorage */
    save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this._data));
        } catch (e) {
            console.error('SiteDataManager: Failed to save.', e);
        }
    }

    /** Get all data */
    getData() {
        if (!this._data) this.load();
        return this._data;
    }

    // ── Carousel ──
    getCarousel() { return this.getData().carousel.sort((a, b) => a.order - b.order); }
    
    saveCarouselItem(item) {
        const data = this.getData();
        const idx = data.carousel.findIndex(c => c.id === item.id);
        if (idx >= 0) data.carousel[idx] = item;
        else data.carousel.push(item);
        this.save();
    }
    
    deleteCarouselItem(id) {
        const data = this.getData();
        data.carousel = data.carousel.filter(c => c.id !== id);
        this.save();
    }

    // ── News ──
    getNews() { return this.getData().news.sort((a, b) => a.order - b.order); }
    getFeaturedNews() { return this.getNews().filter(n => n.isFeatured); }
    
    saveNewsItem(item) {
        const data = this.getData();
        const idx = data.news.findIndex(n => n.id === item.id);
        if (idx >= 0) data.news[idx] = item;
        else data.news.push(item);
        this.save();
    }
    
    deleteNewsItem(id) {
        const data = this.getData();
        data.news = data.news.filter(n => n.id !== id);
        this.save();
    }

    getNewsById(id) {
        return this.getData().news.find(n => n.id === id) || null;
    }

    // ── Products ──
    getProducts() { return this.getData().products.sort((a, b) => a.order - b.order); }
    
    saveProductItem(item) {
        const data = this.getData();
        const idx = data.products.findIndex(p => p.id === item.id);
        if (idx >= 0) data.products[idx] = item;
        else data.products.push(item);
        this.save();
    }
    
    deleteProductItem(id) {
        const data = this.getData();
        data.products = data.products.filter(p => p.id !== id);
        this.save();
    }

    // ── Import / Export / Reset ──
    exportJSON() {
        return JSON.stringify(this.getData(), null, 2);
    }

    importJSON(jsonString) {
        try {
            const parsed = JSON.parse(jsonString);
            if (parsed.carousel && parsed.news && parsed.products) {
                this._data = parsed;
                this.save();
                return true;
            }
            return false;
        } catch (e) {
            console.error('Import failed:', e);
            return false;
        }
    }

    resetToDefault() {
        this._data = JSON.parse(JSON.stringify(SEED_DATA));
        this.save();
    }

    /** Generate a unique ID */
    static generateId(prefix = 'x') {
        return prefix + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
    }
}

// Global instance
const siteData = new SiteDataManager();
