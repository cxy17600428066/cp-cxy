const fs = require("fs");
const path = require("path");

const outDir = path.resolve("09-设计与原型", "代理发货管理Figma标注图");
const outPath = path.join(outDir, "代理发货活动费用-按标注修改版-可编辑.svg");

const W = 1200;
const H = 2940;
const parts = [];

const C = {
  bg: "#f5f7fb",
  panel: "#ffffff",
  panel2: "#eaf7fd",
  panel3: "#f7fbff",
  line: "#d8e0ea",
  softLine: "#eef2f6",
  text: "#1f2937",
  muted: "#667085",
  lightText: "#98a2b3",
  blue: "#2f8df6",
  blueSoft: "#e8f2ff",
  cyan: "#15b8e6",
  red: "#f04438",
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

function required(x, y) {
  text(x, y, "*", 12, C.red, 700);
}

function label(x, y, value, isRequired = true) {
  if (isRequired) required(x, y);
  text(x + (isRequired ? 10 : 0), y, value, 12, C.muted);
}

function input(x, y, w, h, value = "", suffix = "", prefix = "") {
  rect(x, y, w, h, C.input, C.line, 3);
  let left = x + 12;
  if (prefix) {
    rect(x, y, 26, h, C.inputBg, C.line, 3);
    text(x + 10, y + 19, prefix, 12, C.muted);
    left = x + 36;
  }
  if (value) text(left, y + 19, value, 12, value.includes("请输入") || value.includes("请选择") ? C.lightText : C.text);
  if (suffix) {
    rect(x + w - 34, y, 34, h, C.inputBg, C.line, 3);
    text(x + w - 22, y + 19, suffix, 12, C.muted);
  }
}

function select(x, y, w, h, value = "") {
  input(x, y, w, h, value);
  text(x + w - 20, y + 19, "⌄", 13, C.lightText, 700);
}

function textarea(x, y, w, h, placeholder = "请输入备注") {
  rect(x, y, w, h, C.input, C.line, 3);
  text(x + 12, y + 20, placeholder, 12, C.lightText);
  text(x + w - 50, y + h - 8, "0 / 1000", 10, C.lightText);
}

function button(x, y, w, h, value, fill = C.blue, color = "#ffffff") {
  rect(x, y, w, h, fill, fill, 4);
  text(x + 13, y + 20, value, 12, color, 600);
}

function chip(x, y, value, active = false) {
  rect(x, y - 17, 14, 14, active ? C.blue : "#ffffff", active ? C.blue : C.line, 2);
  if (active) text(x + 3, y - 5, "✓", 10, "#ffffff", 700);
  text(x + 20, y - 5, value, 12, C.muted);
}

function sectionTitle(x, y, title, note = "") {
  rect(x, y, 5, 18, C.cyan, "none", 0);
  text(x + 12, y + 14, title, 15, C.text, 700);
  if (note) text(x + 126, y + 14, note, 13, C.red, 700);
}

function table(x, y, w, cols, rows = 1, rowH = 42) {
  const headH = 36;
  rect(x, y, w, headH + rows * rowH, C.panel, C.line, 0);
  rect(x, y, w, headH, "#f8fafc", "none", 0);
  let cx = x;
  cols.forEach(col => {
    text(cx + 10, y + 23, col.title, 12, C.muted, 600);
    cx += col.w;
  });
  for (let i = 1; i <= rows; i += 1) line(x, y + headH + i * rowH, x + w, y + headH + i * rowH, C.softLine);
  text(x + w / 2 - 24, y + headH + 26, "暂无数据", 12, C.lightText);
}

function feeForm(x, y, w, includeDelete = true) {
  const left = x + 28;
  const right = x + w / 2 + 38;

  label(left, y + 24, "预计其他费用(元)");
  input(left + 134, y + 6, 406, 30, "0.00", "元", "-");
  if (includeDelete) text(left + 552, y + 25, "删除", 12, C.red, 600);

  label(left, y + 68, "经销商承担费用(元)");
  input(left + 134, y + 50, 178, 30, "0.00", "元", "-");
  input(left + 328, y + 50, 178, 30, "0.00", "%", "-");

  label(left, y + 112, "公司名称");
  input(left + 134, y + 94, 406, 30, "请输入公司名称");

  label(left, y + 156, "账号");
  input(left + 134, y + 138, 406, 30, "请输入账号");

  text(left + 118, y + 198, "备注", 12, C.muted);
  textarea(left + 134, y + 178, 406, 48);

  label(right, y + 24, "按次时长费用");
  input(right + 130, y + 6, 166, 30, "0.00", "元", "-");
  input(right + 312, y + 6, 166, 30, "0.00", "%", "-");

  label(right, y + 68, "支付方式");
  select(right + 130, y + 50, 430, 30, "活动加价 / 分润 / 经销商上账 / 客户内兑打款 / 公司转账 / 第三方打款");

  label(right, y + 112, "开户行");
  input(right + 130, y + 94, 430, 30, "请输入开户行");
}

function feeSection(y, note) {
  rect(16, y, W - 32, 318, C.panel2, "none", 0);
  sectionTitle(28, y + 16, "活动费用计划", note);
  text(28, y + 68, "重要使用物料明细 >>>", 13, C.text, 700);
  button(W - 232, y + 22, 104, 28, "历史申请记录");
  button(W - 120, y + 22, 92, 28, "+ 选择物料");
  table(38, y + 82, W - 76, [
    { title: "序号", w: 80 },
    { title: "物料名称", w: 260 },
    { title: "本次申请领取数量", w: 220 },
    { title: "单价（元/月）", w: 170 },
    { title: "折旧时长（个月）", w: 180 },
    { title: "成本金额", w: 160 },
    { title: "操作", w: 54 }
  ], 1, 44);
  feeForm(38, y + 168, W - 76, true);
}

function materialSection(y) {
  rect(16, y, W - 32, 222, C.panel2, "none", 0);
  sectionTitle(28, y + 16, "活动费用计划", "社群物料");
  text(28, y + 70, "重点使用物料明细 >>>", 13, C.text, 700);
  button(W - 232, y + 22, 104, 28, "历史申请记录");
  button(W - 120, y + 22, 92, 28, "+ 选择物料");
  table(38, y + 90, W - 76, [
    { title: "序号", w: 80 },
    { title: "米柜品类", w: 180 },
    { title: "米柜型号", w: 180 },
    { title: "米柜尺寸", w: 180 },
    { title: "米柜数量", w: 180 },
    { title: "米柜单价", w: 180 },
    { title: "其他金额", w: 104 },
    { title: "操作", w: 40 }
  ], 1, 48);
}

function shopAndGiftSection(y) {
  rect(16, y, W - 32, 746, C.bg, "none", 0);
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
  rect(134, y + 194, 110, 34, "#fff7f7", "#fecaca", 3);
  text(152, y + 215, "赠品汇总费用", 12, C.red, 600);
  chip(270, y + 216, "按金额核销", true);

  button(38, y + 246, 60, 28, "+ 加一行");
  rect(38, y + 286, W - 76, 420, C.panel, C.line, 0);
  rect(38, y + 286, W - 76, 36, "#f8fafc", "none", 0);
  text(62, y + 309, "次数", 12, C.muted, 600);
  text(190, y + 309, "需二级编辑总额（元）", 12, C.muted, 600);
  text(610, y + 309, "说明", 12, C.muted, 600);
  text(W - 104, y + 309, "操作", 12, C.muted, 600);

  for (let i = 0; i < 7; i += 1) {
    const yy = y + 322 + i * 52;
    rect(38, yy, W - 76, 52, i % 2 ? "#ffffff" : "#f8fbff", "none", 0);
    line(38, yy, W - 38, yy, C.softLine);
    text(68, yy + 31, String(i + 1), 12, C.blue);
    input(116, yy + 11, 148, 28, "需输入");
    text(116, yy + 48, "需输入费用总额必填", 10, C.red);
    input(286, yy + 11, 840, 28, "保证说明");
    text(W - 74, yy + 31, "删除", 12, C.red);
  }
  rect(W - 82, y + 674, 56, 30, "#ff5b67", "#ff5b67", 4);
  text(W - 64, y + 694, "删除", 12, "#ffffff", 600);
}

function topInfo() {
  rect(0, 0, W, H, C.bg, "none", 0);
  sectionTitle(18, 22, "活动信息");
  rect(14, 58, W - 28, 438, C.panel3, C.line, 0);

  label(95, 116, "活动类型");
  select(174, 96, 420, 30, "CP2 活动物料");

  label(95, 158, "计划起止日期");
  input(174, 138, 420, 30, "请选择开始时间                  请选择结束时间");

  label(95, 200, "门店总数量");
  input(174, 180, 420, 30, "0", "", "-");

  label(690, 116, "活动天数");
  input(774, 96, 388, 30, "0", "天", "-");

  label(690, 158, "承担门店数量");
  input(774, 138, 388, 30, "0", "", "-");

  text(94, 242, "费用类型", 12, C.muted);
  chip(164, 242, "陈列费用", false);
  chip(278, 242, "店内物料费用", true);
  chip(416, 242, "内广引流费用", true);
  chip(560, 242, "社群物料", true);
  chip(678, 242, "活动门店", false);
  chip(790, 242, "第三方管理费用", false);
  chip(930, 242, "其他费用", false);

  label(95, 286, "活动主题");
  input(174, 266, 988, 30, "OA企微 / 标准客户群 / 个性化社群客户 / 门头 / 地推 / 陈列 / 综合物料 / 私域群卡头 / 活动帖子 / 门店业务汇总");

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
  label(620, 424, "计划费用合计(元)");
  text(782, 424, "---", 12, C.muted);

  text(84, 444, "申请内容", 13, C.red, 700);
  text(142, 444, "活动总结：", 12, C.muted);
  input(202, 424, 225, 30, "请输入活动总结");
  text(84, 486, "内容详情", 13, C.red, 700);
  text(142, 486, "备注：", 12, C.muted);
  textarea(202, 466, 960, 48, "请输入备注");
  text(84, 536, "附件", 12, C.text);
  rect(184, 516, 86, 28, "#ffffff", C.line, 3);
  text(208, 535, "添加附件", 12, C.text);
}

topInfo();
feeSection(548, "拆分物料");
feeSection(902, "内广引流费用");
feeSection(1256, "社群物料");
materialSection(1660);
shopAndGiftSection(1918);

rect(68, 2662, W - 136, 232, C.panel2, "none", 0);
sectionTitle(84, 2682, "其他费用");
feeForm(84, 2728, W - 168, true);

fs.mkdirSync(outDir, { recursive: true });
const svg = [
  `<?xml version="1.0" encoding="UTF-8"?>`,
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
  ...parts,
  `</svg>`
].join("\n");
fs.writeFileSync(outPath, svg, "utf8");
console.log(outPath);
