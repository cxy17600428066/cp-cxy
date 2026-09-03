import fs from "node:fs/promises";
import path from "node:path";
import { SpreadsheetFile, Workbook } from "@oai/artifact-tool";

const outputDir = "E:/cxy/07-数据与指标/outputs";
const outputPath = path.join(outputDir, "KA销售新增统计字段模板.xlsx");

const workbook = Workbook.create();

const sheets = {
  dashboard: workbook.worksheets.add("总览仪表盘"),
  sales: workbook.worksheets.add("销售明细"),
  inventory: workbook.worksheets.add("库存明细"),
  shipment: workbook.worksheets.add("出货退货"),
  store: workbook.worksheets.add("门店维表"),
  sku: workbook.worksheets.add("商品维表"),
  metrics: workbook.worksheets.add("指标口径"),
};

const colors = {
  ink: "#17202A",
  muted: "#5B6675",
  line: "#D8DEE7",
  bg: "#F6F8FB",
  panel: "#FFFFFF",
  blue: "#1D4ED8",
  cyan: "#0891B2",
  green: "#15803D",
  amber: "#B45309",
  red: "#B91C1C",
  violet: "#6D28D9",
};

function setWidths(sheet, widths) {
  widths.forEach((width, i) => {
    sheet.getCell(0, i).format.columnWidth = width;
  });
}

function styleHeader(range) {
  range.format.fill = { color: "#EAF0F8" };
  range.format.font = { bold: true, color: colors.ink };
  range.format.wrapText = true;
  range.format.horizontalAlignment = "center";
  range.format.verticalAlignment = "center";
}

function styleTitle(range, color = colors.ink) {
  range.format.font = { bold: true, size: 16, color };
}

function styleSection(range) {
  range.format.fill = { color: "#F0F4F8" };
  range.format.font = { bold: true, color: colors.ink };
}

function addTable(sheet, name, startCell, headers, rows) {
  const start = sheet.getRange(startCell);
  const rowCount = rows.length + 1;
  const colCount = headers.length;
  const range = start.resize(rowCount, colCount);
  range.values = [headers, ...rows];
  styleHeader(start.resize(1, colCount));
  range.format.borders = {
    insideHorizontal: { style: "continuous", color: colors.line },
    insideVertical: { style: "continuous", color: colors.line },
    edgeTop: { style: "continuous", color: colors.line },
    edgeBottom: { style: "continuous", color: colors.line },
    edgeLeft: { style: "continuous", color: colors.line },
    edgeRight: { style: "continuous", color: colors.line },
  };
  try {
    sheet.tables.add(range, { name, hasHeaders: true });
  } catch {
    // Tables are a formatting aid; keep the workbook usable if this API differs by runtime.
  }
  return range;
}

function addKpi(sheet, rangeAddress, title, formula, accent, numberFormat) {
  const range = sheet.getRange(rangeAddress);
  range.merge();
  range.format.fill = { color: colors.panel };
  range.format.borders = {
    edgeTop: { style: "continuous", color: accent },
    edgeBottom: { style: "continuous", color: colors.line },
    edgeLeft: { style: "continuous", color: colors.line },
    edgeRight: { style: "continuous", color: colors.line },
  };
  const topLeft = range.getCell(0, 0);
  topLeft.values = [[title]];
  topLeft.format.font = { bold: true, color: colors.muted, size: 10 };
  const valueCell = range.getCell(1, 0);
  valueCell.formulas = [[formula]];
  valueCell.format.font = { bold: true, color: accent, size: 18 };
  valueCell.setNumberFormat(numberFormat);
}

function fillFormulas(sheet, rangeAddress, formula) {
  const range = sheet.getRange(rangeAddress);
  range.formulas = Array.from({ length: range.rowCount }, () => [formula]);
}

const date = (s) => new Date(`${s}T00:00:00`);

const salesHeaders = [
  "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "是否DC", "商品编码", "商品条码", "商品名称",
  "规格", "温层", "渠道", "销售数量", "销售金额", "含税口径", "动销标记", "备注",
];

