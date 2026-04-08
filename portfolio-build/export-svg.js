const fs = require("fs");
const path = require("path");

const root = __dirname;
const outputDir = path.join(root, "svg-boards");

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
    body: "登录、新手引导、剧情试炼和人物信息被串成一条顺滑路径，确保用户不是进来看看，而是快速进入角色关系。",
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
    title: "从冷启动到上手完成，做成有剧情感的开场",
    description: "首登并没有停留在传统注册流程，而是把用户带入人物选择、剧情广场、线索点击、任务完成和分享结局等节点，让第一次使用本身像一次体验式任务。",
    shots: [
      { title: "手机登录", image: "thumbs/screen-002.jpg" },
      { title: "人物选择", image: "thumbs/screen-017.jpg" },
      { title: "通关成功", image: "thumbs/screen-026.jpg" },
    ],
  },
  {
    title: "沉浸式聊天页，不只是输入框和气泡",
    description: "聊天界面引入大幅角色视觉、会话引导、热门话题、发现入口和全屏沉浸模式，既照顾轻量开启对话，也强化角色存在感和情感氛围。",
    shots: [
      { title: "会话引导", image: "thumbs/screen-007.jpg" },
      { title: "聊天常规态", image: "thumbs/screen-014.jpg" },
      { title: "聊天全屏态", image: "thumbs/screen-011.jpg" },
    ],
  },
  {
    title: "把角色关系设计成可见、可升级、可回味的成长系统",
    description: "项目用羁绊、亲密等级、陪伴幻相、创作者等级与勋章体系，把抽象的情感联结转成清晰反馈，既服务留存，也让用户愿意持续经营角色关系。",
    shots: [
      { title: "与我的羁绊", image: "thumbs/screen-004.jpg" },
      { title: "创作者数据报告", image: "thumbs/screen-036.jpg" },
      { title: "陪伴等级说明", image: "thumbs/screen-042.jpg" },
    ],
  },
  {
    title: "虚拟人创建流程，让资产搭建本身也足够有成就感",
    description: "从创建人物、形象设定、声音设定、基本信息、对话设定，到基础档案、羁绊线索、人物塑造、人物心智，整个创建链路被包装成逐步解锁的成长路径。",
    shots: [
      { title: "创建人物", image: "thumbs/screen-049.jpg" },
      { title: "形象设定", image: "thumbs/screen-057.jpg" },
      { title: "对话设定", image: "thumbs/screen-062.jpg" },
    ],
  },
  {
    title: "剧情广场作为内容入口，把浏览、解锁、通关、分享串起来",
    description: "通过剧本卡片、故事背景、剧情聊天、道具解锁和分享结局，把一次次剧情体验做成可消费、可传播、可收集的内容循环。",
    shots: [
      { title: "剧情广场", image: "thumbs/screen-063.jpg" },
      { title: "剧情聊天", image: "thumbs/screen-065.jpg" },
      { title: "分享结局", image: "thumbs/screen-070.jpg" },
    ],
  },
];

