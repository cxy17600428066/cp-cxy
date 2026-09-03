import fs from "node:fs/promises";
import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const workbook = Workbook.create();
console.log("STEP 1 workbook");

const detail = workbook.worksheets.add("核销导出明细");
const dictionary = workbook.worksheets.add("字段说明");
const activitySummary = workbook.worksheets.add("活动执行汇总");
const activityProducts = workbook.worksheets.add("活动商品明细");
const activityAttachments = workbook.worksheets.add("活动附件清单");
const activityLogs = workbook.worksheets.add("活动操作日志");
const activityDictionary = workbook.worksheets.add("活动字段说明");
console.log("STEP 2 sheets");

const blue = "#409EFF";
const darkBlue = "#1F4E78";
const paleBlue = "#EAF3FF";
const line = "#D9E2F0";
const gray = "#F5F7FA";
const text = "#303133";
const muted = "#606266";
const red = "#F56C6C";

function formatExportSheet(sheet, title, note, endCol, lastRow, widths) {
  sheet.showGridLines = false;
  sheet.getRange(`A1:${endCol}1`).merge();
  sheet.getRange("A1").values = [[title]];
  sheet.getRange(`A1:${endCol}1`).format = {
    fill: darkBlue,
    font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" },
    horizontalAlignment: "left",
    verticalAlignment: "center",
  };
  sheet.getRange(`A1:${endCol}1`).format.rowHeight = 32;
  sheet.getRange(`A2:${endCol}2`).merge();
  sheet.getRange("A2").values = [[note]];
  sheet.getRange(`A2:${endCol}2`).format = {
    fill: "#FFF7E6",
    font: { name: "Microsoft YaHei", bold: true, color: "#AD6800" },
    verticalAlignment: "center",
    wrapText: true,
  };
  sheet.getRange(`A2:${endCol}2`).format.rowHeight = 28;
  sheet.getRange(`A5:${endCol}5`).format = {
    fill: blue,
    font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" },
    horizontalAlignment: "center",
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "all", style: "thin", color: line },
  };
  sheet.getRange(`A5:${endCol}5`).format.rowHeight = 40;
  sheet.getRange(`A6:${endCol}${lastRow}`).format = {
    font: { name: "Microsoft YaHei", size: 10, color: text },
    verticalAlignment: "center",
    wrapText: true,
    borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
  };
  for (const [col, width] of Object.entries(widths)) {
    sheet.getRange(`${col}1:${col}${lastRow}`).format.columnWidth = width;
  }
  sheet.freezePanes.freezeRows(5);
  sheet.freezePanes.freezeColumns(2);
}

