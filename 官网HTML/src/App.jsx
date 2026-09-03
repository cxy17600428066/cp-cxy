import { useEffect, useMemo, useState } from "react";
import { Admin } from "./Admin.jsx";
import { loadConfig } from "./config.js";

function getAdminSection() {
  return new URLSearchParams(window.location.search).get("admin");
}

function getPageId(pages) {
  const id = window.location.hash.slice(1);
  return pages.some((page) => page.id === id) ? id : pages[0]?.id ?? "home";
}

function IntroductionSection({ content }) {
  if (!content?.enabled) return null;
  const paragraphs = (content.content ?? "")
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <section className={`site-introduction ${content.image ? "with-image" : ""}`} id={`${content.id}-introduction`}>
      {content.image && <div className="site-introduction-image"><img src={content.image} alt={`${content.label}配图`} /></div>}
      <div className="site-introduction-copy">
        <span>{content.eyebrow}</span>
        <h2>{content.title}</h2>
        <h3>{content.subtitle}</h3>
        <p className="site-introduction-summary">{content.summary}</p>
        <div className="site-introduction-body">
          {paragraphs.map((paragraph, index) => <p key={`${content.id}-${index}`}>{paragraph}</p>)}
        </div>
      </div>
    </section>
  );
}

function ConfigurableContentSection({ section, index }) {
  if (!section.enabled) return null;
  const paragraphs = (section.content ?? "").split(/\n+/).map((item) => item.trim()).filter(Boolean);
  const images = [section.image, section.secondaryImage].filter(Boolean);

  return (
    <section className={`site-content-section ${index % 2 ? "reverse" : ""}`} id={section.id}>
      <div className="site-content-copy">
        <span>{section.eyebrow}</span>
        <h2>{section.title}</h2>
        <p className="site-content-summary">{section.summary}</p>
        <div className="site-content-body">{paragraphs.map((paragraph, paragraphIndex) => <p key={`${section.id}-${paragraphIndex}`}>{paragraph}</p>)}</div>
        {(section.items ?? []).length > 0 && (
          <div className="site-content-metrics">
            {section.items.map((item, itemIndex) => <div key={`${section.id}-metric-${itemIndex}`}><strong>{item.value}</strong><span>{item.label}</span></div>)}
          </div>
        )}
      </div>
      {images.length > 0 && <div className={`site-content-images count-${images.length}`}>{images.map((src, imageIndex) => <img src={src} alt={`${section.label}图片${imageIndex + 1}`} key={src} />)}</div>}
    </section>
  );
}

function PageContentSections({ sections = [] }) {
  return sections.map((section, index) => <ConfigurableContentSection section={section} index={index} key={section.id} />);
}

function ProductDetailModal({ product, category, onClose }) {
  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose]);

  const fields = [
    ["商品标准名称", product.standardName],
    ["商品标准简称", product.shortName],
    ["联合编码", product.skuCode],
    ["版本信息", product.version],
    ["运行状态", product.operationStatus],
    ["商品品牌", product.brand],
    ["商品分类", category?.name],
    ["商品口味", product.flavor],
    ["商品单位", product.unit],
    ["克重", product.weight],
    ["含骨信息", product.boneContent],
    ["温层", product.storageCondition],
    ["固形物含量", product.solidContent],
    ["保质期", product.shelfLife],
    ["辣度", product.spiciness],
    ["销售渠道", product.salesChannel],
    ["69码 / 商品条码", product.barcode],
    ["有货发货时限", product.inStockLeadHours ? `${product.inStockLeadHours} 小时` : ""],
    ["缺货发货时限", product.outOfStockLeadHours ? `${product.outOfStockLeadHours} 小时` : ""],
  ].filter(([, value]) => value);

  return (
    <div className="site-product-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="site-product-modal" role="dialog" aria-modal="true" aria-labelledby="site-product-modal-title" onMouseDown={(event) => event.stopPropagation()}>
        <header><div><small>{category?.name}</small><h2 id="site-product-modal-title">{product.name}</h2></div><button type="button" onClick={onClose}>关闭</button></header>
        <div className="site-product-modal-body">
          <div className="site-product-effect-image"><img src={product.effectImage || product.packageImage || product.image} alt={`${product.name}商品效果图`} /></div>
          <div className="site-product-detail-copy">
            {product.standardName && <p className="site-product-standard-name">{product.standardName}</p>}
            <dl>{fields.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
            {product.description && <div className="site-product-detail-description"><strong>商品详情</strong><p>{product.description}</p></div>}
          </div>
        </div>
      </section>
    </div>
  );
}

