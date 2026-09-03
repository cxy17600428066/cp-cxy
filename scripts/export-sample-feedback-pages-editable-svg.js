const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const sourcePath = path.resolve("09-设计与原型", "12-打样商品二维码反馈交互原型.html");
const outputDir = path.resolve("09-设计与原型", "打样商品二维码反馈Figma可编辑SVG导出");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toFileUrl(filePath) {
  const normalized = filePath.replace(/\\/g, "/");
  return `file:///${encodeURI(normalized)}`;
}

function cleanFileName(name) {
  return name.replace(/[\\/:*?"<>|]/g, "-");
}

async function prepare(page, item) {
  await page.goto(toFileUrl(sourcePath), { waitUntil: "load", timeout: 120000 });
  await page.waitForSelector("#main", { timeout: 120000 });
  if (item.viewport) await page.setViewportSize(item.viewport);
  await page.evaluate(action => {
    if (action.type === "page") {
      setView("admin");
      setPage(action.page);
    }
    if (action.type === "qr") {
      setView("admin");
      setPage("batches");
      openQr("SP20260513001");
    }
    if (action.type === "feedbackDetail") {
      setView("admin");
      setPage("feedbacks");
      openFeedback("FB202605130002");
    }
    if (action.type === "newBatch") {
      setView("admin");
      setPage("batches");
      openBatchModal();
    }
    if (action.type === "mobileForm") {
      setView("mobile");
    }
    if (action.type === "mobileSuccess") {
      setView("mobile");
      submitMobileFeedback();
    }
  }, item.action);
  await page.waitForTimeout(350);
}

async function exportEditable(page, item) {
  const result = await page.evaluate(() => {
    const transparent = new Set(["transparent", "rgba(0, 0, 0, 0)"]);
    const skipTags = new Set(["SCRIPT", "STYLE", "NOSCRIPT", "HEAD", "META", "TITLE"]);

    function esc(value) {
      return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }

    function num(value) {
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) ? parsed : 0;
    }

    function fixed(value) {
      return Number(value).toFixed(2).replace(/\.00$/, "").replace(/(\.\d)0$/, "$1");
    }

    function rectOf(element) {
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left + window.scrollX,
        y: rect.top + window.scrollY,
        width: rect.width,
        height: rect.height
      };
    }

    function isVisibleElement(element) {
      if (!element || !element.getBoundingClientRect || skipTags.has(element.tagName)) return false;
      const style = getComputedStyle(element);
      if (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0) return false;
      const rect = element.getBoundingClientRect();
      if (rect.width <= 0 || rect.height <= 0) return false;
      return true;
    }

    function parseColor(color) {
      if (!color || transparent.has(color)) return null;
      const rgb = color.match(/^rgba?\(([^)]+)\)$/);
      if (!rgb) return { value: color, alpha: 1 };
      const values = rgb[1].split(",").map(item => item.trim());
      const r = Math.max(0, Math.min(255, Math.round(num(values[0]))));
      const g = Math.max(0, Math.min(255, Math.round(num(values[1]))));
      const b = Math.max(0, Math.min(255, Math.round(num(values[2]))));
      const alpha = values.length > 3 ? Math.max(0, Math.min(1, Number(values[3]))) : 1;
      if (alpha <= 0) return null;
      const value = `#${[r, g, b].map(item => item.toString(16).padStart(2, "0")).join("")}`;
      return { value, alpha };
    }

    function colorVisible(color) {
      return Boolean(parseColor(color));
    }

    function paintAttrs(kind, color) {
      const parsed = parseColor(color);
      if (!parsed) return `${kind}="none"`;
      const opacity = parsed.alpha < 1 ? ` ${kind}-opacity="${fixed(parsed.alpha)}"` : "";
      return `${kind}="${esc(parsed.value)}"${opacity}`;
    }

    function borderRadius(style, width, height) {
      const radius = Math.min(
        num(style.borderTopLeftRadius),
        Math.max(0, width / 2),
        Math.max(0, height / 2)
      );
      return radius > 0 ? ` rx="${fixed(radius)}" ry="${fixed(radius)}"` : "";
    }

    function shapeForElement(element) {
      if (!isVisibleElement(element)) return "";
      const style = getComputedStyle(element);
      const rect = rectOf(element);
      if (rect.width < 1 || rect.height < 1) return "";

      const rx = borderRadius(style, rect.width, rect.height);
      const parts = [];
      const bg = style.backgroundColor;
      if (colorVisible(bg)) {
        parts.push(`<rect x="${fixed(rect.x)}" y="${fixed(rect.y)}" width="${fixed(rect.width)}" height="${fixed(rect.height)}"${rx} ${paintAttrs("fill", bg)}/>`);
      }

      const borderWidth = Math.max(
        num(style.borderTopWidth),
        num(style.borderRightWidth),
        num(style.borderBottomWidth),
        num(style.borderLeftWidth)
      );
      const borderColor = style.borderTopColor;
      if (borderWidth > 0 && colorVisible(borderColor)) {
        const inset = borderWidth / 2;
        parts.push(`<rect x="${fixed(rect.x + inset)}" y="${fixed(rect.y + inset)}" width="${fixed(Math.max(0, rect.width - borderWidth))}" height="${fixed(Math.max(0, rect.height - borderWidth))}"${rx} fill="none" ${paintAttrs("stroke", borderColor)} stroke-width="${fixed(borderWidth)}"/>`);
      }

      return parts.join("");
    }

    function textStyle(parent) {
      const style = getComputedStyle(parent);
      return {
        fill: style.color,
        size: num(style.fontSize) || 12,
        family: style.fontFamily.split(",")[0].replace(/^["']|["']$/g, ""),
        weight: style.fontWeight,
        style: style.fontStyle
      };
    }

    function visibleTextParent(node) {
      const parent = node.parentElement;
      if (!parent || skipTags.has(parent.tagName)) return null;
      return isVisibleElement(parent) ? parent : null;
    }

    function textLinesForNode(node) {
      const parent = visibleTextParent(node);
      if (!parent) return [];
      const raw = node.textContent || "";
      if (!raw.replace(/\s+/g, "")) return [];

      const lines = [];
      const range = document.createRange();
      for (let i = 0; i < raw.length; i += 1) {
        const char = raw[i];
        if (char === "\n" || char === "\r" || char === "\t") continue;
        range.setStart(node, i);
        range.setEnd(node, i + 1);
        const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
        if (!rects.length) continue;
        const rect = rects[0];
        const y = Math.round((rect.top + window.scrollY) * 2) / 2;
        let line = lines.find(item => Math.abs(item.y - y) <= 1.5);
        if (!line) {
          line = { text: "", x: rect.left + window.scrollX, y, top: rect.top + window.scrollY, height: rect.height };
          lines.push(line);
        }
        line.text += char;
        line.x = Math.min(line.x, rect.left + window.scrollX);
        line.top = Math.min(line.top, rect.top + window.scrollY);
        line.height = Math.max(line.height, rect.height);
      }
      range.detach();
      return lines.map(line => ({ ...line, text: line.text.replace(/\s+/g, " ").trim() })).filter(line => line.text);
    }

    function textSvgForNode(node) {
      const parent = visibleTextParent(node);
      if (!parent) return "";
      const style = textStyle(parent);
      if (!colorVisible(style.fill)) return "";
      return textLinesForNode(node).map(line => {
        const y = line.top + style.size * 0.82;
        const attrs = [
          `x="${fixed(line.x)}"`,
          `y="${fixed(y)}"`,
          paintAttrs("fill", style.fill),
          `font-family="${esc(style.family || "Arial")}"`,
          `font-size="${fixed(style.size)}"`,
          `font-weight="${esc(style.weight)}"`
        ];
        if (style.style && style.style !== "normal") attrs.push(`font-style="${esc(style.style)}"`);
        return `<text ${attrs.join(" ")}>${esc(line.text)}</text>`;
      }).join("");
    }

    function controlTextSvg(element) {
      if (!isVisibleElement(element)) return "";
      const tag = element.tagName;
      if (!["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return "";

      let value = "";
      if (tag === "SELECT") value = element.options[element.selectedIndex]?.text || "";
      else value = element.value || element.getAttribute("placeholder") || "";
      value = value.trim();
      if (!value) return "";

      const rect = rectOf(element);
      const style = textStyle(element);
      const x = rect.x + Math.max(8, num(getComputedStyle(element).paddingLeft));
      const y = rect.y + rect.height / 2 + style.size * 0.35;
      return `<text x="${fixed(x)}" y="${fixed(y)}" ${paintAttrs("fill", style.fill)} font-family="${esc(style.family || "Arial")}" font-size="${fixed(style.size)}" font-weight="${esc(style.weight)}">${esc(value)}</text>`;
    }

    const width = Math.max(
      document.documentElement.scrollWidth || 0,
      document.body ? document.body.scrollWidth : 0,
      window.innerWidth || 0
    );
    const height = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      window.innerHeight || 0
    );

    const parts = [];

    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
    let node = walker.currentNode;
    while (node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        parts.push(shapeForElement(node));
        parts.push(controlTextSvg(node));
      } else if (node.nodeType === Node.TEXT_NODE) {
        parts.push(textSvgForNode(node));
      }
      node = walker.nextNode();
    }

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${fixed(width)}" height="${fixed(height)}" viewBox="0 0 ${fixed(width)} ${fixed(height)}">`,
      `<rect x="0" y="0" width="${fixed(width)}" height="${fixed(height)}" fill="#ffffff"/>`,
      parts.join(""),
      `</svg>`
    ].join("");

    return { svg, width, height, title: document.title || "" };
  });

  const fileName = `${String(item.index).padStart(2, "0")}-${cleanFileName(item.name)}.svg`;
  const svgPath = path.join(outputDir, fileName);
  fs.writeFileSync(svgPath, result.svg, "utf8");
  return { ...result, name: item.name, svgPath, mode: "figma-editable-vector-svg" };
}

