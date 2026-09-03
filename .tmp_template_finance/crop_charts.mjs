import sharp from "file:///C:/Users/admin/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp/lib/index.js";
import fs from "node:fs/promises";
const src = "E:\\cxy\\outputs\\大客中心利润分析\\rendered";
const out = "E:\\cxy\\.tmp_template_finance\\chart-images";
await fs.mkdir(out, { recursive: true });
for (const [input, name] of [
  ["幻灯片3.PNG", "budget.png"],
  ["幻灯片4.PNG", "revenue.png"],
  ["幻灯片5.PNG", "margin.png"],
  ["幻灯片6.PNG", "expense.png"],
]) {
  await sharp(`${src}\\${input}`).extract({ left: 45, top: 135, width: 735, height: 670 }).png().toFile(`${out}\\${name}`);
}