const salesRows = [
  [date("2026-05-24"), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "697000000001", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "线下", 210, 4675, "含税", "Y", ""],
  [date("2026-05-24"), "大润发", "华东", "江苏", "1002", "杨浦店", "否", "4354169", "697000000002", "脱骨侠无骨鸡爪(泡椒味)", "158g/袋", "常温", "京东到家", 86, 1978, "含税", "Y", ""],
  [date("2026-05-25"), "大润发", "华南", "广东", "5001", "广州天河店", "否", "4502138", "697000000003", "脱骨侠虎皮凤爪(白松露味)", "220g/盒", "冷藏", "美团", 134, 3350, "含税", "Y", ""],
  [date("2026-05-25"), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "否", "25354863", "0697765695110", "常温脱骨侠无骨鸡爪柠檬", "158g/袋", "常温", "POS", 190, 3800, "未税", "Y", ""],
  [date("2026-05-26"), "华润", "华北", "北京", "204392", "皇姑店", "否", "5150673", "6973883075622", "脱骨侠无骨鸡爪(柠檬味)158g", "158g/袋", "常温", "线下", 150, 2895, "含税", "Y", ""],
  [date("2026-05-26"), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "6973883075387", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "POS", 980, 12740, "含税", "Y", ""],
  [date("2026-05-27"), "永辉", "华东", "浙江", "9626", "滨江区龙湖天街店", "否", "1830795", "6973883073277", "脱骨侠蒜香酸甜辣无骨鸡爪780g", "780g/罐", "冷藏", "POS", 52, 2225, "含税", "Y", ""],
  [date("2026-05-27"), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "6977656954114", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "天虹到家", 72, 2729, "含税", "Y", ""],
  [date("2026-05-28"), "比优特", "东北", "黑龙江", "2201", "麓林山店", "否", "1156752", "6973883073277", "脱骨侠无骨鸡爪蒜香酸甜辣780g", "780g/罐", "冷藏", "POS", 18, 629, "含税", "Y", ""],
  [date("2026-05-28"), "家得福", "华东", "江苏", "1001", "家得福海棠店", "否", "10081319", "6973883073284", "脱骨侠酸辣柠檬无骨鸡爪780g", "780g/罐", "冷藏", "POS", 35, 1033, "含税", "Y", ""],
  [date("2026-05-29"), "大润发", "华北", "天津", "6001", "天津南开店", "否", "4354172", "697000000004", "脱骨侠盐焗鸡爪", "138g/袋", "常温", "线下", 98, 1421, "含税", "Y", ""],
  [date("2026-05-29"), "沃尔玛", "华东", "浙江", "2470", "沃尔玛赤峰玉龙大街店", "否", "25325573", "0697388307468", "冷藏蒜香凤爪", "230g/盒", "冷藏", "POS", 79, 2500, "未税", "Y", ""],
  [date("2026-05-30"), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "697000000001", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "线下", 235, 5235, "含税", "Y", ""],
  [date("2026-05-30"), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "6973883075387", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "POS", 1100, 14300, "含税", "Y", ""],
  [date("2026-05-30"), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "6977656954114", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "京东到家", 88, 3335, "含税", "Y", ""],
];

const inventoryHeaders = [
  "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "是否DC", "商品编码", "商品名称",
  "门店库存", "DC库存", "在途/待收", "近7日平均销量", "周转天数", "是否超60天", "备注",
];

const inventoryRows = [
  [date("2026-05-30"), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "脱骨侠无骨鸡爪(柠檬味)", 15089, 1950, 725, 620, "", "", ""],
  [date("2026-05-30"), "大润发", "华南", "广东", "5001", "广州天河店", "否", "4502138", "脱骨侠虎皮凤爪(白松露味)", 13619, 1250, 550, 210, "", "", ""],
  [date("2026-05-30"), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "否", "25354863", "常温脱骨侠无骨鸡爪柠檬", 30943, 0, 840, 1408, "", "", ""],
  [date("2026-05-30"), "华润", "华北", "北京", "204392", "皇姑店", "否", "5150673", "脱骨侠无骨鸡爪(柠檬味)158g", 5233, 0, 0, 245, "", "", ""],
  [date("2026-05-30"), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "盒马工坊 蒜香无骨鸡爪 230g", 94942, 0, 21250, 20146, "", "", ""],
  [date("2026-05-30"), "永辉", "华东", "浙江", "9626", "滨江区龙湖天街店", "否", "1830795", "脱骨侠蒜香酸甜辣无骨鸡爪780g", 74, 0, 0, 7, "", "", ""],
  [date("2026-05-30"), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "脱骨侠双椒无骨鸭掌", 5444, 0, 0, 129, "", "", ""],
  [date("2026-05-30"), "比优特", "东北", "黑龙江", "2201", "麓林山店", "否", "1156752", "脱骨侠无骨鸡爪蒜香酸甜辣780g", 15925, 0, 0, 31, "", "", ""],
  [date("2026-05-30"), "家得福", "华东", "江苏", "1001", "家得福海棠店", "否", "10081319", "脱骨侠酸辣柠檬无骨鸡爪780g", 315, 0, 0, 6, "", "", ""],
];

