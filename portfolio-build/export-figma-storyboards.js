const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputDir = path.join(root, "figma-svg");
const useFullRes = process.env.SVG_FULL_RES === "1";

const profile = {
  name: "你的名字",
  title: "高级 UI/UX 设计师",
  city: "上海 / Remote",
  email: "name@example.com",
  tools: "Figma / Midjourney / Photoshop / AIGC Workflow",
};

const overview = {
  title: "唠唠",
  subtitle: "AI 虚拟人陪伴与剧情互动 App 设计案例",
  positioning: "把 AI 陪伴、剧情互动、成长反馈和角色资产体系，设计成一个可持续探索的移动端产品体验。",
  summary:
    "案例覆盖登录、新手引导、聊天体验、虚拟人详情、角色创建、关系成长、创作者体系与剧情广场，共 70+ 张界面设计稿，可直接作为求职作品集核心项目。",
};

const stats = [
  { value: "70+", label: "设计页面" },
  { value: "6", label: "核心模块" },
  { value: "1", label: "完整移动端案例" },
  { value: "AI", label: "产品赛道" },
];

const principles = [
  {
    title: "第一次进入就要建立兴趣",
    body: "不是把用户丢进注册流程，而是尽快让他进入角色、剧情和互动本身。",
  },
  {
    title: "聊天必须有角色感",
    body: "通过大图立绘、全屏模式、话题引导和任务机制，把聊天做成关系推进器。",
  },
  {
    title: "成长反馈必须可感知",
    body: "羁绊、亲密度、陪伴等级、创作者等级和勋章一起构成长期激励语言。",
  },
  {
    title: "世界观决定视觉辨识度",
    body: "统一的夜色紫基底、金色粒子、故事卡面和角色资产，让产品更像一个内容宇宙。",
  },
];

const interviewNarrative = [
  {
    step: "01 背景",
    title: "AI 陪伴产品如果只剩聊天框，会迅速同质化",
    body: "这个项目的机会点，不是再做一个对话界面，而是构建一个角色关系、内容互动和长期留存并存的产品体验。",
  },
  {
    step: "02 问题",
    title: "需要同时解决冷启动、沉浸感和留存动力",
    body: "用户第一次进入是否愿意留下，日常聊天是否够有代入感，长期使用是否能看到成长，是这套设计要同时回答的问题。",
  },
  {
    step: "03 方案",
    title: "用引导剧情 + 角色资产 + 成长反馈来搭建闭环",
    body: "把上手路径设计成剧情化体验，把聊天升级为互动场景，再用陪伴等级和剧情广场把长期价值接起来。",
  },
  {
    step: "04 结果",
    title: "形成了一套完整的 AI 叙事陪伴产品视觉系统",
    body: "从注册、引导、聊天、角色详情、角色创建到内容消费链路，视觉语言和交互节奏保持统一，可直接支撑完整面试讲述。",
  },
];