function ProductShowcase({ categories = [], products = [] }) {
  const enabledCategories = useMemo(
    () => categories.filter((category) => category.enabled),
    [categories],
  );
  const [activeCategoryId, setActiveCategoryId] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    if (activeCategoryId && !enabledCategories.some((category) => category.id === activeCategoryId)) {
      setActiveCategoryId("");
    }
  }, [activeCategoryId, enabledCategories]);

  if (enabledCategories.length === 0) return null;

  const activeCategory = enabledCategories.find((category) => category.id === activeCategoryId);
  const visibleProducts = products.filter(
    (product) => product.categoryId === activeCategoryId && product.status === "published",
  );

  return (
    <section className="site-product-showcase" aria-labelledby="product-showcase-title">
      <div className="site-product-heading">
        <div><span>Product collection</span><h2 id="product-showcase-title">全系列产品</h2></div>
        <p>选择商品分类，查看该分类下已发布的商品。</p>
      </div>
      <div className="site-product-categories" aria-label="商品分类">
        {enabledCategories.map((category) => (
          <article className={category.id === activeCategoryId ? "active" : ""} key={category.id}>
            <img src={category.image} alt="" />
            <h3>{category.name}</h3>
            <p>{category.description}</p>
            <span>{products.filter((product) => product.categoryId === category.id && product.status === "published").length} 个商品</span>
            <button type="button" aria-expanded={category.id === activeCategoryId} aria-controls="category-product-list" onClick={() => { setActiveCategoryId(category.id); setSelectedProduct(null); }}>{category.detailText || "查看详情"}</button>
          </article>
        ))}
      </div>
      {!activeCategory && <div className="site-product-select-hint">点击商品类型的“查看详情”，即可浏览该类型下的商品。</div>}
      {activeCategory && (
        <div className="site-category-products" id="category-product-list">
          <div className="site-category-products-heading">
            <div><small>Category products</small><h3>{activeCategory.name}商品列表</h3><p>{activeCategory.description}</p></div>
            <button type="button" onClick={() => setActiveCategoryId("")}>收起列表</button>
          </div>
          <div className="site-product-list" aria-live="polite">
            {visibleProducts.map((product) => (
              <article className="site-product-card" key={product.id}>
                <div className="site-product-image"><img src={product.effectImage || product.image} alt={product.name} /></div>
                <small>{activeCategory.name}</small>
                <h3>{product.name}</h3>
                <p>{product.slogan || product.description}</p>
                {product.specs && <span className="site-product-specs">{product.specs}</span>}
                <button className="site-product-detail-button" type="button" onClick={() => setSelectedProduct(product)}>查看商品详情</button>
              </article>
            ))}
            {visibleProducts.length === 0 && <div className="site-product-empty">该类型暂无已发布商品</div>}
          </div>
        </div>
      )}
      {selectedProduct && <ProductDetailModal product={selectedProduct} category={activeCategory} onClose={() => setSelectedProduct(null)} />}
    </section>
  );
}

