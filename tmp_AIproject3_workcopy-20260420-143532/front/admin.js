/**
 * Zhuoxi Admin Panel v2
 * Covers: auth, role-based workflow, CRUD, status transitions, pagination, search, logs, versions, SEO/profile/legal/media.
 */

const PAGE_SIZE = 10;

const state = {
  activeTab: "dashboard",
  searchKeyword: "",
  paging: {
    carousel: 1,
    news: 1,
    products: 1,
    careers: 1
  },
  filters: {
    carouselStatus: "all",
    newsStatus: "all",
    newsCategory: "all",
    productStatus: "all",
    productCategory: "all",
    careerStatus: "all"
  },
  modal: {
    module: "",
    item: null
  }
};

const ui = {};

document.addEventListener("DOMContentLoaded", () => {
  siteData.load();
  cacheUi();
  bindCommonEvents();
  bootAuth();
});

function cacheUi() {
  ui.loginOverlay = document.getElementById("loginOverlay");
  ui.loginForm = document.getElementById("loginForm");
  ui.loginError = document.getElementById("loginError");
  ui.loginUsername = document.getElementById("loginUsername");
  ui.loginPassword = document.getElementById("loginPassword");

  ui.currentUserName = document.getElementById("currentUserName");
  ui.currentUserRole = document.getElementById("currentUserRole");

  ui.dashboardKpi = document.getElementById("dashboardKpi");
  ui.dashboardLogs = document.getElementById("dashboardLogs");

  ui.carouselList = document.getElementById("carouselList");
  ui.newsList = document.getElementById("newsList");
  ui.productsList = document.getElementById("productsList");
  ui.careersList = document.getElementById("careersList");
  ui.logsList = document.getElementById("logsList");
  ui.mediaList = document.getElementById("mediaList");
  ui.workflowBoard = document.getElementById("workflowBoard");

  ui.carouselPagination = document.getElementById("carouselPagination");
  ui.newsPagination = document.getElementById("newsPagination");
  ui.productsPagination = document.getElementById("productsPagination");
  ui.careersPagination = document.getElementById("careersPagination");

  ui.globalSearchInput = document.getElementById("globalSearchInput");
  ui.btnGlobalSearch = document.getElementById("btnGlobalSearch");
  ui.btnGlobalSearchReset = document.getElementById("btnGlobalSearchReset");

  ui.carouselStatusFilter = document.getElementById("carouselStatusFilter");
  ui.newsStatusFilter = document.getElementById("newsStatusFilter");
  ui.newsCategoryFilter = document.getElementById("newsCategoryFilter");
  ui.productStatusFilter = document.getElementById("productStatusFilter");
  ui.productCategoryFilter = document.getElementById("productCategoryFilter");
  ui.careerStatusFilter = document.getElementById("careerStatusFilter");

  ui.entityModalOverlay = document.getElementById("entityModalOverlay");
  ui.entityModalTitle = document.getElementById("entityModalTitle");
  ui.entityForm = document.getElementById("entityForm");
  ui.entityFormBody = document.getElementById("entityFormBody");
  ui.entityModule = document.getElementById("entityModule");
  ui.entityId = document.getElementById("entityId");
  ui.entityVersions = document.getElementById("entityVersions");

  ui.btnSaveDraft = document.getElementById("btnSaveDraft");
  ui.btnSubmitReview = document.getElementById("btnSubmitReview");
  ui.btnPublish = document.getElementById("btnPublish");
  ui.btnArchive = document.getElementById("btnArchive");
  ui.btnRevertVersion = document.getElementById("btnRevertVersion");
}

function bindCommonEvents() {
  ui.loginForm.addEventListener("submit", onLoginSubmit);

  document.querySelectorAll(".admin-nav-item[data-tab]").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab, btn));
  });

  document.getElementById("btnAddCarousel").addEventListener("click", () => openEntityModal("carousel"));
  document.getElementById("btnAddNews").addEventListener("click", () => openEntityModal("news"));
  document.getElementById("btnAddProduct").addEventListener("click", () => openEntityModal("products"));
  document.getElementById("btnAddCareer").addEventListener("click", () => openEntityModal("careers"));

  document.getElementById("btnExport").addEventListener("click", exportData);
  document.getElementById("btnImport").addEventListener("click", () => document.getElementById("importFile").click());
  document.getElementById("importFile").addEventListener("change", importData);
  document.getElementById("btnReset").addEventListener("click", resetData);
  document.getElementById("btnLogout").addEventListener("click", logout);

  ui.btnGlobalSearch.addEventListener("click", () => {
    state.searchKeyword = ui.globalSearchInput.value.trim();
    refreshActiveViews();
  });
  ui.btnGlobalSearchReset.addEventListener("click", () => {
    state.searchKeyword = "";
    ui.globalSearchInput.value = "";
    refreshActiveViews();
  });
  ui.globalSearchInput.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      e.preventDefault();
      state.searchKeyword = ui.globalSearchInput.value.trim();
      refreshActiveViews();
    }
  });

  ui.carouselStatusFilter.addEventListener("change", () => {
    state.filters.carouselStatus = ui.carouselStatusFilter.value;
    state.paging.carousel = 1;
    renderCarouselList();
  });
  ui.newsStatusFilter.addEventListener("change", () => {
    state.filters.newsStatus = ui.newsStatusFilter.value;
    state.paging.news = 1;
    renderNewsList();
  });
  ui.newsCategoryFilter.addEventListener("change", () => {
    state.filters.newsCategory = ui.newsCategoryFilter.value;
    state.paging.news = 1;
    renderNewsList();
  });
  ui.productStatusFilter.addEventListener("change", () => {
    state.filters.productStatus = ui.productStatusFilter.value;
    state.paging.products = 1;
    renderProductsList();
  });
  ui.productCategoryFilter.addEventListener("change", () => {
    state.filters.productCategory = ui.productCategoryFilter.value;
    state.paging.products = 1;
    renderProductsList();
  });
  ui.careerStatusFilter.addEventListener("change", () => {
    state.filters.careerStatus = ui.careerStatusFilter.value;
    state.paging.careers = 1;
    renderCareersList();
  });

  document.getElementById("btnCloseEntityModal").addEventListener("click", closeEntityModal);
  ui.entityModalOverlay.addEventListener("click", e => {
    if (e.target === ui.entityModalOverlay) closeEntityModal();
  });

  ui.btnSaveDraft.addEventListener("click", () => saveEntityWithStatus("draft"));
  ui.btnSubmitReview.addEventListener("click", () => saveEntityWithStatus("review"));
  ui.btnPublish.addEventListener("click", () => saveEntityWithStatus("published"));
  ui.btnArchive.addEventListener("click", () => saveEntityWithStatus("archived"));
  ui.btnRevertVersion.addEventListener("click", revertLatestVersion);

  document.getElementById("seoPageKey").addEventListener("change", loadSeoForm);
  document.getElementById("seoForm").addEventListener("submit", saveSeoForm);
  document.getElementById("siteProfileForm").addEventListener("submit", saveSiteProfile);
  document.getElementById("legalForm").addEventListener("submit", saveLegal);
  document.getElementById("mediaForm").addEventListener("submit", saveMediaAsset);
}

