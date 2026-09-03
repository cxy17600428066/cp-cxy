import { useState } from "react";
import { Modal } from "./ContentManagers.jsx";
import { ImageUploadField } from "./MediaUpload.jsx";

function move(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

function parseChildren(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [label, link = "#home"] = line.split("|").map((part) => part.trim());
      return { id: `sub-${Date.now()}-${index}`, label, link, enabled: true };
    });
}

function childrenText(children = []) {
  return children.map((item) => `${item.label}|${item.link}`).join("\n");
}

function NavigationList({ title, description, items, onChange, allowChildren = false }) {
  const [editing, setEditing] = useState(null);

  function openNew() {
    setEditing({
      id: `navigation-${Date.now()}`,
      label: "新导航",
      link: "#home",
      enabled: true,
      children: [],
      childrenInput: "",
      isNew: true,
    });
  }

  function save() {
    const record = {
      id: editing.id,
      label: editing.label,
      link: editing.link,
      enabled: editing.enabled,
      ...(allowChildren ? { children: parseChildren(editing.childrenInput) } : {}),
    };
    onChange(editing.isNew ? [...items, record] : items.map((item) => item.id === record.id ? record : item));
    setEditing(null);
  }

  return (
    <section className="admin-card structure-card">
      <div className="structure-card-heading">
        <div><h3>{title}</h3><p>{description}</p></div>
        <button className="admin-button primary" type="button" onClick={openNew}>新增导航</button>
      </div>
      <div className="structure-list">
        {items.map((item, index) => (
          <article className="structure-row" key={item.id}>
            <div>
              <small>{item.link}</small>
              <strong>{item.label}</strong>
              {allowChildren && <span>{item.children?.length ?? 0} 个二级菜单</span>}
            </div>
            <span className={`content-status ${item.enabled ? "published" : "offline"}`}>{item.enabled ? "已启用" : "已停用"}</span>
            <div className="collection-row-actions">
              <button type="button" disabled={index === 0} onClick={() => onChange(move(items, index, -1))}>上移</button>
              <button type="button" disabled={index === items.length - 1} onClick={() => onChange(move(items, index, 1))}>下移</button>
              <button className="edit" type="button" onClick={() => setEditing({ ...item, childrenInput: childrenText(item.children), isNew: false })}>编辑</button>
              <button className="danger" type="button" onClick={() => onChange(items.filter((entry) => entry.id !== item.id))}>删除</button>
            </div>
          </article>
        ))}
      </div>
      {editing && (
        <Modal title={editing.isNew ? "新增导航" : "编辑导航"} subtitle="Navigation form" onClose={() => setEditing(null)} onSave={save}>
          <div className="admin-form-grid modal-form-grid">
            <label><span>导航名称</span><input value={editing.label} onChange={(event) => setEditing({ ...editing, label: event.target.value })} /></label>
            <label><span>跳转链接</span><input value={editing.link} onChange={(event) => setEditing({ ...editing, link: event.target.value })} /></label>
            <label className="modal-check"><input type="checkbox" checked={editing.enabled} onChange={(event) => setEditing({ ...editing, enabled: event.target.checked })} /><span>启用此导航</span></label>
            {allowChildren && (
              <label className="wide"><span>二级菜单（每行：名称|链接）</span><textarea rows="7" value={editing.childrenInput} onChange={(event) => setEditing({ ...editing, childrenInput: event.target.value })} placeholder={'品牌介绍|#brand\n产品系列|#brand'} /></label>
            )}
          </div>
        </Modal>
      )}
    </section>
  );
}

function ConfigTabs({ tabs, active, onChange }) {
  return (
    <div className="admin-config-tabs" role="tablist" aria-label="配置分类">
      {tabs.map((tab) => (
        <button className={active === tab.id ? "active" : ""} type="button" role="tab" aria-selected={active === tab.id} onClick={() => onChange(tab.id)} key={tab.id}>
          <strong>{tab.label}</strong><span>{tab.count}</span>
        </button>
      ))}
    </div>
  );
}