const moduleSections = [
  {
    key: "onboarding",
    title: "登录与新手引导",
    description: "从手机号登录到人物选择、剧情试炼、任务反馈与通关成功，建立第一次体验的节奏感。",
    interviewTip: "讲这部分时重点强调：如何把首登从功能路径改造成剧情化体验路径。",
    items: [
      ["手机登录", "thumbs/screen-002.jpg"],
      ["人物选择", "thumbs/screen-017.jpg"],
      ["背景故事", "thumbs/screen-023.jpg"],
      ["剧情广场引导", "thumbs/screen-020.jpg"],
      ["点击剧本", "thumbs/screen-021.jpg"],
      ["查看任务", "thumbs/screen-024.jpg"],
      ["点击线索", "thumbs/screen-018.jpg"],
      ["线索弹窗", "thumbs/screen-027.jpg"],
      ["查看对话", "thumbs/screen-025.jpg"],
      ["任务完成", "thumbs/screen-016.jpg"],
      ["分享结局", "thumbs/screen-022.jpg"],
      ["通关成功", "thumbs/screen-026.jpg"],
      ["引导完成", "thumbs/screen-019.jpg"],
      ["查看人物", "thumbs/screen-028.jpg"],
    ],
  },
  {
    key: "chat",
    title: "聊天与发现体验",
    description: "围绕会话引导、主动推荐、发现页和两种聊天模式，打造更沉浸的陪伴式互动体验。",
    interviewTip: "讲这部分时重点强调：如何让聊天从工具界面升级为有情绪价值的角色体验。",
    items: [
      ["会话引导", "thumbs/screen-007.jpg"],
      ["聊天详情-常规", "thumbs/screen-014.jpg"],
      ["聊天详情-全屏", "thumbs/screen-011.jpg"],
      ["主动推新弹窗", "thumbs/screen-044.jpg"],
      ["聊天页-会话引导", "thumbs/screen-045.jpg"],
      ["发现页", "thumbs/screen-046.jpg"],
      ["聊天页-详情常规", "thumbs/screen-048.jpg"],
      ["聊天页-详情全屏", "thumbs/screen-047.jpg"],
    ],
  },
  {
    key: "detail",
    title: "虚拟人详情与幻相体系",
    description: "通过形象、人物、幻相与其他信息页，构建可浏览、可延展、可收藏的角色资产中心。",
    interviewTip: "讲这部分时重点强调：角色为什么要被当成一套资产来设计，而不只是一个聊天对象。",
    items: [
      ["幻相奇境", "thumbs/screen-001.jpg"],
      ["详情-形象", "thumbs/screen-003.jpg"],
      ["详情-人物", "thumbs/screen-012.jpg"],
      ["幻相详情", "thumbs/screen-015.jpg"],
      ["创建幻相", "thumbs/screen-029.jpg"],
      ["详情-幻相奇境", "thumbs/screen-030.jpg"],
      ["详情-形象二级", "thumbs/screen-031.jpg"],
      ["详情-其他", "thumbs/screen-032.jpg"],
      ["详情-人物二级", "thumbs/screen-033.jpg"],
      ["详情-幻相详情二级", "thumbs/screen-034.jpg"],
    ],
  },
  {
    key: "growth",
    title: "成长、关系与荣誉系统",
    description: "把羁绊、亲密度、陪伴等级、创作者等级和勋章设计成一套统一反馈系统，持续强化长期价值。",
    interviewTip: "讲这部分时重点强调：如何把抽象的关系经营转成有反馈、有升级、有可见成果的体验。",
    items: [
      ["与我的羁绊", "thumbs/screen-004.jpg"],
      ["人物塑造已成形", "thumbs/screen-005.jpg"],
      ["人物心智已敞开", "thumbs/screen-006.jpg"],
      ["基本信息", "thumbs/screen-008.jpg"],
      ["等级勋章", "thumbs/screen-009.jpg"],
      ["陪伴幻相", "thumbs/screen-010.jpg"],
      ["陪伴等级", "thumbs/screen-013.jpg"],
      ["创作者等级弹窗", "thumbs/screen-035.jpg"],
      ["数据报告", "thumbs/screen-036.jpg"],
      ["等级介绍", "thumbs/screen-037.jpg"],
      ["创作者升级", "thumbs/screen-038.jpg"],
      ["创作者勋章", "thumbs/screen-039.jpg"],
      ["亲密等级勋章", "thumbs/screen-040.jpg"],
      ["亲密等级-陪伴幻相", "thumbs/screen-041.jpg"],
      ["陪伴等级说明", "thumbs/screen-042.jpg"],
      ["亲密等级-陪伴等级", "thumbs/screen-043.jpg"],
    ],
  },
  {
    key: "create",
    title: "创建虚拟人流程",
    description: "创建过程并非单次填写，而是由多个可解锁的节点组成，强调陪伴角色的搭建感和养成感。",
    interviewTip: "讲这部分时重点强调：为什么创建流程要做成逐步解锁，而不是一张长表单。",
    items: [
      ["创建人物", "thumbs/screen-049.jpg"],
      ["人物塑造已成形-1", "thumbs/screen-050.jpg"],
      ["与我的羁绊-到底", "thumbs/screen-051.jpg"],
      ["标签选择", "thumbs/screen-052.jpg"],
      ["与我的羁绊-到顶", "thumbs/screen-053.jpg"],
      ["声音设定", "thumbs/screen-054.jpg"],
      ["人物塑造已成形", "thumbs/screen-055.jpg"],
      ["人物心智已敞开", "thumbs/screen-056.jpg"],
      ["形象设定", "thumbs/screen-057.jpg"],
      ["基础档案", "thumbs/screen-058.jpg"],
      ["基本信息", "thumbs/screen-059.jpg"],
      ["人物心智已敞开-1", "thumbs/screen-060.jpg"],
      ["羁绊线索", "thumbs/screen-061.jpg"],
      ["对话设定", "thumbs/screen-062.jpg"],
    ],
  },
  {
    key: "story",
    title: "剧情广场与剧本体验",
    description: "围绕剧本浏览、剧情聊天、背景补充、道具解锁与分享结局，形成内容消费和社交传播闭环。",
    interviewTip: "讲这部分时重点强调：剧情内容如何承担留存、传播和世界观扩展的作用。",
    items: [
      ["独立剧本", "thumbs/screen-063.jpg"],
      ["获得道具", "thumbs/screen-064.jpg"],
      ["剧情聊天", "thumbs/screen-065.jpg"],
      ["通关成功", "thumbs/screen-066.jpg"],
      ["道具解锁", "thumbs/screen-067.jpg"],
      ["故事背景", "thumbs/screen-068.jpg"],
      ["任务完成动画", "thumbs/screen-069.jpg"],
      ["分享结局", "thumbs/screen-070.jpg"],
    ],
  },
];

