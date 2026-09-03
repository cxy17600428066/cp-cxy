const fs = require("fs");
const path = require("path");

const outDir = path.resolve("09-设计与原型", "代理发货管理Figma标注图");
const outPath = path.join(outDir, "代理发货活动费用标注-可编辑.svg");

const W = 1200;
const H = 2960;
const parts = [];

const C = {
  bg: "#f5f7fb",
  panel: "#ffffff",
  panel2: "#eef9fd",
  band: "#dff4fb",
  line: "#d8e0ea",
  softLine: "#eef2f6",
  text: "#273142",
  muted: "#667085",
  lightText: "#98a2b3",
  blue: "#2f8df6",
  red: "#ff0000",
  input: "#ffffff",
  inputBg: "#f8fbff"
};

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function push(tag, attrs = {}, body = "") {
  const attrText = Object.entries(attrs)
    .filter(([, value]) => value !== undefined && value !== null && value !== false)
    .map(([key, value]) => `${key}="${esc(value)}"`)
    .join(" ");
  parts.push(body ? `<${tag} ${attrText}>${body}</${tag}>` : `<${tag} ${attrText}/>`);
}

function rect(x, y, w, h, fill = "none", stroke = "none", rx = 0, extra = {}) {
  push("rect", { x, y, width: w, height: h, fill, stroke, rx, ry: rx, ...extra });
}

function line(x1, y1, x2, y2, stroke = C.line, sw = 1) {
  push("line", { x1, y1, x2, y2, stroke, "stroke-width": sw });
}

function text(x, y, value, size = 13, fill = C.text, weight = 400, extra = {}) {
  push("text", {
    x,
    y,
    fill,
    "font-family": "Microsoft YaHei, Arial, sans-serif",
    "font-size": size,
    "font-weight": weight,
    "letter-spacing": 0,
    ...extra
  }, esc(value));
}

function redText(x, y, value, size = 12, weight = 700) {
  text(x, y, value, size, C.red, weight);
}

function redBox(x, y, w, h, label) {
  rect(x, y, w, h, "none", C.red, 0, { "stroke-width": 2 });
  if (label) redText(x + 6, y - 6, label, 12);
}

function label(x, y, value, required = true) {
  if (required) redText(x, y, "*", 12, 400);
  text(x + (required ? 10 : 0), y, value, 12, C.muted);
}

function input(x, y, w, h, value = "", suffix = "", prefix = "") {
  rect(x, y, w, h, C.input, C.line, 3);
  if (prefix) {
    rect(x, y, 24, h, C.inputBg, C.line, 3);
    text(x + 9, y + 18, prefix, 12, C.muted);
  }
  if (value) text(x + (prefix ? 34 : 12), y + 18, value, 12, value.includes("请输入") ? C.lightText : C.text);
  if (suffix) {
    rect(x + w - 32, y, 32, h, C.inputBg, C.line, 3);
    text(x + w - 20, y + 18, suffix, 12, C.muted);
  }
}

function textarea(x, y, w, h, placeholder = "请输入备注") {
  rect(x, y, w, h, C.input, C.line, 3);
  text(x + 12, y + 20, placeholder, 12, C.lightText);
  text(x + w - 48, y + h - 8, "0 / 1000", 10, C.lightText);
}

function button(x, y, w, h, value, fill = C.blue, color = "#ffffff") {
  rect(x, y, w, h, fill, fill, 4);
  text(x + 13, y + 20, value, 12, color, 600);
}

function checkbox(x, y, value, checked = false) {
  rect(x, y - 10, 10, 10, checked ? C.blue : "#ffffff", checked ? C.blue : C.line, 1);
  if (checked) text(x + 1.5, y - 1.5, "✓", 9, "#ffffff", 700);
  text(x + 16, y, value, 12, C.muted);
}

function sectionTitle(x, y, title, note = "") {
  rect(x, y, 5, 18, "#16b5e8", "none", 0);
  text(x + 12, y + 14, title, 15, C.text, 700);
  if (note) redText(x + 130, y + 14, note, 13);
}

function table(x, y, w, cols, rows = 2, rowH = 38) {
  const headH = 36;
  rect(x, y, w, headH + rows * rowH, C.panel, C.line, 0);
  rect(x, y, w, headH, "#f7fafc", "none", 0);
  let cx = x;
  cols.forEach(col => {
    text(cx + 10, y + 23, col.title, 12, C.muted, 600);
    if (col.red) redText(cx + 10, y + 12, col.red, 11);
    cx += col.w;
  });
  for (let i = 1; i <= rows; i += 1) line(x, y + headH + i * rowH, x + w, y + headH + i * rowH, C.softLine);
  text(x + w / 2 - 24, y + headH + 24, "暂无数据", 12, C.lightText);
}