const shipmentHeaders = [
  "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "商品编码", "商品名称",
  "出货数量", "出货金额", "退货数量", "退货金额", "出货字段来源", "退货字段来源", "备注",
];

const shipmentRows = [
  [date("2026-05-30"), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "431448153", "盒马工坊 蒜香无骨鸡爪 230g", 24043, "", 120, "", "当天入库采购件数数量", "退货数量", ""],
  [date("2026-05-30"), "家得福", "华东", "江苏", "1001", "家得福海棠店", "10081319", "脱骨侠酸辣柠檬无骨鸡爪780g", 315, 9050, 0, 0, "进货数量/含税进货金额", "含税退补金额", ""],
  [date("2026-05-30"), "大润发", "华东", "上海", "1001", "闸北店", "4354168", "脱骨侠无骨鸡爪(柠檬味)", 725, "", "", "", "待收", "源表无退货发生", "待收不等于真实出货，需业务确认"],
  [date("2026-05-30"), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "25354863", "常温脱骨侠无骨鸡爪柠檬", "", "", "", "", "缺进货源", "缺退货源", "需补退货/进货明细"],
];

const storeHeaders = ["KA系统", "门店编码", "门店名称", "是否DC", "大区", "省份", "城市", "内外区", "门店状态"];
const storeRows = [
  ["大润发", "1001", "闸北店", "否", "华东", "上海", "上海", "内区", "开业"],
  ["大润发", "1002", "杨浦店", "否", "华东", "上海", "上海", "内区", "开业"],
  ["大润发", "5001", "广州天河店", "否", "华南", "广东", "广州", "外区", "开业"],
  ["沃尔玛", "101", "沃尔玛广州天河店", "否", "华南", "广东", "广州", "外区", "开业"],
  ["华润", "204392", "皇姑店", "否", "华北", "北京", "北京", "外区", "开业"],
  ["盒马", "HM001", "武汉珞狮路店", "否", "华中", "湖北", "武汉", "外区", "开业"],
  ["永辉", "9626", "滨江区龙湖天街店", "否", "华东", "浙江", "杭州", "内区", "开业"],
  ["天虹", "104", "深圳创业天虹", "否", "华南", "广东", "深圳", "外区", "开业"],
  ["比优特", "2201", "麓林山店", "否", "东北", "黑龙江", "鹤岗", "外区", "开业"],
  ["家得福", "1001", "家得福海棠店", "否", "华东", "江苏", "连云港", "内区", "开业"],
];

const skuHeaders = ["KA系统", "商品编码", "商品条码", "统一商品名", "系统商品名", "规格", "温层", "口味", "产品线", "是否核心品"];
const skuRows = [
  ["大润发", "4354168", "697000000001", "无骨鸡爪 柠檬味 158g", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "柠檬", "无骨鸡爪", "Y"],
  ["大润发", "4502138", "697000000003", "虎皮凤爪 白松露味", "脱骨侠虎皮凤爪(白松露味)", "220g/盒", "冷藏", "白松露", "虎皮凤爪", "Y"],
  ["沃尔玛", "25354863", "0697765695110", "无骨鸡爪 柠檬味 158g", "常温脱骨侠无骨鸡爪柠檬", "158g/袋", "常温", "柠檬", "无骨鸡爪", "Y"],
  ["盒马", "431448153", "6973883075387", "蒜香无骨鸡爪 230g", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "蒜香", "无骨鸡爪", "Y"],
  ["天虹", "v000110869", "6977656954114", "双椒无骨鸭掌 320g", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "双椒", "鸭掌", "Y"],
];