const highlightShots = [
  ["聊天全屏", "thumbs/screen-011.jpg"],
  ["创建人物", "thumbs/screen-049.jpg"],
  ["剧情广场", "thumbs/screen-063.jpg"],
  ["陪伴等级说明", "thumbs/screen-042.jpg"],
];

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function imageDataUri(relPath) {
  let resolvedPath = relPath;

  if (useFullRes && relPath.startsWith("thumbs/")) {
    resolvedPath = relPath.replace(/^thumbs\//, "assets/").replace(/\.jpg$/i, ".png");
  }

  const filePath = path.join(root, resolvedPath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${fs.readFileSync(filePath).toString("base64")}`;
}

function wrapText(text, limit) {
  const chars = Array.from(text);
  const lines = [];
  let current = "";
  chars.forEach((char) => {
    current += char;
    if (current.length >= limit) {
      lines.push(current);
      current = "";
    }
  });
  if (current) {
    lines.push(current);
  }
  return lines;
}

function textBlock(text, x, y, options = {}) {
  const {
    size = 24,
    color = "#F3EFE8",
    weight = 500,
    widthChars = 24,
    lineHeight = Math.round(size * 1.55),
  } = options;
  const lines = wrapText(text, widthChars);
  return `
    <text x="${x}" y="${y}" fill="${color}" font-size="${size}" font-weight="${weight}" font-family="PingFang SC, Microsoft YaHei, sans-serif">
      ${lines
        .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
        .join("")}
    </text>
  `;
}

function panel(x, y, w, h, radius = 28, fill = "rgba(17,20,39,0.88)") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="rgba(255,255,255,0.08)" />`;
}

function pill(x, y, text, fill = "rgba(255,215,130,0.16)", stroke = "rgba(255,215,130,0.28)", color = "#FFD78B") {
  const width = Math.max(160, text.length * 24 + 44);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${width}" height="54" rx="27" fill="${fill}" stroke="${stroke}" />
      <text x="${x + 22}" y="${y + 35}" fill="${color}" font-size="22" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(text)}</text>
    </g>
  `;
}

function imageCard(x, y, w, h, relPath, title, subtitle = "") {
  const href = imageDataUri(relPath);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="26" fill="#0E1022" stroke="rgba(255,216,140,0.16)" />
      <image x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 96}" preserveAspectRatio="xMidYMid meet" href="${href}" />
      <text x="${x + 20}" y="${y + h - 42}" fill="#F3EFE8" font-size="22" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(title)}</text>
      ${
        subtitle
          ? `<text x="${x + 20}" y="${y + h - 16}" fill="rgba(243,239,232,0.54)" font-size="16" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(subtitle)}</text>`
          : ""
      }
    </g>
  `;
}

