const navbarHTML = `
<nav class="navbar" id="main-nav">
  <div class="nav-container">
    <a href="index.html" class="logo">
      <img src="hero.png" alt="脱骨侠 Logo" id="brand-logo" style="height: 38px; mix-blend-mode: multiply;">
      <span class="brand-name">卓希集团</span>
    </a>
    <ul class="nav-links">
      <li><a href="index.html" id="nav-index">集团首页</a></li>
      <li class="has-dropdown">
        <a href="about.html" id="nav-about">关于我们</a>
        <div class="dropdown-island">
          <div class="dropdown-grid single-col">
            <a href="about.html">集团概况</a>
            <a href="about.html#culture">企业文化</a>
          </div>
        </div>
      </li>
      <li class="has-dropdown">
        <a href="news.html" id="nav-news">集团资讯</a>
        <div class="dropdown-island">
          <div class="dropdown-grid single-col">
            <a href="news.html">新闻中心</a>
            <a href="news.html">品牌动态</a>
          </div>
        </div>
      </li>
      <li><a href="products.html" id="nav-products">产品介绍</a></li>
      <li class="has-dropdown">
        <a href="contact.html" id="nav-contact">联系我们</a>
        <div class="dropdown-island">
          <div class="dropdown-grid single-col">
            <a href="contact.html">商务合作</a>
            <a href="contact.html#careers">加入我们</a>
          </div>
        </div>
      </li>
      <li><a href="https://gleeglee.zhuoxi.group/" target="_blank">越南官网</a></li>
      <li><a href="admin.html" id="nav-admin">后台管理</a></li>
    </ul>
    <div class="nav-actions">
      <button class="nav-toggle-btn" title="切换沉浸模式">
        <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 3h6v6" />
          <path d="M9 21H3v-6" />
          <path d="M21 3l-7 7" />
          <path d="M3 21l7-7" />
        </svg>
      </button>
    </div>
  </div>
</nav>
`;

class ZhuoxiNavbar extends HTMLElement {
  connectedCallback() {
    this.innerHTML = navbarHTML;

    const filename = window.location.pathname.split("/").pop() || "index.html";
    const activeMap = {
      "index.html": "nav-index",
      "about.html": "nav-about",
      "news.html": "nav-news",
      "news-detail.html": "nav-news",
      "products.html": "nav-products",
      "product-detail.html": "nav-products",
      "contact.html": "nav-contact",
      "privacy.html": "nav-contact",
      "terms.html": "nav-contact",
      "admin.html": "nav-admin"
    };
    const activeId = activeMap[filename];
    if (!activeId) return;
    const el = this.querySelector("#" + activeId);
    if (!el) return;
    el.style.color = "var(--hero-orange)";
    el.style.opacity = "1";
  }
}

customElements.define("zhuoxi-navbar", ZhuoxiNavbar);