function BannerManager({ pages, onChange }) {
  const [editing, setEditing] = useState(null);

  function saveEditing() {
    onChange(pages.map((page, index) => index === editing.index ? {
      ...page,
      bannerImage: editing.bannerImage,
      bannerAlt: editing.bannerAlt,
      bannerEnabled: editing.bannerEnabled,
    } : page));
    setEditing(null);
  }

  return (
    <>
      <section className="admin-card media-table-card banner-manager-card">
        <div className="structure-card-heading banner-manager-heading">
          <div><h3>页面 Banner 配置</h3><p>为每个官网页面独立设置 Banner 图片、图片说明和显示状态。</p></div>
        </div>
        <div className="media-table-scroll">
          <table className="media-config-table banner-config-table">
            <thead><tr><th>官网页面</th><th>Banner预览</th><th>图片说明</th><th>显示状态</th><th>操作</th></tr></thead>
            <tbody>
              {pages.map((page, index) => (
                <tr key={page.id}>
                  <td><strong>{page.label}</strong><small>#{page.id}</small></td>
                  <td><MediaPreview src={page.bannerImage} empty="未设置Banner" /></td>
                  <td>{page.bannerAlt || "未填写图片说明"}</td>
                  <td><span className={`content-status ${page.bannerEnabled !== false && page.bannerImage ? "published" : "offline"}`}>{page.bannerEnabled !== false && page.bannerImage ? "展示中" : "未展示"}</span></td>
                  <td><button className="admin-button primary" type="button" onClick={() => setEditing({ ...page, bannerEnabled: page.bannerEnabled !== false, index })}>配置Banner</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
      {editing && (
        <Modal title={`配置${editing.label} Banner`} subtitle="Page banner form" onClose={() => setEditing(null)} onSave={saveEditing}>
          <div className="admin-form-grid modal-form-grid">
            <ImageUploadField className="wide" label="页面Banner图片" value={editing.bannerImage} onChange={(bannerImage) => setEditing({ ...editing, bannerImage })} />
            <label className="wide"><span>Banner图片说明</span><input value={editing.bannerAlt} onChange={(event) => setEditing({ ...editing, bannerAlt: event.target.value })} /></label>
            <label className="modal-check"><input type="checkbox" checked={editing.bannerEnabled} onChange={(event) => setEditing({ ...editing, bannerEnabled: event.target.checked })} /><span>在官网展示此Banner</span></label>
          </div>
        </Modal>
      )}
    </>
  );
}

export function NavigationFooterManager({ header, footer, pages, onHeaderChange, onFooterChange, onPagesChange }) {
  const [activeTab, setActiveTab] = useState("header");
  const tabs = [
    { id: "header", label: "头部设置", count: 1 },
    { id: "header-nav", label: "头部导航", count: header.navigation.length },
    { id: "banner", label: "Banner配置", count: pages.filter((page) => page.bannerImage).length },
    { id: "footer", label: "页脚设置", count: 1 },
    { id: "footer-nav", label: "底部导航", count: footer.navigation.length },
    { id: "filing", label: "备案信息", count: 2 },
  ];

  return (
    <section className="admin-section standalone-section structure-manager">
      <div className="admin-section-heading">
        <div><span>Navigation & footer</span><h2>导航与页脚</h2></div>
        <p>不同配置已拆分为独立Tab，当前页面仅展示一个配置表。</p>
      </div>
      <ConfigTabs tabs={tabs} active={activeTab} onChange={setActiveTab} />

      {activeTab === "header" && <section className="admin-card structure-card"><div className="structure-card-heading"><div><h3>头部基础设置</h3><p>Logo、品牌文字、吸顶和整体显示状态。</p></div></div><div className="admin-form-grid"><label><span>品牌文字</span><input value={header.logoText} onChange={(event) => onHeaderChange({ ...header, logoText: event.target.value })} /></label><label className="modal-check"><input type="checkbox" checked={header.enabled} onChange={(event) => onHeaderChange({ ...header, enabled: event.target.checked })} /><span>显示头部导航</span></label><label className="modal-check"><input type="checkbox" checked={header.sticky} onChange={(event) => onHeaderChange({ ...header, sticky: event.target.checked })} /><span>滚动时吸顶</span></label><ImageUploadField className="wide" label="头部Logo" value={header.logoImage} onChange={(logoImage) => onHeaderChange({ ...header, logoImage })} /></div></section>}

      {activeTab === "header-nav" && <NavigationList title="头部导航与二级菜单" description="一级菜单支持排序、启停和多条二级菜单。" items={header.navigation} onChange={(navigation) => onHeaderChange({ ...header, navigation })} allowChildren />}

      {activeTab === "banner" && <BannerManager pages={pages} onChange={onPagesChange} />}

      {activeTab === "footer" && <section className="admin-card structure-card"><div className="structure-card-heading"><div><h3>页脚基础设置</h3><p>页脚品牌、介绍、Logo和版权信息。</p></div></div><div className="admin-form-grid"><label><span>页脚品牌文字</span><input value={footer.logoText} onChange={(event) => onFooterChange({ ...footer, logoText: event.target.value })} /></label><label className="modal-check"><input type="checkbox" checked={footer.enabled} onChange={(event) => onFooterChange({ ...footer, enabled: event.target.checked })} /><span>显示页脚</span></label><label className="wide"><span>品牌简介</span><textarea value={footer.description} onChange={(event) => onFooterChange({ ...footer, description: event.target.value })} /></label><label className="wide"><span>版权内容</span><input value={footer.copyright} onChange={(event) => onFooterChange({ ...footer, copyright: event.target.value })} /></label><ImageUploadField className="wide" label="页脚Logo" value={footer.logoImage} onChange={(logoImage) => onFooterChange({ ...footer, logoImage })} /></div></section>}

      {activeTab === "footer-nav" && <NavigationList title="底部导航" description="一级菜单仅作栏目标题，二级菜单为可点击链接；支持排序、启停和编辑。" items={footer.navigation} onChange={(navigation) => onFooterChange({ ...footer, navigation })} allowChildren />}

      {activeTab === "filing" && <section className="admin-card structure-card"><div className="structure-card-heading"><div><h3>备案内容</h3><p>分别维护ICP备案与公安备案文字和跳转地址。</p></div></div><div className="admin-form-grid"><label><span>ICP备案内容</span><input value={footer.filingText} onChange={(event) => onFooterChange({ ...footer, filingText: event.target.value })} /></label><label><span>ICP备案链接</span><input value={footer.filingLink} onChange={(event) => onFooterChange({ ...footer, filingLink: event.target.value })} /></label><label><span>公安备案内容</span><input value={footer.securityFilingText} onChange={(event) => onFooterChange({ ...footer, securityFilingText: event.target.value })} /></label><label><span>公安备案链接</span><input value={footer.securityFilingLink} onChange={(event) => onFooterChange({ ...footer, securityFilingLink: event.target.value })} /></label></div></section>}
    </section>
  );
}

function MediaPreview({ src, empty = "未设置" }) {
  return <div className="media-table-preview">{src ? <img src={src} alt="" /> : <span>{empty}</span>}</div>;
}
