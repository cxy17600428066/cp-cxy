const footerHTML = `
<footer class="footer">
    <div class="footer-container" style="max-width: 1200px; margin: 0 auto; width: 100%;">
        <div class="footer-main"
            style="display: grid; grid-template-columns: 1.5fr 1fr 1fr 1fr; gap: 40px; margin-bottom: 60px;">
            <!-- Brand & Social -->
            <div class="footer-brand">
                <div class="brand-name" style="font-size: 24px; margin-bottom: 20px;">卓希集团</div>
                <p
                    style="color: var(--text-muted); margin-bottom: 32px; max-width: 250px; font-size: 14px; line-height: 1.6;">
                    从手工匠心到工业智慧，致力于重塑全球休闲食品的爽感高度。
                </p>
                <div style="display: flex; gap: 16px;">
                    <!-- 抖音 -->
                    <a href="https://www.douyin.com" target="_blank" class="social-item-mini" title="访问官方抖音">
                        <img src="icon_douyin.png" alt="抖音图标" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover;">
                        <div class="social-qr-popup">
                            <img src="微信图片_20260415143029_283_2.png" alt="官方抖音二维码">
                        </div>
                    </a>
                    
                    <!-- 小红书 -->
                    <a href="https://www.xiaohongshu.com" target="_blank" class="social-item-mini" title="访问官方小红书">
                        <img src="icon_xhs.png" alt="小红书图标" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover;">
                        <div class="social-qr-popup">
                            <img src="微信图片_20260415143029_283_2.png" alt="官方小红书二维码">
                        </div>
                    </a>

                    <!-- 微博 -->
                    <a href="https://weibo.com" target="_blank" class="social-item-mini" title="访问官方微博">
                        <img src="icon_weibo.png" alt="微博图标" style="width: 24px; height: 24px; border-radius: 6px; object-fit: cover;">
                        <div class="social-qr-popup">
                            <img src="微信图片_20260415143029_283_2.png" alt="官方微博二维码">
                        </div>
                    </a>
                </div>
            </div>

            <!-- Links 1 -->
            <div class="footer-nav-col">
                <h4 style="margin-bottom: 24px; font-size: 16px;">了解卓希</h4>
                <ul class="footer-link-list">
                    <li><a href="about.html">集团概况</a></li>
                    <li><a href="about.html#timeline">发展历程</a></li>
                </ul>
            </div>

            <!-- Links 2 -->
            <div class="footer-nav-col">
                <h4 style="margin-bottom: 24px; font-size: 16px;">新闻与产品</h4>
                <ul class="footer-link-list">
                    <li><a href="news.html">媒体中心</a></li>
                    <li><a href="products.html">主打产品</a></li>
                </ul>
            </div>

            <!-- Links 3 -->
            <div class="footer-nav-col">
                <h4 style="margin-bottom: 24px; font-size: 16px;">合作与责任</h4>
                <ul class="footer-link-list">
                    <li><a href="contact.html">商务合作</a></li>
                    <li><a href="contact.html#careers">加入我们</a></li>
                </ul>
            </div>
        </div>

        <div class="footer-bottom"
            style="border-top: 1px solid rgba(0,0,0,0.05); padding-top: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px;">
            <p class="footer-copy" style="color: var(--text-muted); font-size: 14px; margin: 0;">© 2026 卓希食品科技有限公司 &nbsp;|&nbsp; 皖ICP备XXXXXXXX号 &nbsp;|&nbsp; SCXXXXXXXXXXXX</p>
            <div class="footer-legal">
                <a href="#" class="legal-link"
                    style="color: var(--text-muted); font-size: 14px; text-decoration: none; margin-left: 24px;">隐私政策</a>
                <a href="#" class="legal-link"
                    style="color: var(--text-muted); font-size: 14px; text-decoration: none; margin-left: 24px;">使用条款</a>
            </div>
        </div>
    </div>
</footer>
`;

class ZhuoxiFooter extends HTMLElement {
    connectedCallback() {
        this.innerHTML = footerHTML;
    }
}

customElements.define('zhuoxi-footer', ZhuoxiFooter);
