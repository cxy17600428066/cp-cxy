import path from "node:path";
import { FileBlob, SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = path.dirname(new URL(import.meta.url).pathname.replace(/^\/(.:)/, "$1"));
const workbook = Workbook.create();
const data = workbook.worksheets.add("单行导出数据");
const guide = workbook.worksheets.add("字段说明");

const blue = "#409EFF";
const darkBlue = "#1F4E78";
const paleBlue = "#EAF3FF";
const gray = "#F5F7FA";
const line = "#D9E2F0";
const text = "#303133";

data.showGridLines = false;
data.getRange("A1:AA1").merge();
data.getRange("A1").values = [["特价活动执行情况单行导出模板"]];
data.getRange("A1:AA1").format = {
  fill: darkBlue,
  font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" },
  horizontalAlignment: "left",
  verticalAlignment: "center",
};
data.getRange("A1:AA1").format.rowHeight = 32;

data.getRange("A2:AA2").merge();
data.getRange("A2").values = [[
  "一场活动只导出一行。多件商品放入“商品明细”单元格并换行显示；同类多附件用分号分隔。"
]];
data.getRange("A2:AA2").format = {
  fill: "#FFF7E6",
  font: { name: "Microsoft YaHei", bold: true, color: "#AD6800" },
  verticalAlignment: "center",
  wrapText: true,
};
data.getRange("A2:AA2").format.rowHeight = 28;

data.getRange("A5:AA5").values = [[
  "活动记录ID", "特价活动开始日期", "特价活动结束日期", "实际活动门店数", "实际活动天数",
  "实际变价补差（元）", "实际海报费（元）", "实际费用合计（元）", "我司实际承担部分合计（元）",
  "我司承担比例", "实际促销POS额（元）", "费销比", "销售数据结案表", "备注说明",
  "商品数量", "商品明细", "扣款凭证附件", "价签卡照片附件", "DM海报附件", "档期陈列照片附件",
  "扣减金额（元）", "上账金额（元）", "扣减原因", "单据状态", "创建人", "创建时间", "操作日志"
]];

const productDetail = [
  "1｜虎皮鸡爪·脱骨装-300克-香辣（冷藏）9个月（85%-虎皮冷藏-罐）｜单位：罐｜销量：120｜正常单价：18.88｜补差单价：7.84｜补差金额：940.80｜POS销售额：2265.60",
  "2｜鸡爪test111（70%-无骨-冷藏-袋）｜单位：袋｜销量：230｜正常单价：15.66｜补差单价：2.57｜补差金额：591.10｜POS销售额：3601.80",
].join("\n");

data.getRange("A6:AA6").values = [[
  "ACT-20260213-001", new Date(2026, 1, 13), new Date(2026, 1, 13), 2, null,
  1531.90, 1234.12, null, 2214.56, null, 5867.40, null, "订单列表(12).xls", null,
  2, productDetail, "扣款凭证.jpg", "价签卡照片.jpg", "DM海报.jpg", null,
  700.99, null, "662+52", "待审核", "钱佳音", new Date(2026, 2, 8, 10, 19, 17),
  "钱佳音｜创建｜2026-03-08 10:19:17"
]];

data.getRange("E6").formulas = [["=C6-B6+1"]];
data.getRange("H6").formulas = [["=F6+G6"]];
data.getRange("J6").formulas = [["=IFERROR(I6/H6,0)"]];
data.getRange("L6").formulas = [["=IFERROR(I6/K6,0)"]];
data.getRange("V6").formulas = [["=I6-U6"]];

const table = data.tables.add("A5:AA6", true, "ActivityOneRowExportTable");
table.style = "TableStyleMedium2";
table.showBandedRows = true;
table.showFilterButton = true;

data.getRange("A5:AA5").format = {
  fill: blue,
  font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: line },
};
data.getRange("A5:AA5").format.rowHeight = 44;
data.getRange("A6:AA6").format = {
  font: { name: "Microsoft YaHei", size: 10, color: text },
  verticalAlignment: "top",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
};
data.getRange("A6:AA6").format.rowHeight = 86;

data.getRange("B6:C6").format.numberFormat = "yyyy-mm-dd";
data.getRange("D6:E6").format.numberFormat = "0";
data.getRange("F6:I6").format.numberFormat = "#,##0.00";
data.getRange("J6").format.numberFormat = "0.00%";
data.getRange("K6").format.numberFormat = "#,##0.00";
data.getRange("L6").format.numberFormat = "0.00%";
data.getRange("O6").format.numberFormat = "0";
data.getRange("U6:V6").format.numberFormat = "#,##0.00";
data.getRange("Z6").format.numberFormat = "yyyy-mm-dd hh:mm:ss";
data.getRange("E6:E6").format.fill = gray;
data.getRange("H6:H6").format.fill = gray;
data.getRange("J6:J6").format.fill = gray;
data.getRange("L6:L6").format.fill = gray;
data.getRange("V6:V6").format.fill = gray;