const sections = [
  {
    title: "登录与新手引导",
    description: "从手机号登录到人物选择、剧情试炼、任务反馈与通关成功，建立第一次体验的节奏感。",
    items: [
      ["手机登录", "thumbs/screen-002.jpg"],
      ["人物选择", "thumbs/screen-017.jpg"],
      ["背景故事", "thumbs/screen-023.jpg"],
      ["剧情广场引导", "thumbs/screen-020.jpg"],
      ["点击剧本", "thumbs/screen-021.jpg"],
      ["查看任务", "thumbs/screen-024.jpg"],
      ["点击线索", "thumbs/screen-018.jpg"],
      ["通关成功", "thumbs/screen-026.jpg"],
    ],
  },
  {
    title: "聊天与发现体验",
    description: "围绕会话引导、主动推荐、发现页和两种聊天模式，打造更沉浸的陪伴式互动体验。",
    items: [
      ["会话引导", "thumbs/screen-007.jpg"],
      ["聊天常规", "thumbs/screen-014.jpg"],
      ["聊天全屏", "thumbs/screen-011.jpg"],
      ["主动推新弹窗", "thumbs/screen-044.jpg"],
      ["聊天页会话引导", "thumbs/screen-045.jpg"],
      ["发现页", "thumbs/screen-046.jpg"],
      ["聊天页详情常规", "thumbs/screen-048.jpg"],
      ["聊天页详情全屏", "thumbs/screen-047.jpg"],
    ],
  },
  {
    title: "虚拟人详情与幻相体系",
    description: "通过形象、人物、幻相与其他信息页，构建可浏览、可延展、可收藏的角色资产中心。",
    items: [
      ["幻相奇境", "thumbs/screen-001.jpg"],
      ["详情形象", "thumbs/screen-003.jpg"],
      ["详情人物", "thumbs/screen-012.jpg"],
      ["幻相详情", "thumbs/screen-015.jpg"],
      ["创建幻相", "thumbs/screen-029.jpg"],
      ["详情幻相奇境", "thumbs/screen-030.jpg"],
      ["详情其他", "thumbs/screen-032.jpg"],
      ["详情人物二级", "thumbs/screen-033.jpg"],
    ],
  },
  {
    title: "成长、关系与荣誉系统",
    description: "把羁绊、亲密度、陪伴等级、创作者等级和勋章设计成一套统一反馈系统，持续强化长期价值。",
    items: [
      ["与我的羁绊", "thumbs/screen-004.jpg"],
      ["人物塑造已成形", "thumbs/screen-005.jpg"],
      ["人物心智已敞开", "thumbs/screen-006.jpg"],
      ["等级勋章", "thumbs/screen-009.jpg"],
      ["陪伴等级", "thumbs/screen-013.jpg"],
      ["数据报告", "thumbs/screen-036.jpg"],
      ["创作者升级", "thumbs/screen-038.jpg"],
      ["陪伴等级说明", "thumbs/screen-042.jpg"],
    ],
  },
  {
    title: "创建虚拟人流程",
    description: "创建过程并非单次填写，而是由多个可解锁的节点组成，强调陪伴角色的搭建感和养成感。",
    items: [
      ["创建人物", "thumbs/screen-049.jpg"],
      ["标签选择", "thumbs/screen-052.jpg"],
      ["声音设定", "thumbs/screen-054.jpg"],
      ["形象设定", "thumbs/screen-057.jpg"],
      ["基础档案", "thumbs/screen-058.jpg"],
      ["基本信息", "thumbs/screen-059.jpg"],
      ["羁绊线索", "thumbs/screen-061.jpg"],
      ["对话设定", "thumbs/screen-062.jpg"],
    ],
  },
  {
    title: "剧情广场与剧本体验",
    description: "围绕剧本浏览、剧情聊天、背景补充、道具解锁与分享结局，形成内容消费和社交传播闭环。",
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
  const filePath = path.join(root, relPath);
  const buffer = fs.readFileSync(filePath);
  const ext = path.extname(filePath).toLowerCase();
  const mime = ext === ".png" ? "image/png" : "image/jpeg";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

function wrapText(text, limit) {
  const chars = Array.from(text);
  const lines = [];
  let line = "";
  chars.forEach((char) => {
    line += char;
    if (line.length >= limit) {
      lines.push(line);
      line = "";
    }
  });
  if (line) {
    lines.push(line);
  }
  return lines;
}

function drawTextBlock(text, x, y, options = {}) {
  const {
    size = 28,
    color = "#F3EFE8",
    weight = 500,
    lineHeight = size * 1.6,
    widthChars = 24,
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

function frame(x, y, w, h, radius = 32, fill = "rgba(17,20,39,0.9)") {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${fill}" stroke="rgba(255,255,255,0.08)" />`;
}

function cardImage(x, y, w, h, relPath, label) {
  const href = imageDataUri(relPath);
  return `
    <g>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="#0E1022" stroke="rgba(255,216,140,0.18)" />
      <image x="${x + 14}" y="${y + 14}" width="${w - 28}" height="${h - 28}" preserveAspectRatio="xMidYMid meet" href="${href}" />
      ${label
        ? `<rect x="${x + 20}" y="${y + h - 82}" width="${w - 40}" height="48" rx="18" fill="rgba(6,7,16,0.72)" />
           <text x="${x + 44}" y="${y + h - 48}" fill="#F3EFE8" font-size="24" font-weight="600" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(label)}</text>`
        : ""}
    </g>
  `;
}

function boardShell(title, subtitle, content, width = 1600, height = 2200) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="160" y1="80" x2="1360" y2="2200" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0B0D16" />
      <stop offset="0.45" stop-color="#0A0C19" />
      <stop offset="1" stop-color="#06070F" />
    </linearGradient>
    <radialGradient id="violetGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(280 220) rotate(28) scale(540 420)">
      <stop stop-color="#7D61FF" stop-opacity="0.30" />
      <stop offset="1" stop-color="#7D61FF" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="goldGlow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1280 200) rotate(20) scale(360 260)">
      <stop stop-color="#FFD78B" stop-opacity="0.24" />
      <stop offset="1" stop-color="#FFD78B" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#bg)" />
  <rect width="${width}" height="${height}" fill="url(#violetGlow)" />
  <rect width="${width}" height="${height}" fill="url(#goldGlow)" />
  <text x="100" y="100" fill="#FFD78B" font-size="24" letter-spacing="6" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">JOB PORTFOLIO</text>
  <text x="100" y="170" fill="#F3EFE8" font-size="72" font-weight="700" font-family="Georgia, Times New Roman, serif">${escapeXml(title)}</text>
  <text x="100" y="220" fill="rgba(243,239,232,0.72)" font-size="30" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(subtitle)}</text>
  ${content}
</svg>`;
}

function buildCoverBoard() {
  const hero = cardImage(940, 260, 260, 560, "thumbs/screen-011.jpg", "聊天全屏");
  const sideA = cardImage(1220, 260, 220, 360, "thumbs/screen-049.jpg", "创建人物");
  const sideB = cardImage(1220, 640, 220, 360, "thumbs/screen-063.jpg", "剧情广场");
  const sideC = cardImage(940, 840, 500, 310, "thumbs/screen-042.jpg", "陪伴等级说明");

  const statBlocks = stats
    .map((item, index) => {
      const x = 100 + index * 230;
      return `
        <g>
          <rect x="${x}" y="760" width="200" height="128" rx="28" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
          <text x="${x + 28}" y="818" fill="#FFD78B" font-size="42" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.value)}</text>
          <text x="${x + 28}" y="860" fill="rgba(243,239,232,0.68)" font-size="24" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.label)}</text>
        </g>
      `;
    })
    .join("");

  const principleCards = principles
    .map((item, index) => {
      const x = 100 + (index % 2) * 360;
      const y = 980 + Math.floor(index / 2) * 270;
      return `
        <g>
          <rect x="${x}" y="${y}" width="320" height="220" rx="28" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
          <circle cx="${x + 42}" cy="${y + 40}" r="20" fill="rgba(255,215,130,0.16)" stroke="rgba(255,215,130,0.3)" />
          <text x="${x + 34}" y="${y + 48}" fill="#FFD78B" font-size="20" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">0${index + 1}</text>
          <text x="${x + 32}" y="${y + 88}" fill="#F3EFE8" font-size="26" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.title)}</text>
          ${drawTextBlock(item.body, x + 32, y + 132, { size: 20, color: "rgba(243,239,232,0.72)", widthChars: 14, lineHeight: 34 })}
        </g>
      `;
    })
    .join("");

  const content = `
    ${drawTextBlock("把 AI 虚拟陪伴、剧情互动与成长体系，设计成一个有沉浸感、可持续探索的移动端产品体验。", 100, 340, { size: 34, weight: 600, widthChars: 20, lineHeight: 52 })}
    ${drawTextBlock("该案例围绕冷启动引导、聊天沉浸感、虚拟人资产体系、关系成长与剧情广场，输出完整的产品视觉与关键流程页面。", 100, 470, { size: 24, color: "rgba(243,239,232,0.72)", widthChars: 27, lineHeight: 42 })}
    <rect x="100" y="620" width="300" height="66" rx="33" fill="rgba(255,215,130,0.18)" stroke="rgba(255,215,130,0.28)" />
    <text x="140" y="663" fill="#FFD78B" font-size="26" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">AI 陪伴 / 剧情互动 App</text>
    ${statBlocks}
    ${hero}
    ${sideA}
    ${sideB}
    ${sideC}
    <text x="100" y="940" fill="#FFD78B" font-size="26" letter-spacing="4" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">DESIGN PRINCIPLES</text>
    ${principleCards}
    <rect x="100" y="1530" width="1340" height="260" rx="34" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
    <text x="140" y="1600" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">个人信息占位</text>
    <text x="140" y="1652" fill="rgba(243,239,232,0.72)" font-size="24" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">姓名 / 职位 / 城市 / 邮箱可在导入 Figma 后替换</text>
    <text x="140" y="1738" fill="#FFD78B" font-size="26" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.name)}</text>
    <text x="140" y="1784" fill="#F3EFE8" font-size="24" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.title)}</text>
    <text x="520" y="1738" fill="#FFD78B" font-size="26" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.city)}</text>
    <text x="520" y="1784" fill="#F3EFE8" font-size="24" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(profile.email)}</text>
  `;

  return boardShell("唠唠", "AI 虚拟人陪伴与剧情互动产品案例", content, 1600, 1900);
}

function buildHighlightsBoard(startIndex, endIndex, filename, title) {
  const list = highlights.slice(startIndex, endIndex);
  const items = list
    .map((item, index) => {
      const y = 260 + index * 590;
      const shots = item.shots
        .map((shot, shotIndex) => {
          const x = 860 + shotIndex * 180;
          return cardImage(x, y + 90, 160, 360, shot.image, shot.title);
        })
        .join("");
      return `
        <g>
          <rect x="100" y="${y}" width="1340" height="520" rx="34" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
          <text x="140" y="${y + 70}" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(item.title)}</text>
          ${drawTextBlock(item.description, 140, y + 130, { size: 22, color: "rgba(243,239,232,0.72)", widthChars: 24, lineHeight: 38 })}
          ${shots}
        </g>
      `;
    })
    .join("");

  const height = 260 + list.length * 590 + 100;
  return {
    filename,
    svg: boardShell(title, "把核心设计亮点拆成 Figma 可继续编排的案例画板", items, 1600, height),
  };
}

function buildSectionBoard(section, filename) {
  const tiles = section.items
    .map(([label, image], index) => {
      const col = index % 4;
      const row = Math.floor(index / 4);
      const x = 100 + col * 340;
      const y = 440 + row * 530;
      return `
        <g>
          <rect x="${x}" y="${y}" width="300" height="470" rx="28" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
          <image x="${x + 18}" y="${y + 18}" width="264" height="380" preserveAspectRatio="xMidYMid meet" href="${imageDataUri(image)}" />
          <text x="${x + 24}" y="${y + 430}" fill="#F3EFE8" font-size="24" font-weight="600" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(label)}</text>
        </g>
      `;
    })
    .join("");

  const content = `
    <rect x="100" y="260" width="1340" height="120" rx="28" fill="rgba(17,20,39,0.88)" stroke="rgba(255,255,255,0.08)" />
    <text x="140" y="320" fill="#F3EFE8" font-size="34" font-weight="700" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.title)}</text>
    <text x="140" y="356" fill="rgba(243,239,232,0.72)" font-size="22" font-weight="500" font-family="PingFang SC, Microsoft YaHei, sans-serif">${escapeXml(section.description)}</text>
    ${tiles}
  `;

  return {
    filename,
    svg: boardShell(section.title, "模块化设计稿总览", content, 1600, 1540),
  };
}

function writeBoards() {
  ensureDir(outputDir);

  const boards = [
    { filename: "01-cover-overview.svg", svg: buildCoverBoard() },
    buildHighlightsBoard(0, 3, "02-highlight-a.svg", "核心设计亮点 A"),
    buildHighlightsBoard(3, 5, "03-highlight-b.svg", "核心设计亮点 B"),
    buildSectionBoard(sections[0], "04-onboarding.svg"),
    buildSectionBoard(sections[1], "05-chat-experience.svg"),
    buildSectionBoard(sections[2], "06-character-system.svg"),
    buildSectionBoard(sections[3], "07-growth-system.svg"),
    buildSectionBoard(sections[4], "08-character-creation.svg"),
    buildSectionBoard(sections[5], "09-story-plaza.svg"),
  ];

  boards.forEach((board) => {
    fs.writeFileSync(path.join(outputDir, board.filename), board.svg, "utf8");
  });

  const readme = [
    "# SVG Boards",
    "",
    "这些 SVG 画板可直接拖入 Figma。",
    "说明：由于原始设计稿来自 PNG 图片，SVG 内部使用了嵌入式位图，不是纯矢量重绘。",
    "如果需要完全可编辑的矢量组件，需要再做一次 Figma 级重建。",
    "",
    "建议导入顺序：01 -> 09",
  ].join("\n");

  fs.writeFileSync(path.join(outputDir, "README.txt"), readme, "utf8");
}

writeBoards();