function boardBase(title, subtitle, content, height) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="${height}" viewBox="0 0 1600 ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="160" y1="0" x2="1320" y2="${height}" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0B0D16" />
      <stop offset="0.45" stop-color="#0A0C19" />
      <stop offset="1" stop-color="#06070F" />
    </linearGradient>
    <radialGradient id="violetGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(260 240) rotate(24) scale(640 520)">
      <stop stop-color="#7D61FF" stop-opacity="0.28" />
      <stop offset="1" stop-color="#7D61FF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="goldGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1300 180) rotate(24) scale(420 280)">
      <stop stop-color="#FFD78B" stop-opacity="0.22" />
      <stop offset="1" stop-color="#FFD78B" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="1600" height="${height}" fill="url(#bg)" />
  <rect width="1600" height="${height}" fill="url(#violetGlow)" />
  <rect width="1600" height="${height}" fill="url(#goldGlow)" />
  <text x="100" y="88" fill="#FFD78B" font-size="22" letter-spacing="6" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">FIGMA IMPORT READY</text>
  <text x="100" y="160" fill="#F3EFE8" font-size="68" font-weight="700" font-family="Georgia, Times New Roman, serif">${escapeXml(title)}</text>
  <text x="100" y="208" fill="rgba(243,239,232,0.72)" font-size="28" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(subtitle)}</text>
  ${content}
