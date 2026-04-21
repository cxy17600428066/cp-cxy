/* global siteData, STATUS_LABELS, ROLE_LABELS, CATEGORY_MAP, PRODUCT_CATEGORY_MAP */

const AdminUI = {
    currentTab: 'dashboard',
    editing: { module: '', id: '' },
    queryState: {
        carousel: { q: '', status: 'all', page: 1, pageSize: 8 },
        news: { q: '', status: 'all', page: 1, pageSize: 8 },
        products: { q: '', status: 'all', page: 1, pageSize: 8 },
        careers: { q: '', status: 'all', page: 1, pageSize: 8 }
    },
    moduleConfig: {
        carousel: {
            titleField: 'alt',
            columns: [
                { key: 'alt', label: '标题' },
                { key: 'src', label: '资源' },
                { key: 'status', label: '状态', type: 'status' },
                { key: 'order', label: '排序' }
            ],
            fields: [
                { key: 'src', label: '图片路径', type: 'text', required: true },
                { key: 'alt', label: '图片描述', type: 'text', required: true },
                { key: 'order', label: '排序', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: ['draft', 'review', 'published', 'archived'] }
            ]
        },
        news: {
            titleField: 'title',
            columns: [
                { key: 'title', label: '标题' },
                { key: 'category', label: '分类' },
                { key: 'date', label: '日期' },
                { key: 'status', label: '状态', type: 'status' }
            ],
            fields: [
                { key: 'title', label: '新闻标题', type: 'text', required: true },
                { key: 'slug', label: 'URL 标识(slug)', type: 'text', required: true },
                { key: 'categoryKey', label: '分类', type: 'select', options: Object.keys(CATEGORY_MAP) },
                { key: 'date', label: '日期', type: 'text', required: true },
                { key: 'emoji', label: '封面图标(emoji)', type: 'text' },
                { key: 'thumbClass', label: '卡片色彩类', type: 'text' },
                { key: 'coverImage', label: '封面图(可选)', type: 'text' },
                { key: 'isFeatured', label: '头条推荐', type: 'checkbox' },
                { key: 'excerpt', label: '摘要', type: 'textarea', required: true },
                { key: 'detail', label: '详情正文', type: 'textarea', required: true },
                { key: 'order', label: '排序', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: ['draft', 'review', 'published', 'archived'] }
            ]
        },
        products: {
            titleField: 'name',
            columns: [
                { key: 'name', label: '产品名' },
                { key: 'categoryKey', label: '分类' },
                { key: 'badge', label: '标签' },
                { key: 'status', label: '状态', type: 'status' }
            ],
            fields: [
                { key: 'name', label: '产品名称', type: 'text', required: true },
                { key: 'slug', label: 'URL 标识(slug)', type: 'text', required: true },
                { key: 'flavor', label: '风味标签', type: 'text' },
                { key: 'badge', label: '角标', type: 'text' },
                { key: 'categoryKey', label: '分类', type: 'select', options: Object.keys(PRODUCT_CATEGORY_MAP) },
                { key: 'desc', label: '描述', type: 'textarea', required: true },
                { key: 'image', label: '图片路径', type: 'text', required: true },
                { key: 'link', label: '跳转链接', type: 'text' },
                { key: 'specs', label: '规格(每行一条)', type: 'array' },
                { key: 'heat', label: '辣度(1-5)', type: 'number' },
                { key: 'bgClass', label: '背景类名', type: 'text' },
                { key: 'order', label: '排序', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: ['draft', 'review', 'published', 'archived'] }
            ]
        },
        careers: {
            titleField: 'title',
            columns: [
                { key: 'title', label: '岗位' },
                { key: 'location', label: '地点' },
                { key: 'type', label: '类型' },
                { key: 'status', label: '状态', type: 'status' }
            ],
            fields: [
                { key: 'title', label: '岗位名称', type: 'text', required: true },
                { key: 'location', label: '工作地点', type: 'text', required: true },
                { key: 'type', label: '岗位类型', type: 'text', required: true },
                { key: 'summary', label: '岗位简介', type: 'textarea', required: true },
                { key: 'order', label: '排序', type: 'number' },
                { key: 'status', label: '状态', type: 'select', options: ['draft', 'review', 'published', 'archived'] }
            ]
        }
    },
    init() {
        siteData.load();
        this.bindAuth();
        this.bootstrapSession();
    },
    bootstrapSession() {
        const session = siteData.getSession();
        if (session) {
            this.showApp();
            this.bindAppEvents();
            this.renderAll();
        } else {
            this.showLogin();
        }
    },
    bindAuth() {
        const form = document.getElementById('login-form');
        if (!form) return;
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-username').value.trim();
            const password = document.getElementById('login-password').value.trim();
            const session = siteData.login(username, password);
            if (!session) {
                alert('账号或密码错误');
                return;
            }
            this.showApp();
            this.bindAppEvents();
            this.renderAll();
        });
    },
    bindAppEvents() {
        if (this._eventsBound) return;
        this._eventsBound = true;

        document.querySelectorAll('.admin-nav-item[data-tab]').forEach((btn) => {
            btn.addEventListener('click', () => this.switchTab(btn.getAttribute('data-tab')));
        });

        document.getElementById('btn-export').addEventListener('click', () => this.exportData());
        document.getElementById('btn-import-trigger').addEventListener('click', () => document.getElementById('import-file').click());
        document.getElementById('import-file').addEventListener('change', (e) => this.importData(e));
        document.getElementById('btn-reset').addEventListener('click', () => this.resetData());
        document.getElementById('btn-logout').addEventListener('click', () => this.logout());

        document.getElementById('add-carousel').addEventListener('click', () => this.openModuleModal('carousel'));
        document.getElementById('add-news').addEventListener('click', () => this.openModuleModal('news'));
        document.getElementById('add-product').addEventListener('click', () => this.openModuleModal('products'));
        document.getElementById('add-career').addEventListener('click', () => this.openModuleModal('careers'));

        document.getElementById('save-site-profile').addEventListener('click', () => this.saveSiteProfile());
        document.getElementById('save-seo').addEventListener('click', () => this.saveSeo());
        document.getElementById('save-navigation').addEventListener('click', () => this.saveNavigation());
        document.getElementById('save-pages').addEventListener('click', () => this.savePages());
        document.getElementById('save-legal').addEventListener('click', () => this.saveLegal());
        document.getElementById('save-workflow').addEventListener('click', () => this.saveWorkflow());
    },
    showLogin() {
        document.getElementById('admin-auth').classList.remove('admin-hidden');
        document.getElementById('admin-app').classList.add('admin-hidden');
    },
    showApp() {
        document.getElementById('admin-auth').classList.add('admin-hidden');
        document.getElementById('admin-app').classList.remove('admin-hidden');
    },
    switchTab(tab) {
        this.currentTab = tab;
        document.querySelectorAll('.admin-nav-item[data-tab]').forEach((btn) => {
            btn.classList.toggle('active', btn.getAttribute('data-tab') === tab);
        });
        document.querySelectorAll('.admin-tab-content').forEach((sec) => {
            sec.classList.toggle('active', sec.id === `tab-${tab}`);
        });
        if (tab === 'logs') this.renderLogs();
        if (tab === 'versions') this.renderVersions();
    },
    getSession() {
        return siteData.getSession();
    },
    can(permission) {
        return siteData.hasPermission(permission);
    },
    safeText(value) {
        return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        }[ch]));
    },
    statusTag(status) {
        return `<span class="admin-tag tag-${status}">${STATUS_LABELS[status] || status}</span>`;
    },
    renderAll() {
        this.renderDashboard();
        this.renderSiteProfile();
        this.renderSeo();
        this.renderNavigation();
        this.renderPages();
        this.renderLegal();
        this.renderWorkflow();
        this.renderModule('carousel', 'carousel-module');
        this.renderModule('news', 'news-module');
        this.renderModule('products', 'products-module');
        this.renderModule('careers', 'careers-module');
        this.renderLogs();
        this.renderVersions();
        this.applyPermissionUI();
    },
    applyPermissionUI() {
        const writable = this.can('write');
        const publishable = this.can('publish');
        const settingable = this.can('settings');
        const toggles = [
            ['#add-carousel', writable],
            ['#add-news', writable],
            ['#add-product', writable],
            ['#add-career', writable],
            ['#save-site-profile', settingable],
            ['#save-seo', settingable],
            ['#save-navigation', settingable],
            ['#save-pages', settingable],
            ['#save-legal', settingable],
            ['#save-workflow', publishable],
            ['#btn-import-trigger', settingable],
            ['#btn-reset', settingable]
        ];
        toggles.forEach(([selector, enabled]) => {
            const el = document.querySelector(selector);
            if (el) el.disabled = !enabled;
        });
    },
    renderDashboard() {
        const root = document.getElementById('dashboard-cards');
        const data = siteData.getData();
        const session = this.getSession();
        const cards = [
            { label: '当前登录', value: `${session?.name || '-'}（${ROLE_LABELS[session?.role] || '-' }）` },
            { label: '轮播内容', value: data.modules.carousel.length },
            { label: '新闻内容', value: data.modules.news.length },
            { label: '产品内容', value: data.modules.products.length },
            { label: '招聘岗位', value: data.modules.careers.length },
            { label: '最近更新', value: new Date(data.meta.updatedAt).toLocaleString('zh-CN') }
        ];
        root.innerHTML = cards.map((c) => `
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">${this.safeText(c.label)}</div>
                    <div style="font-size:22px;font-weight:900;margin-top:8px;">${this.safeText(c.value)}</div>
                </div>
            </div>
        `).join('');
    },
    renderSiteProfile() {
        const profile = siteData.getProfile();
        const root = document.getElementById('site-profile-form');
        root.innerHTML = `
            ${this.kvInput('品牌中文名', 'f_brandName', profile.brandName)}
            ${this.kvInput('品牌英文名', 'f_brandNameEn', profile.brandNameEn)}
            ${this.kvInput('Slogan', 'f_slogan', profile.slogan)}
            ${this.kvInput('商务邮箱', 'f_businessEmail', profile.businessEmail)}
            ${this.kvInput('招聘邮箱', 'f_hrEmail', profile.hrEmail)}
            ${this.kvInput('联系电话', 'f_phone', profile.phone)}
            ${this.kvInput('公司名称', 'f_companyName', profile.companyName)}
            ${this.kvInput('ICP备案号', 'f_icp', profile.icp)}
            ${this.kvInput('SC 编号', 'f_sc', profile.sc)}
            ${this.kvInput('导航 Logo', 'f_navLogo', profile.navLogo)}
            ${this.kvInput('页脚 Logo', 'f_logo', profile.logo)}
        `;
    },
    saveSiteProfile() {
        if (!this.can('settings')) return alert('无权限');
        siteData.updateProfile({
            brandName: this.val('f_brandName'),
            brandNameEn: this.val('f_brandNameEn'),
            slogan: this.val('f_slogan'),
            businessEmail: this.val('f_businessEmail'),
            hrEmail: this.val('f_hrEmail'),
            phone: this.val('f_phone'),
            companyName: this.val('f_companyName'),
            icp: this.val('f_icp'),
            sc: this.val('f_sc'),
            navLogo: this.val('f_navLogo'),
            logo: this.val('f_logo')
        }, this.getSession()?.username || 'system');
        this.renderAll();
        alert('站点资料已保存');
    },
    renderSeo() {
        const pages = siteData.getData().seo.pages;
        const keys = Object.keys(pages);
        const root = document.getElementById('seo-form');
        root.innerHTML = keys.map((key) => `
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">${this.safeText(key)} 页面</div>
                    <div class="admin-kv"><label>Title</label><input id="seo_${key}_title" class="admin-input" value="${this.safeText(pages[key].title)}"></div>
                    <div class="admin-kv"><label>Description</label><textarea id="seo_${key}_desc" class="admin-textarea" rows="3">${this.safeText(pages[key].description)}</textarea></div>
                </div>
            </div>
        `).join('');
    },
    saveSeo() {
        if (!this.can('settings')) return alert('无权限');
        const pages = siteData.getData().seo.pages;
        Object.keys(pages).forEach((key) => {
            siteData.updateSeoPage(key, {
                title: this.val(`seo_${key}_title`),
                description: this.val(`seo_${key}_desc`)
            }, this.getSession()?.username || 'system');
        });
        alert('SEO 已保存');
    },
    renderNavigation() {
        const nav = siteData.getNavigation();
        const root = document.getElementById('navigation-form');
        root.innerHTML = `
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">顶部导航(JSON)</div>
                    <textarea id="nav_topLinks" class="admin-textarea" rows="8">${this.safeText(JSON.stringify(nav.topLinks, null, 2))}</textarea>
                </div>
            </div>
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">外部链接(JSON)</div>
                    <textarea id="nav_externalLinks" class="admin-textarea" rows="6">${this.safeText(JSON.stringify(nav.externalLinks, null, 2))}</textarea>
                </div>
            </div>
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">页脚分组(JSON)</div>
                    <textarea id="nav_footerGroups" class="admin-textarea" rows="10">${this.safeText(JSON.stringify(nav.footerGroups, null, 2))}</textarea>
                </div>
            </div>
        `;
    },
    saveNavigation() {
        if (!this.can('settings')) return alert('无权限');
        try {
            const topLinks = JSON.parse(this.val('nav_topLinks'));
            const externalLinks = JSON.parse(this.val('nav_externalLinks'));
            const footerGroups = JSON.parse(this.val('nav_footerGroups'));
            siteData.updateNavigation({ topLinks, externalLinks, footerGroups }, this.getSession()?.username || 'system');
            this.renderAll();
            alert('导航页脚已保存');
        } catch (e) {
            alert('JSON 格式错误，请检查后重试');
        }
    },
    renderPages() {
        const pages = siteData.getData().pages;
        const root = document.getElementById('pages-form');
        root.innerHTML = `
            ${this.pageJsonCard('首页(index)', 'pages_index', pages.index)}
            ${this.pageJsonCard('关于页(about)', 'pages_about', pages.about)}
            ${this.pageJsonCard('新闻页(news)', 'pages_news', pages.news)}
            ${this.pageJsonCard('产品页(products)', 'pages_products', pages.products)}
            ${this.pageJsonCard('联系页(contact)', 'pages_contact', pages.contact)}
        `;
    },
    savePages() {
        if (!this.can('settings')) return alert('无权限');
        try {
            siteData.updatePageConfig('index', JSON.parse(this.val('pages_index')), this.getSession()?.username || 'system');
            siteData.updatePageConfig('about', JSON.parse(this.val('pages_about')), this.getSession()?.username || 'system');
            siteData.updatePageConfig('news', JSON.parse(this.val('pages_news')), this.getSession()?.username || 'system');
            siteData.updatePageConfig('products', JSON.parse(this.val('pages_products')), this.getSession()?.username || 'system');
            siteData.updatePageConfig('contact', JSON.parse(this.val('pages_contact')), this.getSession()?.username || 'system');
            this.renderAll();
            alert('页面配置已保存');
        } catch (e) {
            alert('页面配置 JSON 格式错误');
        }
    },
    renderLegal() {
        const legal = siteData.getLegal();
        const root = document.getElementById('legal-form');
        root.innerHTML = `
            <div class="admin-card"><div class="admin-card-body">
                ${this.kvInput('隐私政策标题', 'legal_privacyTitle', legal.privacyTitle)}
                ${this.kvInput('隐私更新时间', 'legal_privacyUpdatedAt', legal.privacyUpdatedAt)}
                <div class="admin-kv"><label>隐私正文</label><textarea id="legal_privacyContent" class="admin-textarea" rows="8">${this.safeText(legal.privacyContent)}</textarea></div>
            </div></div>
            <div class="admin-card"><div class="admin-card-body">
                ${this.kvInput('使用条款标题', 'legal_termsTitle', legal.termsTitle)}
                ${this.kvInput('条款更新时间', 'legal_termsUpdatedAt', legal.termsUpdatedAt)}
                <div class="admin-kv"><label>条款正文</label><textarea id="legal_termsContent" class="admin-textarea" rows="8">${this.safeText(legal.termsContent)}</textarea></div>
            </div></div>
        `;
    },
    saveLegal() {
        if (!this.can('settings')) return alert('无权限');
        siteData.updateLegal({
            privacyTitle: this.val('legal_privacyTitle'),
            privacyUpdatedAt: this.val('legal_privacyUpdatedAt'),
            privacyContent: this.val('legal_privacyContent'),
            termsTitle: this.val('legal_termsTitle'),
            termsUpdatedAt: this.val('legal_termsUpdatedAt'),
            termsContent: this.val('legal_termsContent')
        }, this.getSession()?.username || 'system');
        this.renderAll();
        alert('法务内容已保存');
    },
    renderWorkflow() {
        const workflow = siteData.getData().workflow;
        const settings = siteData.getData().settings.site;
        const root = document.getElementById('workflow-form');
        root.innerHTML = `
            <div class="admin-card"><div class="admin-card-body">
                <div class="admin-kv">
                    <label>启用草稿流</label>
                    <input id="wf_draftsEnabled" type="checkbox" ${workflow.draftsEnabled ? 'checked' : ''}>
                </div>
                <div class="admin-kv">
                    <label>发布需审核</label>
                    <input id="wf_publishRequiresReview" type="checkbox" ${workflow.publishRequiresReview ? 'checked' : ''}>
                </div>
                <div class="admin-kv">
                    <label>前台仅展示已发布</label>
                    <input id="wf_showOnlyPublished" type="checkbox" ${settings.showOnlyPublished ? 'checked' : ''}>
                </div>
                <div class="admin-kv">
                    <label>新闻每页数量</label>
                    <input id="wf_publicNewsPageSize" class="admin-input" type="number" value="${settings.publicNewsPageSize}">
                </div>
                <div class="admin-kv">
                    <label>产品每页数量</label>
                    <input id="wf_publicProductPageSize" class="admin-input" type="number" value="${settings.publicProductPageSize}">
                </div>
            </div></div>
        `;
    },
    saveWorkflow() {
        if (!this.can('publish')) return alert('无权限');
        const data = siteData.getData();
        data.workflow = {
            draftsEnabled: document.getElementById('wf_draftsEnabled').checked,
            publishRequiresReview: document.getElementById('wf_publishRequiresReview').checked
        };
        data.settings.site = {
            ...data.settings.site,
            showOnlyPublished: document.getElementById('wf_showOnlyPublished').checked,
            publicNewsPageSize: Number(document.getElementById('wf_publicNewsPageSize').value) || 6,
            publicProductPageSize: Number(document.getElementById('wf_publicProductPageSize').value) || 9
        };
        siteData.save();
        this.renderAll();
        alert('发布流程已保存');
    },
    renderModule(module, rootId) {
        const root = document.getElementById(rootId);
        const conf = this.moduleConfig[module];
        const state = this.queryState[module];
        const result = siteData.searchModule(module, state.q, {
            page: state.page,
            pageSize: state.pageSize,
            status: state.status
        });

        root.innerHTML = `
            <div class="admin-list-toolbar">
                <input id="${module}_q" class="admin-input" placeholder="搜索标题/关键词" value="${this.safeText(state.q)}">
                <select id="${module}_status" class="admin-select">
                    ${['all', 'draft', 'review', 'published', 'archived'].map((s) => `<option value="${s}" ${state.status === s ? 'selected' : ''}>${s === 'all' ? '全部状态' : (STATUS_LABELS[s] || s)}</option>`).join('')}
                </select>
                <select id="${module}_pageSize" class="admin-select">
                    ${[8, 12, 20].map((n) => `<option value="${n}" ${state.pageSize === n ? 'selected' : ''}>每页 ${n} 条</option>`).join('')}
                </select>
                <button class="btn-admin btn-admin-ghost" id="${module}_query">查询</button>
            </div>
            <div class="admin-list-table">
                <div class="admin-row header">
                    ${conf.columns.map((c) => `<div>${this.safeText(c.label)}</div>`).join('')}
                    <div style="text-align:right;">操作</div>
                </div>
                ${result.items.map((item) => this.renderModuleRow(module, item)).join('')}
            </div>
            <div class="admin-pager">
                <button class="btn-admin btn-admin-ghost" id="${module}_prev" ${result.page <= 1 ? 'disabled' : ''}>上一页</button>
                <span>第 ${result.page} / ${Math.max(1, Math.ceil(result.total / result.pageSize))} 页（共 ${result.total} 条）</span>
                <button class="btn-admin btn-admin-ghost" id="${module}_next" ${result.page >= Math.ceil(result.total / result.pageSize) ? 'disabled' : ''}>下一页</button>
            </div>
        `;

        document.getElementById(`${module}_query`).addEventListener('click', () => {
            this.queryState[module].q = this.val(`${module}_q`);
            this.queryState[module].status = this.val(`${module}_status`);
            this.queryState[module].pageSize = Number(this.val(`${module}_pageSize`)) || 8;
            this.queryState[module].page = 1;
            this.renderModule(module, rootId);
        });
        document.getElementById(`${module}_prev`).addEventListener('click', () => {
            this.queryState[module].page = Math.max(1, this.queryState[module].page - 1);
            this.renderModule(module, rootId);
        });
        document.getElementById(`${module}_next`).addEventListener('click', () => {
            this.queryState[module].page += 1;
            this.renderModule(module, rootId);
        });

        root.querySelectorAll(`[data-edit-module="${module}"]`).forEach((btn) => {
            btn.addEventListener('click', () => this.openModuleModal(module, btn.getAttribute('data-id')));
        });
        root.querySelectorAll(`[data-del-module="${module}"]`).forEach((btn) => {
            btn.addEventListener('click', () => this.deleteModuleItem(module, btn.getAttribute('data-id')));
        });
        root.querySelectorAll(`[data-up-module="${module}"]`).forEach((btn) => {
            btn.addEventListener('click', () => this.moveModuleItem(module, btn.getAttribute('data-id'), -1));
        });
        root.querySelectorAll(`[data-down-module="${module}"]`).forEach((btn) => {
            btn.addEventListener('click', () => this.moveModuleItem(module, btn.getAttribute('data-id'), 1));
        });
    },
    renderModuleRow(module, item) {
        const conf = this.moduleConfig[module];
        const cells = conf.columns.map((c) => {
            const value = item[c.key];
            if (c.type === 'status') return `<div>${this.statusTag(item.status)}</div>`;
            return `<div>${this.safeText(value)}</div>`;
        }).join('');
        const disabled = this.can('write') ? '' : 'disabled';
        return `
            <div class="admin-row">
                ${cells}
                <div class="admin-actions-inline">
                    <button class="order-btn" data-up-module="${module}" data-id="${item.id}" ${disabled}>↑</button>
                    <button class="order-btn" data-down-module="${module}" data-id="${item.id}" ${disabled}>↓</button>
                    <button class="btn-admin btn-admin-sm btn-admin-ghost" data-edit-module="${module}" data-id="${item.id}" ${disabled}>编辑</button>
                    <button class="btn-admin btn-admin-sm btn-admin-danger" data-del-module="${module}" data-id="${item.id}" ${disabled}>删除</button>
                </div>
            </div>
        `;
    },
    openModuleModal(module, id = '') {
        if (!this.can('write')) return alert('无权限');
        this.editing = { module, id };
        const conf = this.moduleConfig[module];
        const existing = id ? siteData.getModuleItem(module, id) : null;
        const title = id ? `编辑${module}项` : `新增${module}项`;
        document.getElementById('module-modal-title').textContent = title;

        const form = document.getElementById('module-form');
        form.innerHTML = `
            <input type="hidden" id="m_id" value="${this.safeText(existing?.id || '')}">
            ${conf.fields.map((f) => this.renderField(f, existing)).join('')}
            <div class="admin-modal-footer">
                <button type="button" class="btn-admin btn-admin-ghost" onclick="window.AdminUI.closeModuleModal()">取消</button>
                <button type="submit" class="btn-admin btn-admin-primary">保存</button>
            </div>
        `;
        form.onsubmit = (e) => this.submitModuleForm(e);
        document.getElementById('module-modal').classList.add('active');
    },
    renderField(field, existing) {
        const v = existing ? existing[field.key] : '';
        if (field.type === 'textarea') {
            return `<div class="admin-form-group"><label>${field.label}</label><textarea id="m_${field.key}" class="admin-textarea" rows="4" ${field.required ? 'required' : ''}>${this.safeText(v || '')}</textarea></div>`;
        }
        if (field.type === 'number') {
            return `<div class="admin-form-group"><label>${field.label}</label><input id="m_${field.key}" class="admin-input" type="number" value="${Number(v ?? 0)}"></div>`;
        }
        if (field.type === 'select') {
            return `<div class="admin-form-group"><label>${field.label}</label><select id="m_${field.key}" class="admin-select">${field.options.map((opt) => `<option value="${opt}" ${(String(v) === String(opt)) ? 'selected' : ''}>${this.safeText(opt)}</option>`).join('')}</select></div>`;
        }
        if (field.type === 'checkbox') {
            return `<div class="admin-form-group"><label><input id="m_${field.key}" type="checkbox" ${v ? 'checked' : ''}> ${field.label}</label></div>`;
        }
        if (field.type === 'array') {
            const joined = Array.isArray(v) ? v.join('\n') : '';
            return `<div class="admin-form-group"><label>${field.label}</label><textarea id="m_${field.key}" class="admin-textarea" rows="4">${this.safeText(joined)}</textarea></div>`;
        }
        return `<div class="admin-form-group"><label>${field.label}</label><input id="m_${field.key}" class="admin-input" type="text" value="${this.safeText(v || '')}" ${field.required ? 'required' : ''}></div>`;
    },
    submitModuleForm(e) {
        e.preventDefault();
        const { module } = this.editing;
        const conf = this.moduleConfig[module];
        const payload = { id: this.val('m_id') || undefined };
        conf.fields.forEach((field) => {
            const id = `m_${field.key}`;
            const el = document.getElementById(id);
            if (!el) return;
            if (field.type === 'checkbox') {
                payload[field.key] = el.checked;
                return;
            }
            if (field.type === 'number') {
                payload[field.key] = Number(el.value) || 0;
                return;
            }
            if (field.type === 'array') {
                payload[field.key] = (el.value || '').split('\n').map((s) => s.trim()).filter(Boolean);
                return;
            }
            payload[field.key] = el.value.trim();
        });
        if (module === 'news') {
            payload.category = CATEGORY_MAP[payload.categoryKey] || payload.categoryKey;
        }
        if (module === 'products' && !payload.specs) payload.specs = [];
        siteData.saveModuleItem(module, payload, this.getSession()?.username || 'system');
        this.closeModuleModal();
        this.renderModule(module, `${module}-module`);
        this.renderDashboard();
    },
    closeModuleModal() {
        document.getElementById('module-modal').classList.remove('active');
        this.editing = { module: '', id: '' };
    },
    deleteModuleItem(module, id) {
        if (!this.can('delete') && !this.can('write')) return alert('无权限');
        if (!confirm('确认删除该内容？')) return;
        siteData.deleteModuleItem(module, id, this.getSession()?.username || 'system');
        this.renderModule(module, `${module}-module`);
        this.renderDashboard();
    },
    moveModuleItem(module, id, direction) {
        if (!this.can('write')) return alert('无权限');
        siteData.moveModuleItem(module, id, direction, this.getSession()?.username || 'system');
        this.renderModule(module, `${module}-module`);
    },
    renderLogs() {
        const logs = siteData.getLogs(120);
        const root = document.getElementById('logs-list');
        if (!logs.length) {
            root.innerHTML = '<div class="admin-empty"><h4>暂无日志</h4></div>';
            return;
        }
        root.innerHTML = logs.map((log) => `
            <div class="admin-log-item">
                <div>
                    <div style="font-weight:700;">${this.safeText(log.action)} · ${this.safeText(log.module)}</div>
                    <div style="font-size:13px;color:var(--admin-text-muted);margin-top:4px;">${this.safeText(log.detail)}</div>
                </div>
                <div style="text-align:right;">
                    <div style="font-size:12px;color:var(--admin-text-muted);">${this.safeText(log.user)}</div>
                    <div style="font-size:12px;color:var(--admin-text-muted);">${new Date(log.at).toLocaleString('zh-CN')}</div>
                </div>
            </div>
        `).join('');
    },
    renderVersions() {
        const versions = siteData.getVersions(40);
        const root = document.getElementById('versions-list');
        if (!versions.length) {
            root.innerHTML = '<div class="admin-empty"><h4>暂无快照</h4></div>';
            return;
        }
        root.innerHTML = versions.map((ver) => `
            <div class="admin-log-item">
                <div>
                    <div style="font-weight:700;">${this.safeText(ver.reason || 'snapshot')}</div>
                    <div style="font-size:13px;color:var(--admin-text-muted);margin-top:4px;">${this.safeText(ver.id)}</div>
                </div>
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:12px;color:var(--admin-text-muted);">${new Date(ver.createdAt).toLocaleString('zh-CN')}</span>
                    <button class="btn-admin btn-admin-sm btn-admin-ghost" data-restore="${ver.id}" ${this.can('settings') ? '' : 'disabled'}>恢复</button>
                </div>
            </div>
        `).join('');
        root.querySelectorAll('[data-restore]').forEach((btn) => {
            btn.addEventListener('click', () => {
                if (!this.can('settings')) return alert('无权限');
                const id = btn.getAttribute('data-restore');
                if (!confirm('恢复后将覆盖当前配置，是否继续？')) return;
                siteData.restoreVersion(id, this.getSession()?.username || 'system');
                this.renderAll();
                alert('版本恢复成功');
            });
        });
    },
    exportData() {
        const json = siteData.exportJSON();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'zhuoxi-site-data-v2.json';
        a.click();
        URL.revokeObjectURL(url);
    },
    importData(event) {
        if (!this.can('settings')) return alert('无权限');
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            const ok = siteData.importJSON(e.target.result, this.getSession()?.username || 'system');
            if (!ok) {
                alert('导入失败，JSON 不合法');
                return;
            }
            this.renderAll();
            alert('导入成功');
        };
        reader.readAsText(file);
        event.target.value = '';
    },
    resetData() {
        if (!this.can('settings')) return alert('无权限');
        if (!confirm('确认重置为默认数据？')) return;
        siteData.resetToDefault(this.getSession()?.username || 'system');
        this.renderAll();
        alert('已重置');
    },
    logout() {
        siteData.logout();
        location.reload();
    },
    pageJsonCard(title, id, value) {
        return `
            <div class="admin-card">
                <div class="admin-card-body">
                    <div class="admin-card-title">${this.safeText(title)}</div>
                    <textarea id="${id}" class="admin-textarea" rows="10">${this.safeText(JSON.stringify(value, null, 2))}</textarea>
                </div>
            </div>
        `;
    },
    kvInput(label, id, value) {
        return `<div class="admin-kv"><label>${this.safeText(label)}</label><input id="${id}" class="admin-input" value="${this.safeText(value || '')}"></div>`;
    },
    val(id) {
        const el = document.getElementById(id);
        return el ? el.value : '';
    }
};

window.AdminUI = AdminUI;
document.addEventListener('DOMContentLoaded', () => AdminUI.init());
