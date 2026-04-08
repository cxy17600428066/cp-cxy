const profile = {
  name: "你的名字",
  title: "高级 UI/UX 设计师",
  city: "上海 / Remote",
  email: "name@example.com",
};

const stats = [
  { value: "70+", label: "设计页面" },
  { value: "6", label: "核心模块" },
  { value: "1", label: "完整移动端案例" },
];

const principles = [
  {
    title: "让第一次进入就有情绪价值",
    body: "登录、新手引导、剧情试炼和人物信息被串成一条顺滑路径，确保用户不是“进来看看”，而是快速进入角色关系。",
  },
  {
    title: "把聊天设计成关系推进器",
    body: "通过全屏角色、推荐话题、引导句与剧情任务，让聊天从工具型会话升级为沉浸式互动体验。",
  },
  {
    title: "把成长反馈做得可感知",
    body: "羁绊、亲密度、陪伴等级、创作者等级、勋章体系统一成一套反馈语言，持续强化长期留存动机。",
  },
  {
    title: "统一世界观与视觉秩序",
    body: "深夜紫基底、金色粒子光感、故事卡片和角色立绘共同构成有辨识度的 ACG 叙事氛围。",
  },
];

const highlights = [
  {
    title: "从冷启动到上手完成，做成一个真正有剧情感的开场",
    description:
      "首登并没有停留在传统注册流程，而是直接把用户带入人物选择、剧情广场、线索点击、任务完成和分享结局等节点，让“第一次使用”本身就像一次体验式任务。",
    tags: ["手机登录", "新手引导", "剧情试炼"],
    shots: [
      { title: "手机登录", thumb: "./thumbs/screen-002.jpg", full: "./assets/screen-002.png" },
      { title: "人物选择", thumb: "./thumbs/screen-017.jpg", full: "./assets/screen-017.png" },
      { title: "通关成功", thumb: "./thumbs/screen-026.jpg", full: "./assets/screen-026.png" },
    ],
  },
  {
    title: "沉浸式聊天页，不只是输入框和气泡",
    description:
      "聊天界面引入大幅角色视觉、会话引导、热门话题、发现入口和全屏沉浸模式，既照顾轻量开启对话，也强化角色存在感和情感氛围。",
    tags: ["聊天引导", "热门话题", "全屏模式"],
    shots: [
      { title: "会话引导", thumb: "./thumbs/screen-007.jpg", full: "./assets/screen-007.png" },
      { title: "聊天常规态", thumb: "./thumbs/screen-014.jpg", full: "./assets/screen-014.png" },
      { title: "聊天全屏态", thumb: "./thumbs/screen-011.jpg", full: "./assets/screen-011.png" },
    ],
  },
  {
    title: "把角色关系设计成可见、可升级、可回味的成长系统",
    description:
      "项目用羁绊、亲密等级、陪伴幻相、创作者等级与勋章体系，把抽象的情感联结转成清晰反馈，既服务留存，也让用户愿意持续经营角色关系。",
    tags: ["羁绊成长", "亲密等级", "勋章反馈"],
    shots: [
      { title: "与我的羁绊", thumb: "./thumbs/screen-004.jpg", full: "./assets/screen-004.png" },
      { title: "创作者数据报告", thumb: "./thumbs/screen-036.jpg", full: "./assets/screen-036.png" },
      { title: "陪伴等级说明", thumb: "./thumbs/screen-042.jpg", full: "./assets/screen-042.png" },
    ],
  },
  {
    title: "虚拟人创建流程，让“资产搭建”本身也足够有成就感",
    description:
      "从创建人物、形象设定、声音设定、基本信息、对话设定，到基础档案、羁绊线索、人物塑造、人物心智，整个创建链路被包装成逐步解锁的成长路径。",
    tags: ["角色创建", "对话设定", "逐步解锁"],
    shots: [
      { title: "创建人物", thumb: "./thumbs/screen-049.jpg", full: "./assets/screen-049.png" },
      { title: "形象设定", thumb: "./thumbs/screen-057.jpg", full: "./assets/screen-057.png" },
      { title: "对话设定", thumb: "./thumbs/screen-062.jpg", full: "./assets/screen-062.png" },
    ],
  },
  {
    title: "剧情广场作为内容入口，把浏览、解锁、通关、分享串起来",
    description:
      "通过剧本卡片、故事背景、剧情聊天、道具解锁和分享结局，把一次次剧情体验做成可消费、可传播、可收集的内容循环。",
    tags: ["剧情广场", "剧本卡片", "通关分享"],
    shots: [
      { title: "剧情广场", thumb: "./thumbs/screen-063.jpg", full: "./assets/screen-063.png" },
      { title: "剧情聊天", thumb: "./thumbs/screen-065.jpg", full: "./assets/screen-065.png" },
      { title: "分享结局", thumb: "./thumbs/screen-070.jpg", full: "./assets/screen-070.png" },
    ],
  },
];