function bootAuth() {
  if (siteData.isLoggedIn()) {
    afterLogin();
  } else {
    ui.loginOverlay.classList.add("active");
  }
}

function onLoginSubmit(e) {
  e.preventDefault();
  const user = siteData.login(ui.loginUsername.value.trim(), ui.loginPassword.value.trim());
  if (!user) {
    ui.loginError.textContent = "璐﹀彿鎴栧瘑鐮侀敊璇?;
    return;
  }
  ui.loginError.textContent = "";
  afterLogin();
}

function afterLogin() {
  ui.loginOverlay.classList.remove("active");
  const session = siteData.getSession();
  ui.currentUserName.textContent = session.user.displayName;
  ui.currentUserRole.textContent = session.user.role;
  initCategoryFilters();
  loadSeoForm();
  loadSiteProfileForm();
  loadLegalForm();
  renderAll();
}

function logout() {
  siteData.logout();
  location.reload();
}

function initCategoryFilters() {
  const keys = [];
  siteData.getNews().forEach(item => {
    if (item.categoryKey && !keys.includes(item.categoryKey)) keys.push(item.categoryKey);
  });
  ui.newsCategoryFilter.innerHTML =
    `<option value="all">鍏ㄩ儴鍒嗙被</option>` +
    keys.map(k => `<option value="${escapeHtml(k)}">${escapeHtml(categoryLabel(k))}</option>`).join("");
}

function switchTab(tab, btn) {
  state.activeTab = tab;
  document.querySelectorAll(".admin-tab-content").forEach(el => el.classList.remove("active"));
  document.querySelectorAll(".admin-nav-item[data-tab]").forEach(el => el.classList.remove("active"));
  document.getElementById("tab-" + tab).classList.add("active");
  btn.classList.add("active");
}

function renderAll() {
  renderDashboard();
  renderCarouselList();
  renderNewsList();
  renderProductsList();
  renderCareersList();
  renderLogs();
  renderMedia();
  renderWorkflow();
}

function refreshActiveViews() {
  renderDashboard();
  renderCarouselList();
  renderNewsList();
  renderProductsList();
  renderCareersList();
  renderLogs();
  renderWorkflow();
}

function getFilteredItems(module) {
  let list = siteData.search(module, state.searchKeyword);
  if (module === "carousel" && state.filters.carouselStatus !== "all") {
    list = list.filter(item => item.status === state.filters.carouselStatus);
  }
  if (module === "news") {
    if (state.filters.newsStatus !== "all") list = list.filter(item => item.status === state.filters.newsStatus);
    if (state.filters.newsCategory !== "all") list = list.filter(item => item.categoryKey === state.filters.newsCategory);
  }
  if (module === "products") {
    if (state.filters.productStatus !== "all") list = list.filter(item => item.status === state.filters.productStatus);
    if (state.filters.productCategory !== "all") list = list.filter(item => item.categoryKey === state.filters.productCategory);
  }
  if (module === "careers" && state.filters.careerStatus !== "all") {
    list = list.filter(item => item.status === state.filters.careerStatus);
  }
  return list.sort((a, b) => (a.order || 0) - (b.order || 0));
}

