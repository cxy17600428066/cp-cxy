/**
 * Zhuoxi Admin Panel — Interaction Logic
 * CRUD operations for Carousel, News, Products
 */

// ════════════════════════════════════
// Init
// ════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
    siteData.load();
    renderCarouselList();
    renderNewsList();
    renderProductsList();
});

// ════════════════════════════════════
// Tab Switching
// ════════════════════════════════════
function switchTab(tab, btn) {
    document.querySelectorAll('.admin-tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(b => b.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');
    btn.classList.add('active');
}

// ════════════════════════════════════
// Modal Helpers
// ════════════════════════════════════
function openModal(id) {
    document.getElementById(id).classList.add('active');
}
function closeModal(id) {
    document.getElementById(id).classList.remove('active');
}

// ════════════════════════════════════
// CAROUSEL
// ════════════════════════════════════
function renderCarouselList() {
    const list = document.getElementById('carousel-list');
    const items = siteData.getCarousel();
    
    if (items.length === 0) {
        list.innerHTML = `<div class="admin-empty"><div class="empty-icon">🖼️</div><h4>暂无轮播图</h4><p>点击上方按钮添加轮播图</p></div>`;
        return;
    }
    
    list.innerHTML = items.map((item, idx) => `
        <div class="admin-card">
            <div class="admin-card-thumb"><img src="${item.src}" alt="${item.alt}" onerror="this.parentElement.innerHTML='🖼️'"></div>
            <div class="admin-card-body">
                <div class="admin-card-title">${item.alt}</div>
                <div class="admin-card-meta">
                    <span>路径: ${item.src}</span>
                    <span>排序: ${item.order}</span>
                </div>
            </div>
            <div class="admin-card-actions">
                <button class="order-btn" onclick="moveCarousel('${item.id}',-1)" title="上移">↑</button>
                <button class="order-btn" onclick="moveCarousel('${item.id}',1)" title="下移">↓</button>
                <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="editCarousel('${item.id}')">编辑</button>
                <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteCarousel('${item.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function openCarouselModal(item = null) {
    document.getElementById('carousel-modal-title').textContent = item ? '编辑轮播图' : '新增轮播图';
    document.getElementById('carousel-id').value = item ? item.id : '';
    document.getElementById('carousel-src').value = item ? item.src : '';
    document.getElementById('carousel-alt').value = item ? item.alt : '';
    document.getElementById('carousel-order').value = item ? item.order : (siteData.getCarousel().length + 1);
    openModal('carousel-modal');
}

function editCarousel(id) {
    const item = siteData.getCarousel().find(c => c.id === id);
    if (item) openCarouselModal(item);
}

function saveCarousel(e) {
    e.preventDefault();
    const item = {
        id: document.getElementById('carousel-id').value || SiteDataManager.generateId('c'),
        src: document.getElementById('carousel-src').value.trim(),
        alt: document.getElementById('carousel-alt').value.trim(),
        order: parseInt(document.getElementById('carousel-order').value) || 1
    };
    siteData.saveCarouselItem(item);
    closeModal('carousel-modal');
    renderCarouselList();
}

function deleteCarousel(id) {
    if (confirm('确定删除这张轮播图？')) {
        siteData.deleteCarouselItem(id);
        renderCarouselList();
    }
}

function moveCarousel(id, direction) {
    const items = siteData.getCarousel();
    const idx = items.findIndex(c => c.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    // Swap orders
    const tempOrder = items[idx].order;
    items[idx].order = items[targetIdx].order;
    items[targetIdx].order = tempOrder;
    siteData.saveCarouselItem(items[idx]);
    siteData.saveCarouselItem(items[targetIdx]);
    renderCarouselList();
}

// ════════════════════════════════════
// NEWS
// ════════════════════════════════════
const CATEGORY_MAP = {
    'brand': '品牌资讯',
    'event': '活动报道',
    'industry': '行业动态',
    'global': '全球化',
    'product': '产品研发'
};

const THUMB_CLASSES = ['thumb-amber', 'thumb-brick', 'thumb-blue', 'thumb-dark', 'thumb-green', 'thumb-purple'];

function renderNewsList() {
    const list = document.getElementById('news-list');
    const items = siteData.getNews();
    
    if (items.length === 0) {
        list.innerHTML = `<div class="admin-empty"><div class="empty-icon">📰</div><h4>暂无资讯</h4><p>点击上方按钮添加新闻</p></div>`;
        return;
    }
    
    list.innerHTML = items.map(item => `
        <div class="admin-card">
            <div class="admin-card-thumb"><span class="emoji-thumb">${item.emoji || '📰'}</span></div>
            <div class="admin-card-body">
                <div class="admin-card-title">${item.title}</div>
                <div class="admin-card-meta">
                    <span class="admin-card-badge">${item.category}</span>
                    <span>${item.date}</span>
                    ${item.isFeatured ? '<span style="color: var(--admin-accent);">⭐ 头条</span>' : ''}
                    <span>排序: ${item.order}</span>
                </div>
            </div>
            <div class="admin-card-actions">
                <button class="order-btn" onclick="moveNews('${item.id}',-1)" title="上移">↑</button>
                <button class="order-btn" onclick="moveNews('${item.id}',1)" title="下移">↓</button>
                <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="editNews('${item.id}')">编辑</button>
                <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteNews('${item.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function openNewsModal(item = null) {
    document.getElementById('news-modal-title').textContent = item ? '编辑资讯' : '新增资讯';
    document.getElementById('news-id').value = item ? item.id : '';
    document.getElementById('news-title').value = item ? item.title : '';
    document.getElementById('news-category').value = item ? item.categoryKey : 'brand';
    document.getElementById('news-date').value = item ? item.date : '';
    document.getElementById('news-emoji').value = item ? (item.emoji || '📰') : '📰';
    document.getElementById('news-order').value = item ? item.order : (siteData.getNews().length + 1);
    document.getElementById('news-excerpt').value = item ? item.excerpt : '';
    document.getElementById('news-detail').value = item ? item.detail : '';
    const toggle = document.getElementById('news-featured-toggle');
    if (item && item.isFeatured) toggle.classList.add('on');
    else toggle.classList.remove('on');
    openModal('news-modal');
}

function editNews(id) {
    const item = siteData.getNews().find(n => n.id === id);
    if (item) openNewsModal(item);
}

function saveNews(e) {
    e.preventDefault();
    const categoryKey = document.getElementById('news-category').value;
    const item = {
        id: document.getElementById('news-id').value || SiteDataManager.generateId('n'),
        title: document.getElementById('news-title').value.trim(),
        category: CATEGORY_MAP[categoryKey] || categoryKey,
        categoryKey: categoryKey,
        date: document.getElementById('news-date').value.trim(),
        excerpt: document.getElementById('news-excerpt').value.trim(),
        detail: document.getElementById('news-detail').value.trim(),
        emoji: document.getElementById('news-emoji').value.trim() || '📰',
        thumbClass: THUMB_CLASSES[Math.floor(Math.random() * THUMB_CLASSES.length)],
        isFeatured: document.getElementById('news-featured-toggle').classList.contains('on'),
        order: parseInt(document.getElementById('news-order').value) || 1
    };
    // Preserve existing thumbClass on edit
    const existing = siteData.getNews().find(n => n.id === item.id);
    if (existing && existing.thumbClass) item.thumbClass = existing.thumbClass;

    siteData.saveNewsItem(item);
    closeModal('news-modal');
    renderNewsList();
}

function deleteNews(id) {
    if (confirm('确定删除这条资讯？')) {
        siteData.deleteNewsItem(id);
        renderNewsList();
    }
}

function moveNews(id, direction) {
    const items = siteData.getNews();
    const idx = items.findIndex(n => n.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const tempOrder = items[idx].order;
    items[idx].order = items[targetIdx].order;
    items[targetIdx].order = tempOrder;
    siteData.saveNewsItem(items[idx]);
    siteData.saveNewsItem(items[targetIdx]);
    renderNewsList();
}

// ════════════════════════════════════
// PRODUCTS
// ════════════════════════════════════
function renderProductsList() {
    const list = document.getElementById('products-list');
    const items = siteData.getProducts();
    
    if (items.length === 0) {
        list.innerHTML = `<div class="admin-empty"><div class="empty-icon">🛒</div><h4>暂无产品</h4><p>点击上方按钮添加产品</p></div>`;
        return;
    }
    
    list.innerHTML = items.map(item => `
        <div class="admin-card">
            <div class="admin-card-thumb"><img src="${item.image}" alt="${item.name}" onerror="this.parentElement.innerHTML='🛒'"></div>
            <div class="admin-card-body">
                <div class="admin-card-title">${item.name}</div>
                <div class="admin-card-meta">
                    <span class="admin-card-badge">${item.badge || ''}</span>
                    <span>${item.desc}</span>
                    <span>规格: ${(item.specs || []).join(' / ')}</span>
                    <span>排序: ${item.order}</span>
                </div>
            </div>
            <div class="admin-card-actions">
                <button class="order-btn" onclick="moveProduct('${item.id}',-1)" title="上移">↑</button>
                <button class="order-btn" onclick="moveProduct('${item.id}',1)" title="下移">↓</button>
                <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="editProduct('${item.id}')">编辑</button>
                <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteProduct('${item.id}')">删除</button>
            </div>
        </div>
    `).join('');
}

function openProductModal(item = null) {
    document.getElementById('product-modal-title').textContent = item ? '编辑产品' : '新增产品';
    document.getElementById('product-id').value = item ? item.id : '';
    document.getElementById('product-name').value = item ? item.name : '';
    document.getElementById('product-badge').value = item ? (item.badge || '') : '';
    document.getElementById('product-desc').value = item ? item.desc : '';
    document.getElementById('product-image').value = item ? item.image : '';
    document.getElementById('product-link').value = item ? (item.link || '') : '';
    document.getElementById('product-specs').value = item ? (item.specs || []).join('\n') : '';
    document.getElementById('product-category').value = item ? (item.categoryKey || 'all') : 'all';
    document.getElementById('product-order').value = item ? item.order : (siteData.getProducts().length + 1);
    openModal('product-modal');
}

function editProduct(id) {
    const item = siteData.getProducts().find(p => p.id === id);
    if (item) openProductModal(item);
}

function saveProduct(e) {
    e.preventDefault();
    const specsRaw = document.getElementById('product-specs').value.trim();
    const item = {
        id: document.getElementById('product-id').value || SiteDataManager.generateId('p'),
        name: document.getElementById('product-name').value.trim(),
        badge: document.getElementById('product-badge').value.trim(),
        categoryKey: document.getElementById('product-category').value,
        desc: document.getElementById('product-desc').value.trim(),
        image: document.getElementById('product-image').value.trim(),
        link: document.getElementById('product-link').value.trim(),
        specs: specsRaw ? specsRaw.split('\n').map(s => s.trim()).filter(Boolean) : [],
        order: parseInt(document.getElementById('product-order').value) || 1
    };
    siteData.saveProductItem(item);
    closeModal('product-modal');
    renderProductsList();
}

function deleteProduct(id) {
    if (confirm('确定删除这个产品？')) {
        siteData.deleteProductItem(id);
        renderProductsList();
    }
}

function moveProduct(id, direction) {
    const items = siteData.getProducts();
    const idx = items.findIndex(p => p.id === id);
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= items.length) return;
    const tempOrder = items[idx].order;
    items[idx].order = items[targetIdx].order;
    items[targetIdx].order = tempOrder;
    siteData.saveProductItem(items[idx]);
    siteData.saveProductItem(items[targetIdx]);
    renderProductsList();
}

// ════════════════════════════════════
// GLOBAL DATA OPERATIONS
// ════════════════════════════════════
function exportData() {
    const json = siteData.exportJSON();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'zhuoxi-site-data.json';
    a.click();
    URL.revokeObjectURL(url);
}

function importData(event) {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        const success = siteData.importJSON(e.target.result);
        if (success) {
            renderCarouselList();
            renderNewsList();
            renderProductsList();
            alert('数据导入成功！');
        } else {
            alert('数据格式错误，导入失败。');
        }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset
}

function resetData() {
    if (confirm('确定要重置所有数据为默认值吗？此操作不可撤销。')) {
        siteData.resetToDefault();
        renderCarouselList();
        renderNewsList();
        renderProductsList();
        alert('数据已重置为默认值。');
    }
}
