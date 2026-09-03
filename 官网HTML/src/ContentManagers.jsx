import { useEffect, useState } from "react";
import { ImageUploadField } from "./MediaUpload.jsx";

const statusOptions = [
  ["draft", "草稿"],
  ["published", "已发布"],
  ["offline", "已下架"],
];

export function Modal({ title, subtitle, onClose, onSave, children, className = "" }) {
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

  return (
    <div className="cms-modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section
        className={`cms-modal ${className}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="cms-modal-header">
          <div>
            <small>{subtitle}</small>
            <h2>{title}</h2>
          </div>
          <button type="button" onClick={onClose}>关闭</button>
        </header>
        <div className="cms-modal-body">{children}</div>
        <footer className="cms-modal-footer">
          <button className="admin-button ghost" type="button" onClick={onClose}>
            取消
          </button>
          <button className="admin-button primary" type="button" onClick={onSave}>
            确认保存
          </button>
        </footer>
      </section>
    </div>
  );
}

function CollectionShell({
  title,
  eyebrow,
  description,
  countLabel,
  items,
  onAdd,
  children,
}) {
  return (
    <section className="admin-section content-manager">
      <div className="admin-section-heading">
        <div>
          <span>{eyebrow}</span>
          <h2>{title}</h2>
        </div>
        <div className="collection-heading-actions">
          <p>{description}</p>
          <button className="admin-button primary" type="button" onClick={onAdd}>
            新增{countLabel}
          </button>
        </div>
      </div>
      <div className="collection-count">
        共 {items.length} 条，已发布{" "}
        {items.filter((item) => item.status === "published").length} 条
      </div>
      <div className="collection-list">{children}</div>
    </section>
  );
}

function StatusSelect({ value, onChange }) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value)}>
      {statusOptions.map(([key, label]) => (
        <option key={key} value={key}>{label}</option>
      ))}
    </select>
  );
}

function RowActions({ index, total, onMove, onEdit, onDelete, editLabel = "编辑" }) {
  return (
    <div className="collection-row-actions">
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)}>
        上移
      </button>
      <button type="button" disabled={index === total - 1} onClick={() => onMove(1)}>
        下移
      </button>
      <button className="edit" type="button" onClick={onEdit}>{editLabel}</button>
      <button className="danger" type="button" onClick={onDelete}>删除</button>
    </div>
  );
}

function updateOrder(items, index, direction) {
  const target = index + direction;
  if (target < 0 || target >= items.length) return items;
  const next = [...items];
  [next[index], next[target]] = [next[target], next[index]];
  return next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 }));
}

export function ProductManager({ products, categories, onChange, onCategoriesChange }) {
  const [activeTab, setActiveTab] = useState("categories");
  const [selectedCategoryId, setSelectedCategoryId] = useState("all");
  const [editing, setEditing] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const categoryMap = new Map(categories.map((category) => [category.id, category]));
  const visibleProducts = selectedCategoryId === "all"
    ? products
    : products.filter((product) => product.categoryId === selectedCategoryId);

  function openNewProduct() {
    const categoryId = selectedCategoryId !== "all"
      ? selectedCategoryId
      : categories[0]?.id ?? "";
    setEditing({
      id: `product-${Date.now()}`,
      categoryId,
      name: "新商品",
      standardName: "",
      shortName: "",
      skuCode: "",
      version: "v1",
      operationStatus: "运行中",
      brand: "脱骨侠",
      flavor: "",
      unit: "袋",
      weight: "",
      boneContent: "",
      storageCondition: "常温",
      solidContent: "100%",
      shelfLife: "",
      spiciness: "无区分",
      salesChannel: "常温休食",
      barcode: "",
      inStockLeadHours: "72",
      outOfStockLeadHours: "216",
      effectImage: "",
      series: categoryMap.get(categoryId)?.name ?? "",
      slogan: "",
      description: "",
      image: "/assets/products/food-1.png",
      packageImage: "/assets/products/package-1.png",
      specs: "",
      salesText: "",
      actionText: "探索全系列产品",
      link: "#brand",
      featured: false,
      status: "draft",
      order: products.length + 1,
      isNew: true,
    });
  }

  function saveEditing() {
    const { isNew, ...record } = editing;
    const category = categoryMap.get(record.categoryId);
    const nextRecord = { ...record, series: category?.name ?? "未分类" };
    onChange(
      isNew
        ? [...products, nextRecord]
        : products.map((item) => item.id === nextRecord.id ? nextRecord : item),
    );
    setEditing(null);
  }

  function saveCategory() {
    const { isNew, ...record } = editingCategory;
    onCategoriesChange(
      isNew
        ? [...categories, record]
        : categories.map((item) => item.id === record.id ? record : item),
    );
    onChange(products.map((product) => (
      product.categoryId === record.id ? { ...product, series: record.name } : product
    )));
    setEditingCategory(null);
  }

  function deleteCategory(categoryId) {
    onCategoriesChange(categories.filter((category) => category.id !== categoryId));
    onChange(products.map((product) => (
      product.categoryId === categoryId
        ? { ...product, categoryId: "", series: "未分类" }
        : product
    )));
    if (selectedCategoryId === categoryId) setSelectedCategoryId("all");
  }

  function moveVisibleProduct(index, direction) {
    const target = index + direction;
    if (target < 0 || target >= visibleProducts.length) return;
    const next = [...products];
    const sourceIndex = next.findIndex((item) => item.id === visibleProducts[index].id);
    const targetIndex = next.findIndex((item) => item.id === visibleProducts[target].id);
    [next[sourceIndex], next[targetIndex]] = [next[targetIndex], next[sourceIndex]];
    onChange(next.map((item, itemIndex) => ({ ...item, order: itemIndex + 1 })));
  }

  function field(name, value) {
    setEditing((current) => ({ ...current, [name]: value }));
  }

  function categoryField(name, value) {
    setEditingCategory((current) => ({ ...current, [name]: value }));
  }

  return (
    <>
      <section className="admin-section content-manager product-manager">
        <div className="admin-section-heading">
          <div><span>Product showcase</span><h2>商品展示配置</h2></div>
          <p>先维护商品分类，再将商品关联到对应分类；商品列表可按所选分类筛选。</p>
        </div>
        <div className="admin-config-tabs product-manager-tabs">
          <button className={activeTab === "categories" ? "active" : ""} type="button" onClick={() => setActiveTab("categories")}>商品分类 <span>{categories.length}</span></button>
          <button className={activeTab === "products" ? "active" : ""} type="button" onClick={() => setActiveTab("products")}>商品列表 <span>{products.length}</span></button>
        </div>

        {activeTab === "categories" && (
          <>
            <div className="product-manager-toolbar">
              <div><strong>商品分类</strong><p>配置分类名称、配图、排序和展示状态。</p></div>
              <button className="admin-button primary" type="button" onClick={() => setEditingCategory({ id: `category-${Date.now()}`, name: "新商品分类", description: "", detailText: "查看详情", image: "/assets/products/food-1.png", enabled: true, order: categories.length + 1, isNew: true })}>新增分类</button>
            </div>
            <div className="collection-list">
              {categories.map((category, index) => (
                <article className="collection-item" key={category.id}>
                  <div className="collection-summary">
                    <img src={category.image} alt="" />
                    <div className="collection-summary-copy">
                      <small>商品分类 · {products.filter((product) => product.categoryId === category.id).length} 个商品</small>
                      <h3>{category.name}</h3>
                      <p>{category.description || "商品可在“商品列表”中关联到此分类"}</p>
                      <button className="category-manage-products" type="button" onClick={() => { setSelectedCategoryId(category.id); setActiveTab("products"); }}>管理商品</button>
                    </div>
                    <span className={`content-status ${category.enabled ? "published" : "offline"}`}>{category.enabled ? "展示中" : "已停用"}</span>
                    <RowActions index={index} total={categories.length} onMove={(direction) => onCategoriesChange(updateOrder(categories, index, direction))} onEdit={() => setEditingCategory({ ...category, isNew: false })} onDelete={() => deleteCategory(category.id)} />
                  </div>
                </article>
              ))}
              {categories.length === 0 && <div className="product-empty">暂无商品分类，请先新增分类。</div>}
            </div>
          </>
        )}

        {activeTab === "products" && (
          <>
            <div className="product-manager-toolbar">
              <div><strong>商品列表</strong><p>选择商品分类后，只展示该分类下的商品。</p></div>
              <button className="admin-button primary" type="button" onClick={openNewProduct}>新增商品</button>
            </div>
            <div className="product-category-filter" aria-label="商品分类筛选">
              <button className={selectedCategoryId === "all" ? "active" : ""} type="button" onClick={() => setSelectedCategoryId("all")}>全部 <span>{products.length}</span></button>
              {categories.map((category) => (
                <button className={selectedCategoryId === category.id ? "active" : ""} type="button" key={category.id} onClick={() => setSelectedCategoryId(category.id)}>{category.name} <span>{products.filter((product) => product.categoryId === category.id).length}</span></button>
              ))}
              {products.some((product) => !product.categoryId) && <button className={selectedCategoryId === "" ? "active" : ""} type="button" onClick={() => setSelectedCategoryId("")}>未分类 <span>{products.filter((product) => !product.categoryId).length}</span></button>}
            </div>
            <div className="collection-count">当前展示 {visibleProducts.length} 个商品</div>
            <div className="collection-list">
              {visibleProducts.map((product, index) => (
                <article className="collection-item" key={product.id}>
                  <div className="collection-summary">
                    <img src={product.effectImage || product.image} alt="" />
                    <div className="collection-summary-copy">
                      <small>{categoryMap.get(product.categoryId)?.name ?? "未分类"}</small>
                      <h3>{product.name}</h3>
                      <p>{product.slogan}</p>
                    </div>
                    <span className={`content-status ${product.status}`}>{statusOptions.find(([key]) => key === product.status)?.[1]}</span>
                    <RowActions index={index} total={visibleProducts.length} onMove={(direction) => moveVisibleProduct(index, direction)} onEdit={() => setEditing({ ...product, isNew: false })} onDelete={() => onChange(products.filter((item) => item.id !== product.id))} />
                  </div>
                </article>
              ))}
              {visibleProducts.length === 0 && <div className="product-empty">当前分类下暂无商品。</div>}
            </div>
          </>
        )}
      </section>

      {editingCategory && (
        <Modal title={editingCategory.isNew ? "新增商品分类" : "编辑商品分类"} subtitle="Product category form" onClose={() => setEditingCategory(null)} onSave={saveCategory}>
          <div className="admin-form-grid modal-form-grid">
            <label><span>分类名称</span><input value={editingCategory.name} onChange={(event) => categoryField("name", event.target.value)} /></label>
            <label><span>详情按钮文字</span><input value={editingCategory.detailText ?? "查看详情"} onChange={(event) => categoryField("detailText", event.target.value)} /></label>
            <label className="wide"><span>分类简介</span><textarea rows="3" value={editingCategory.description ?? ""} onChange={(event) => categoryField("description", event.target.value)} /></label>
            <ImageUploadField className="wide" label="分类配图" value={editingCategory.image} onChange={(value) => categoryField("image", value)} />
            <label className="modal-check"><input type="checkbox" checked={editingCategory.enabled} onChange={(event) => categoryField("enabled", event.target.checked)} /><span>在官网展示此分类</span></label>
          </div>
        </Modal>
      )}

      {editing && (
        <Modal className="product-editor-modal" title={editing.isNew ? "新增商品" : "编辑商品"} subtitle="Product form" onClose={() => setEditing(null)} onSave={saveEditing}>
          <div className="admin-form-grid modal-form-grid">
            <div className="modal-form-divider wide">商品基础信息</div>
            <label><span>商品名称</span><input value={editing.name} onChange={(e) => field("name", e.target.value)} /></label>
            <label><span>所属商品分类</span><select value={editing.categoryId ?? ""} onChange={(e) => field("categoryId", e.target.value)}><option value="">未分类</option>{categories.map((category) => <option value={category.id} key={category.id}>{category.name}</option>)}</select></label>
            <label className="wide"><span>商品标准名称</span><input value={editing.standardName ?? ""} onChange={(e) => field("standardName", e.target.value)} /></label>
            <label className="wide"><span>商品标准简称</span><input value={editing.shortName ?? ""} onChange={(e) => field("shortName", e.target.value)} /></label>
            <label><span>联合编码</span><input value={editing.skuCode ?? ""} onChange={(e) => field("skuCode", e.target.value)} /></label>
            <label><span>版本信息</span><input value={editing.version ?? ""} onChange={(e) => field("version", e.target.value)} /></label>
            <label><span>商品品牌</span><input value={editing.brand ?? ""} onChange={(e) => field("brand", e.target.value)} /></label>
            <label><span>运行状态</span><input value={editing.operationStatus ?? ""} onChange={(e) => field("operationStatus", e.target.value)} /></label>
            <label><span>发布状态</span><StatusSelect value={editing.status} onChange={(value) => field("status", value)} /></label>
            <div className="modal-form-divider wide">规格与流通信息</div>
            <label><span>商品口味</span><input value={editing.flavor ?? ""} onChange={(e) => field("flavor", e.target.value)} /></label>
            <label><span>商品单位</span><input value={editing.unit ?? ""} onChange={(e) => field("unit", e.target.value)} /></label>
            <label><span>克重</span><input value={editing.weight ?? ""} onChange={(e) => field("weight", e.target.value)} /></label>
            <label><span>含骨信息</span><input value={editing.boneContent ?? ""} onChange={(e) => field("boneContent", e.target.value)} /></label>
            <label><span>温层</span><input value={editing.storageCondition ?? ""} onChange={(e) => field("storageCondition", e.target.value)} /></label>
            <label><span>固形物含量</span><input value={editing.solidContent ?? ""} onChange={(e) => field("solidContent", e.target.value)} /></label>
            <label><span>保质期</span><input value={editing.shelfLife ?? ""} onChange={(e) => field("shelfLife", e.target.value)} /></label>
            <label><span>辣度</span><input value={editing.spiciness ?? ""} onChange={(e) => field("spiciness", e.target.value)} /></label>
            <label><span>销售渠道</span><input value={editing.salesChannel ?? ""} onChange={(e) => field("salesChannel", e.target.value)} /></label>
            <label><span>69码 / 商品条码</span><input value={editing.barcode ?? ""} onChange={(e) => field("barcode", e.target.value)} /></label>
            <label><span>有货发货时限（小时）</span><input value={editing.inStockLeadHours ?? ""} onChange={(e) => field("inStockLeadHours", e.target.value)} /></label>
            <label><span>缺货发货时限（小时）</span><input value={editing.outOfStockLeadHours ?? ""} onChange={(e) => field("outOfStockLeadHours", e.target.value)} /></label>
            <div className="modal-form-divider wide">前台展示内容</div>
            <label className="wide"><span>展示主标题</span><input value={editing.slogan} onChange={(e) => field("slogan", e.target.value)} /></label>
            <label className="wide"><span>商品描述</span><textarea rows="3" value={editing.description} onChange={(e) => field("description", e.target.value)} /></label>
            <div className="product-image-grid wide">
              <ImageUploadField label="商品效果图" hint="支持 JPG、PNG、WebP，≤10MB" value={editing.effectImage ?? ""} onChange={(value) => field("effectImage", value)} />
              <ImageUploadField label="食品展示图" hint="支持 JPG、PNG、WebP，≤10MB" value={editing.image} onChange={(value) => field("image", value)} />
              <ImageUploadField label="包装展示图" hint="支持 JPG、PNG、WebP，≤10MB" value={editing.packageImage} onChange={(value) => field("packageImage", value)} />
            </div>
            <div className="modal-form-divider wide">补充展示信息</div>
            <label><span>规格</span><input value={editing.specs} onChange={(e) => field("specs", e.target.value)} /></label>
            <label><span>销售数据</span><input value={editing.salesText} onChange={(e) => field("salesText", e.target.value)} /></label>
            <label><span>按钮文字</span><input value={editing.actionText} onChange={(e) => field("actionText", e.target.value)} /></label>
            <label className="wide"><span>跳转链接</span><input value={editing.link} onChange={(e) => field("link", e.target.value)} /></label>
            <label className="modal-check wide"><input type="checkbox" checked={editing.featured} onChange={(e) => field("featured", e.target.checked)} /><span>设为重点推荐商品</span></label>
          </div>
        </Modal>
      )}
    </>
  );
}

export function NewsManager({ news, articles, onChange }) {
  const [editing, setEditing] = useState(null);

  function openNew() {
    setEditing({
      id: `news-${Date.now()}`,
      title: "新新闻",
      category: "卓希新事",
      date: new Date().toISOString().slice(0, 10),
      excerpt: "",
      coverImage: "/assets/news/news-1.png",
      articleId: "",
      featured: false,
      status: "draft",
      order: news.length + 1,
      isNew: true,
    });
  }

  function field(name, value) {
    setEditing((current) => ({ ...current, [name]: value }));
  }

  function saveEditing() {
    const { isNew, ...record } = editing;
    onChange(
      isNew
        ? [...news, record]
        : news.map((item) => item.id === record.id ? record : item),
    );
    setEditing(null);
  }

  return (
    <>
      <CollectionShell
        title="新闻资讯配置"
        eyebrow="News management"
        description="管理新闻头条、分类、日期、摘要、封面和关联文章。"
        countLabel="新闻"
        items={news}
        onAdd={openNew}
      >
        {news.map((item, index) => (
          <article className="collection-item" key={item.id}>
            <div className="collection-summary">
              <img src={item.coverImage} alt="" />
              <div className="collection-summary-copy">
                <small>{item.category} · {item.date}</small>
                <h3>{item.title}</h3>
                <p>{item.excerpt}</p>
              </div>
              <span className={`content-status ${item.status}`}>
                {statusOptions.find(([key]) => key === item.status)?.[1]}
              </span>
              <RowActions
                index={index}
                total={news.length}
                onMove={(direction) => onChange(updateOrder(news, index, direction))}
                onEdit={() => setEditing({ ...item, isNew: false })}
                onDelete={() => onChange(news.filter((newsItem) => newsItem.id !== item.id))}
              />
            </div>
          </article>
        ))}
      </CollectionShell>
      {editing && (
        <Modal
          title={editing.isNew ? "新增新闻" : "编辑新闻"}
          subtitle="News form"
          onClose={() => setEditing(null)}
          onSave={saveEditing}
        >
          <div className="admin-form-grid modal-form-grid">
            <label className="wide"><span>新闻标题</span><input value={editing.title} onChange={(e) => field("title", e.target.value)} /></label>
            <label><span>新闻分类</span><input value={editing.category} onChange={(e) => field("category", e.target.value)} /></label>
            <label><span>发布日期</span><input type="date" value={editing.date} onChange={(e) => field("date", e.target.value)} /></label>
            <label><span>发布状态</span><StatusSelect value={editing.status} onChange={(value) => field("status", value)} /></label>
            <label className="wide"><span>新闻摘要</span><textarea rows="4" value={editing.excerpt} onChange={(e) => field("excerpt", e.target.value)} /></label>
            <ImageUploadField className="wide" label="新闻封面" value={editing.coverImage} onChange={(value) => field("coverImage", value)} />
            <label><span>关联文章</span>
              <select value={editing.articleId} onChange={(e) => field("articleId", e.target.value)}>
                <option value="">暂不关联</option>
                {articles.map((article) => <option key={article.id} value={article.id}>{article.title}</option>)}
              </select>
            </label>
            <label className="modal-check">
              <input type="checkbox" checked={editing.featured} onChange={(e) => field("featured", e.target.checked)} />
              <span>设为头条推荐</span>
            </label>
          </div>
        </Modal>
      )}
    </>
  );
}

export function ArticleManager({ articles, onChange }) {
  const [editing, setEditing] = useState(null);

  function openNew() {
    setEditing({
      id: `article-${Date.now()}`,
      title: "新文章",
      slug: `article-${Date.now()}`,
      author: "卓希品牌中心",
      summary: "",
      coverImage: "/assets/news/news-1.png",
      body: "",
      seoTitle: "",
      status: "draft",
      updatedAt: new Date().toISOString().slice(0, 10),
      isNew: true,
    });
  }

  function field(name, value) {
    setEditing((current) => ({ ...current, [name]: value }));
  }

  function saveEditing() {
    const { isNew, ...record } = editing;
    onChange(
      isNew
        ? [...articles, record]
        : articles.map((item) => item.id === record.id ? record : item),
    );
    setEditing(null);
  }

  return (
    <>
      <CollectionShell
        title="文章内容配置"
        eyebrow="Article editor"
        description="独立维护文章正文、作者、摘要、封面和SEO标题。"
        countLabel="文章"
        items={articles}
        onAdd={openNew}
      >
        {articles.map((article, index) => (
          <article className="collection-item" key={article.id}>
            <div className="collection-summary">
              <img src={article.coverImage} alt="" />
              <div className="collection-summary-copy">
                <small>{article.author} · {article.updatedAt}</small>
                <h3>{article.title}</h3>
                <p>{article.summary}</p>
              </div>
              <span className={`content-status ${article.status}`}>
                {statusOptions.find(([key]) => key === article.status)?.[1]}
              </span>
              <RowActions
                index={index}
                total={articles.length}
                onMove={(direction) => onChange(updateOrder(articles, index, direction))}
                onEdit={() => setEditing({ ...article, isNew: false })}
                onDelete={() => onChange(articles.filter((item) => item.id !== article.id))}
                editLabel="编辑正文"
              />
            </div>
          </article>
        ))}
      </CollectionShell>
      {editing && (
        <Modal
          title={editing.isNew ? "新增文章" : "编辑文章"}
          subtitle="Article form"
          onClose={() => setEditing(null)}
          onSave={saveEditing}
        >
          <div className="admin-form-grid modal-form-grid">
            <label className="wide"><span>文章标题</span><input value={editing.title} onChange={(e) => field("title", e.target.value)} /></label>
            <label><span>URL标识（slug）</span><input value={editing.slug} onChange={(e) => field("slug", e.target.value)} /></label>
            <label><span>作者</span><input value={editing.author} onChange={(e) => field("author", e.target.value)} /></label>
            <label><span>发布状态</span><StatusSelect value={editing.status} onChange={(value) => field("status", value)} /></label>
            <label className="wide"><span>文章摘要</span><textarea rows="3" value={editing.summary} onChange={(e) => field("summary", e.target.value)} /></label>
            <ImageUploadField className="wide" label="文章封面" value={editing.coverImage} onChange={(value) => field("coverImage", value)} />
            <label className="wide body-editor"><span>文章正文</span><textarea rows="12" value={editing.body} onChange={(e) => field("body", e.target.value)} /></label>
            <label className="wide"><span>SEO标题</span><input value={editing.seoTitle} onChange={(e) => field("seoTitle", e.target.value)} /></label>
            <label><span>更新日期</span><input type="date" value={editing.updatedAt} onChange={(e) => field("updatedAt", e.target.value)} /></label>
          </div>
        </Modal>
      )}
    </>
  );
}
