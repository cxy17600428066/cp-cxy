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

class ZhuoxiFooter extends HTMLElement {
    connectedCallback() {
        siteData.load();
        const profile = siteData.getProfile();
        const nav = siteData.getNavigation();
        const groups = (nav.footerGroups || []).sort((a, b) => a.order - b.order);
        const social = profile.social || {};

        const socialHtml = ['douyin', 'xhs', 'weibo'].map((k) => {
            const it = social[k] || {};
            if (!it.url) return '';
            return `
                <a href="${safeText(it.url)}" target="_blank" class="social-item-mini">
                    <img src="${safeText(it.icon || '')}" alt="${safeText(k)}" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover;">
                    ${it.qr ? `<div class="social-qr-popup"><img src="${safeText(it.qr)}" alt="${safeText(k)}二维码"></div>` : ''}
                </a>
            `;
        }).join('');

        this.innerHTML = `
<footer class="footer">
    <div class="footer-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
        <div class="footer-main" style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px;">
            <div class="footer-brand">
                <div class="brand-name" style="font-size: 24px; margin-bottom: 20px;">${safeText(profile.brandName)}</div>
                <p style="color: var(--text-muted); margin-bottom: 32px; max-width: 250px; font-size: 14px; line-height: 1.6;">
                    从手工匠心到工业智慧，致力于重塑全球休闲食品体验。
                </p>
                <div style="display: flex; gap: 16px;">${socialHtml}</div>
            </div>
            ${groups.map((g) => `
                <div class="footer-nav-col">
                    <h4 style="margin-bottom: 24px; font-size: 16px;">${safeText(g.title)}</h4>
                    <ul class="footer-link-list">
                        ${(g.links || []).map((l) => `<li><a href="${safeText(l.href)}">${safeText(l.label)}</a></li>`).join('')}
                    </ul>
                </div>
            `).join('')}
        </div>
        <div class="footer-bottom" style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <p class="footer-copy" style="color: var(--text-muted); font-size: 14px; margin: 0;">© 2026 ${safeText(profile.companyName)} | ${safeText(profile.icp)} | ${safeText(profile.sc)}</p>
            <div class="footer-legal">
                <a href="privacy.html" class="legal-link" style="color: var(--text-muted); font-size: 14px; text-decoration: none; margin-left: 24px;">隐私政策</a>
                <a href="terms.html" class="legal-link" style="color: var(--text-muted); font-size: 14px; text-decoration: none; margin-left: 24px;">使用条款</a>
            </div>
        </div>
    </div>
</footer>
        `;
    }
}

customElements.define('zhuoxi-footer', ZhuoxiFooter);