function feeForm(x, y, w, annotate = true) {
  const left = x + 28;
  const right = x + w / 2 + 38;
  label(left, y + 24, "预计其他费用(元)");
  input(left + 134, y + 6, 410, 30, "0.00", "元", "-");
  if (annotate) redBox(left + 128, y + 2, 430, 38, "删除");

  label(left, y + 68, "经销商承担费用(元)");
  input(left + 134, y + 50, 180, 30, "0.00", "元", "-");
  input(left + 330, y + 50, 180, 30, "0.00", "%", "-");

  label(left, y + 112, "公司名称");
  input(left + 134, y + 94, 410, 30, "输入公司名称");
  label(left, y + 156, "账号");
  input(left + 134, y + 138, 410, 30, "输入账号");
  text(left + 118, y + 198, "备注", 12, C.muted);
  textarea(left + 134, y + 178, 410, 48);

  label(right, y + 24, "按次时长费用");
  input(right + 130, y + 6, 170, 30, "0.00", "元", "-");
  input(right + 316, y + 6, 170, 30, "0.00", "%", "-");

  label(right, y + 68, "支付方式");
  input(right + 130, y + 50, 430, 30, "下拉框维护1次款项：活动加价、分润、经销商上账、客户内兑打款、公司转账、第三方打款", "", "");
  redBox(right + 124, y + 46, 448, 38, "");
  redText(right + 170, y + 67, "下拉框维护1次款项，活动加价、分润、经销商上账、客户内兑打款、公司转账、第三方打款", 11);

  label(right, y + 112, "开户行");
  input(right + 130, y + 94, 430, 30, "输入开户行");
}

function feeSection(y, title, note, rowLabel = "重要使用物料明细 >>>", showButtons = true) {
  rect(16, y, W - 32, 318, C.panel2, "none", 0);
  sectionTitle(28, y + 16, title, note);
  redBox(28, y + 46, 130, 38, rowLabel);
  if (showButtons) {
    button(W - 232, y + 22, 104, 28, "历史申请记录");
    button(W - 120, y + 22, 92, 28, "+ 选择物料");
  }
  table(38, y + 82, W - 76, [
    { title: "序号", w: 80 },
    { title: "物料名称", w: 300 },
    { title: "本次申请领取数量", w: 260 },
    { title: "成本单价", w: 210, red: "单价（元/月）" },
    { title: "成本金额", w: 210, red: "总额" },
    { title: "操作", w: 60 }
  ], 1, 44);
  feeForm(38, y + 168, W - 76, true);
}

function materialSection(y) {
  rect(16, y, W - 32, 222, C.panel2, "none", 0);
  sectionTitle(28, y + 16, "活动费用计划", "社群物料");
  redBox(28, y + 48, 128, 38, "重点使用物料明细 >>>");
  button(W - 232, y + 22, 104, 28, "历史申请记录");
  button(W - 120, y + 22, 92, 28, "+ 选择物料");
  table(38, y + 90, W - 76, [
    { title: "序号", w: 80 },
    { title: "物料名称", w: 220, red: "米柜品类" },
    { title: "本次申请领取数量", w: 240, red: "米柜型号" },
    { title: "本次申请领取数量", w: 180, red: "米柜尺寸" },
    { title: "成本单价", w: 200, red: "米柜单价" },
    { title: "成本金额", w: 180, red: "其他金额" },
    { title: "操作", w: 60 }
  ], 1, 48);
}

function shopAndGiftSection(y) {
  rect(16, y, W - 32, 760, C.bg, "none", 0);
  button(38, y + 18, 58, 28, "+添加");
  button(104, y + 18, 86, 28, "+导入门店");
  button(198, y + 18, 92, 28, "+手动门店");
  table(38, y + 58, W - 76, [
    { title: "序号", w: 75 },
    { title: "门店名称", w: 160 },
    { title: "市市", w: 120 },
    { title: "地址", w: 260 },
    { title: "渠道大类", w: 120 },
    { title: "公司分类", w: 150 },
    { title: "负责人", w: 110 },
    { title: "联系电话", w: 120 },
    { title: "大区经理", w: 120 },
    { title: "操作", w: 69 }
  ], 1, 52);

  label(38, y + 212, "核销方式");
  rect(132, y + 194, 86, 34, "#fff7f7", C.red, 0);
  redText(146, y + 215, "赠品汇总费用", 12);
  text(238, y + 215, "按金额核销", 12, C.blue);
  redText(204, y + 186, "介绍2个核销", 12);
  redText(204, y + 204, "给全费用类型", 12);

  button(38, y + 246, 60, 28, "+ 加一行");
  rect(38, y + 286, W - 76, 430, C.panel, C.line, 0);
  rect(38, y + 286, W - 76, 36, "#f7fafc", "none", 0);
  text(62, y + 309, "次数", 12, C.muted, 600);
  redText(178, y + 300, "需二级编辑总额（元）", 11);
  text(190, y + 309, "需二级编辑总额（元）", 12, C.muted, 600);
  text(610, y + 309, "说明", 12, C.muted, 600);
  text(W - 104, y + 309, "操作", 12, C.muted, 600);

  for (let i = 0; i < 7; i += 1) {
    const yy = y + 322 + i * 54;
    rect(38, yy, W - 76, 54, i % 2 ? "#ffffff" : "#f8fbff", "none", 0);
    line(38, yy, W - 38, yy, C.softLine);
    text(68, yy + 31, String(i + 1), 12, C.blue);
    input(116, yy + 11, 148, 28, "需输入");
    redText(116, yy + 48, "需输入费用总额必填", 10, 400);
    input(286, yy + 11, 840, 28, "保证说明");
    text(W - 74, yy + 31, "删除", 12, C.red);
  }
  rect(W - 82, y + 686, 56, 30, "#ff5b67", "#ff5b67", 4);
  text(W - 64, y + 706, "删除", 12, "#ffffff", 600);
}

