const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

const sourceDir = process.argv[2] || "E:\\cxy\\09-设计与原型";
const outputDir = process.argv[3] || path.join(sourceDir, "设计工单SVG导出");

function ensureDir(dir) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function toFileUrl(p) {
  const normalized = p.replace(/\\/g, "/");
  return `file:///${encodeURI(normalized)}`;
}

async function exportOne(page, htmlPath, svgPath) {
  const fileUrl = toFileUrl(htmlPath);
  await page.goto(fileUrl, { waitUntil: "load", timeout: 120000 });
  await page.waitForTimeout(350);

  const result = await page.evaluate(() => {
    const width = Math.max(
      document.documentElement.scrollWidth || 0,
      document.body ? document.body.scrollWidth : 0,
      window.innerWidth || 0,
      375
    );
    const height = Math.max(
      document.documentElement.scrollHeight || 0,
      document.body ? document.body.scrollHeight : 0,
      window.innerHeight || 0,
      667
    );

    const cloned = document.documentElement.cloneNode(true);
    const scripts = cloned.querySelectorAll("script");
    scripts.forEach(node => node.remove());

    const serializer = new XMLSerializer();
    let xhtml = serializer.serializeToString(cloned);
    xhtml = xhtml
      .replace(/&nbsp;/g, "&#160;")
      .replace(/<\/?meta([^>]*)>/gi, "<meta$1 />");

    const svg = [
      `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`,
      `<rect x="0" y="0" width="${width}" height="${height}" fill="#ffffff" />`,
      `<foreignObject x="0" y="0" width="${width}" height="${height}">`,
      xhtml,
      `</foreignObject>`,
      `</svg>`
    ].join("");

    return { svg, width, height, title: document.title || "" };
  });

  fs.writeFileSync(svgPath, result.svg, "utf8");
  return result;
}

async function main() {
  ensureDir(outputDir);
  const htmlFiles = fs
    .readdirSync(sourceDir, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.toLowerCase().endsWith(".html"))
    .map(entry => path.join(sourceDir, entry.name))
    .sort((a, b) => a.localeCompare(b, "zh-CN"));

  if (!htmlFiles.length) {
    console.log(`NO_HTML: ${sourceDir}`);
    return;
  }

  const browser = await chromium.launch({
    channel: "msedge",
    headless: true
  });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

  const report = [];
  for (const htmlPath of htmlFiles) {
    const base = path.basename(htmlPath, path.extname(htmlPath));
    const svgPath = path.join(outputDir, `${base}.svg`);
    const { width, height, title } = await exportOne(page, htmlPath, svgPath);
    report.push({ htmlPath, svgPath, width, height, title });
  }

  await page.close();
  await browser.close();

  const reportPath = path.join(outputDir, "_export-report.json");
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), "utf8");

  console.log(`DONE: ${report.length} files`);
  report.forEach(item => {
    console.log(`${path.basename(item.svgPath)} | ${item.width}x${item.height} | ${item.title}`);
  });
  console.log(`REPORT: ${reportPath}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});