const flows = [
  {
    number: "01",
    title: "登录与引导",
    body: "用户先完成手机登录，再通过人物选择、剧情试炼、任务卡与结局分享快速进入产品语境。",
  },
  {
    number: "02",
    title: "聊天与发现",
    body: "会话引导、热门话题、主动推荐与全屏模式共同提升互动效率和沉浸感。",
  },
  {
    number: "03",
    title: "虚拟人详情",
    body: "围绕形象、人物、幻相和其他信息构建完整角色资产页，便于浏览和延展。",
  },
  {
    number: "04",
    title: "成长与等级",
    body: "羁绊、勋章、陪伴等级、创作者等级和数据报告形成清晰的长期反馈体系。",
  },
  {
    number: "05",
    title: "创建虚拟人",
    body: "从外显设定到性格心智逐步搭建，突出“养成”而非单次表单输入。",
  },
  {
    number: "06",
    title: "剧情广场",
    body: "剧本浏览、背景设定、剧情聊天、奖励解锁和分享结局完成内容消费闭环。",
  },
];

const gallerySections = [
  {
    title: "登录与新手引导",
    description: "从手机号登录到人物选择、剧情试炼、任务反馈与通关成功，建立第一次体验的节奏感。",
    items: [
      { title: "手机登录", note: "首登入口", thumb: "./thumbs/screen-002.jpg", full: "./assets/screen-002.png" },
      { title: "人物选择", note: "快速进入角色世界", thumb: "./thumbs/screen-017.jpg", full: "./assets/screen-017.png" },
      { title: "背景故事", note: "建立剧情上下文", thumb: "./thumbs/screen-023.jpg", full: "./assets/screen-023.png" },
      { title: "剧情广场引导", note: "引导首次探索", thumb: "./thumbs/screen-020.jpg", full: "./assets/screen-020.png" },
      { title: "点击剧本", note: "进入核心内容", thumb: "./thumbs/screen-021.jpg", full: "./assets/screen-021.png" },
      { title: "查看任务", note: "任务驱动的上手路径", thumb: "./thumbs/screen-024.jpg", full: "./assets/screen-024.png" },
      { title: "点击线索", note: "探索式交互", thumb: "./thumbs/screen-018.jpg", full: "./assets/screen-018.png" },
      { title: "线索弹窗", note: "反馈线索获得", thumb: "./thumbs/screen-027.jpg", full: "./assets/screen-027.png" },
      { title: "查看对话", note: "把任务导回聊天", thumb: "./thumbs/screen-025.jpg", full: "./assets/screen-025.png" },
      { title: "任务完成", note: "分阶段奖励反馈", thumb: "./thumbs/screen-016.jpg", full: "./assets/screen-016.png" },
      { title: "分享结局", note: "鼓励传播与回顾", thumb: "./thumbs/screen-022.jpg", full: "./assets/screen-022.png" },
      { title: "通关成功", note: "阶段性高光时刻", thumb: "./thumbs/screen-026.jpg", full: "./assets/screen-026.png" },
      { title: "新手引导完成", note: "进入日常使用", thumb: "./thumbs/screen-019.jpg", full: "./assets/screen-019.png" },
      { title: "查看人物", note: "引导用户了解角色", thumb: "./thumbs/screen-028.jpg", full: "./assets/screen-028.png" },
    ],
  },
  {
    title: "聊天与发现体验",
    description: "围绕会话引导、主动推荐、发现页和两种聊天模式，打造更沉浸的陪伴式互动体验。",
    items: [
      { title: "会话引导", note: "降低开聊门槛", thumb: "./thumbs/screen-007.jpg", full: "./assets/screen-007.png" },
      { title: "聊天详情-常规", note: "日常聊天模式", thumb: "./thumbs/screen-014.jpg", full: "./assets/screen-014.png" },
      { title: "聊天详情-全屏", note: "高沉浸互动模式", thumb: "./thumbs/screen-011.jpg", full: "./assets/screen-011.png" },
      { title: "主动推新弹窗", note: "触发继续互动", thumb: "./thumbs/screen-044.jpg", full: "./assets/screen-044.png" },
      { title: "聊天页-会话引导", note: "聊天入口强化", thumb: "./thumbs/screen-045.jpg", full: "./assets/screen-045.png" },
      { title: "发现页", note: "扩展内容入口", thumb: "./thumbs/screen-046.jpg", full: "./assets/screen-046.png" },
      { title: "聊天页-详情常规", note: "角色与消息并置", thumb: "./thumbs/screen-048.jpg", full: "./assets/screen-048.png" },
      { title: "聊天页-详情全屏", note: "强化角色在场感", thumb: "./thumbs/screen-047.jpg", full: "./assets/screen-047.png" },
    ],
  },
  {
    title: "虚拟人详情与幻相体系",
    description: "通过形象、人物、幻相与其他信息页，构建可浏览、可延展、可收藏的角色资产中心。",
    items: [
      { title: "幻相奇境", note: "视觉化角色资产入口", thumb: "./thumbs/screen-001.jpg", full: "./assets/screen-001.png" },
      { title: "虚拟人详情-形象", note: "强调角色外显风格", thumb: "./thumbs/screen-003.jpg", full: "./assets/screen-003.png" },
      { title: "虚拟人详情-人物", note: "展现人物信息层", thumb: "./thumbs/screen-012.jpg", full: "./assets/screen-012.png" },
      { title: "虚拟人详情-幻相详情", note: "卡片化浏览资产", thumb: "./thumbs/screen-015.jpg", full: "./assets/screen-015.png" },
      { title: "创建幻相", note: "扩展角色表现形式", thumb: "./thumbs/screen-029.jpg", full: "./assets/screen-029.png" },
      { title: "详情页-幻相奇境", note: "沉浸式资产浏览", thumb: "./thumbs/screen-030.jpg", full: "./assets/screen-030.png" },
      { title: "详情页-形象", note: "角色外观信息", thumb: "./thumbs/screen-031.jpg", full: "./assets/screen-031.png" },
      { title: "详情页-其他", note: "补充资料整合", thumb: "./thumbs/screen-032.jpg", full: "./assets/screen-032.png" },
      { title: "详情页-人物", note: "角色设定与资料", thumb: "./thumbs/screen-033.jpg", full: "./assets/screen-033.png" },
      { title: "详情页-幻相详情", note: "幻相内容深度页", thumb: "./thumbs/screen-034.jpg", full: "./assets/screen-034.png" },
    ],
  },
  {
    title: "成长、关系与荣誉系统",
    description: "把羁绊、亲密度、陪伴等级、创作者等级和勋章设计成一套统一反馈系统，持续强化长期价值。",
    items: [
      { title: "与我的羁绊", note: "关系进度总览", thumb: "./thumbs/screen-004.jpg", full: "./assets/screen-004.png" },
      { title: "人物塑造已成形", note: "阶段性成长反馈", thumb: "./thumbs/screen-005.jpg", full: "./assets/screen-005.png" },
      { title: "人物心智已敞开", note: "更深层的解锁感", thumb: "./thumbs/screen-006.jpg", full: "./assets/screen-006.png" },
      { title: "基本信息", note: "关系与身份信息", thumb: "./thumbs/screen-008.jpg", full: "./assets/screen-008.png" },
      { title: "等级勋章", note: "荣誉资产可视化", thumb: "./thumbs/screen-009.jpg", full: "./assets/screen-009.png" },
      { title: "陪伴幻相", note: "情感资产延展", thumb: "./thumbs/screen-010.jpg", full: "./assets/screen-010.png" },
      { title: "陪伴等级", note: "长期互动激励", thumb: "./thumbs/screen-013.jpg", full: "./assets/screen-013.png" },
      { title: "创作者等级弹窗", note: "升级反馈入口", thumb: "./thumbs/screen-035.jpg", full: "./assets/screen-035.png" },
      { title: "创作者数据报告", note: "行为成果量化", thumb: "./thumbs/screen-036.jpg", full: "./assets/screen-036.png" },
      { title: "创作者等级介绍", note: "清楚说明规则", thumb: "./thumbs/screen-037.jpg", full: "./assets/screen-037.png" },
      { title: "创作者升级", note: "激励情绪拉满", thumb: "./thumbs/screen-038.jpg", full: "./assets/screen-038.png" },
      { title: "创作者勋章", note: "荣誉内容沉淀", thumb: "./thumbs/screen-039.jpg", full: "./assets/screen-039.png" },
      { title: "亲密等级勋章", note: "关系反馈延展", thumb: "./thumbs/screen-040.jpg", full: "./assets/screen-040.png" },
      { title: "亲密等级-陪伴幻相", note: "亲密资产呈现", thumb: "./thumbs/screen-041.jpg", full: "./assets/screen-041.png" },
      { title: "陪伴等级说明", note: "规则与权益解释", thumb: "./thumbs/screen-042.jpg", full: "./assets/screen-042.png" },
      { title: "亲密等级-陪伴等级", note: "等级清单展示", thumb: "./thumbs/screen-043.jpg", full: "./assets/screen-043.png" },
    ],
  },
  {
    title: "创建虚拟人流程",
    description: "创建过程并非单次填写，而是由多个可解锁的节点组成，强调陪伴角色的搭建感和养成感。",
    items: [
      { title: "创建人物", note: "创建入口主画面", thumb: "./thumbs/screen-049.jpg", full: "./assets/screen-049.png" },
      { title: "人物塑造已成形-1", note: "阶段状态反馈", thumb: "./thumbs/screen-050.jpg", full: "./assets/screen-050.png" },
      { title: "与我的羁绊-到底", note: "关系路径展示", thumb: "./thumbs/screen-051.jpg", full: "./assets/screen-051.png" },
      { title: "对话设定-标签选择", note: "人格标签配置", thumb: "./thumbs/screen-052.jpg", full: "./assets/screen-052.png" },
      { title: "与我的羁绊-到顶", note: "进度达成表现", thumb: "./thumbs/screen-053.jpg", full: "./assets/screen-053.png" },
      { title: "声音设定", note: "角色听觉设定", thumb: "./thumbs/screen-054.jpg", full: "./assets/screen-054.png" },
      { title: "人物塑造已成形", note: "人格塑造完成", thumb: "./thumbs/screen-055.jpg", full: "./assets/screen-055.png" },
      { title: "人物心智已敞开", note: "更深层性格搭建", thumb: "./thumbs/screen-056.jpg", full: "./assets/screen-056.png" },
      { title: "形象设定", note: "视觉外观与头像", thumb: "./thumbs/screen-057.jpg", full: "./assets/screen-057.png" },
      { title: "基础档案已锁定", note: "关键资料确认", thumb: "./thumbs/screen-058.jpg", full: "./assets/screen-058.png" },
      { title: "基本信息", note: "角色基础资料页", thumb: "./thumbs/screen-059.jpg", full: "./assets/screen-059.png" },
      { title: "人物心智已敞开-1", note: "心智层状态页", thumb: "./thumbs/screen-060.jpg", full: "./assets/screen-060.png" },
      { title: "羁绊线索已连接", note: "关系结构补全", thumb: "./thumbs/screen-061.jpg", full: "./assets/screen-061.png" },
      { title: "对话设定", note: "聊天人格配置", thumb: "./thumbs/screen-062.jpg", full: "./assets/screen-062.png" },
    ],
  },
  {
    title: "剧情广场与剧本体验",
    description: "围绕剧本浏览、剧情聊天、背景补充、道具解锁与分享结局，形成内容消费和社交传播闭环。",
    items: [
      { title: "剧情广场-独立剧本", note: "内容入口页", thumb: "./thumbs/screen-063.jpg", full: "./assets/screen-063.png" },
      { title: "分享成功-获得道具", note: "奖励正反馈", thumb: "./thumbs/screen-064.jpg", full: "./assets/screen-064.png" },
      { title: "剧情聊天", note: "剧情对话进行中", thumb: "./thumbs/screen-065.jpg", full: "./assets/screen-065.png" },
      { title: "分享-通关成功", note: "高光节点传播", thumb: "./thumbs/screen-066.jpg", full: "./assets/screen-066.png" },
      { title: "剧情详情-道具解锁", note: "解锁下一步内容", thumb: "./thumbs/screen-067.jpg", full: "./assets/screen-067.png" },
      { title: "故事背景", note: "补充剧情世界观", thumb: "./thumbs/screen-068.jpg", full: "./assets/screen-068.png" },
      { title: "剧情聊天-任务完成动画", note: "局内任务反馈", thumb: "./thumbs/screen-069.jpg", full: "./assets/screen-069.png" },
      { title: "剧情广场-分享结局", note: "结束后的留存传播", thumb: "./thumbs/screen-070.jpg", full: "./assets/screen-070.png" },
    ],
  },
];