export function App() {
  const [config, setConfig] = useState(loadConfig);
  const [artboardAspect, setArtboardAspect] = useState(null);
  const enabledPages = useMemo(
    () => config.pages.filter((page) => page.enabled),
    [config.pages],
  );
  const [pageId, setPageId] = useState(() => getPageId(enabledPages));
  const page = useMemo(
    () =>
      enabledPages.find((item) => item.id === pageId) ??
      enabledPages[0] ??
      config.pages[0],
    [config.pages, enabledPages, pageId],
  );

  useEffect(() => {
    setArtboardAspect(null);
  }, [page?.id, page?.image, page?.footerCropPercent]);

  useEffect(() => {
    if (!enabledPages.some((item) => item.id === pageId) && enabledPages[0]) {
      window.location.hash = enabledPages[0].id;
      setPageId(enabledPages[0].id);
    }
  }, [enabledPages, pageId]);

  useEffect(() => {
    const onHashChange = () => {
      if (window.location.hash === "#site-footer") {
        window.requestAnimationFrame(() => {
          document.getElementById("site-footer")?.scrollIntoView({ block: "start" });
        });
        return;
      }
      setPageId(getPageId(enabledPages));
      window.scrollTo({ top: 0, behavior: "auto" });
    };
    window.addEventListener("hashchange", onHashChange);
    if (window.location.hash === "#site-footer") onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, [enabledPages]);

  useEffect(() => {
    document.title = getAdminSection()
      ? `后台管理 | ${config.siteName}`
      : page?.title ?? config.siteName;
  }, [config.siteName, page]);

  const adminSection = getAdminSection();
  if (adminSection) {
    return (
      <Admin
        initialConfig={config}
        onConfigChange={setConfig}
        section={adminSection === "1" ? "introductions" : adminSection}
      />
    );
  }

  if (!page) {
    return <main className="site-empty">暂无已启用页面，请进入后台管理启用页面。</main>;
  }

  const layoutStyle = {
    "--desktop-width": `${config.desktopWidthPercent}vw`,
    "--desktop-max": `${config.desktopMaxWidth}px`,
  };

  return (
    <main className="site-canvas" style={layoutStyle}>
      {config.header.enabled && (
        <header className={`site-header ${config.header.sticky ? "sticky" : ""}`}>
          <div className="site-header-inner">
            <a className="site-logo" href="#home" aria-label={config.siteName}>
              {config.header.logoImage && <img src={config.header.logoImage} alt="" />}
              <strong>{config.header.logoText || config.siteName}</strong>
            </a>
            <nav className="site-primary-nav" aria-label="官网头部导航">
              {config.header.navigation.filter((item) => item.enabled).map((item) => {
                const children = (item.children ?? []).filter((child) => child.enabled);
                return (
                  <div className={`site-nav-item ${item.link === `#${page.id}` ? "active" : ""}`} key={item.id}>
                    <a href={item.link}>{item.label}</a>
                    {children.length > 0 && (
                      <div className="site-submenu">
                        {children.map((child) => <a href={child.link} key={child.id}>{child.label}</a>)}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </header>
      )}
      {page.bannerEnabled !== false && page.bannerImage && (
        <section className="site-banner" aria-label={`${page.label}Banner`}>
          <img src={page.bannerImage} alt={page.bannerAlt || `${page.label}Banner`} />
        </section>
      )}
      <section className="artboard" aria-label={page.title} style={artboardAspect ? { aspectRatio: artboardAspect, minHeight: 0 } : undefined}>
        <img
          className="design-page"
          src={page.image}
          alt={`${page.title}完整设计稿`}
          fetchPriority="high"
          onLoad={(event) => {
            const image = event.currentTarget;
            if (image?.naturalWidth && image?.naturalHeight) {
              const croppedHeight = image.naturalHeight * (1 - (page.footerCropPercent ?? 0) / 100);
              setArtboardAspect(`${image.naturalWidth} / ${croppedHeight}`);
            }
            if (window.location.hash === "#site-footer") {
              window.requestAnimationFrame(() => {
                document.getElementById("site-footer")?.scrollIntoView({ block: "start" });
              });
            }
          }}
        />
      </section>
      {page.id === "brand" && <IntroductionSection content={config.introductions.brand} />}
      {page.id === "about" && <IntroductionSection content={config.introductions.group} />}
      {page.id === "about" && <PageContentSections sections={config.contentSections.about} />}
      {page.id === "supply-chain" && <PageContentSections sections={config.contentSections.supply} />}
      {page.id === "careers" && <PageContentSections sections={config.contentSections.careers} />}
      {page.id === "brand" && (
        <ProductShowcase categories={config.productCategories} products={config.products} />
      )}
      {config.footer.enabled && (
        <footer className="site-footer" id="site-footer">
          <div className="site-footer-inner">
            <nav className="site-footer-nav" aria-label="官网底部导航">
              {config.footer.navigation.filter((item) => item.enabled).map((item) => (
                <section className="site-footer-group" key={item.id}>
                  <strong>{item.label}</strong>
                  <div>
                    {(item.children ?? []).filter((child) => child.enabled).map((child) => (
                      <a href={child.link} key={child.id}>{child.label}</a>
                    ))}
                  </div>
                </section>
              ))}
            </nav>
          </div>
          <div className="site-footer-legal">
            <span>{config.footer.copyright}</span>
            {config.footer.filingText && <a href={config.footer.filingLink || undefined} target={config.footer.filingLink ? "_blank" : undefined} rel="noreferrer">{config.footer.filingText}</a>}
            {config.footer.securityFilingText && <a href={config.footer.securityFilingLink || undefined} target={config.footer.securityFilingLink ? "_blank" : undefined} rel="noreferrer">{config.footer.securityFilingText}</a>}
          </div>
        </footer>
      )}
      <a className="admin-entry" href="/?admin=introductions">后台管理</a>
    </main>
  );
}
