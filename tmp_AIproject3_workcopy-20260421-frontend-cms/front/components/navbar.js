/* global siteData */

function safeText(value) {
    return String(value ?? '').replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));
}

class ZhuoxiNavbar extends HTMLElement {
    connectedCallback() {
        siteData.load();
        const profile = siteData.getProfile();
        const nav = siteData.getNavigation();
        const links = (nav.topLinks || [])
            .filter((it) => it.status === 'published')
            .sort((a, b) => a.order - b.order);
        const extLinks = (nav.externalLinks || [])
            .filter((it) => it.status === 'published')
            .sort((a, b) => a.order - b.order);

        const currentPath = window.location.pathname.split('/').pop() || 'index.html';

        this.innerHTML = `
<nav class="navbar" id="main-nav">
    <div class="nav-container">
        <a href="index.html" class="logo">
            <img src="${safeText(profile.navLogo)}" alt="${safeText(profile.navLogoAlt || '品牌标识')}" id="brand-logo" style="height: 38px; mix-blend-mode: multiply;">
            <span class="brand-name">${safeText(profile.brandName)}</span>
        </a>
        <ul class="nav-links">
            ${links.map((link) => {
                const activeStyle = currentPath === link.href ? 'style="color:var(--hero-orange);opacity:1;"' : '';
                return `<li><a href="${safeText(link.href)}" ${activeStyle}>${safeText(link.label)}</a></li>`;
            }).join('')}
            ${extLinks.map((link) => `<li><a href="${safeText(link.href)}" target="_blank" rel="noopener">${safeText(link.label)}</a></li>`).join('')}
        </ul>
        <div class="nav-actions">
            <button class="nav-toggle-btn" title="切换沉浸模式">
                <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
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
    }
}

customElements.define('zhuoxi-navbar', ZhuoxiNavbar);