function setProfile() {
  document.getElementById("designer-name").textContent = profile.name;
  document.getElementById("designer-title").textContent = profile.title;
  document.getElementById("contact-name").textContent = profile.name;
  document.getElementById("contact-role").textContent = profile.title;
  document.getElementById("contact-city").textContent = profile.city;
  document.getElementById("contact-email").textContent = profile.email;
}

function renderStats() {
  const root = document.getElementById("stat-row");
  root.innerHTML = stats
    .map(
      (item) => `
        <article class="stat-card">
          <strong>${item.value}</strong>
          <span>${item.label}</span>
        </article>
      `
    )
    .join("");
}

function renderPrinciples() {
  const root = document.getElementById("principle-grid");
  root.innerHTML = principles
    .map(
      (item, index) => `
        <article class="principle-card">
          <span class="principle-number">0${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function renderHighlights() {
  const root = document.getElementById("highlight-list");
  root.innerHTML = highlights
    .map(
      (item) => `
        <article class="highlight-item">
          <div class="highlight-copy">
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="tag-row">
              ${item.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
            </div>
          </div>
          <div class="highlight-shots">
            ${item.shots
              .map(
                (shot) => `
                  <figure class="shot-card">
                    <img
                      src="${shot.thumb}"
                      data-full="${shot.full}"
                      data-title="${shot.title}"
                      data-description="${item.title}"
                      alt="${shot.title}"
                      loading="lazy"
                    >
                    <span>${shot.title}</span>
                  </figure>
                `
              )
              .join("")}
          </div>
        </article>
      `
    )
    .join("");
}

function renderFlows() {
  const root = document.getElementById("flow-grid");
  root.innerHTML = flows
    .map(
      (item) => `
        <article class="flow-card">
          <strong>${item.number}</strong>
          <h3>${item.title}</h3>
          <p>${item.body}</p>
        </article>
      `
    )
    .join("");
}

function renderGallery() {
  const root = document.getElementById("gallery-sections");
  root.innerHTML = gallerySections
    .map(
      (section) => `
        <section class="gallery-section">
          <div class="gallery-section-header">
            <div class="gallery-section-copy">
              <h3>${section.title}</h3>
              <p>${section.description}</p>
            </div>
            <div class="gallery-count">${section.items.length} 张设计稿</div>
          </div>
          <div class="gallery-grid">
            ${section.items
              .map(
                (item) => `
                  <article class="gallery-card">
                    <img
                      src="${item.thumb}"
                      data-full="${item.full}"
                      data-title="${item.title}"
                      data-description="${item.note}"
                      alt="${item.title}"
                      loading="lazy"
                    >
                    <h4>${item.title}</h4>
                    <p>${item.note}</p>
                  </article>
                `
              )
              .join("")}
          </div>
        </section>
      `
    )
    .join("");
}

function bindLightbox() {
  const lightbox = document.getElementById("lightbox");
  const image = document.getElementById("lightbox-image");
  const title = document.getElementById("lightbox-title");
  const description = document.getElementById("lightbox-description");
  const closeButton = document.getElementById("lightbox-close");

  function openLightbox(src, heading, copy) {
    image.src = src;
    image.alt = heading;
    title.textContent = heading;
    description.textContent = copy || "";
    lightbox.classList.add("open");
    lightbox.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeLightbox() {
    lightbox.classList.remove("open");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    image.src = "";
  }

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
      return;
    }

    if (target.matches("img[data-full]")) {
      openLightbox(
        target.getAttribute("data-full"),
        target.getAttribute("data-title") || target.getAttribute("alt") || "设计稿预览",
        target.getAttribute("data-description") || ""
      );
    }
  });

  closeButton.addEventListener("click", closeLightbox);
  lightbox.addEventListener("click", (event) => {
    if (event.target === lightbox) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      closeLightbox();
    }
  });
}

setProfile();
renderStats();
renderPrinciples();
renderHighlights();
renderFlows();
renderGallery();
bindLightbox();