</svg>`;
}

function renderStatRow(y) {
  return stats
    .map((item, index) => {
      const x = 100 + index * 270;
      return `
        <g>
          ${panel(x, y, 240, 124, 26)}
          <text x="${x + 28}" y="${y + 56}" fill="#FFD78B" font-size="38" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.value)}</text>
          <text x="${x + 28}" y="${y + 92}" fill="rgba(243,239,232,0.58)" font-size="20" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.label)}</text>
        </g>
      `;
    })
    .join("");
}

function renderPrincipleCards(y) {
  return principles
    .map((item, index) => {
      const x = 100 + (index % 2) * 680;
      const row = Math.floor(index / 2);
      const cy = y + row * 250;
      return `
        <g>
          ${panel(x, cy, 620, 210, 30)}
          <circle cx="${x + 44}" cy="${cy + 44}" r="18" fill="rgba(255,215,130,0.16)" stroke="rgba(255,215,130,0.28)" />
          <text x="${x + 35}" y="${cy + 52}" fill="#FFD78B" font-size="18" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">0${index + 1}</text>
          <text x="${x + 78}" y="${cy + 54}" fill="#F3EFE8" font-size="28" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.title)}</text>
          ${textBlock(item.body, x + 34, cy + 102, { size: 20, color: "rgba(243,239,232,0.70)", widthChars: 24, lineHeight: 34 })}
        </g>
      `;
    })
    .join("");
}

function renderModuleSection(section, startY, options = {}) {
  const columns = options.columns || 4;
  const cardWidth = options.cardWidth || 300;
  const cardHeight = options.cardHeight || 470;
  const gutter = options.gutter || 26;
  const left = options.left || 100;
  const top = startY + 140;
  const rows = Math.ceil(section.items.length / columns);
  const gridHeight = rows * cardHeight + (rows - 1) * 34;
  const blockHeight = 220 + gridHeight;

  const cards = section.items
    .map(([title, relPath], index) => {
      const col = index % columns;
      const row = Math.floor(index / columns);
      const x = left + col * (cardWidth + gutter);
      const y = top + row * (cardHeight + 34);
      return imageCard(x, y, cardWidth, cardHeight, relPath, title);
    })
    .join("");

  const content = `
    ${panel(80, startY, 1440, blockHeight, 34)}
    ${pill(110, startY + 26, section.title)}
    <text x="110" y="${startY + 110}" fill="rgba(243,239,232,0.74)" font-size="24" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.description)}</text>
    <text x="110" y="${startY + 146}" fill="rgba(255,215,130,0.82)" font-size="18" font-weight="600" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.interviewTip)}</text>
    ${cards}
  `;

  return { content, height: blockHeight + 70 };
}

function buildLongScrollSvg() {
  let y = 280;
  let content = `
    ${panel(80, y, 1440, 780, 36)}
    ${textBlock(overview.positioning, 110, y + 120, { size: 34, weight: 700, widthChars: 22, lineHeight: 50 })}
    ${textBlock(overview.summary, 110, y + 260, { size: 22, color: "rgba(243,239,232,0.72)", widthChars: 34, lineHeight: 36 })}
    ${pill(110, y + 420, "AI 陪伴 / 剧情互动 / 角色成长")}
    ${renderStatRow(y + 520)}
    ${imageCard(960, y + 70, 250, 500, highlightShots[0][1], highlightShots[0][0])}
    ${imageCard(1230, y + 70, 210, 320, highlightShots[1][1], highlightShots[1][0])}
    ${imageCard(1230, y + 410, 210, 320, highlightShots[2][1], highlightShots[2][0])}
  `;
  y += 860;

  content += `
    <text x="100" y="${y}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">DESIGN PRINCIPLES</text>
    ${renderPrincipleCards(y + 40)}
  `;
  y += 560;

  content += `
    ${panel(80, y, 1440, 270, 34)}
    <text x="110" y="${y + 70}" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">完整模块总览</text>
    ${textBlock("这一版是适合一次性导入 Figma 的超长单页。它保留完整模块分组、标题层级与讲述提示，方便你继续调整文案、替换个人信息或拆成单独页面。", 110, y + 126, { size: 22, color: "rgba(243,239,232,0.72)", widthChars: 38, lineHeight: 36 })}
    ${pill(110, y + 186, "建议导入后按模块建立 Section")}
  `;
  y += 330;

  moduleSections.forEach((section) => {
    const block = renderModuleSection(section, y);
    content += block.content;
    y += block.height;
  });

  content += `
    ${panel(80, y, 1440, 220, 34)}
    <text x="110" y="${y + 72}" fill="#F3EFE8" font-size="30" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">个人信息占位</text>
    <text x="110" y="${y + 122}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.name)} / ${escapeXml(profile.title)}</text>
    <text x="110" y="${y + 160}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.city)} / ${escapeXml(profile.email)}</text>
    <text x="900" y="${y + 122}" fill="#FFD78B" font-size="22" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">工具</text>
    ${textBlock(profile.tools, 900, y + 160, { size: 20, color: "rgba(243,239,232,0.68)", widthChars: 28, lineHeight: 30 })}
  `;
  y += 280;

  return boardBase("唠唠 Long Scroll", "超长单页作品集 SVG，适合一次性导入 Figma", content, y);
}

function buildStoryboardSvg() {
  let y = 280;
  let content = `
    ${panel(80, y, 1440, 760, 36)}
    <text x="110" y="${y + 86}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">INTERVIEW STORYBOARD</text>
    ${textBlock("这不是一张单纯的页面清单，而是一套按面试讲述顺序编排的作品集分镜。你可以沿着“背景 → 问题 → 方案 → 关键体验 → 系统价值”的节奏介绍项目。", 110, y + 160, { size: 30, weight: 700, widthChars: 24, lineHeight: 46 })}
    ${textBlock("适合你在 Figma 中继续增补：项目角色、周期、团队协作、业务目标、设计贡献，以及最终上线后的数据表现。", 110, y + 312, { size: 22, color: "rgba(243,239,232,0.72)", widthChars: 34, lineHeight: 36 })}
    ${imageCard(980, y + 70, 220, 480, "thumbs/screen-011.jpg", "聊天全屏")}
    ${imageCard(1220, y + 70, 220, 280, "thumbs/screen-049.jpg", "创建人物")}
    ${imageCard(1220, y + 370, 220, 280, "thumbs/screen-063.jpg", "剧情广场")}
    ${pill(110, y + 520, "适合面试讲述的版本")}
    ${pill(420, y + 520, "一页导入 Figma")}
    ${pill(650, y + 520, "按叙事顺序排版")}
  `;
  y += 840;

  content += `
    <text x="100" y="${y}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">1. 项目框架</text>
    ${panel(80, y + 30, 1440, 320, 34)}
    <text x="110" y="${y + 92}" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">你可以先补充这四项基础信息</text>
    <text x="110" y="${y + 142}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">项目名称：唠唠 / AI 虚拟人陪伴与剧情互动 App</text>
    <text x="110" y="${y + 182}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">你的角色：UI/UX 设计师 / 可替换为真实职责</text>
    <text x="110" y="${y + 222}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">项目周期：可在 Figma 中补充时间轴、版本节点和协作方式</text>
    <text x="110" y="${y + 262}" fill="rgba(243,239,232,0.68)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">设计工具：${escapeXml(profile.tools)}</text>
  `;
  y += 410;

  content += `
    <text x="100" y="${y}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">2. 讲述逻辑</text>
  `;
  interviewNarrative.forEach((item, index) => {
    const cardY = y + 30 + index * 220;
    content += `
      ${panel(80, cardY, 1440, 180, 30)}
      <text x="110" y="${cardY + 52}" fill="#FFD78B" font-size="20" letter-spacing="2" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.step)}</text>
      <text x="110" y="${cardY + 96}" fill="#F3EFE8" font-size="30" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.title)}</text>
      ${textBlock(item.body, 110, cardY + 140, { size: 20, color: "rgba(243,239,232,0.68)", widthChars: 42, lineHeight: 32 })}
    `;
  });
  y += 940;

  const storyboardSections = [
    {
      heading: "3. 冷启动体验",
      title: "把注册流程改造成剧情式上手路径",
      body: "先讲首登体验：用户不是填完信息才开始使用，而是在登录后快速进入人物、剧情和任务流。这里建议重点展示人物选择、任务引导和通关成功三个节点。",
      shots: [
        ["手机登录", "thumbs/screen-002.jpg"],
        ["人物选择", "thumbs/screen-017.jpg"],
        ["通关成功", "thumbs/screen-026.jpg"],
      ],
    },
    {
      heading: "4. 聊天沉浸感",
      title: "用角色全屏、话题引导和推荐机制提升互动欲望",
      body: "第二段讲聊天体验：重点说明为什么常规聊天页不够，以及如何通过全屏、引导和发现入口让用户更愿意继续聊下去。",
      shots: [
        ["会话引导", "thumbs/screen-007.jpg"],
        ["聊天常规", "thumbs/screen-014.jpg"],
        ["聊天全屏", "thumbs/screen-011.jpg"],
      ],
    },
    {
      heading: "5. 角色资产",
      title: "把虚拟人设计成可浏览、可延展、可收藏的内容资产",
      body: "第三段讲角色资产体系：你可以解释为什么角色详情页要拆成形象、人物、幻相等多个维度，以及这样做如何支撑内容消费和世界观扩展。",
      shots: [
        ["幻相奇境", "thumbs/screen-001.jpg"],
        ["详情-形象", "thumbs/screen-003.jpg"],
        ["幻相详情", "thumbs/screen-015.jpg"],
      ],
    },
    {
      heading: "6. 成长系统",
      title: "用羁绊、等级和荣誉把抽象关系变成长期动力",
      body: "第四段讲成长反馈：这部分是你展示产品思维的重点，因为它把情感关系、创作者激励和长期留存连接到了一起。",
      shots: [
        ["与我的羁绊", "thumbs/screen-004.jpg"],
        ["数据报告", "thumbs/screen-036.jpg"],
        ["陪伴等级说明", "thumbs/screen-042.jpg"],
      ],
    },
    {
      heading: "7. 创建与内容闭环",
      title: "让角色创建和剧情广场一起构成持续生产与消费链路",
      body: "最后讲长期价值：角色创建负责生产和搭建，剧情广场负责浏览和消费，两者一起让产品不只是聊天工具，而是有持续内容的互动平台。",
      shots: [
        ["创建人物", "thumbs/screen-049.jpg"],
        ["对话设定", "thumbs/screen-062.jpg"],
        ["剧情广场", "thumbs/screen-063.jpg"],
      ],
    },
  ];

  storyboardSections.forEach((section) => {
    content += `<text x="100" y="${y}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.heading)}</text>`;
    content += `${panel(80, y + 30, 1440, 520, 34)}`;
    content += `<text x="110" y="${y + 94}" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.title)}</text>`;
    content += textBlock(section.body, 110, y + 148, {
      size: 22,
      color: "rgba(243,239,232,0.70)",
      widthChars: 30,
      lineHeight: 36,
    });
    section.shots.forEach(([label, img], index) => {
      content += imageCard(830 + index * 190, y + 84, 170, 390, img, label);
    });
    y += 610;
  });

  content += `
    <text x="100" y="${y}" fill="#FFD78B" font-size="22" letter-spacing="5" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">8. 收尾页</text>
    ${panel(80, y + 30, 1440, 300, 34)}
    <text x="110" y="${y + 100}" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">面试讲述建议</text>
    ${textBlock("你可以在导入 Figma 后再补三类信息：1）项目角色与时间；2）你主导的设计决策；3）如果有上线数据，再加一页结果页。现在这张分镜版已经把讲述顺序和视觉抓手搭好了。", 110, y + 156, { size: 22, color: "rgba(243,239,232,0.70)", widthChars: 40, lineHeight: 36 })}
    <text x="110" y="${y + 270}" fill="#FFD78B" font-size="22" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.name)} / ${escapeXml(profile.title)}</text>
  `;
  y += 380;

  return boardBase("唠唠 Storyboard", "按面试讲述顺序重构的 Figma 分镜版", content, y);
}