const metricsRows = [
  ["指标", "计算口径", "建议字段/公式", "注意事项"],
  ["销售数量", "按日期、系统、门店、商品、渠道汇总 POS 销售数量", "SUMIFS(销售明细[销售数量], ...)", "不同系统最小单位需统一"],
  ["销售金额", "按同维度汇总 POS 销售金额，优先含税口径", "SUMIFS(销售明细[销售金额], ...)", "沃尔玛部分为未税，需保留标签或换算"],
  ["出货数量", "优先取进货/入库/日收/月收/待收等字段", "出货退货[出货数量]", "待收不一定等于真实出货"],
  ["近7日平均销量", "建议 D-7 至 D-1 销售数量合计 / 7", "SUMIFS(...)/7", "不建议包含数据日"],
  ["门店库存周转天数", "门店库存 / 近7日平均销量", "'=IFERROR(门店库存/近7日平均销量,\"\")", "均销为0且有库存时标记无动销库存"],
  ["PSD", "销售数量 / 有库存门店数", "销售数量/有库存门店数", "需确认分母沿用现有日报口径"],
  ["超60天门店数", "周转天数>60 且门店库存>0 的门店数", "COUNTIFS(...)\n", "排除 DC、闭店、小店需依赖门店维表"],
  ["退货率", "当月退货数量 / 当月进货数量", "退货数量/进货数量", "沃尔玛当前缺退货/进货源"],
];

Object.values(sheets).forEach((sheet) => {
  sheet.showGridLines = false;
});

setWidths(sheets.sales, [12, 12, 10, 10, 12, 24, 9, 14, 16, 32, 12, 10, 12, 12, 14, 10, 10, 20]);
setWidths(sheets.inventory, [12, 12, 10, 10, 12, 24, 9, 14, 32, 12, 12, 12, 14, 12, 12, 20]);
setWidths(sheets.shipment, [12, 12, 10, 10, 12, 24, 14, 32, 12, 14, 12, 14, 18, 18, 28]);
setWidths(sheets.store, [12, 12, 24, 9, 10, 10, 12, 10, 10]);
setWidths(sheets.sku, [12, 14, 16, 26, 32, 12, 10, 10, 14, 10]);
setWidths(sheets.metrics, [18, 42, 30, 40]);

addTable(sheets.sales, "tblSales", "A1", salesHeaders, salesRows);
addTable(sheets.inventory, "tblInventory", "A1", inventoryHeaders, inventoryRows);
addTable(sheets.shipment, "tblShipment", "A1", shipmentHeaders, shipmentRows);
addTable(sheets.store, "tblStore", "A1", storeHeaders, storeRows);
addTable(sheets.sku, "tblSku", "A1", skuHeaders, skuRows);
sheets.metrics.getRange("A1:D1").values = [metricsRows[0]];
styleHeader(sheets.metrics.getRange("A1:D1"));
sheets.metrics.getRange("A2:D9").values = metricsRows.slice(1);
sheets.metrics.getRange("A1:D9").format.borders = {
  insideHorizontal: { style: "continuous", color: colors.line },
  insideVertical: { style: "continuous", color: colors.line },
  edgeTop: { style: "continuous", color: colors.line },
  edgeBottom: { style: "continuous", color: colors.line },
  edgeLeft: { style: "continuous", color: colors.line },
  edgeRight: { style: "continuous", color: colors.line },
};
sheets.metrics.getRange("A2:D9").format.wrapText = true;

sheets.sales.freezePanes.freezeRows(1);
sheets.inventory.freezePanes.freezeRows(1);
sheets.shipment.freezePanes.freezeRows(1);
sheets.store.freezePanes.freezeRows(1);
sheets.sku.freezePanes.freezeRows(1);
sheets.metrics.freezePanes.freezeRows(1);

sheets.sales.getRange("A2:A16").setNumberFormat("yyyy-mm-dd");
sheets.inventory.getRange("A2:A10").setNumberFormat("yyyy-mm-dd");
sheets.shipment.getRange("A2:A5").setNumberFormat("yyyy-mm-dd");
sheets.sales.getRange("N2:O16").setNumberFormat("#,##0");
sheets.inventory.getRange("J2:N10").setNumberFormat("#,##0.0");
sheets.shipment.getRange("I2:L5").setNumberFormat("#,##0.0");

// Computed columns on inventory.
for (let r = 2; r <= inventoryRows.length + 1; r += 1) {
  sheets.inventory.getRange(`N${r}`).formulas = [[`=IFERROR(J${r}/M${r},"")`]];
  sheets.inventory.getRange(`O${r}`).formulas = [[`=IF(N${r}="","",IF(N${r}>60,"Y","N"))`]];
}
sheets.inventory.getRange(`N2:N${inventoryRows.length + 1}`).setNumberFormat("0.0");