const widths = {
  A: 22, B: 18, C: 18, D: 17, E: 15, F: 19, G: 17, H: 19, I: 25,
  J: 15, K: 20, L: 13, M: 25, N: 30, O: 12, P: 90, Q: 26, R: 26,
  S: 26, T: 28, U: 17, V: 17, W: 25, X: 13, Y: 13, Z: 21, AA: 38,
};
for (const [col, width] of Object.entries(widths)) {
  data.getRange(`${col}1:${col}6`).format.columnWidth = width;
}
data.freezePanes.freezeRows(5);
data.freezePanes.freezeColumns(2);

guide.showGridLines = false;
guide.getRange("A1:F1").merge();
guide.getRange("A1").values = [["单行导出字段说明"]];
guide.getRange("A1:F1").format = {
  fill: darkBlue,
  font: { name: "Microsoft YaHei", size: 16, bold: true, color: "#FFFFFF" },
  verticalAlignment: "center",
};
guide.getRange("A1:F1").format.rowHeight = 32;
guide.getRange("A3:F3").values = [["字段名", "数据类型", "是否必填", "说明", "导出规则", "示例"]];
const guideRows = [
  ["活动记录ID", "文本", "是", "一场活动的唯一标识", "每个活动仅导出一行", "ACT-20260213-001"],
  ["特价活动开始/结束日期", "日期", "是", "活动时间范围", "拆为开始、结束两列", "2026-02-13"],
  ["实际活动天数", "整数", "派生", "包含首尾日期", "结束日期-开始日期+1", "1"],
  ["实际费用合计（元）", "金额", "派生", "变价补差和海报费合计", "实际变价补差+实际海报费", "2766.02"],
  ["我司承担比例", "百分比", "派生", "承担金额占费用合计比例", "我司承担合计/费用合计", "80.06%"],
  ["费销比", "百分比", "派生", "承担金额占POS销售额比例", "我司承担合计/实际促销POS额", "37.74%"],
  ["商品数量", "整数", "是", "该活动包含的商品数", "与商品明细中的条目数一致", "2"],
  ["商品明细", "多行文本", "是", "所有商品集中在一个单元格", "一件商品一行；字段间用｜分隔", "1｜商品A｜单位：罐｜销量：120…"],
  ["四类图片附件", "文本", "按页面", "各附件类别的文件名或URL", "同类多文件用分号分隔", "图片1.jpg;图片2.jpg"],
  ["上账金额（元）", "金额", "派生", "最终上账金额", "我司承担合计-扣减金额", "1513.57"],
  ["操作日志", "多行文本", "建议", "全部操作记录集中展示", "一条日志一行；字段间用｜分隔", "钱佳音｜创建｜2026-03-08 10:19:17"],
];
guide.getRange("A4:F14").values = guideRows;
const guideTable = guide.tables.add("A3:F14", true, "OneRowFieldGuideTable");
guideTable.style = "TableStyleMedium2";
guideTable.showBandedRows = true;
guideTable.showFilterButton = true;
guide.getRange("A3:F3").format = {
  fill: blue,
  font: { name: "Microsoft YaHei", bold: true, color: "#FFFFFF" },
  horizontalAlignment: "center",
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "all", style: "thin", color: line },
};
guide.getRange("A4:F14").format = {
  font: { name: "Microsoft YaHei", size: 10, color: text },
  verticalAlignment: "center",
  wrapText: true,
  borders: { preset: "inside", style: "thin", color: "#E8EDF4" },
};
for (const [col, width] of Object.entries({ A: 30, B: 15, C: 14, D: 38, E: 48, F: 36 })) {
  guide.getRange(`${col}1:${col}16`).format.columnWidth = width;
}
guide.getRange("A16:F16").merge();
guide.getRange("A16").values = [["商品、附件和日志都使用可换行文本或分号分隔，因此无论数量多少，每场活动始终只占一行。"]];
guide.getRange("A16:F16").format = {
  fill: paleBlue,
  font: { name: "Microsoft YaHei", bold: true, color: darkBlue },
  wrapText: true,
  verticalAlignment: "center",
};
guide.freezePanes.freezeRows(3);

const outputName = "特价活动执行情况单行导出模板.xlsx";
const outputPath = path.join(outputDir, outputName);
const xlsx = await SpreadsheetFile.exportXlsx(workbook);
await xlsx.save(outputName);

const qaInput = await FileBlob.load(outputPath);
const qaWorkbook = await SpreadsheetFile.importXlsx(qaInput);
const inspectData = await qaWorkbook.inspect({
  kind: "table",
  range: "单行导出数据!A5:AA6",
  include: "values,formulas",
  tableMaxRows: 4,
  tableMaxCols: 27,
  maxChars: 12000,
});
console.log(inspectData.ndjson);

const errors = await qaWorkbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 100 },
  summary: "formula error scan",
});
console.log(errors.ndjson);
console.log(`OUTPUT=${outputPath}`);