function renderDashboard() {
  const kpi = [
    { label: "杞挱", value: siteData.getCarousel().length },
    { label: "璧勮", value: siteData.getNews().length },
    { label: "浜у搧", value: siteData.getProducts().length },
    { label: "宀椾綅", value: siteData.getCareers().length },
    { label: "宸插彂甯冭祫璁?, value: siteData.getPublishedNews().length },
    { label: "宸插彂甯冧骇鍝?, value: siteData.getPublishedProducts().length }
  ];
  ui.dashboardKpi.innerHTML = kpi
    .map(item => `<div class="admin-kpi-card"><span>${item.label}</span><strong>${item.value}</strong></div>`)
    .join("");

  const logs = siteData.getLogs().slice(0, 8);
  ui.dashboardLogs.innerHTML = logs.length
    ? logs
        .map(
          log => `<div class="admin-log-row">
          <div><strong>${escapeHtml(log.action)}</strong> 路 ${escapeHtml(log.detail || "")}</div>
          <div>${escapeHtml(log.userName || "")} 路 ${formatTime(log.at)}</div>
        </div>`
        )
        .join("")
    : `<div class="admin-empty">鏆傛棤鏃ュ織</div>`;
}

function renderListByModule(module, listNode, paginationNode, renderCard) {
  const items = getFilteredItems(module);
  const page = state.paging[module] || 1;
  const paged = siteData.paginate(items, page, PAGE_SIZE);
  listNode.innerHTML = paged.records.length
    ? paged.records.map(renderCard).join("")
    : `<div class="admin-empty"><h4>鏆傛棤鏁版嵁</h4><p>褰撳墠绛涢€夋潯浠朵笅娌℃湁鍙睍绀哄唴瀹广€?/p></div>`;
  renderPagination(paginationNode, module, paged);
}

function renderCarouselList() {
  renderListByModule("carousel", ui.carouselList, ui.carouselPagination, item => {
    return `<div class="admin-card">
      <div class="admin-card-thumb"><img src="${escapeHtml(item.src || "")}" alt="${escapeHtml(item.alt || "")}" onerror="this.parentElement.innerHTML='馃柤锔?" /></div>
      <div class="admin-card-body">
        <div class="admin-card-title">${escapeHtml(item.alt || "")}</div>
        <div class="admin-card-meta">
          <span>璺緞锛?{escapeHtml(item.src || "")}</span>
          <span>鐘舵€侊細${statusLabel(item.status)}</span>
          <span>鎺掑簭锛?{item.order || 0}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="order-btn" onclick="moveOrder('carousel','${item.id}',-1)">鈫?/button>
        <button class="order-btn" onclick="moveOrder('carousel','${item.id}',1)">鈫?/button>
        <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="openEntityModal('carousel','${item.id}')">缂栬緫</button>
        <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteItem('carousel','${item.id}')">鍒犻櫎</button>
      </div>
    </div>`;
  });
}

function renderNewsList() {
  renderListByModule("news", ui.newsList, ui.newsPagination, item => {
    return `<div class="admin-card">
      <div class="admin-card-thumb"><span class="emoji-thumb">${escapeHtml(item.emoji || "馃摪")}</span></div>
      <div class="admin-card-body">
        <div class="admin-card-title">${escapeHtml(item.title || "")}</div>
        <div class="admin-card-meta">
          <span class="admin-card-badge">${escapeHtml(item.category || "")}</span>
          <span>${escapeHtml(item.date || "")}</span>
          <span>鐘舵€侊細${statusLabel(item.status)}</span>
          <span>slug锛?{escapeHtml(item.slug || "")}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="order-btn" onclick="moveOrder('news','${item.id}',-1)">鈫?/button>
        <button class="order-btn" onclick="moveOrder('news','${item.id}',1)">鈫?/button>
        <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="openEntityModal('news','${item.id}')">缂栬緫</button>
        <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteItem('news','${item.id}')">鍒犻櫎</button>
      </div>
    </div>`;
  });
}

function renderProductsList() {
  renderListByModule("products", ui.productsList, ui.productsPagination, item => {
    return `<div class="admin-card">
      <div class="admin-card-thumb"><img src="${escapeHtml(item.image || "")}" alt="${escapeHtml(item.name || "")}" onerror="this.parentElement.innerHTML='馃摝'" /></div>
      <div class="admin-card-body">
        <div class="admin-card-title">${escapeHtml(item.name || "")}</div>
        <div class="admin-card-meta">
          <span class="admin-card-badge">${escapeHtml(item.badge || "")}</span>
          <span>鍒嗙被锛?{escapeHtml(categoryLabel(item.categoryKey))}</span>
          <span>鐘舵€侊細${statusLabel(item.status)}</span>
          <span>slug锛?{escapeHtml(item.slug || "")}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="order-btn" onclick="moveOrder('products','${item.id}',-1)">鈫?/button>
        <button class="order-btn" onclick="moveOrder('products','${item.id}',1)">鈫?/button>
        <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="openEntityModal('products','${item.id}')">缂栬緫</button>
        <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteItem('products','${item.id}')">鍒犻櫎</button>
      </div>
    </div>`;
  });
}

function renderCareersList() {
  renderListByModule("careers", ui.careersList, ui.careersPagination, item => {
    return `<div class="admin-card">
      <div class="admin-card-thumb"><span class="emoji-thumb">馃懃</span></div>
      <div class="admin-card-body">
        <div class="admin-card-title">${escapeHtml(item.title || "")}</div>
        <div class="admin-card-meta">
          <span class="admin-card-badge">${escapeHtml(item.department || "")}</span>
          <span>${escapeHtml(item.city || "")}</span>
          <span>鐘舵€侊細${statusLabel(item.status)}</span>
          <span>钖祫锛?{escapeHtml(item.salary || "")}</span>
        </div>
      </div>
      <div class="admin-card-actions">
        <button class="order-btn" onclick="moveOrder('careers','${item.id}',-1)">鈫?/button>
        <button class="order-btn" onclick="moveOrder('careers','${item.id}',1)">鈫?/button>
        <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="openEntityModal('careers','${item.id}')">缂栬緫</button>
        <button class="btn-admin btn-admin-sm btn-admin-danger" onclick="deleteItem('careers','${item.id}')">鍒犻櫎</button>
      </div>
    </div>`;
  });
}

function renderPagination(node, module, paged) {
  node.innerHTML = `
    <button class="btn-admin btn-admin-sm btn-admin-ghost" ${paged.page <= 1 ? "disabled" : ""} onclick="changePage('${module}',${paged.page - 1})">涓婁竴椤?/button>
    <span class="admin-page-info">绗?${paged.page} / ${paged.pages} 椤?路 鍏?${paged.total} 鏉?/span>
    <button class="btn-admin btn-admin-sm btn-admin-ghost" ${paged.page >= paged.pages ? "disabled" : ""} onclick="changePage('${module}',${paged.page + 1})">涓嬩竴椤?/button>
  `;
}

function changePage(module, nextPage) {
  state.paging[module] = nextPage;
  if (module === "carousel") renderCarouselList();
  if (module === "news") renderNewsList();
  if (module === "products") renderProductsList();
  if (module === "careers") renderCareersList();
}

function moveOrder(module, id, direction) {
  const items = getFilteredItems(module);
  const idx = items.findIndex(i => i.id === id);
  const target = idx + direction;
  if (idx < 0 || target < 0 || target >= items.length) return;
  const a = items[idx];
  const b = items[target];
  const aOrder = a.order || 0;
  a.order = b.order || 0;
  b.order = aOrder;
  siteData.saveItem(module, a, "ORDER");
  siteData.saveItem(module, b, "ORDER");
  refreshActiveViews();
}

function deleteItem(module, id) {
  if (!confirm("纭鍒犻櫎璇ユ潯鏁版嵁锛熸鎿嶄綔涓嶅彲鎭㈠銆?)) return;
  siteData.deleteItem(module, id);
  refreshActiveViews();
}

function openEntityModal(module, id = "") {
  state.modal.module = module;
  const current = id ? siteData.getItemByModule(module, id) : null;
  state.modal.item = current ? JSON.parse(JSON.stringify(current)) : createEmptyItem(module);

  ui.entityModule.value = module;
  ui.entityId.value = state.modal.item.id || "";
  ui.entityModalTitle.textContent = `${moduleLabel(module)}缂栬緫`;
  ui.entityFormBody.innerHTML = buildEntityForm(module, state.modal.item);
  renderEntityVersions(state.modal.item);
  ui.entityModalOverlay.classList.add("active");
}

function closeEntityModal() {
  ui.entityModalOverlay.classList.remove("active");
  state.modal.module = "";
  state.modal.item = null;
}

function createEmptyItem(module) {
  const now = new Date().toISOString();
  if (module === "carousel") {
    return { id: SiteDataManager.generateId("c"), src: "", alt: "", order: siteData.getCarousel().length + 1, status: "draft", publishAt: null, versionHistory: [], seo: {} };
  }
  if (module === "news") {
    return {
      id: SiteDataManager.generateId("n"),
      slug: "",
      title: "",
      category: "鍝佺墝璧勮",
      categoryKey: "brand",
      date: formatDate(new Date()),
      excerpt: "",
      detail: "",
      emoji: "馃摪",
      thumbClass: "thumb-amber",
      isFeatured: false,
      order: siteData.getNews().length + 1,
      status: "draft",
      publishAt: null,
      seo: { title: "", description: "", keywords: "", ogImage: "" },
      author: "",
      source: "",
      tags: [],
      versionHistory: [],
      updatedAt: now,
      updatedBy: siteData.getCurrentUserName()
    };
  }
  if (module === "products") {
    return {
      id: SiteDataManager.generateId("p"),
      slug: "",
      name: "",
      flavor: "",
      categoryKey: "spicy",
      desc: "",
      image: "",
      badge: "",
      specs: [],
      link: "",
      order: siteData.getProducts().length + 1,
      status: "draft",
      publishAt: null,
      nutrition: "",
      ingredients: "",
      scenes: "",
      faq: "",
      seo: { title: "", description: "", keywords: "", ogImage: "" },
      versionHistory: []
    };
  }
  return {
    id: SiteDataManager.generateId("j"),
    title: "",
    department: "",
    city: "",
    type: "鍏ㄨ亴",
    level: "",
    salary: "",
    status: "draft",
    responsibilities: "",
    requirements: "",
    process: "",
    contactEmail: siteData.getProfile().hrEmail || "",
    order: siteData.getCareers().length + 1,
    publishAt: null,
    versionHistory: []
  };
}

function buildEntityForm(module, item) {
  if (module === "carousel") {
    return `
      <div class="admin-form-group"><label>鍥剧墖璺緞</label><input id="f_src" class="admin-input" value="${escapeHtml(item.src || "")}" required /></div>
      <div class="admin-form-group"><label>鏇夸唬鏂囨湰 alt</label><input id="f_alt" class="admin-input" value="${escapeHtml(item.alt || "")}" required /></div>
      <div class="admin-form-group"><label>鎺掑簭</label><input id="f_order" type="number" class="admin-input" value="${item.order || 1}" min="1" /></div>
      <div class="admin-form-group"><label>鐘舵€?/label>${statusSelect(item.status)}</div>
    `;
  }
  if (module === "news") {
    return `
      <div class="admin-form-row">
        <div class="admin-form-group"><label>鏍囬</label><input id="f_title" class="admin-input" value="${escapeHtml(item.title || "")}" required /></div>
        <div class="admin-form-group"><label>slug</label><input id="f_slug" class="admin-input" value="${escapeHtml(item.slug || "")}" required /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>鍒嗙被</label>
          <select id="f_categoryKey" class="admin-select">
            <option value="brand" ${item.categoryKey === "brand" ? "selected" : ""}>鍝佺墝璧勮</option>
            <option value="event" ${item.categoryKey === "event" ? "selected" : ""}>娲诲姩鎶ラ亾</option>
            <option value="industry" ${item.categoryKey === "industry" ? "selected" : ""}>琛屼笟鍔ㄦ€?/option>
            <option value="global" ${item.categoryKey === "global" ? "selected" : ""}>鍏ㄧ悆鍖?/option>
            <option value="product" ${item.categoryKey === "product" ? "selected" : ""}>浜у搧鐮斿彂</option>
          </select>
        </div>
        <div class="admin-form-group"><label>鏃ユ湡</label><input id="f_date" class="admin-input" value="${escapeHtml(item.date || "")}" /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>浣滆€?/label><input id="f_author" class="admin-input" value="${escapeHtml(item.author || "")}" /></div>
        <div class="admin-form-group"><label>鏉ユ簮</label><input id="f_source" class="admin-input" value="${escapeHtml(item.source || "")}" /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>emoji</label><input id="f_emoji" class="admin-input" value="${escapeHtml(item.emoji || "")}" /></div>
        <div class="admin-form-group"><label>鎺掑簭</label><input id="f_order" type="number" class="admin-input" value="${item.order || 1}" min="1" /></div>
      </div>
      <div class="admin-form-group"><label>鎽樿</label><textarea id="f_excerpt" class="admin-textarea" rows="3">${escapeHtml(item.excerpt || "")}</textarea></div>
      <div class="admin-form-group"><label>姝ｆ枃</label><textarea id="f_detail" class="admin-textarea" rows="6">${escapeHtml(item.detail || "")}</textarea></div>
      <div class="admin-form-group"><label>鏍囩锛堥€楀彿鍒嗛殧锛?/label><input id="f_tags" class="admin-input" value="${escapeHtml((item.tags || []).join(","))}" /></div>
      <div class="admin-form-group"><label>SEO Title</label><input id="f_seoTitle" class="admin-input" value="${escapeHtml((item.seo || {}).title || "")}" /></div>
      <div class="admin-form-group"><label>SEO Description</label><textarea id="f_seoDescription" class="admin-textarea" rows="3">${escapeHtml((item.seo || {}).description || "")}</textarea></div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>SEO Keywords</label><input id="f_seoKeywords" class="admin-input" value="${escapeHtml((item.seo || {}).keywords || "")}" /></div>
        <div class="admin-form-group"><label>OG Image</label><input id="f_seoOgImage" class="admin-input" value="${escapeHtml((item.seo || {}).ogImage || "")}" /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label><input id="f_featured" type="checkbox" ${item.isFeatured ? "checked" : ""} /> 澶存潯</label></div>
        <div class="admin-form-group"><label>鐘舵€?/label>${statusSelect(item.status)}</div>
      </div>
    `;
  }
  if (module === "products") {
    return `
      <div class="admin-form-row">
        <div class="admin-form-group"><label>浜у搧鍚?/label><input id="f_name" class="admin-input" value="${escapeHtml(item.name || "")}" required /></div>
        <div class="admin-form-group"><label>slug</label><input id="f_slug" class="admin-input" value="${escapeHtml(item.slug || "")}" required /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>鍒嗙被</label>
          <select id="f_categoryKey" class="admin-select">
            <option value="spicy" ${item.categoryKey === "spicy" ? "selected" : ""}>鏃犻绯诲垪</option>
            <option value="sour" ${item.categoryKey === "sour" ? "selected" : ""}>铏庣毊绯诲垪</option>
            <option value="fragrant" ${item.categoryKey === "fragrant" ? "selected" : ""}>鑰佸崵绯诲垪</option>
          </select>
        </div>
        <div class="admin-form-group"><label>鍙ｅ懗/鏍囩</label><input id="f_flavor" class="admin-input" value="${escapeHtml(item.flavor || "")}" /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>鍥剧墖璺緞</label><input id="f_image" class="admin-input" value="${escapeHtml(item.image || "")}" /></div>
        <div class="admin-form-group"><label>璐拱閾炬帴</label><input id="f_link" class="admin-input" value="${escapeHtml(item.link || "")}" /></div>
      </div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>灞曠ず寰芥爣</label><input id="f_badge" class="admin-input" value="${escapeHtml(item.badge || "")}" /></div>
        <div class="admin-form-group"><label>鎺掑簭</label><input id="f_order" type="number" class="admin-input" value="${item.order || 1}" min="1" /></div>
      </div>
      <div class="admin-form-group"><label>鐭弿杩?/label><textarea id="f_desc" class="admin-textarea" rows="3">${escapeHtml(item.desc || "")}</textarea></div>
      <div class="admin-form-group"><label>瑙勬牸锛堟瘡琛屼竴椤癸級</label><textarea id="f_specs" class="admin-textarea" rows="3">${escapeHtml((item.specs || []).join("\n"))}</textarea></div>
      <div class="admin-form-group"><label>閰嶆枡淇℃伅</label><textarea id="f_ingredients" class="admin-textarea" rows="2">${escapeHtml(item.ingredients || "")}</textarea></div>
      <div class="admin-form-group"><label>钀ュ吇淇℃伅</label><textarea id="f_nutrition" class="admin-textarea" rows="2">${escapeHtml(item.nutrition || "")}</textarea></div>
      <div class="admin-form-group"><label>鎺ㄨ崘椋熺敤鍦烘櫙</label><textarea id="f_scenes" class="admin-textarea" rows="2">${escapeHtml(item.scenes || "")}</textarea></div>
      <div class="admin-form-group"><label>FAQ</label><textarea id="f_faq" class="admin-textarea" rows="2">${escapeHtml(item.faq || "")}</textarea></div>
      <div class="admin-form-group"><label>SEO Title</label><input id="f_seoTitle" class="admin-input" value="${escapeHtml((item.seo || {}).title || "")}" /></div>
      <div class="admin-form-group"><label>SEO Description</label><textarea id="f_seoDescription" class="admin-textarea" rows="3">${escapeHtml((item.seo || {}).description || "")}</textarea></div>
      <div class="admin-form-row">
        <div class="admin-form-group"><label>SEO Keywords</label><input id="f_seoKeywords" class="admin-input" value="${escapeHtml((item.seo || {}).keywords || "")}" /></div>
        <div class="admin-form-group"><label>OG Image</label><input id="f_seoOgImage" class="admin-input" value="${escapeHtml((item.seo || {}).ogImage || "")}" /></div>
      </div>
      <div class="admin-form-group"><label>鐘舵€?/label>${statusSelect(item.status)}</div>
    `;
  }

  return `
    <div class="admin-form-row">
      <div class="admin-form-group"><label>宀椾綅鍚嶇О</label><input id="f_title" class="admin-input" value="${escapeHtml(item.title || "")}" required /></div>
      <div class="admin-form-group"><label>鎵€灞為儴闂?/label><input id="f_department" class="admin-input" value="${escapeHtml(item.department || "")}" /></div>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label>鍩庡競</label><input id="f_city" class="admin-input" value="${escapeHtml(item.city || "")}" /></div>
      <div class="admin-form-group"><label>鑱屼綅绫诲瀷</label><input id="f_type" class="admin-input" value="${escapeHtml(item.type || "")}" /></div>
    </div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label>绾у埆</label><input id="f_level" class="admin-input" value="${escapeHtml(item.level || "")}" /></div>
      <div class="admin-form-group"><label>钖祫鑼冨洿</label><input id="f_salary" class="admin-input" value="${escapeHtml(item.salary || "")}" /></div>
    </div>
    <div class="admin-form-group"><label>宀椾綅鑱岃矗</label><textarea id="f_responsibilities" class="admin-textarea" rows="3">${escapeHtml(item.responsibilities || "")}</textarea></div>
    <div class="admin-form-group"><label>浠昏亴瑕佹眰</label><textarea id="f_requirements" class="admin-textarea" rows="3">${escapeHtml(item.requirements || "")}</textarea></div>
    <div class="admin-form-group"><label>鎷涜仒娴佺▼</label><textarea id="f_process" class="admin-textarea" rows="2">${escapeHtml(item.process || "")}</textarea></div>
    <div class="admin-form-row">
      <div class="admin-form-group"><label>鑱旂郴閭</label><input id="f_contactEmail" class="admin-input" value="${escapeHtml(item.contactEmail || "")}" /></div>
      <div class="admin-form-group"><label>鎺掑簭</label><input id="f_order" type="number" class="admin-input" value="${item.order || 1}" min="1" /></div>
    </div>
    <div class="admin-form-group"><label>鐘舵€?/label>${statusSelect(item.status)}</div>
  `;
}

function statusSelect(value) {
  return `<select id="f_status" class="admin-select">
    <option value="draft" ${value === "draft" ? "selected" : ""}>鑽夌</option>
    <option value="review" ${value === "review" ? "selected" : ""}>寰呭鏍?/option>
    <option value="published" ${value === "published" ? "selected" : ""}>宸插彂甯?/option>
    <option value="archived" ${value === "archived" ? "selected" : ""}>宸插綊妗?/option>
  </select>`;
}

function collectEntityData() {
  const module = ui.entityModule.value;
  const base = state.modal.item || createEmptyItem(module);
  if (module === "carousel") {
    return {
      ...base,
      src: val("f_src"),
      alt: val("f_alt"),
      order: num("f_order", base.order || 1),
      status: val("f_status") || "draft"
    };
  }
  if (module === "news") {
    const categoryKey = val("f_categoryKey");
    return {
      ...base,
      title: val("f_title"),
      slug: val("f_slug"),
      categoryKey,
      category: categoryLabel(categoryKey),
      date: val("f_date"),
      author: val("f_author"),
      source: val("f_source"),
      emoji: val("f_emoji") || "馃摪",
      order: num("f_order", base.order || 1),
      excerpt: val("f_excerpt"),
      detail: val("f_detail"),
      tags: splitComma("f_tags"),
      isFeatured: byId("f_featured").checked,
      seo: {
        title: val("f_seoTitle"),
        description: val("f_seoDescription"),
        keywords: val("f_seoKeywords"),
        ogImage: val("f_seoOgImage")
      },
      status: val("f_status") || "draft"
    };
  }
  if (module === "products") {
    return {
      ...base,
      name: val("f_name"),
      slug: val("f_slug"),
      categoryKey: val("f_categoryKey"),
      flavor: val("f_flavor"),
      image: val("f_image"),
      link: val("f_link"),
      badge: val("f_badge"),
      order: num("f_order", base.order || 1),
      desc: val("f_desc"),
      specs: splitLines("f_specs"),
      ingredients: val("f_ingredients"),
      nutrition: val("f_nutrition"),
      scenes: val("f_scenes"),
      faq: val("f_faq"),
      seo: {
        title: val("f_seoTitle"),
        description: val("f_seoDescription"),
        keywords: val("f_seoKeywords"),
        ogImage: val("f_seoOgImage")
      },
      status: val("f_status") || "draft"
    };
  }
  return {
    ...base,
    title: val("f_title"),
    department: val("f_department"),
    city: val("f_city"),
    type: val("f_type"),
    level: val("f_level"),
    salary: val("f_salary"),
    responsibilities: val("f_responsibilities"),
    requirements: val("f_requirements"),
    process: val("f_process"),
    contactEmail: val("f_contactEmail"),
    order: num("f_order", base.order || 1),
    status: val("f_status") || "draft"
  };
}

function saveEntityWithStatus(nextStatus) {
  const module = ui.entityModule.value;
  if (!module) return;
  if (!canTransitTo(nextStatus)) {
    alert("褰撳墠璐﹀彿瑙掕壊鏃犳潈闄愭墽琛岃鐘舵€佹祦杞€?);
    return;
  }
  const item = collectEntityData();
  item.status = nextStatus;
  if (!validateEntity(module, item)) return;
  siteData.saveItem(module, item, "SAVE");
  closeEntityModal();
  renderAll();
}

function validateEntity(module, item) {
  if (module === "carousel") {
    if (!item.src || !item.alt) {
      alert("杞挱鍥鹃渶濉啓鍥剧墖璺緞鍜宎lt銆?);
      return false;
    }
  }
  if (module === "news") {
    if (!item.title || !item.slug || !item.detail) {
      alert("璧勮闇€濉啓鏍囬銆乻lug銆佹鏂囥€?);
      return false;
    }
  }
  if (module === "products") {
    if (!item.name || !item.slug || !item.image) {
      alert("浜у搧闇€濉啓鍚嶇О銆乻lug銆佸浘鐗囪矾寰勩€?);
      return false;
    }
  }
  if (module === "careers") {
    if (!item.title || !item.department) {
      alert("宀椾綅闇€濉啓宀椾綅鍚嶇О鍜屾墍灞為儴闂ㄣ€?);
      return false;
    }
  }
  return true;
}

function canTransitTo(nextStatus) {
  if (nextStatus === "draft") return siteData.hasPermission("content.write");
  if (nextStatus === "review") return siteData.hasPermission("content.write") || siteData.hasPermission("content.review");
  if (nextStatus === "published") return siteData.hasPermission("publish.use") || siteData.hasPermission("*");
  if (nextStatus === "archived") return siteData.hasPermission("publish.use") || siteData.hasPermission("*");
  return false;
}

function renderEntityVersions(item) {
  const versions = (item && item.versionHistory) || [];
  if (!versions.length) {
    ui.entityVersions.innerHTML = `<div class="admin-empty">鏆傛棤鐗堟湰</div>`;
    return;
  }
  ui.entityVersions.innerHTML = versions
    .slice(0, 8)
    .map(
      v => `<div class="admin-version-row">
      <span>${formatTime(v.at)} 路 ${escapeHtml(v.author || "system")} 路 ${escapeHtml(v.note || "")}</span>
      <button class="btn-admin btn-admin-sm btn-admin-ghost" onclick="revertVersionById('${escapeHtml(v.versionId)}')">鍥炴粴</button>
    </div>`
    )
    .join("");
}

function revertVersionById(versionId) {
  const module = ui.entityModule.value;
  const id = ui.entityId.value;
  if (!module || !id) return;
  if (!confirm("纭鍥炴粴鍒拌鐗堟湰锛?)) return;
  siteData.revertVersion(module, id, versionId);
  const fresh = siteData.getItemByModule(module, id);
  state.modal.item = JSON.parse(JSON.stringify(fresh));
  ui.entityFormBody.innerHTML = buildEntityForm(module, fresh);
  renderEntityVersions(fresh);
  renderAll();
}

function revertLatestVersion() {
  const module = ui.entityModule.value;
  const id = ui.entityId.value;
  if (!module || !id) {
    alert("浠呮敮鎸佸凡鏈夊唴瀹瑰洖婊氥€?);
    return;
  }
  const item = siteData.getItemByModule(module, id);
  if (!item || !item.versionHistory || item.versionHistory.length < 2) {
    alert("娌℃湁鍙洖婊氱殑鍘嗗彶鐗堟湰銆?);
    return;
  }
  revertVersionById(item.versionHistory[1].versionId);
}

function loadSeoForm() {
  const key = document.getElementById("seoPageKey").value;
  const seo = siteData.getSeo(key);
  byId("seoTitle").value = seo.title || "";
  byId("seoDescription").value = seo.description || "";
  byId("seoKeywords").value = seo.keywords || "";
  byId("seoOgImage").value = seo.ogImage || "";
  byId("seoCanonical").value = seo.canonical || "";
}

function saveSeoForm(e) {
  e.preventDefault();
  const key = byId("seoPageKey").value;
  siteData.updateSeo(key, {
    title: byId("seoTitle").value.trim(),
    description: byId("seoDescription").value.trim(),
    keywords: byId("seoKeywords").value.trim(),
    ogImage: byId("seoOgImage").value.trim(),
    canonical: byId("seoCanonical").value.trim()
  });
  alert("SEO璁剧疆宸蹭繚瀛?);
}

function loadSiteProfileForm() {
  const p = siteData.getProfile();
  const s = siteData.getSettings();
  byId("profileCompanyName").value = p.companyName || "";
  byId("profileCompanyShortName").value = p.companyShortName || "";
  byId("profileUnifiedCode").value = p.unifiedCode || "";
  byId("profileIcp").value = p.icp || "";
  byId("profileFoodLicense").value = p.foodLicense || "";
  byId("profilePublicSecurity").value = p.publicSecurity || "";
  byId("profileAddress").value = p.address || "";
  byId("profileServicePhone").value = p.servicePhone || "";
  byId("profileBusinessEmail").value = p.businessEmail || "";
  byId("profileHrEmail").value = p.hrEmail || "";
  byId("profileWorkingHours").value = p.workingHours || "";
  byId("profileLegalStatement").value = p.legalStatement || "";
  if (byId("siteStatus")) byId("siteStatus").value = s.siteStatus || "online";
  if (byId("defaultPageSize")) byId("defaultPageSize").value = s.defaultPageSize || 10;
  if (byId("enableCookieNotice")) byId("enableCookieNotice").checked = Boolean(s.enableCookieNotice);
}

function saveSiteProfile(e) {
  e.preventDefault();
  siteData.updateProfile({
    companyName: byId("profileCompanyName").value.trim(),
    companyShortName: byId("profileCompanyShortName").value.trim(),
    unifiedCode: byId("profileUnifiedCode").value.trim(),
    icp: byId("profileIcp").value.trim(),
    foodLicense: byId("profileFoodLicense").value.trim(),
    publicSecurity: byId("profilePublicSecurity").value.trim(),
    address: byId("profileAddress").value.trim(),
    servicePhone: byId("profileServicePhone").value.trim(),
    businessEmail: byId("profileBusinessEmail").value.trim(),
    hrEmail: byId("profileHrEmail").value.trim(),
    workingHours: byId("profileWorkingHours").value.trim(),
    legalStatement: byId("profileLegalStatement").value.trim()
  });
  siteData.updateSettings({
    siteStatus: byId("siteStatus") ? byId("siteStatus").value : "online",
    defaultPageSize: byId("defaultPageSize") ? Number(byId("defaultPageSize").value || 10) : 10,
    enableCookieNotice: byId("enableCookieNotice") ? byId("enableCookieNotice").checked : true
  });
  alert("站点信息已保存");
}

function loadLegalForm() {
  const legal = siteData.getLegal();
  byId("privacyEffectiveDate").value = (legal.privacy || {}).effectiveDate || "";
  byId("termsEffectiveDate").value = (legal.terms || {}).effectiveDate || "";
  byId("privacyContent").value = (legal.privacy || {}).content || "";
  byId("termsContent").value = (legal.terms || {}).content || "";
}

function saveLegal(e) {
  e.preventDefault();
  siteData.updateLegal("privacy", {
    effectiveDate: byId("privacyEffectiveDate").value.trim(),
    content: byId("privacyContent").value.trim()
  });
  siteData.updateLegal("terms", {
    effectiveDate: byId("termsEffectiveDate").value.trim(),
    content: byId("termsContent").value.trim()
  });
  alert("娉曞緥鏉℃宸蹭繚瀛?);
}

function renderLogs() {
  const logs = siteData.getLogs();
  ui.logsList.innerHTML = logs.length
    ? logs
        .map(
          log => `<div class="admin-log-row">
      <div><strong>${escapeHtml(log.action)}</strong> 路 ${escapeHtml(log.module)} 路 ${escapeHtml(log.detail || "")}</div>
      <div>${formatTime(log.at)} 路 ${escapeHtml(log.userName || "")}</div>
    </div>`
        )
        .join("")
    : `<div class="admin-empty">鏆傛棤鏃ュ織</div>`;
}

function renderMedia() {
  const list = siteData.getMediaAssets();
  ui.mediaList.innerHTML = list.length
    ? list
        .map(
          m => `<div class="admin-media-row">
      <div><strong>${escapeHtml(m.path)}</strong><div>${escapeHtml(m.title || "")}</div></div>
      <div>鏍囩锛?{escapeHtml((m.tags || []).join(", ")) || "-"}</div>
      <div>浣跨敤锛?{escapeHtml((m.usage || []).join(", ")) || "-"}</div>
      <div>${formatTime(m.updatedAt)}</div>
    </div>`
        )
        .join("")
    : `<div class="admin-empty">鏆傛棤濯掍綋璧勪骇璁板綍</div>`;
}

function saveMediaAsset(e) {
  e.preventDefault();
  const path = byId("mediaPath").value.trim();
  if (!path) {
    alert("璇峰～鍐欐枃浠惰矾寰?);
    return;
  }
  siteData.upsertMediaAsset({
    path,
    title: byId("mediaTitle").value.trim(),
    tags: splitComma("mediaTags"),
    usage: splitComma("mediaUsage")
  });
  byId("mediaPath").value = "";
  byId("mediaTitle").value = "";
  byId("mediaTags").value = "";
  byId("mediaUsage").value = "";
  renderMedia();
  renderLogs();
}

function renderWorkflow() {
  const modules = ["carousel", "news", "products", "careers"];
  const board = modules
    .map(module => {
      const list = getFilteredItems(module);
      const count = {
        draft: list.filter(i => i.status === "draft").length,
        review: list.filter(i => i.status === "review").length,
        published: list.filter(i => i.status === "published").length,
        archived: list.filter(i => i.status === "archived").length
      };
      return `<div class="admin-workflow-card">
        <h4>${moduleLabel(module)}</h4>
        <div>鑽夌锛?{count.draft}</div>
        <div>寰呭鏍革細${count.review}</div>
        <div>宸插彂甯冿細${count.published}</div>
        <div>宸插綊妗ｏ細${count.archived}</div>
      </div>`;
    })
    .join("");
  ui.workflowBoard.innerHTML = `<div class="admin-workflow-grid">${board}</div>`;
}

function exportData() {
  const json = siteData.exportJSON();
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `zhuoxi-site-data-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importData(event) {
  const file = event.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const ok = siteData.importJSON(e.target.result);
    if (!ok) {
      alert("瀵煎叆澶辫触锛孞SON鏍煎紡涓嶆纭€?);
      return;
    }
    initCategoryFilters();
    loadSeoForm();
    loadSiteProfileForm();
    loadLegalForm();
    renderAll();
    alert("鏁版嵁瀵煎叆鎴愬姛銆?);
  };
  reader.readAsText(file, "utf-8");
  event.target.value = "";
}

function resetData() {
  if (!confirm("纭閲嶇疆涓洪粯璁ゆ暟鎹紵")) return;
  siteData.resetToDefault();
  initCategoryFilters();
  loadSeoForm();
  loadSiteProfileForm();
  loadLegalForm();
  renderAll();
}

// ===== Utils =====
function byId(id) {
  return document.getElementById(id);
}

function val(id) {
  const node = byId(id);
  return node ? node.value.trim() : "";
}

function num(id, fallback = 0) {
  const v = parseInt(val(id), 10);
  return Number.isFinite(v) ? v : fallback;
}

function splitComma(id) {
  return val(id)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);
}

function splitLines(id) {
  return val(id)
    .split("\n")
    .map(s => s.trim())
    .filter(Boolean);
}

function formatTime(iso) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function formatDate(d) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}.${mm}.${dd}`;
}

function statusLabel(status) {
  if (status === "draft") return "鑽夌";
  if (status === "review") return "寰呭鏍?;
  if (status === "published") return "宸插彂甯?;
  if (status === "archived") return "宸插綊妗?;
  return status || "-";
}

function categoryLabel(key) {
  const map = {
    brand: "鍝佺墝璧勮",
    event: "娲诲姩鎶ラ亾",
    industry: "琛屼笟鍔ㄦ€?,
    global: "鍏ㄧ悆鍖?,
    product: "浜у搧鐮斿彂",
    spicy: "鏃犻绯诲垪",
    sour: "铏庣毊绯诲垪",
    fragrant: "鑰佸崵绯诲垪"
  };
  return map[key] || key || "鏈垎绫?;
}

function moduleLabel(module) {
  const map = {
    carousel: "杞挱",
    news: "璧勮",
    products: "浜у搧",
    careers: "宀椾綅"
  };
  return map[module] || module;
}

function escapeHtml(text) {
  return String(text || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}