detail.showGridLines = false;
detail.getRange("A1:T1").merge();
detail.getRange("A1").values = [["核销规则导出模板（兼容按比例核销 / 按金额核销）"]];
detail.getRange("A1:T1").format = {
  fill: darkBlue,
  font: { bold: true, color: "#FFFFFF", size: 16 },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
detail.getRange("A1:T1").format.rowHeight = 32;

detail.getRange("A2:T2").merge();
detail.getRange("A2").values = [["兼容原则：一次核销一行；按比例模式填写“本次核销比例”，按金额模式填写“本次最高核销金额”，不适用字段留空。"]];
detail.getRange("A2:T2").format = {
  fill: "#FFF7E6",
  font: { color: "#AD6800", bold: true },
  verticalAlignment: "center",
};
detail.getRange("A2:T2").format.rowHeight = 24;

detail.getRange("A3:T3").merge();
detail.getRange("A3").values = [["下方为两种模式的示例数据。接入导出时，用实际业务数据替换示例行；比例、金额和日期均保持 Excel 原生数值类型。"]];
detail.getRange("A3:T3").format = {
  fill: "#FEF0F0",
  font: { color: red },
  verticalAlignment: "center",
};
detail.getRange("A3:T3").format.rowHeight = 24;

const headers = [[
  "规则ID", "订单号", "客户名称", "核销方式", "核销计量基准",
  "订单金额（元）", "上账金额（元）", "订单最高核销比例", "核销次数运算符", "核销次数值",
  "明细总次数", "本次序号", "本次核销比例", "本次最高核销金额（元）", "本次预计核销金额（元）",
  "累计核销比例", "累计预计核销金额（元）", "说明", "状态", "导出时间"
]];
detail.getRange("A5:T5").values = headers;

const exportTime = new Date(2026, 6, 3, 10, 30, 0);
const rows = [
  ["RULE-P-001", "ORD-20260703-001", "示例客户甲", "按比例核销", "实际订货金额", 1000, 100, 0.30, ">=", 4, 4, 1, 0.25, null, null, null, null, "第一次比例", "生效", exportTime],
  ["RULE-P-001", "ORD-20260703-001", "示例客户甲", "按比例核销", "实际订货金额", 1000, 100, 0.30, ">=", 4, 4, 2, 0.25, null, null, null, null, "第二次比例", "生效", exportTime],
  ["RULE-P-001", "ORD-20260703-001", "示例客户甲", "按比例核销", "实际订货金额", 1000, 100, 0.30, ">=", 4, 4, 3, 0.25, null, null, null, null, "第三次比例", "生效", exportTime],
  ["RULE-P-001", "ORD-20260703-001", "示例客户甲", "按比例核销", "实际订货金额", 1000, 100, 0.30, ">=", 4, 4, 4, 0.25, null, null, null, null, "第四次比例", "生效", exportTime],
  ["RULE-A-001", "ORD-20260703-002", "示例客户乙", "按金额核销", null, 1000, null, null, null, null, 5, 1, null, 20, null, null, null, "第一次金额上限", "草稿", exportTime],
  ["RULE-A-001", "ORD-20260703-002", "示例客户乙", "按金额核销", null, 1000, null, null, null, null, 5, 2, null, 30, null, null, null, "第二次金额上限", "草稿", exportTime],
  ["RULE-A-001", "ORD-20260703-002", "示例客户乙", "按金额核销", null, 1000, null, null, null, null, 5, 3, null, 25, null, null, null, "第三次金额上限", "草稿", exportTime],
  ["RULE-A-001", "ORD-20260703-002", "示例客户乙", "按金额核销", null, 1000, null, null, null, null, 5, 4, null, 15, null, null, null, "第四次金额上限", "草稿", exportTime],
  ["RULE-A-001", "ORD-20260703-002", "示例客户乙", "按金额核销", null, 1000, null, null, null, null, 5, 5, null, 10, null, null, null, "第五次金额上限", "草稿", exportTime],
];
detail.getRange("A6:T14").values = rows;
console.log("STEP 3 detail values");
detail.getRange("O6").formulas = [["=IF(D6=\"按比例核销\",G6*M6,IF(D6=\"按金额核销\",N6,\"\"))"]];
detail.getRange("O6:O14").fillDown();
detail.getRange("P6").formulas = [["=IF(D6=\"按比例核销\",SUMIFS($M$6:M6,$A$6:A6,A6),\"\")"]];
detail.getRange("P6:P14").fillDown();
detail.getRange("Q6").formulas = [["=SUMIFS($O$6:O6,$A$6:A6,A6)"]];
detail.getRange("Q6:Q14").fillDown();

const table = detail.tables.add("A5:T14", true, "WriteoffExportTable");
table.style = "TableStyleMedium2";
table.showBandedRows = true;
table.showFilterButton = true;
console.log("STEP 4 detail table");

detail.getRange("A5:T5").format = {
  fill: blue,
  font: { bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: line },
};
detail.getRange("A5:T5").format.rowHeight = 40;
console.log("STEP 4a header format");
detail.getRange("A6:T14").format = {
  font: { color: text, size: 10 },
  verticalAlignment: "center",
  borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
};
console.log("STEP 4b body format");
detail.getRange("A6:E14").format.horizontalAlignment = "left";
detail.getRange("I6:M14").format.horizontalAlignment = "center";
detail.getRange("R6:T14").format.horizontalAlignment = "left";
detail.getRange("F6:G14").format.numberFormat = "#,##0.00";
detail.getRange("H6:H14").format.numberFormat = "0.00%";
detail.getRange("J6:L14").format.numberFormat = "0";
detail.getRange("M6:M14").format.numberFormat = "0.00%";
detail.getRange("N6:O14").format.numberFormat = "#,##0.00";
detail.getRange("P6:P14").format.numberFormat = "0.00%";
detail.getRange("Q6:Q14").format.numberFormat = "#,##0.00";
detail.getRange("T6:T14").format.numberFormat = "yyyy-mm-dd hh:mm:ss";
console.log("STEP 4c number formats");
detail.getRange("M6:M14").format.fill = "#E8F5E9";
detail.getRange("N6:N14").format.fill = "#FFF3E0";
detail.getRange("O6:Q14").format.fill = gray;
console.log("STEP 4d fills");

detail.getRange("A1:T14").format.font = { name: "Microsoft YaHei", size: 10, color: text };
detail.getRange("A1:T1").format.font = { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" };
detail.getRange("A2:T3").format.font.name = "Microsoft YaHei";
console.log("STEP 4e fonts");
console.log("STEP 4f using explicit widths");
const widths = {
  A: 15, B: 20, C: 14, D: 14, E: 16, F: 15, G: 15, H: 17, I: 15, J: 13,
  K: 13, L: 12, M: 15, N: 20, O: 20, P: 15, Q: 20, R: 20, S: 10, T: 21,
};
for (const [col, width] of Object.entries(widths)) detail.getRange(`${col}1:${col}14`).format.columnWidth = width;
console.log("STEP 4g widths");
detail.freezePanes.freezeRows(5);
detail.freezePanes.freezeColumns(4);
console.log("STEP 5 detail format");

dictionary.showGridLines = false;
dictionary.getRange("A1:G1").merge();
dictionary.getRange("A1").values = [["字段说明与兼容规则"]];
dictionary.getRange("A1:G1").format = {
  fill: darkBlue,
  font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
dictionary.getRange("A1:G1").format.rowHeight = 32;

dictionary.getRange("A3:G3").values = [["字段名", "数据类型", "公共/专用", "按比例核销", "按金额核销", "填写规则", "示例"]];
const fieldRows = [
  ["规则ID", "文本", "公共", "必填", "必填", "同一核销规则的所有明细行保持一致，用于分组", "RULE-P-001"],
  ["订单号", "文本", "公共", "建议填", "建议填", "关联业务订单", "ORD-20260703-001"],
  ["客户名称", "文本", "公共", "建议填", "建议填", "客户或主体名称", "示例客户甲"],
  ["核销方式", "枚举", "公共", "按比例核销", "按金额核销", "仅允许两种枚举值", "按比例核销"],
  ["核销计量基准", "文本", "比例专用", "按业务填", "留空", "例如实际订货金额；金额模式不适用", "实际订货金额"],
  ["订单金额（元）", "金额", "公共", "建议填", "建议填", "订单原始金额，保留两位小数", "1000.00"],
  ["上账金额（元）", "金额", "比例专用", "必填", "留空", "本次规则需要按比例分摊的金额", "100.00"],
  ["订单最高核销比例", "百分比", "比例专用", "按业务填", "留空", "Excel 中保存为 0~1 的数值，例如 30%=0.3", "30.00%"],
  ["核销次数运算符", "枚举", "比例专用", "按业务填", "留空", "如 =、>=、<=；对应页面的次数条件", ">="],
  ["核销次数值", "整数", "比例专用", "按业务填", "留空", "与核销次数运算符配套", "4"],
  ["明细总次数", "整数", "公共", "必填", "必填", "该规则实际导出的明细行数", "4"],
  ["本次序号", "整数", "公共", "必填", "必填", "从 1 连续递增到明细总次数", "1"],
  ["本次核销比例", "百分比", "比例专用", "必填", "留空", "每次分摊比例；所有比例之和按业务要求校验", "25.00%"],
  ["本次最高核销金额（元）", "金额", "金额专用", "留空", "必填", "按金额模式下每次允许核销的金额上限", "20.00"],
  ["本次预计核销金额（元）", "金额", "派生", "上账金额×比例", "等于本次最高金额", "建议后端直接输出；模板内用公式演示", "25.00"],
  ["累计核销比例", "百分比", "派生", "累计本次比例", "留空", "按规则ID、序号累计", "50.00%"],
  ["累计预计核销金额（元）", "金额", "派生", "累计预计金额", "累计预计金额", "按规则ID、序号累计", "50.00"],
  ["说明", "文本", "公共", "可选", "可选", "对应每一核销次序的备注", "第一次比例"],
  ["状态", "枚举", "公共", "建议填", "建议填", "例如草稿、生效、停用", "生效"],
  ["导出时间", "日期时间", "公共", "建议填", "建议填", "真实日期时间值，显示格式 yyyy-mm-dd hh:mm:ss", "2026-07-03 10:30:00"],
];
dictionary.getRange("A4:G23").values = fieldRows;
console.log("STEP 6 dictionary values");
const dictTable = dictionary.tables.add("A3:G23", true, "WriteoffFieldDictionary");
dictTable.style = "TableStyleMedium2";
dictTable.showBandedRows = true;
dictTable.showFilterButton = true;
console.log("STEP 6a dictionary table");
dictionary.getRange("A3:G3").format = {
  fill: blue,
  font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: line },
};
console.log("STEP 6b dictionary header format");
dictionary.getRange("A4:G23").format = {
  font: { name: "Microsoft YaHei", size: 10, color: text },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
};
console.log("STEP 6c dictionary body format");
for (const [col, width] of Object.entries({A:24, B:13, C:13, D:16, E:16, F:48, G:23})) {
  dictionary.getRange(`${col}1:${col}30`).format.columnWidth = width;
}
console.log("STEP 6d dictionary widths");

dictionary.getRange("A25:G25").merge();
dictionary.getRange("A25").values = [["后端导出校验建议"]];
dictionary.getRange("A25:G25").format = {
  fill: paleBlue,
  font: { name: "Microsoft YaHei", bold: true, color: darkBlue },
  verticalAlignment: "center",
};
console.log("STEP 6e dictionary section");
dictionary.getRange("A26:G30").merge(true);
dictionary.getRange("A26:A30").values = [[
  "1. 按比例核销：本次核销比例必填，本次最高核销金额必须为空。"
], [
  "2. 按金额核销：本次最高核销金额必填，本次核销比例必须为空。"
], [
  "3. 明细总次数应等于同一规则ID的导出行数，本次序号应从1连续递增。"
], [
  "4. 金额使用数值类型并保留两位小数；比例使用0~1的数值类型，不要导出成带%号的文本。"
], [
  "5. 若只想导出原始配置，可删除三个派生列：本次预计核销金额、累计核销比例、累计预计核销金额。"
]];
dictionary.getRange("A26:G30").format = {
  fill: "#FAFAFA",
  font: { name: "Microsoft YaHei", color: muted },
  verticalAlignment: "center",
  wrapText: true,
};
dictionary.getRange("A26:G30").format.rowHeight = 24;
console.log("STEP 6f dictionary notes");
dictionary.freezePanes.freezeRows(3);
console.log("STEP 7 dictionary format");

// 活动商品明细：一件商品一行，活动ID用于关联汇总表。
activityProducts.getRange("A5:I5").values = [[
  "活动ID", "序号", "商品名称", "商品单位", "实际销量", "正常销售单价（元）",
  "促销补差单价（元）", "实际变价补差金额（元）", "POS销售额（元）"
]];
activityProducts.getRange("A6:I7").values = [[
  "ACT-20260213-001", 1, "虎皮鸡爪·脱骨装-300克-香辣（冷藏）9个月（85%-虎皮冷藏-罐）", "罐", 120, 18.88, 7.84, null, null
], [
  "ACT-20260213-001", 2, "鸡爪test111（70%-无骨-冷藏-袋）", "袋", 230, 15.66, 2.57, null, null
]];
activityProducts.getRange("H6").formulas = [["=E6*G6"]];
activityProducts.getRange("H6:H7").fillDown();
activityProducts.getRange("I6").formulas = [["=E6*F6"]];
activityProducts.getRange("I6:I7").fillDown();
const productTable = activityProducts.tables.add("A5:I7", true, "ActivityProductTable");
productTable.style = "TableStyleMedium2";
productTable.showBandedRows = true;
productTable.showFilterButton = true;
formatExportSheet(
  activityProducts,
  "特价活动商品明细导出模板",
  "兼容动态商品数量：每个商品占一行，通过活动ID关联“活动执行汇总”。实际变价补差金额和POS销售额为公式派生示例。",
  "I",
  7,
  { A: 22, B: 9, C: 48, D: 12, E: 13, F: 18, G: 19, H: 23, I: 18 },
);
activityProducts.getRange("B6:B7").format.numberFormat = "0";
activityProducts.getRange("E6:E7").format.numberFormat = "#,##0.00";
activityProducts.getRange("F6:I7").format.numberFormat = "#,##0.00";
activityProducts.getRange("H6:I7").format.fill = gray;

// 活动执行汇总：一场活动一行，页面指标完整保留。
activitySummary.getRange("A5:T5").values = [[
  "活动ID", "活动名称", "活动开始日期", "活动结束日期", "实际活动门店数", "实际活动天数",
  "实际变价补差（元）", "实际海报费（元）", "实际费用合计（元）", "我司实际承担合计（元）",
  "我司承担比例", "实际促销POS额（元）", "费销比", "扣减金额（元）", "上账金额（元）",
  "扣减原因", "备注说明", "状态", "创建人", "创建时间"
]];
activitySummary.getRange("A6:T6").values = [[
  "ACT-20260213-001", "2026年2月特价活动", new Date(2026, 1, 13), new Date(2026, 1, 13), 2, null,
  null, 1234.12, null, 2214.56, null, null, null, 700.99, null,
  "662+52", "示例数据，导出时替换为实际活动信息", "待审核", "钱佳音", new Date(2026, 2, 8, 10, 19, 17)
]];
activitySummary.getRange("F6").formulas = [["=D6-C6+1"]];
activitySummary.getRange("G6").formulas = [["=SUMIFS('活动商品明细'!$H$6:$H$205,'活动商品明细'!$A$6:$A$205,A6)"]];
activitySummary.getRange("I6").formulas = [["=G6+H6"]];
activitySummary.getRange("K6").formulas = [["=IFERROR(J6/I6,0)"]];
activitySummary.getRange("L6").formulas = [["=SUMIFS('活动商品明细'!$I$6:$I$205,'活动商品明细'!$A$6:$A$205,A6)"]];
activitySummary.getRange("M6").formulas = [["=IFERROR(J6/L6,0)"]];
activitySummary.getRange("O6").formulas = [["=J6-N6"]];
const activitySummaryTable = activitySummary.tables.add("A5:T6", true, "ActivitySummaryTable");
activitySummaryTable.style = "TableStyleMedium2";
activitySummaryTable.showBandedRows = true;
activitySummaryTable.showFilterButton = true;
formatExportSheet(
  activitySummary,
  "特价活动执行情况导出模板",
  "一场活动占一行；商品、附件和操作日志采用独立明细表，通过活动ID关联。灰色单元格为派生字段示例。",
  "T",
  6,
  { A: 22, B: 23, C: 15, D: 15, E: 16, F: 14, G: 19, H: 17, I: 19, J: 22, K: 15, L: 20, M: 13, N: 17, O: 17, P: 25, Q: 34, R: 12, S: 12, T: 21 },
);
activitySummary.getRange("C6:D6").format.numberFormat = "yyyy-mm-dd";
activitySummary.getRange("E6:F6").format.numberFormat = "0";
activitySummary.getRange("G6:J6").format.numberFormat = "#,##0.00";
activitySummary.getRange("K6").format.numberFormat = "0.00%";
activitySummary.getRange("L6").format.numberFormat = "#,##0.00";
activitySummary.getRange("M6").format.numberFormat = "0.00%";
activitySummary.getRange("N6:O6").format.numberFormat = "#,##0.00";
activitySummary.getRange("T6").format.numberFormat = "yyyy-mm-dd hh:mm:ss";
activitySummary.getRange("F6:G6").format.fill = gray;
activitySummary.getRange("I6:I6").format.fill = gray;
activitySummary.getRange("K6:M6").format.fill = gray;
activitySummary.getRange("O6:O6").format.fill = gray;

// 活动附件清单：附件本体不嵌入表格，只导出类型、文件名与可访问地址。
activityAttachments.getRange("A5:J5").values = [[
  "活动ID", "序号", "附件分类", "文件名称", "文件格式", "是否水印", "上传状态", "文件URL/存储路径", "上传时间", "备注"
]];
activityAttachments.getRange("A6:J10").values = [[
  "ACT-20260213-001", 1, "销售数据结案表", "订单列表(12).xls", "xls", "否", "已上传", "/files/activity/ACT-20260213-001/订单列表(12).xls", new Date(2026, 2, 8, 10, 10, 0), "页面必传文件"
], [
  "ACT-20260213-001", 2, "促销变价补差系统扣款凭证", "扣款凭证.jpg", "jpg", "是", "已上传", "/files/activity/ACT-20260213-001/扣款凭证.jpg", new Date(2026, 2, 8, 10, 12, 0), "图片需带水印"
], [
  "ACT-20260213-001", 3, "价签卡照片", "价签卡照片.jpg", "jpg", "是", "已上传", "/files/activity/ACT-20260213-001/价签卡照片.jpg", new Date(2026, 2, 8, 10, 13, 0), "图片需带水印"
], [
  "ACT-20260213-001", 4, "DM海报原件或复印件", "DM海报.jpg", "jpg", "是", "已上传", "/files/activity/ACT-20260213-001/DM海报.jpg", new Date(2026, 2, 8, 10, 14, 0), "存在海报费用时必传"
], [
  "ACT-20260213-001", 5, "档期陈列照片", null, null, "是", "未上传", null, null, "无文件时保留分类并标记未上传"
]];
const attachmentTable = activityAttachments.tables.add("A5:J10", true, "ActivityAttachmentTable");
attachmentTable.style = "TableStyleMedium2";
attachmentTable.showBandedRows = true;
attachmentTable.showFilterButton = true;
formatExportSheet(
  activityAttachments,
  "特价活动附件清单导出模板",
  "建议导出附件元数据和系统访问地址，不直接把原图嵌入Excel；同一分类有多份文件时，每份文件占一行。",
  "J",
  10,
  { A: 22, B: 9, C: 30, D: 26, E: 12, F: 12, G: 14, H: 54, I: 21, J: 30 },
);
activityAttachments.getRange("B6:B10").format.numberFormat = "0";
activityAttachments.getRange("I6:I10").format.numberFormat = "yyyy-mm-dd hh:mm:ss";

// 操作日志：一个动作一行，便于审计和追踪。
activityLogs.getRange("A5:G5").values = [[
  "活动ID", "日志序号", "操作人", "操作类型", "操作结果", "操作时间", "备注"
]];
activityLogs.getRange("A6:G6").values = [[
  "ACT-20260213-001", 1, "钱佳音", "创建", "成功", new Date(2026, 2, 8, 10, 19, 17), "页面操作日志示例"
]];
const logTable = activityLogs.tables.add("A5:G6", true, "ActivityLogTable");
logTable.style = "TableStyleMedium2";
logTable.showBandedRows = true;
logTable.showFilterButton = true;
formatExportSheet(
  activityLogs,
  "特价活动操作日志导出模板",
  "每次创建、编辑、提交、审核、驳回等操作单独导出一行，通过活动ID关联活动。",
  "G",
  6,
  { A: 22, B: 12, C: 14, D: 15, E: 14, F: 21, G: 36 },
);
activityLogs.getRange("B6").format.numberFormat = "0";
activityLogs.getRange("F6").format.numberFormat = "yyyy-mm-dd hh:mm:ss";

// 活动相关字段说明。
activityDictionary.showGridLines = false;
activityDictionary.getRange("A1:G1").merge();
activityDictionary.getRange("A1").values = [["特价活动导出字段说明"]];
activityDictionary.getRange("A1:G1").format = {
  fill: darkBlue,
  font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
activityDictionary.getRange("A1:G1").format.rowHeight = 32;
activityDictionary.getRange("A3:G3").values = [["所属Sheet", "字段名", "数据类型", "必填", "说明", "取值/计算规则", "示例"]];
const activityFieldRows = [
  ["活动执行汇总", "活动ID", "文本", "是", "跨表关联主键", "同一活动在所有Sheet保持一致", "ACT-20260213-001"],
  ["活动执行汇总", "活动名称", "文本", "建议", "活动标题", "按业务名称导出", "2026年2月特价活动"],
  ["活动执行汇总", "活动开始日期", "日期", "是", "特价活动开始日期", "Excel真实日期值", "2026-02-13"],
  ["活动执行汇总", "活动结束日期", "日期", "是", "特价活动结束日期", "不得早于开始日期", "2026-02-13"],
  ["活动执行汇总", "实际活动门店数", "整数", "是", "参与活动的实际门店数量", "非负整数", "2"],
  ["活动执行汇总", "实际活动天数", "整数", "派生", "包含首尾日期的活动天数", "结束日期-开始日期+1", "1"],
  ["活动执行汇总", "实际变价补差（元）", "金额", "派生", "全部商品实际变价补差金额合计", "按活动ID汇总商品明细", "1531.90"],
  ["活动执行汇总", "实际海报费（元）", "金额", "按业务", "实际发生的海报费用", "有费用时需上传DM海报附件", "1234.12"],
  ["活动执行汇总", "实际费用合计（元）", "金额", "派生", "变价补差与海报费合计", "实际变价补差+实际海报费", "2766.02"],
  ["活动执行汇总", "我司实际承担合计（元）", "金额", "是", "我司实际承担金额", "人工确认或业务计算结果", "2214.56"],
  ["活动执行汇总", "我司承担比例", "百分比", "派生", "我司承担金额占实际费用合计比例", "我司承担合计/实际费用合计", "80.06%"],
  ["活动执行汇总", "实际促销POS额（元）", "金额", "派生", "全部商品POS销售额合计", "按活动ID汇总商品明细", "5867.40"],
  ["活动执行汇总", "费销比", "百分比", "派生", "我司承担金额占促销POS额比例", "我司承担合计/实际促销POS额", "37.74%"],
  ["活动执行汇总", "扣减金额（元）", "金额", "按业务", "审核或结算时扣减金额", "非负金额", "700.99"],
  ["活动执行汇总", "上账金额（元）", "金额", "派生", "最终可上账金额", "我司承担合计-扣减金额", "1513.57"],
  ["活动执行汇总", "扣减原因", "文本", "扣减时是", "扣减金额的原因说明", "扣减金额大于0时必填", "662+52"],
  ["活动执行汇总", "备注说明", "文本", "否", "活动执行补充说明", "可为空", "-"],
  ["活动执行汇总", "状态", "枚举", "建议", "活动单据状态", "草稿/待审核/已审核/已驳回", "待审核"],
  ["活动执行汇总", "创建人", "文本", "建议", "单据创建人", "来自操作日志或单据元数据", "钱佳音"],
  ["活动执行汇总", "创建时间", "日期时间", "建议", "单据创建时间", "Excel真实日期时间值", "2026-03-08 10:19:17"],
  ["活动商品明细", "商品名称", "文本", "是", "参与活动商品名称", "每件商品一行", "虎皮鸡爪…"],
  ["活动商品明细", "商品单位", "文本", "是", "商品销售单位", "例如罐、袋、盒", "罐"],
  ["活动商品明细", "实际销量", "数值", "是", "活动期间实际销量", "非负数", "120"],
  ["活动商品明细", "正常销售单价（元）", "金额", "是", "正常销售单价", "保留两位小数", "18.88"],
  ["活动商品明细", "促销补差单价（元）", "金额", "是", "每件商品促销补差单价", "保留两位或四位小数", "7.84"],
  ["活动商品明细", "实际变价补差金额（元）", "金额", "派生", "单商品补差金额", "实际销量×促销补差单价", "940.80"],
  ["活动商品明细", "POS销售额（元）", "金额", "派生", "单商品POS销售额", "实际销量×正常销售单价", "2265.60"],
  ["活动附件清单", "附件分类", "枚举", "是", "页面中的附件类别", "销售数据结案表/扣款凭证/价签卡/DM海报/陈列照片", "销售数据结案表"],
  ["活动附件清单", "文件名称", "文本", "上传时是", "上传文件原始名称", "未上传时可为空", "订单列表(12).xls"],
  ["活动附件清单", "文件格式", "文本", "上传时是", "文件扩展名", "xls/xlsx/pdf/doc/docx/jpg/png等", "xls"],
  ["活动附件清单", "是否水印", "布尔/枚举", "建议", "图片类附件是否包含水印", "是/否", "是"],
  ["活动附件清单", "上传状态", "枚举", "是", "附件当前状态", "已上传/未上传/已删除", "已上传"],
  ["活动附件清单", "文件URL/存储路径", "文本", "上传时是", "供导出用户访问附件的地址", "建议短时签名URL或受控系统路径", "/files/activity/..."],
  ["活动操作日志", "操作人", "文本", "是", "执行操作的用户", "记录显示名称或账号", "钱佳音"],
  ["活动操作日志", "操作类型", "枚举", "是", "操作动作", "创建/编辑/提交/审核/驳回/取消", "创建"],
  ["活动操作日志", "操作结果", "枚举", "建议", "操作是否成功", "成功/失败", "成功"],
  ["活动操作日志", "操作时间", "日期时间", "是", "操作发生时间", "Excel真实日期时间值", "2026-03-08 10:19:17"],
];
const activityFieldEndRow = 3 + activityFieldRows.length;
activityDictionary.getRange(`A4:G${activityFieldEndRow}`).values = activityFieldRows;
const activityDictionaryTable = activityDictionary.tables.add(`A3:G${activityFieldEndRow}`, true, "ActivityFieldDictionary");
activityDictionaryTable.style = "TableStyleMedium2";
activityDictionaryTable.showBandedRows = true;
activityDictionaryTable.showFilterButton = true;
activityDictionary.getRange("A3:G3").format = {
  fill: blue,
  font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: line },
};
activityDictionary.getRange(`A4:G${activityFieldEndRow}`).format = {
  font: { name: "Microsoft YaHei", size: 10, color: text },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
};
for (const [col, width] of Object.entries({ A: 21, B: 29, C: 14, D: 14, E: 33, F: 47, G: 25 })) {
  activityDictionary.getRange(`${col}1:${col}${activityFieldEndRow}`).format.columnWidth = width;
}
activityDictionary.freezePanes.freezeRows(3);
console.log("STEP 9 activity sheets created");

await fs.mkdir(outputDir, { recursive: true });

const outputPath = path.join(outputDir, "促销活动执行及核销导出模板.xlsx");
const initialOutput = await SpreadsheetFile.exportXlsx(workbook);
await initialOutput.save("促销活动执行及核销导出模板.xlsx");
console.log("STEP 7a initial export");

const qaInput = await FileBlob.load(outputPath);
const qaWorkbook = await SpreadsheetFile.importXlsx(qaInput);
console.log("STEP 7b QA import");

console.log("STEP 8 render skipped: bundled renderer crashes on a minimal workbook in this environment");

const inspectDetail = await qaWorkbook.inspect({
  kind: "table",
  range: "核销导出明细!A5:T14",
  include: "values,formulas",
  tableMaxRows: 12,
  tableMaxCols: 20,
  maxChars: 10000,
});
console.log(inspectDetail.ndjson);

const inspectActivitySummary = await qaWorkbook.inspect({
  kind: "table",
  range: "活动执行汇总!A5:T6",
  include: "values,formulas",
  tableMaxRows: 4,
  tableMaxCols: 20,
  maxChars: 7000,
});
console.log(inspectActivitySummary.ndjson);

const inspectActivityDetails = await qaWorkbook.inspect({
  kind: "table",
  range: "活动商品明细!A5:I7",
  include: "values,formulas",
  tableMaxRows: 5,
  tableMaxCols: 10,
  maxChars: 4000,
});
console.log(inspectActivityDetails.ndjson);

const inspectActivityAttachments = await qaWorkbook.inspect({
  kind: "table",
  range: "活动附件清单!A5:J10",
  include: "values,formulas",
  tableMaxRows: 7,
  tableMaxCols: 10,
  maxChars: 5000,
});
console.log(inspectActivityAttachments.ndjson);

const errors = await qaWorkbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "final formula error scan",
});
console.log(errors.ndjson);

console.log(`OUTPUT=${outputPath}`);
