import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const sourceHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const scriptMatch = sourceHtml.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const styleMatch = sourceHtml.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/);

if (!scriptMatch || !styleMatch) {
  throw new Error("未找到构建后的脚本或样式文件");
}

const assetPath = (url) => path.join(outputDirectory, url.replace(/^\//, ""));
let javascript = await readFile(assetPath(scriptMatch[1]), "utf8");
const stylesheet = await readFile(assetPath(styleMatch[1]), "utf8");

javascript = javascript
  .replaceAll('"/assets/', '"./assets/')
  .replaceAll("'/assets/", "'./assets/")
  .replaceAll("/?admin=", "?admin=")
  .replaceAll("/#", "#")
  .replaceAll("</script", "<\\/script");

const standaloneHtml = sourceHtml
  .replace('<div id="root"></div>', '<div id="root"><div style="display:grid;min-height:100vh;place-items:center;color:#667085;font:14px system-ui">页面正在加载，请稍候…</div></div>')
  .replace(styleMatch[0], () => `<style>\n${stylesheet}\n</style>`)
  .replace(scriptMatch[0], "")
  .replace("</body>", () => `<script>\n${javascript}\n</script>\n</body>`);

const outputPath = path.join(outputDirectory, "脱骨侠官网管理系统.html");
await writeFile(outputPath, standaloneHtml, "utf8");
console.log(`Exported HTML: ${outputPath}`);