function topInfo() {
  rect(0, 0, W, H, C.bg, "none", 0);
  sectionTitle(18, 22, "活动信息");
  rect(14, 58, W - 28, 438, "#f8fbff", C.line, 0);

  redText(154, 86, "CP2 活动物料", 13);
  label(95, 116, "活动类型");
  input(174, 96, 420, 30, "CP1 活动物料");
  label(95, 158, "计划起止日期");
  input(174, 138, 420, 30, "请选择开始时间                  请选择结束时间");
  label(95, 200, "门店总数量");
  input(174, 180, 420, 30, "0", "", "-");

  label(690, 116, "CP1扣款");
  input(774, 96, 388, 30, "请选择CP1扣款");
  redBox(682, 82, 494, 58, "CP1扣款");
  label(690, 158, "活动天数");
  input(774, 138, 388, 30, "0", "天", "-");
  label(690, 200, "承担门店数量");
  input(774, 180, 388, 30, "0", "", "-");

  text(94, 242, "费用类型", 12, C.muted);
  checkbox(164, 242, "陈列费用", false);
  checkbox(278, 242, "店内物料费用", true);
  checkbox(416, 242, "内广引流费用", true);
  checkbox(560, 242, "社群物料", true);
  checkbox(678, 242, "活动门店", false);
  checkbox(790, 242, "第三方管理费用", false);
  checkbox(930, 242, "其他费用", false);

  label(95, 286, "活动主题");
  input(174, 266, 988, 30, "");
  redBox(98, 254, 970, 44, "其他类型：");
  redText(112, 280, "OA企微/标准客情群、少个性化群/社群客户、门头、地推、拍照物料、称重铺陈、综合物料、卡头、活动帖子、门店业务汇总等", 12);

  label(38, 340, "预计费用合计(元)");
  text(190, 340, "---", 12, C.muted);
  label(38, 382, "预计买赠活动费用(元)");
  text(220, 382, "---", 12, C.muted);
  label(38, 424, "预计其他活动支出合计(元)");
  text(240, 424, "---", 12, C.muted);

  label(620, 340, "预计买赠活动费用预计(元)");
  text(820, 340, "---", 12, C.muted);
  label(620, 382, "预计其他活动费用预计(元)");
  text(828, 382, "---", 12, C.muted);
  label(620, 424, "预计总计(元)");
  text(742, 424, "---", 12, C.muted);
  redText(826, 376, "OA填写系统维护活动计划金额", 12);
  redText(900, 356, "2026版本不允许系统默认计划金额", 11);

  redText(84, 444, "申请内容", 13);
  text(142, 444, "活动总结：", 12, C.muted);
  input(202, 424, 225, 30, "");
  redText(84, 486, "内容详情", 13);
  text(142, 486, "备注：", 12, C.muted);
  textarea(202, 466, 960, 48, "请输入备注");
  text(84, 536, "附件", 12, C.text);
  rect(184, 516, 86, 28, "#ffffff", C.line, 3);
  text(208, 535, "添加附件", 12, C.text);
}

topInfo();
feeSection(548, "活动费用计划", "拆分物料", "重要使用物料明细 >>>");
feeSection(902, "活动费用计划", "内广引流费用", "重要使用物料明细 >>>");
feeSection(1256, "活动费用计划", "社群物料", "重要使用物料明细 >>>");
materialSection(1660);
shopAndGiftSection(1918);

rect(68, 2676, W - 136, 232, C.panel2, "none", 0);
sectionTitle(84, 2696, "其他费用");
feeForm(84, 2742, W - 168, true);
redBox(84, 2728, 580, 48, "删除");

fs.mkdirSync(outDir, { recursive: true });
const svg = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  ...parts,
  `</svg>`
].join("\n");
fs.writeFileSync(outPath, svg, "utf8");
console.log(outPath);