// Dashboard layout.
const d = sheets.dashboard;
setWidths(d, [4, 16, 16, 16, 16, 16, 4, 16, 16, 16, 16, 16, 4]);
d.getRange("A1:M1").merge();
d.getRange("A1").values = [["KA销售新增统计字段模板"]];
styleTitle(d.getRange("A1"), colors.ink);
d.getRange("A2:M2").merge();
d.getRange("A2").values = [["可替换明细页示例数据；总览页公式会自动汇总销售、库存、出货退货与周转风险。"]];
d.getRange("A2").format.font = { color: colors.muted, size: 10 };
d.getRange("A1:M36").format.fill = { color: colors.bg };

addKpi(d, "B4:C6", "销售金额", "=SUM('销售明细'!O2:O500)", colors.blue, "#,##0");
addKpi(d, "D4:E6", "销售数量", "=SUM('销售明细'!N2:N500)", colors.green, "#,##0");
addKpi(d, "H4:I6", "门店库存", "=SUM('库存明细'!J2:J500)", colors.amber, "#,##0");
addKpi(d, "J4:K6", "超60天门店", '=COUNTIF(\'库存明细\'!O2:O500,"Y")', colors.red, "#,##0");

d.getRange("B8:F8").merge();
d.getRange("B8").values = [["按系统销售汇总"]];
styleSection(d.getRange("B8:F8"));
d.getRange("B9:E9").values = [["KA系统", "销售金额", "销售数量", "占比"]];
styleHeader(d.getRange("B9:E9"));
const systems = ["大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"];
d.getRange("B10:B17").values = systems.map((s) => [s]);
for (let r = 10; r <= 17; r += 1) {
  d.getRange(`C${r}`).formulas = [[`=SUMIF('销售明细'!B$2:B$500,B${r},'销售明细'!O$2:O$500)`]];
  d.getRange(`D${r}`).formulas = [[`=SUMIF('销售明细'!B$2:B$500,B${r},'销售明细'!N$2:N$500)`]];
  d.getRange(`E${r}`).formulas = [[`=IFERROR(C${r}/SUM($C$10:$C$17),0)`]];
}
d.getRange("C10:D17").setNumberFormat("#,##0");
d.getRange("E10:E17").setNumberFormat("0.0%");

d.getRange("H8:L8").merge();
d.getRange("H8").values = [["按日期销售趋势"]];
styleSection(d.getRange("H8:L8"));
d.getRange("H9:K9").values = [["日期", "销售金额", "销售数量", "动销门店"]];
styleHeader(d.getRange("H9:K9"));
const trendDates = ["2026-05-24", "2026-05-25", "2026-05-26", "2026-05-27", "2026-05-28", "2026-05-29", "2026-05-30"];
d.getRange("H10:H16").values = trendDates.map((x) => [date(x)]);
d.getRange("H10:H16").setNumberFormat("yyyy-mm-dd");
for (let r = 10; r <= 16; r += 1) {
  d.getRange(`I${r}`).formulas = [[`=SUMIF('销售明细'!A$2:A$500,H${r},'销售明细'!O$2:O$500)`]];
  d.getRange(`J${r}`).formulas = [[`=SUMIF('销售明细'!A$2:A$500,H${r},'销售明细'!N$2:N$500)`]];
  d.getRange(`K${r}`).formulas = [[`=COUNTIFS('销售明细'!A$2:A$500,H${r},'销售明细'!N$2:N$500,">0")`]];
}
d.getRange("I10:K16").setNumberFormat("#,##0");

d.getRange("B20:F20").merge();
d.getRange("B20").values = [["大区库存周转风险"]];
styleSection(d.getRange("B20:F20"));
d.getRange("B21:F21").values = [["大区", "门店库存", "近7日均销", "周转天数", "超60天门店"]];
styleHeader(d.getRange("B21:F21"));
const regions = ["华东", "华南", "华北", "华中", "东北"];
d.getRange("B22:B26").values = regions.map((x) => [x]);
for (let r = 22; r <= 26; r += 1) {
  d.getRange(`C${r}`).formulas = [[`=SUMIF('库存明细'!C$2:C$500,B${r},'库存明细'!J$2:J$500)`]];
  d.getRange(`D${r}`).formulas = [[`=SUMIF('库存明细'!C$2:C$500,B${r},'库存明细'!M$2:M$500)`]];
  d.getRange(`E${r}`).formulas = [[`=IFERROR(C${r}/D${r},"")`]];
  d.getRange(`F${r}`).formulas = [[`=COUNTIFS('库存明细'!C$2:C$500,B${r},'库存明细'!O$2:O$500,"Y")`]];
}
d.getRange("C22:F26").setNumberFormat("#,##0.0");