function writeOutput(name, svg) {
  fs.writeFileSync(path.join(outputDir, name), svg, "utf8");
}

function writeReadme() {
  const text = [
    "# Figma SVG Export",
    "",
    "1. portfolio-long-scroll.svg",
    "适合一次性拖入 Figma 的超长单页作品集。",
    "",
    "2. portfolio-storyboard.svg",
    "按真正面试讲述顺序编排的分镜版。",
    "",
    "说明：",
    "- SVG 内部嵌入的是位图缩略图，适合排版和展示，不是纯矢量重绘。",
    "- 如果你需要更高分辨率版本，可以把脚本里的 thumbs 路径改成 assets 路径后重新导出。",
    "- 导入 Figma 后建议先转成 Section，再按你的求职场景继续拆页。",
    `- 当前导出模式：${useFullRes ? "high-resolution assets" : "lightweight thumbs"}`,
  ].join("\n");

  fs.writeFileSync(path.join(outputDir, "README.txt"), text, "utf8");
}

ensureDir(outputDir);
writeOutput(
  useFullRes ? "portfolio-long-scroll-hires.svg" : "portfolio-long-scroll.svg",
  buildLongScrollSvg()
);
writeOutput(
  useFullRes ? "portfolio-storyboard-hires.svg" : "portfolio-storyboard.svg",
  buildStoryboardSvg()
);
writeReadme();
