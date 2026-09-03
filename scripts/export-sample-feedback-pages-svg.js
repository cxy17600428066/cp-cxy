const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const sourcePath = path.resolve("09-设计与原型", "12-打样商品二维码反馈交互原型.html");
const outputDir = path.resolve("09-设计与原型", "打样商品二维码反馈SVG导出");

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
  await page.evaluate(async action => {
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
  await page.waitForTimeout(250);
}

async function pageMetrics(page) {
  return page.evaluate(() => {
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
    return { width, height, title: document.title || "" };
  });
}

async function exportCurrent(page, item) {
  const result = await pageMetrics(page);
  await page.setViewportSize({
    width: Math.ceil(result.width),
    height: Math.ceil(Math.min(result.height, 12000))
  });
  await page.waitForTimeout(100);
  const imageBuffer = await page.screenshot({
    fullPage: true,
    type: "png"
  });
  const imageBase64 = imageBuffer.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${result.width}" height="${result.height}" viewBox="0 0 ${result.width} ${result.height}">`,
    `<rect x="0" y="0" width="${result.width}" height="${result.height}" fill="#ffffff" />`,
    `<image x="0" y="0" width="${result.width}" height="${result.height}" href="data:image/png;base64,${imageBase64}" />`,
    `</svg>`
  ].join("");

  const fileName = `${String(item.index).padStart(2, "0")}-${cleanFileName(item.name)}.svg`;
  const svgPath = path.join(outputDir, fileName);
  fs.writeFileSync(svgPath, svg, "utf8");
  return { ...result, name: item.name, svgPath, mode: "figma-compatible-image-svg" };
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
    const exported = await exportCurrent(page, item);
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