d.getRange("H20:L20").merge();
d.getRange("H20").values = [["出货 / POS 对比"]];
styleSection(d.getRange("H20:L20"));
d.getRange("H21:L21").values = [["KA系统", "POS销售额", "出货金额", "差额", "出货/POS"]];
styleHeader(d.getRange("H21:L21"));
d.getRange("H22:H29").values = systems.map((s) => [s]);
for (let r = 22; r <= 29; r += 1) {
  d.getRange(`I${r}`).formulas = [[`=SUMIF('销售明细'!B$2:B$500,H${r},'销售明细'!O$2:O$500)`]];
  d.getRange(`J${r}`).formulas = [[`=SUMIF('出货退货'!B$2:B$500,H${r},'出货退货'!J$2:J$500)`]];
  d.getRange(`K${r}`).formulas = [[`=J${r}-I${r}`]];
  d.getRange(`L${r}`).formulas = [[`=IFERROR(J${r}/I${r},0)`]];
}
d.getRange("I22:K29").setNumberFormat("#,##0");
d.getRange("L22:L29").setNumberFormat("0.0%");

// Add simple icon/status column through symbols.
d.getRange("M4:M6").merge();
d.getRange("M4").values = [["●"]];
d.getRange("M4").format.font = { color: colors.green, size: 24, bold: true };
d.getRange("M20:M26").values = [["风险"], ["●"], ["●"], ["●"], ["●"], ["●"], [""]];
d.getRange("M20").format.font = { bold: true, color: colors.muted };
d.getRange("M21:M25").format.font = { color: colors.red, size: 14 };

// Charts. The exact API can vary; keep template valid even if charts are skipped.
try {
  const chart = d.charts.add("columnClustered", d.getRange("B9:C17"), { top: 275, left: 70, width: 420, height: 260 });
  chart.title.text = "各KA销售金额";
} catch {}
try {
  const chart = d.charts.add("line", d.getRange("H9:J16"), { top: 275, left: 580, width: 420, height: 260 });
  chart.title.text = "销售趋势";
} catch {}
try {
  const chart = d.charts.add("barClustered", d.getRange("B21:E26"), { top: 600, left: 70, width: 420, height: 240 });
  chart.title.text = "区域库存周转";
} catch {}

// Validations on editable sheets.
const kaValues = ["大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"];
const regionsValues = ["华东", "华南", "华北", "华中", "西北", "东北"];
const yesNo = ["Y", "N"];
[sheets.sales, sheets.inventory, sheets.shipment, sheets.store, sheets.sku].forEach((sheet) => {
  try {
    sheet.getRange("B2:B500").dataValidation = { rule: { type: "list", values: kaValues } };
  } catch {}
});
try {
  sheets.sales.getRange("C2:C500").dataValidation = { rule: { type: "list", values: regionsValues } };
  sheets.inventory.getRange("C2:C500").dataValidation = { rule: { type: "list", values: regionsValues } };
  sheets.sales.getRange("G2:G500").dataValidation = { rule: { type: "list", values: ["是", "否"] } };
  sheets.inventory.getRange("G2:G500").dataValidation = { rule: { type: "list", values: ["是", "否"] } };
  sheets.sales.getRange("Q2:Q500").dataValidation = { rule: { type: "list", values: yesNo } };
} catch {}

// Conditional formatting for risk values.
try {
  sheets.inventory.getRange("N2:N500").conditionalFormats.add("cellIs", {
    operator: "greaterThan",
    formula: 60,
    format: { fill: { color: "#FEE2E2" }, font: { color: colors.red, bold: true } },
  });
  d.getRange("E22:E26").conditionalFormats.add("cellIs", {
    operator: "greaterThan",
    formula: 60,
    format: { fill: { color: "#FEE2E2" }, font: { color: colors.red, bold: true } },
  });
} catch {}

await fs.mkdir(outputDir, { recursive: true });

const formulaErrors = await workbook.inspect({
  kind: "match",
  searchTerm: "#REF!|#DIV/0!|#VALUE!|#NAME\\?|#N/A",
  options: { useRegex: true, maxResults: 50 },
  summary: "formula error scan",
});
console.log(formulaErrors.ndjson);

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);
console.log(outputPath);

try {
  const preview = await workbook.render({ sheetName: "总览仪表盘", autoCrop: "all", scale: 1, format: "png" });
  await fs.writeFile(path.join(outputDir, "KA销售新增统计字段模板-总览预览.png"), new Uint8Array(await preview.arrayBuffer()));
} catch (error) {
  console.log(`render skipped: ${error.message}`);
}
