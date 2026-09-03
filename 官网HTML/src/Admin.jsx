import { useState } from "react";
import { defaultConfig, saveConfig } from "./config.js";
import {
  ArticleManager,
  Modal,
  NewsManager,
  ProductManager,
} from "./ContentManagers.jsx";
import { ImageUploadField } from "./MediaUpload.jsx";
import { NavigationFooterManager } from "./SiteStructureManagers.jsx";

function clone(value) {
  return structuredClone(value);
}

const sections = [
  { id: "introductions", label: "品牌与集团", eyebrow: "Brand & group", title: "品牌简介与集团介绍" },
  { id: "supply-content", label: "全供应链", eyebrow: "Supply chain", title: "全供应链内容配置" },
  { id: "careers-content", label: "渠道与招聘", eyebrow: "Channel & careers", title: "渠道合作与人才招聘" },
  { id: "navigation", label: "导航与页脚", eyebrow: "Navigation & footer", title: "导航与页脚配置" },
  { id: "products", label: "商品展示", eyebrow: "Product showcase", title: "商品展示配置" },
  { id: "content", label: "资讯与文章", eyebrow: "Content center", title: "资讯与文章内容中心" },
];

function PageModuleManager({ pages, onChange }) {
  const [editing, setEditing] = useState(null);

  function updatePage(index, field, value) {
    onChange(
      pages.map((page, pageIndex) =>
        pageIndex === index ? { ...page, [field]: value } : page,
      ),
    );
  }

  function movePage(index, direction) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= pages.length) return;
    const next = [...pages];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  function saveEditing() {
    onChange(
      pages.map((page, index) =>
        index === editing.index
          ? {
              ...page,
              label: editing.label,
              title: editing.title,
              image: editing.image,
              description: editing.description,
            }
          : page,
      ),
    );
    setEditing(null);
  }

  function field(name, value) {
    setEditing((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <section className="admin-section standalone-section">
        <div className="admin-section-heading">
          <div>
            <span>Page modules</span>
            <h2>页面模块</h2>
          </div>
          <p>调整导航顺序、启用状态、页面名称、SEO标题和设计图资源。</p>
        </div>
        <div className="admin-page-list">
          {pages.map((page, index) => (
            <article className="admin-page-card compact" key={page.id}>
              <div className="admin-page-preview">
                <img src={page.image} alt="" />
                <span>{String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="admin-page-fields">
                <div className="admin-page-title-row">
                  <div>
                    <small>{page.id}</small>
                    <h3>{page.label || "未命名页面"}</h3>
                    <p>{page.description}</p>
                  </div>
                  <label className="admin-switch">
                    <input
                      type="checkbox"
                      checked={page.enabled}
                      onChange={(event) =>
                        updatePage(index, "enabled", event.target.checked)
                      }
                    />
                    <span>{page.enabled ? "已启用" : "已停用"}</span>
                  </label>
                </div>
              </div>
              <div className="admin-order-actions" aria-label={`${page.label}排序`}>
                <button
                  type="button"
                  disabled={index === 0}
                  onClick={() => movePage(index, -1)}
                >
                  上移
                </button>
                <button
                  type="button"
                  disabled={index === pages.length - 1}
                  onClick={() => movePage(index, 1)}
                >
                  下移
                </button>
                <button
                  className="edit"
                  type="button"
                  onClick={() => setEditing({ ...page, index })}
                >
                  编辑
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
      {editing && (
        <Modal
          title="编辑页面模块"
          subtitle="Page module form"
          onClose={() => setEditing(null)}
          onSave={saveEditing}
        >
          <div className="admin-form-grid modal-form-grid">
            <label>
              <span>导航名称</span>
              <input value={editing.label} onChange={(event) => field("label", event.target.value)} />
            </label>
            <label>
              <span>SEO标题</span>
              <input value={editing.title} onChange={(event) => field("title", event.target.value)} />
            </label>
            <ImageUploadField className="wide" label="页面设计图" value={editing.image} onChange={(value) => field("image", value)} />
            <label className="wide">
              <span>页面内容说明</span>
              <textarea
                rows="4"
                value={editing.description}
                onChange={(event) => field("description", event.target.value)}
              />
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}

function SiteSettings({ draft, updateSite }) {
  return (
    <section className="admin-section admin-card standalone-section">
      <div className="admin-section-heading">
        <div>
          <span>Site settings</span>
          <h2>全站设置</h2>
        </div>
        <p>控制站点名称和桌面端官网画布比例。</p>
      </div>
      <div className="admin-form-grid">
        <label>
          <span>站点名称</span>
          <input
            value={draft.siteName}
            onChange={(event) => updateSite("siteName", event.target.value)}
          />
        </label>
        <label>
          <span>桌面画布宽度（%）</span>
          <input
            min="60"
            max="100"
            step="0.1"
            type="number"
            value={draft.desktopWidthPercent}
            onChange={(event) =>
              updateSite("desktopWidthPercent", Number(event.target.value))
            }
          />
        </label>
        <label>
          <span>桌面最大宽度（px）</span>
          <input
            min="960"
            max="2400"
            step="10"
            type="number"
            value={draft.desktopMaxWidth}
            onChange={(event) =>
              updateSite("desktopMaxWidth", Number(event.target.value))
            }
          />
        </label>
      </div>
    </section>
  );
}

function ContentCenter({ news, articles, onNewsChange, onArticlesChange }) {
  const [activeTab, setActiveTab] = useState("news");
  return (
    <section className="content-center">
      <div className="admin-config-tabs content-center-tabs" role="tablist" aria-label="资讯内容分类">
        <button className={activeTab === "news" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "news"} onClick={() => setActiveTab("news")}><strong>新闻资讯</strong><span>{news.length}</span></button>
        <button className={activeTab === "articles" ? "active" : ""} type="button" role="tab" aria-selected={activeTab === "articles"} onClick={() => setActiveTab("articles")}><strong>文章内容</strong><span>{articles.length}</span></button>
      </div>
      {activeTab === "news" && <NewsManager news={news} articles={articles} onChange={onNewsChange} />}
      {activeTab === "articles" && <ArticleManager articles={articles} onChange={onArticlesChange} />}
    </section>
  );
}

function IntroductionManager({ introductions, onChange }) {
  const [activeTab, setActiveTab] = useState("brand");
  const [editing, setEditing] = useState(null);
  const tabs = [
    { id: "brand", label: "品牌简介" },
    { id: "group", label: "集团介绍" },
  ];
  const current = introductions[activeTab];

  function saveEditing() {
    const { type, ...record } = editing;
    onChange({ ...introductions, [type]: record });
    setEditing(null);
  }

  function field(name, value) {
    setEditing((item) => ({ ...item, [name]: value }));
  }

  return (
    <section className="admin-section standalone-section introduction-manager">
      <div className="admin-section-heading">
        <div><span>Brand & group content</span><h2>品牌简介与集团介绍</h2></div>
        <p>分别维护官网品牌页与关于我们页面中的介绍内容和配图。</p>
      </div>
      <div className="admin-config-tabs" role="tablist" aria-label="品牌与集团内容分类">
        {tabs.map((tab) => (
          <button className={activeTab === tab.id ? "active" : ""} type="button" role="tab" aria-selected={activeTab === tab.id} onClick={() => setActiveTab(tab.id)} key={tab.id}>
            <strong>{tab.label}</strong><span>{introductions[tab.id]?.enabled ? 1 : 0}</span>
          </button>
        ))}
      </div>
      <article className="admin-card introduction-config-card">
        <div className="introduction-admin-preview">
          {current.image ? <img src={current.image} alt="" /> : <span>暂无配图</span>}
        </div>
        <div className="introduction-admin-copy">
          <small>{current.eyebrow}</small>
          <h3>{current.title}</h3>
          <strong>{current.subtitle}</strong>
          <p>{current.summary}</p>
          <span className={`content-status ${current.enabled ? "published" : "offline"}`}>{current.enabled ? "官网展示中" : "已隐藏"}</span>
        </div>
        <button className="admin-button primary" type="button" onClick={() => setEditing({ ...current, type: activeTab })}>编辑{current.label}</button>
      </article>

      {editing && (
        <Modal title={`编辑${editing.label}`} subtitle="Introduction content form" onClose={() => setEditing(null)} onSave={saveEditing}>
          <div className="admin-form-grid modal-form-grid">
            <label><span>栏目英文标识</span><input value={editing.eyebrow} onChange={(event) => field("eyebrow", event.target.value)} /></label>
            <label><span>内容副标题</span><input value={editing.subtitle} onChange={(event) => field("subtitle", event.target.value)} /></label>
            <label className="wide"><span>主标题</span><input value={editing.title} onChange={(event) => field("title", event.target.value)} /></label>
            <label className="wide"><span>简介摘要</span><textarea rows="3" value={editing.summary} onChange={(event) => field("summary", event.target.value)} /></label>
            <label className="wide"><span>详细介绍</span><textarea rows="8" value={editing.content} onChange={(event) => field("content", event.target.value)} /></label>
            <ImageUploadField className="wide" label={`${editing.label}配图`} value={editing.image} onChange={(value) => field("image", value)} />
            <label className="modal-check"><input type="checkbox" checked={editing.enabled} onChange={(event) => field("enabled", event.target.checked)} /><span>在官网展示此内容</span></label>
          </div>
        </Modal>
      )}
    </section>
  );
}

function ConfigurableSectionManager({ title, eyebrow, description, sections: contentItems, onChange }) {
  const [activeId, setActiveId] = useState(contentItems[0]?.id ?? "");
  const [editing, setEditing] = useState(null);
  const current = contentItems.find((item) => item.id === activeId) ?? contentItems[0];

  function saveEditing() {
    const items = editing.itemsText
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [value, ...labelParts] = line.split("|");
        return { value: value.trim(), label: labelParts.join("|").trim() };
      });
    const { itemsText, ...record } = editing;
    onChange(contentItems.map((item) => item.id === record.id ? { ...record, items } : item));
    setEditing(null);
  }

  function field(name, value) {
    setEditing((item) => ({ ...item, [name]: value }));
  }

  if (!current) return null;

  return (
    <section className="admin-section standalone-section configurable-section-manager">
      <div className="admin-section-heading">
        <div><span>{eyebrow}</span><h2>{title}</h2></div>
        <p>{description}</p>
      </div>
      <div className="admin-config-tabs" role="tablist" aria-label={`${title}分类`}>
        {contentItems.map((item) => (
          <button className={activeId === item.id ? "active" : ""} type="button" role="tab" aria-selected={activeId === item.id} onClick={() => setActiveId(item.id)} key={item.id}>
            <strong>{item.label}</strong><span>{item.enabled ? 1 : 0}</span>
          </button>
        ))}
      </div>
      <article className="admin-card introduction-config-card section-config-card">
        <div className="section-admin-images">
          <div className="introduction-admin-preview">{current.image ? <img src={current.image} alt="" /> : <span>暂无主图</span>}</div>
          {current.secondaryImage && <div className="introduction-admin-preview secondary"><img src={current.secondaryImage} alt="" /></div>}
        </div>
        <div className="introduction-admin-copy">
          <small>{current.eyebrow}</small>
          <h3>{current.title}</h3>
          <p>{current.summary}</p>
          <div className="section-admin-metrics">
            {(current.items ?? []).map((item, index) => <span key={`${current.id}-${index}`}><b>{item.value}</b>{item.label}</span>)}
          </div>
          <span className={`content-status ${current.enabled ? "published" : "offline"}`}>{current.enabled ? "官网展示中" : "已隐藏"}</span>
        </div>
        <button className="admin-button primary" type="button" onClick={() => setEditing({ ...current, itemsText: (current.items ?? []).map((item) => `${item.value}|${item.label}`).join("\n") })}>编辑{current.label}</button>
      </article>

      {editing && (
        <Modal title={`编辑${editing.label}`} subtitle="Website section form" onClose={() => setEditing(null)} onSave={saveEditing}>
          <div className="admin-form-grid modal-form-grid">
            <label><span>模块名称</span><input value={editing.label} onChange={(event) => field("label", event.target.value)} /></label>
            <label><span>英文标识</span><input value={editing.eyebrow} onChange={(event) => field("eyebrow", event.target.value)} /></label>
            <label className="wide"><span>主标题</span><input value={editing.title} onChange={(event) => field("title", event.target.value)} /></label>
            <label className="wide"><span>简介摘要</span><textarea rows="3" value={editing.summary} onChange={(event) => field("summary", event.target.value)} /></label>
            <label className="wide"><span>详细内容</span><textarea rows="6" value={editing.content} onChange={(event) => field("content", event.target.value)} /></label>
            <label className="wide"><span>数据项 / 时间节点（每行：数值|说明）</span><textarea rows="6" value={editing.itemsText} onChange={(event) => field("itemsText", event.target.value)} placeholder={'30+|研发人员\n45项|发明专利'} /></label>
            <ImageUploadField label="模块主图" value={editing.image} onChange={(value) => field("image", value)} />
            <ImageUploadField label="模块辅助图" value={editing.secondaryImage} onChange={(value) => field("secondaryImage", value)} />
            <label className="modal-check"><input type="checkbox" checked={editing.enabled} onChange={(event) => field("enabled", event.target.checked)} /><span>在官网展示此模块</span></label>
          </div>
        </Modal>
      )}
    </section>
  );
}

function Overview({ draft, dirty }) {
  const enabledCount = draft.pages.filter((page) => page.enabled).length;
  const moduleCards = [
    { id: "site", count: 3, detail: "站点名称与页面尺寸" },
    { id: "navigation", count: draft.header.navigation.length + draft.footer.navigation.length, detail: "头部、二级菜单与页脚" },
    { id: "products", count: draft.products.length, detail: "商品系列与展示内容" },
    { id: "content", count: draft.news.length + draft.articles.length, detail: "新闻资讯与文章正文" },
  ];

  return (
    <>
      <section className="admin-section">
        <div className="admin-stats">
          <article>
            <span>页面模块</span>
            <strong>{draft.pages.length}</strong>
            <small>已识别的官网一级页面</small>
          </article>
          <article>
            <span>当前启用</span>
            <strong>{enabledCount}</strong>
            <small>会显示在官网导航中</small>
          </article>
          <article>
            <span>内容资源</span>
            <strong>{draft.products.length + draft.news.length + draft.articles.length}</strong>
            <small>{draft.products.length}商品 / {draft.news.length}新闻 / {draft.articles.length}文章</small>
          </article>
          <article>
            <span>发布状态</span>
            <strong className={dirty ? "status-dirty" : "status-saved"}>
              {dirty ? "待发布" : "已同步"}
            </strong>
            <small>{dirty ? "存在未保存的修改" : "配置与官网一致"}</small>
          </article>
        </div>
      </section>
      <section className="admin-section">
        <div className="admin-section-heading">
          <div>
            <span>Module center</span>
            <h2>独立管理模块</h2>
          </div>
          <p>每个模块都有独立地址、独立页面和独立编辑区域。</p>
        </div>
        <div className="admin-module-grid">
          {moduleCards.map((card) => {
            const meta = sections.find((item) => item.id === card.id);
            return (
              <a href={`/?admin=${card.id}`} key={card.id}>
                <small>{meta.eyebrow}</small>
                <strong>{meta.label}</strong>
                <span>{card.count}</span>
                <p>{card.detail}</p>
                <b>进入管理</b>
              </a>
            );
          })}
        </div>
      </section>
    </>
  );
}

export function Admin({ initialConfig, onConfigChange, section }) {
  const activeSection = sections.some((item) => item.id === section)
    ? section
    : "introductions";
  const meta = sections.find((item) => item.id === activeSection);
  const [draft, setDraft] = useState(() => clone(initialConfig));
  const [savedSnapshot, setSavedSnapshot] = useState(() =>
    JSON.stringify(initialConfig),
  );
  const [notice, setNotice] = useState("");
  const dirty = JSON.stringify(draft) !== savedSnapshot;

  function updateSite(field, value) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function publish() {
    saveConfig(draft);
    setSavedSnapshot(JSON.stringify(draft));
    onConfigChange(clone(draft));
    setNotice(`${meta.label}配置已保存并发布`);
    window.setTimeout(() => setNotice(""), 2600);
  }

  function restoreDefaults() {
    const restored = clone(defaultConfig);
    setDraft(restored);
    setNotice("已载入默认配置，点击“保存并发布”后生效");
  }

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">CMS</span>
          <div>
            <strong>脱骨侠配置中心</strong>
            <small>Website Management</small>
          </div>
        </div>
        <nav className="admin-menu" aria-label="后台管理菜单">
          {sections.map((item) => (
            <a
              className={item.id === activeSection ? "active" : ""}
              href={`/?admin=${item.id}`}
              key={item.id}
              aria-current={item.id === activeSection ? "page" : undefined}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="admin-sidebar-note">
          当前模块：{meta.label}<br />
          每个模块均为独立管理页面。
        </div>
      </aside>

      <section className="admin-main">
        <header className="admin-topbar">
          <div>
            <p>{meta.eyebrow}</p>
            <h1>{meta.title}</h1>
          </div>
          <div className="admin-top-actions">
            <a className="admin-button ghost" href="/#home">返回官网</a>
            <button className="admin-button ghost" type="button" onClick={restoreDefaults}>
              恢复默认
            </button>
            <button className="admin-button primary" type="button" onClick={publish}>
              保存并发布
            </button>
          </div>
        </header>

        {notice && <div className="admin-notice" role="status">{notice}</div>}

        {activeSection === "introductions" && <div className="content-center"><IntroductionManager introductions={draft.introductions} onChange={(introductions) => setDraft((current) => ({ ...current, introductions }))} /><ConfigurableSectionManager title="关于我们扩展内容" eyebrow="About us sections" description="管理生产研发品控、发展里程碑、品牌荣誉和卓希文化。" sections={draft.contentSections.about} onChange={(about) => setDraft((current) => ({ ...current, contentSections: { ...current.contentSections, about } }))} /></div>}
        {activeSection === "supply-content" && <ConfigurableSectionManager title="全供应链内容" eyebrow="Supply chain sections" description="管理工厂布局、原料精选、生产质检、研发能力和品质认证。" sections={draft.contentSections.supply} onChange={(supply) => setDraft((current) => ({ ...current, contentSections: { ...current.contentSections, supply } }))} />}
        {activeSection === "careers-content" && <ConfigurableSectionManager title="渠道、合作与招聘" eyebrow="Channel & careers sections" description="管理渠道分布、业务洽谈和人才招聘内容。" sections={draft.contentSections.careers} onChange={(careers) => setDraft((current) => ({ ...current, contentSections: { ...current.contentSections, careers } }))} />}
        {activeSection === "navigation" && (
          <NavigationFooterManager
            header={draft.header}
            footer={draft.footer}
            pages={draft.pages}
            onHeaderChange={(header) => setDraft((current) => ({ ...current, header }))}
            onFooterChange={(footer) => setDraft((current) => ({ ...current, footer }))}
            onPagesChange={(pages) => setDraft((current) => ({ ...current, pages }))}
          />
        )}
        {activeSection === "products" && (
          <ProductManager
            products={draft.products}
            categories={draft.productCategories}
            onChange={(products) =>
              setDraft((current) => ({ ...current, products }))
            }
            onCategoriesChange={(productCategories) =>
              setDraft((current) => ({ ...current, productCategories }))
            }
          />
        )}
        {activeSection === "content" && (
          <ContentCenter
            news={draft.news}
            articles={draft.articles}
            onNewsChange={(news) => setDraft((current) => ({ ...current, news }))}
            onArticlesChange={(articles) => setDraft((current) => ({ ...current, articles }))}
          />
        )}
      </section>
    </main>
  );
}
