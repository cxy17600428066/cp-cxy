import { readFile } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("dist/client");
const html = await readFile(path.join(outputDirectory, "脱骨侠官网管理系统.html"), "utf8");
const open = html.indexOf("<script>\n") + "<script>\n".length;
const close = html.indexOf("\n</script>", open);
const embedded = html.slice(open, close).replaceAll("<\\\\/script", "</script");
const sourceHtml = await readFile(path.join(outputDirectory, "index.html"), "utf8");
const scriptMatch = sourceHtml.match(/<script type="module"[^>]*src="([^"]+)"[^>]*><\/script>/);
const javascriptName = scriptMatch?.[1].split("/").pop();

if (!javascriptName || open < "<script>\n".length || close < 0) {
  throw new Error("Standalone HTML script could not be located");
}

const built = (await readFile(path.join(outputDirectory, "assets", javascriptName), "utf8"))
  .replaceAll('"/assets/', '"./assets/')
  .replaceAll("'/assets/", "'./assets/")
  .replaceAll("/?admin=", "?admin=")
  .replaceAll("/#", "#");

const result = {
  javascriptName,
  embeddedLength: embedded.length,
  builtLength: built.length,
  exactScriptMatch: embedded === built,
  hasRelativeAssets: html.includes("./assets/"),
  hasModuleScriptTag: /<script[^>]*type=["']module["'][^>]*>/.test(html),
};

if (!result.exactScriptMatch) {
  let firstDifference = 0;
  while (
    firstDifference < embedded.length &&
    firstDifference < built.length &&
    embedded[firstDifference] === built[firstDifference]
  ) {
    firstDifference += 1;
  }
  result.firstDifference = firstDifference;
  result.embeddedRemainder = JSON.stringify(embedded.slice(firstDifference, firstDifference + 80));
  result.builtRemainder = JSON.stringify(built.slice(firstDifference, firstDifference + 80));
}

console.log(JSON.stringify(result, null, 2));
if (!result.exactScriptMatch || result.hasModuleScriptTag || !result.hasRelativeAssets) {
  process.exitCode = 1;
}