async function main() {
  ensureDir(outputDir);

  const items = [
    { index: 1, name: "PC-统计看板", viewport: { width: 1440, height: 900 }, action: { type: "page", page: "dashboard" } },
    { index: 2, name: "PC-打样商品", viewport: { width: 1440, height: 900 }, action: { type: "page", page: "products" } },
    { index: 3, name: "PC-样品批次", viewport: { width: 1440, height: 900 }, action: { type: "page", page: "batches" } },
    { index: 4, name: "PC-反馈列表", viewport: { width: 1440, height: 900 }, action: { type: "page", page: "feedbacks" } },
    { index: 5, name: "PC-批次二维码弹窗", viewport: { width: 1440, height: 900 }, action: { type: "qr" } },
    { index: 6, name: "PC-反馈详情抽屉", viewport: { width: 1440, height: 900 }, action: { type: "feedbackDetail" } },
    { index: 7, name: "PC-新建样品批次弹窗", viewport: { width: 1440, height: 900 }, action: { type: "newBatch" } },
    { index: 8, name: "移动端-扫码反馈表单", viewport: { width: 430, height: 900 }, action: { type: "mobileForm" } },
    { index: 9, name: "移动端-提交成功页", viewport: { width: 430, height: 900 }, action: { type: "mobileSuccess" } }
  ];

  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const report = [];
  for (const item of items) {
    await prepare(page, item);
    const exported = await exportEditable(page, item);
    report.push({
      name: exported.name,
      svgPath: exported.svgPath,
      width: exported.width,
      height: exported.height,
      title: exported.title,
      mode: exported.mode
    });
  }

  await page.close();
  await browser.close();

  const reportPath = path.join(outputDir, "_export-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`DONE: ${report.length} pages`);
  for (const item of report) {
    console.log(`${path.basename(item.svgPath)} | ${item.width}x${item.height}`);
  }
  console.log(`REPORT: ${reportPath}`);
}

main().catch(error => {
  console.error(error);
  process.exit(1);
});
