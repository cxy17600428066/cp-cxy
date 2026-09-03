# -*- coding: utf-8 -*-
from __future__ import annotations

from datetime import date
from pathlib import Path

from openpyxl import Workbook, load_workbook
from openpyxl.chart import BarChart, LineChart, Reference
from openpyxl.formatting.rule import CellIsRule, IconSetRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.worksheet.table import Table, TableStyleInfo


OUTPUT_DIR = Path(r"E:\cxy\07-数据与指标\outputs")
OUTPUT_PATH = OUTPUT_DIR / "KA销售新增统计字段模板.xlsx"


COLORS = {
    "ink": "17202A",
    "muted": "5B6675",
    "line": "D8DEE7",
    "bg": "F6F8FB",
    "panel": "FFFFFF",
    "header": "EAF0F8",
    "blue": "1D4ED8",
    "green": "15803D",
    "amber": "B45309",
    "red": "B91C1C",
    "section": "F0F4F8",
}


thin = Side(style="thin", color=COLORS["line"])
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def style_header(ws, row: int, start_col: int, end_col: int) -> None:
    for col in range(start_col, end_col + 1):
        cell = ws.cell(row=row, column=col)
        cell.fill = PatternFill("solid", fgColor=COLORS["header"])
        cell.font = Font(bold=True, color=COLORS["ink"])
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = border


def add_table(ws, name: str, headers: list[str], rows: list[list], widths: list[float]) -> None:
    ws.append(headers)
    for row in rows:
        ws.append(row)
    style_header(ws, 1, 1, len(headers))
    for row in ws.iter_rows(min_row=2, max_row=max(ws.max_row, 2), max_col=len(headers)):
        for cell in row:
            cell.border = border
            cell.alignment = Alignment(vertical="center", wrap_text=True)
    for idx, width in enumerate(widths, 1):
        ws.column_dimensions[ws.cell(row=1, column=idx).column_letter].width = width
    ws.freeze_panes = "A2"
    ref = f"A1:{ws.cell(row=max(ws.max_row, 2), column=len(headers)).coordinate}"
    table = Table(displayName=name, ref=ref)
    table.tableStyleInfo = TableStyleInfo(
        name="TableStyleMedium2",
        showFirstColumn=False,
        showLastColumn=False,
        showRowStripes=True,
        showColumnStripes=False,
    )
    ws.add_table(table)


def add_validation(ws, cell_range: str, values: list[str]) -> None:
    formula = '"' + ",".join(values) + '"'
    dv = DataValidation(type="list", formula1=formula, allow_blank=True)
    ws.add_data_validation(dv)
    dv.add(cell_range)


def set_date_format(ws, cell_range: str) -> None:
    for row in ws[cell_range]:
        for cell in row:
            cell.number_format = "yyyy-mm-dd"


def set_num_format(ws, cell_range: str, fmt: str) -> None:
    for row in ws[cell_range]:
        for cell in row:
            cell.number_format = fmt


def kpi_block(ws, title_range: str, value_range: str, title: str, formula: str, color: str, fmt: str) -> None:
    ws.merge_cells(title_range)
    ws.merge_cells(value_range)
    title_cell = ws[title_range.split(":")[0]]
    value_cell = ws[value_range.split(":")[0]]
    for rows in ws[title_range]:
        for cell in rows:
            cell.fill = PatternFill("solid", fgColor=COLORS["panel"])
            cell.border = border
    for rows in ws[value_range]:
        for cell in rows:
            cell.fill = PatternFill("solid", fgColor=COLORS["panel"])
            cell.border = border
    title_cell.value = title
    title_cell.font = Font(bold=True, color=COLORS["muted"], size=10)
    title_cell.alignment = Alignment(horizontal="left", vertical="center")
    value_cell.value = formula
    value_cell.font = Font(bold=True, color=color, size=18)
    value_cell.number_format = fmt
    value_cell.alignment = Alignment(horizontal="left", vertical="center")


sales_headers = [
    "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "是否DC", "商品编码", "商品条码", "商品名称",
    "规格", "温层", "渠道", "销售数量", "销售金额", "含税口径", "动销标记", "备注",
]
sales_rows = [
    [date(2026, 5, 24), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "697000000001", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "线下", 210, 4675, "含税", "Y", ""],
    [date(2026, 5, 24), "大润发", "华东", "江苏", "1002", "杨浦店", "否", "4354169", "697000000002", "脱骨侠无骨鸡爪(泡椒味)", "158g/袋", "常温", "京东到家", 86, 1978, "含税", "Y", ""],
    [date(2026, 5, 25), "大润发", "华南", "广东", "5001", "广州天河店", "否", "4502138", "697000000003", "脱骨侠虎皮凤爪(白松露味)", "220g/盒", "冷藏", "美团", 134, 3350, "含税", "Y", ""],
    [date(2026, 5, 25), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "否", "25354863", "0697765695110", "常温脱骨侠无骨鸡爪柠檬", "158g/袋", "常温", "POS", 190, 3800, "未税", "Y", ""],
    [date(2026, 5, 26), "华润", "华北", "北京", "204392", "皇姑店", "否", "5150673", "6973883075622", "脱骨侠无骨鸡爪(柠檬味)158g", "158g/袋", "常温", "线下", 150, 2895, "含税", "Y", ""],
    [date(2026, 5, 26), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "6973883075387", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "POS", 980, 12740, "含税", "Y", ""],
    [date(2026, 5, 27), "永辉", "华东", "浙江", "9626", "滨江区龙湖天街店", "否", "1830795", "6973883073277", "脱骨侠蒜香酸甜辣无骨鸡爪780g", "780g/罐", "冷藏", "POS", 52, 2225, "含税", "Y", ""],
    [date(2026, 5, 27), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "6977656954114", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "天虹到家", 72, 2729, "含税", "Y", ""],
    [date(2026, 5, 28), "比优特", "东北", "黑龙江", "2201", "麓林山店", "否", "1156752", "6973883073277", "脱骨侠无骨鸡爪蒜香酸甜辣780g", "780g/罐", "冷藏", "POS", 18, 629, "含税", "Y", ""],
    [date(2026, 5, 28), "家得福", "华东", "江苏", "1001", "家得福海棠店", "否", "10081319", "6973883073284", "脱骨侠酸辣柠檬无骨鸡爪780g", "780g/罐", "冷藏", "POS", 35, 1033, "含税", "Y", ""],
    [date(2026, 5, 29), "大润发", "华北", "天津", "6001", "天津南开店", "否", "4354172", "697000000004", "脱骨侠盐焗鸡爪", "138g/袋", "常温", "线下", 98, 1421, "含税", "Y", ""],
    [date(2026, 5, 29), "沃尔玛", "华东", "浙江", "2470", "沃尔玛赤峰玉龙大街店", "否", "25325573", "0697388307468", "冷藏蒜香凤爪", "230g/盒", "冷藏", "POS", 79, 2500, "未税", "Y", ""],
    [date(2026, 5, 30), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "697000000001", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "线下", 235, 5235, "含税", "Y", ""],
    [date(2026, 5, 30), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "6973883075387", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "POS", 1100, 14300, "含税", "Y", ""],
    [date(2026, 5, 30), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "6977656954114", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "京东到家", 88, 3335, "含税", "Y", ""],
]

inventory_headers = [
    "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "是否DC", "商品编码", "商品名称",
    "门店库存", "DC库存", "在途/待收", "近7日平均销量", "周转天数", "是否超60天", "备注",
]
inventory_rows = [
    [date(2026, 5, 30), "大润发", "华东", "上海", "1001", "闸北店", "否", "4354168", "脱骨侠无骨鸡爪(柠檬味)", 15089, 1950, 725, 620, "", "", ""],
    [date(2026, 5, 30), "大润发", "华南", "广东", "5001", "广州天河店", "否", "4502138", "脱骨侠虎皮凤爪(白松露味)", 13619, 1250, 550, 210, "", "", ""],
    [date(2026, 5, 30), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "否", "25354863", "常温脱骨侠无骨鸡爪柠檬", 30943, 0, 840, 1408, "", "", ""],
    [date(2026, 5, 30), "华润", "华北", "北京", "204392", "皇姑店", "否", "5150673", "脱骨侠无骨鸡爪(柠檬味)158g", 5233, 0, 0, 245, "", "", ""],
    [date(2026, 5, 30), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "否", "431448153", "盒马工坊 蒜香无骨鸡爪 230g", 94942, 0, 21250, 20146, "", "", ""],
    [date(2026, 5, 30), "永辉", "华东", "浙江", "9626", "滨江区龙湖天街店", "否", "1830795", "脱骨侠蒜香酸甜辣无骨鸡爪780g", 74, 0, 0, 7, "", "", ""],
    [date(2026, 5, 30), "天虹", "华南", "广东", "104", "深圳创业天虹", "否", "v000110869", "脱骨侠双椒无骨鸭掌", 5444, 0, 0, 129, "", "", ""],
    [date(2026, 5, 30), "比优特", "东北", "黑龙江", "2201", "麓林山店", "否", "1156752", "脱骨侠无骨鸡爪蒜香酸甜辣780g", 15925, 0, 0, 31, "", "", ""],
    [date(2026, 5, 30), "家得福", "华东", "江苏", "1001", "家得福海棠店", "否", "10081319", "脱骨侠酸辣柠檬无骨鸡爪780g", 315, 0, 0, 6, "", "", ""],
]

shipment_headers = [
    "数据日期", "KA系统", "大区", "省份", "门店编码", "门店名称", "商品编码", "商品名称",
    "出货数量", "出货金额", "退货数量", "退货金额", "出货字段来源", "退货字段来源", "备注",
]
shipment_rows = [
    [date(2026, 5, 30), "盒马", "华中", "湖北", "HM001", "武汉珞狮路店", "431448153", "盒马工坊 蒜香无骨鸡爪 230g", 24043, "", 120, "", "当天入库采购件数数量", "退货数量", ""],
    [date(2026, 5, 30), "家得福", "华东", "江苏", "1001", "家得福海棠店", "10081319", "脱骨侠酸辣柠檬无骨鸡爪780g", 315, 9050, 0, 0, "进货数量/含税进货金额", "含税退补金额", ""],
    [date(2026, 5, 30), "大润发", "华东", "上海", "1001", "闸北店", "4354168", "脱骨侠无骨鸡爪(柠檬味)", 725, "", "", "", "待收", "源表无退货发生", "待收不等于真实出货，需业务确认"],
    [date(2026, 5, 30), "沃尔玛", "华南", "广东", "101", "沃尔玛广州天河店", "25354863", "常温脱骨侠无骨鸡爪柠檬", "", "", "", "", "缺进货源", "缺退货源", "需补退货/进货明细"],
]

store_headers = ["KA系统", "门店编码", "门店名称", "是否DC", "大区", "省份", "城市", "内外区", "门店状态"]
store_rows = [
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
]

sku_headers = ["KA系统", "商品编码", "商品条码", "统一商品名", "系统商品名", "规格", "温层", "口味", "产品线", "是否核心品"]
sku_rows = [
    ["大润发", "4354168", "697000000001", "无骨鸡爪 柠檬味 158g", "脱骨侠无骨鸡爪(柠檬味)", "158g/袋", "常温", "柠檬", "无骨鸡爪", "Y"],
    ["大润发", "4502138", "697000000003", "虎皮凤爪 白松露味", "脱骨侠虎皮凤爪(白松露味)", "220g/盒", "冷藏", "白松露", "虎皮凤爪", "Y"],
    ["沃尔玛", "25354863", "0697765695110", "无骨鸡爪 柠檬味 158g", "常温脱骨侠无骨鸡爪柠檬", "158g/袋", "常温", "柠檬", "无骨鸡爪", "Y"],
    ["盒马", "431448153", "6973883075387", "蒜香无骨鸡爪 230g", "盒马工坊 蒜香无骨鸡爪 230g", "230g/盒", "冷藏", "蒜香", "无骨鸡爪", "Y"],
    ["天虹", "v000110869", "6977656954114", "双椒无骨鸭掌 320g", "脱骨侠双椒无骨鸭掌", "320g/袋", "冷藏", "双椒", "鸭掌", "Y"],
]

metric_rows = [
    ["指标", "计算口径", "建议字段/公式", "注意事项"],
    ["销售数量", "按日期、系统、门店、商品、渠道汇总 POS 销售数量", "SUMIFS(销售明细[销售数量], ...)", "不同系统最小单位需统一"],
    ["销售金额", "按同维度汇总 POS 销售金额，优先含税口径", "SUMIFS(销售明细[销售金额], ...)", "沃尔玛部分为未税，需保留标签或换算"],
    ["出货数量", "优先取进货/入库/日收/月收/待收等字段", "出货退货[出货数量]", "待收不一定等于真实出货"],
    ["近7日平均销量", "建议 D-7 至 D-1 销售数量合计 / 7", "SUMIFS(...)/7", "不建议包含数据日"],
    ["门店库存周转天数", "门店库存 / 近7日平均销量", "'=IFERROR(门店库存/近7日平均销量,\"\")", "均销为0且有库存时标记无动销库存"],
    ["PSD", "销售数量 / 有库存门店数", "销售数量/有库存门店数", "需确认分母沿用现有日报口径"],
    ["超60天门店数", "周转天数>60 且门店库存>0 的门店数", "COUNTIFS(...)", "排除 DC、闭店、小店需依赖门店维表"],
    ["退货率", "当月退货数量 / 当月进货数量", "退货数量/进货数量", "沃尔玛当前缺退货/进货源"],
]


def build() -> None:
    wb = Workbook()
    ws_dashboard = wb.active
    ws_dashboard.title = "总览仪表盘"
    ws_sales = wb.create_sheet("销售明细")
    ws_inventory = wb.create_sheet("库存明细")
    ws_shipment = wb.create_sheet("出货退货")
    ws_store = wb.create_sheet("门店维表")
    ws_sku = wb.create_sheet("商品维表")
    ws_metrics = wb.create_sheet("指标口径")

    add_table(ws_sales, "tblSales", sales_headers, sales_rows, [12, 12, 10, 10, 12, 24, 9, 14, 16, 32, 12, 10, 12, 12, 14, 10, 10, 20])
    add_table(ws_inventory, "tblInventory", inventory_headers, inventory_rows, [12, 12, 10, 10, 12, 24, 9, 14, 32, 12, 12, 12, 14, 12, 12, 20])
    add_table(ws_shipment, "tblShipment", shipment_headers, shipment_rows, [12, 12, 10, 10, 12, 24, 14, 32, 12, 14, 12, 14, 18, 18, 28])
    add_table(ws_store, "tblStore", store_headers, store_rows, [12, 12, 24, 9, 10, 10, 12, 10, 10])
    add_table(ws_sku, "tblSku", sku_headers, sku_rows, [12, 14, 16, 26, 32, 12, 10, 10, 14, 10])

    for row in metric_rows:
        ws_metrics.append(row)
    style_header(ws_metrics, 1, 1, 4)
    for row in ws_metrics.iter_rows(min_row=2, max_row=ws_metrics.max_row, max_col=4):
        for cell in row:
            cell.border = border
            cell.alignment = Alignment(vertical="top", wrap_text=True)
    for idx, width in enumerate([18, 42, 30, 40], 1):
        ws_metrics.column_dimensions[ws_metrics.cell(row=1, column=idx).column_letter].width = width
    ws_metrics.freeze_panes = "A2"

    for ws in [ws_sales, ws_inventory, ws_shipment]:
        set_date_format(ws, f"A2:A{ws.max_row}")
    set_num_format(ws_sales, f"N2:O{ws_sales.max_row}", "#,##0")
    set_num_format(ws_inventory, f"J2:N{ws_inventory.max_row}", "#,##0.0")
    set_num_format(ws_shipment, f"I2:L{ws_shipment.max_row}", "#,##0.0")

    for row in range(2, ws_inventory.max_row + 1):
        ws_inventory[f"N{row}"] = f'=IFERROR(J{row}/M{row},"")'
        ws_inventory[f"O{row}"] = f'=IF(N{row}="","",IF(N{row}>60,"Y","N"))'
    ws_inventory.conditional_formatting.add(
        f"N2:N{ws_inventory.max_row}",
        CellIsRule(operator="greaterThan", formula=["60"], fill=PatternFill("solid", fgColor="FEE2E2"), font=Font(color=COLORS["red"], bold=True)),
    )

    add_validation(ws_sales, "B2:B500", ["大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"])
    add_validation(ws_sales, "C2:C500", ["华东", "华南", "华北", "华中", "西北", "东北"])
    add_validation(ws_sales, "G2:G500", ["是", "否"])
    add_validation(ws_sales, "Q2:Q500", ["Y", "N"])
    add_validation(ws_inventory, "B2:B500", ["大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"])
    add_validation(ws_inventory, "C2:C500", ["华东", "华南", "华北", "华中", "西北", "东北"])
    add_validation(ws_inventory, "G2:G500", ["是", "否"])

    build_dashboard(ws_dashboard)

    wb.calculation.calcMode = "auto"
    wb.calculation.fullCalcOnLoad = True
    wb.calculation.forceFullCalc = True
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    wb.save(OUTPUT_PATH)

    # Verify the saved workbook can be reopened and has the expected objects.
    check = load_workbook(OUTPUT_PATH, data_only=False)
    assert check.sheetnames == ["总览仪表盘", "销售明细", "库存明细", "出货退货", "门店维表", "商品维表", "指标口径"]
    assert len(check["总览仪表盘"]._charts) >= 3
    assert "tblSales" in check["销售明细"].tables
    assert check["库存明细"]["N2"].value.startswith("=IFERROR")
    check.close()
    print(OUTPUT_PATH)


def build_dashboard(ws) -> None:
    ws.sheet_view.showGridLines = False
    for col, width in zip("ABCDEFGHIJKLM", [4, 16, 16, 16, 16, 16, 4, 16, 16, 16, 16, 16, 4]):
        ws.column_dimensions[col].width = width
    for row in range(1, 60):
        ws.row_dimensions[row].height = 22
    for row in ws.iter_rows(min_row=1, max_row=60, min_col=1, max_col=13):
        for cell in row:
            cell.fill = PatternFill("solid", fgColor=COLORS["bg"])

    ws.merge_cells("A1:M1")
    ws["A1"] = "KA销售新增统计字段模板"
    ws["A1"].font = Font(bold=True, size=18, color=COLORS["ink"])
    ws.merge_cells("A2:M2")
    ws["A2"] = "可替换明细页示例数据；总览页公式会自动汇总销售、库存、出货退货与周转风险。"
    ws["A2"].font = Font(color=COLORS["muted"], size=10)

    kpi_block(ws, "B4:C4", "B5:C6", "销售金额", "=SUM('销售明细'!O2:O500)", COLORS["blue"], "#,##0")
    kpi_block(ws, "D4:E4", "D5:E6", "销售数量", "=SUM('销售明细'!N2:N500)", COLORS["green"], "#,##0")
    kpi_block(ws, "H4:I4", "H5:I6", "门店库存", "=SUM('库存明细'!J2:J500)", COLORS["amber"], "#,##0")
    kpi_block(ws, "J4:K4", "J5:K6", "超60天门店", '=COUNTIF(\'库存明细\'!O2:O500,"Y")', COLORS["red"], "#,##0")
    ws.merge_cells("L4:M6")
    ws["L4"] = "●"
    ws["L4"].font = Font(color=COLORS["green"], size=28, bold=True)
    ws["L4"].alignment = Alignment(horizontal="center", vertical="center")
    for rows in ws["L4:M6"]:
        for cell in rows:
            cell.fill = PatternFill("solid", fgColor=COLORS["panel"])
            cell.border = border

    write_section(ws, "B8:F8", "按系统销售汇总")
    write_table_header(ws, "B9:E9", ["KA系统", "销售金额", "销售数量", "占比"])
    systems = ["大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"]
    for idx, system in enumerate(systems, 10):
        ws[f"B{idx}"] = system
        ws[f"C{idx}"] = f'=SUMIF(\'销售明细\'!B$2:B$500,B{idx},\'销售明细\'!O$2:O$500)'
        ws[f"D{idx}"] = f'=SUMIF(\'销售明细\'!B$2:B$500,B{idx},\'销售明细\'!N$2:N$500)'
        ws[f"E{idx}"] = f'=IFERROR(C{idx}/SUM($C$10:$C$17),0)'
    format_table_body(ws, "B10:E17")
    set_num_format(ws, "C10:D17", "#,##0")
    set_num_format(ws, "E10:E17", "0.0%")

    write_section(ws, "H8:L8", "按日期销售趋势")
    write_table_header(ws, "H9:K9", ["日期", "销售金额", "销售数量", "动销门店"])
    for idx, day in enumerate(range(24, 31), 10):
        ws[f"H{idx}"] = date(2026, 5, day)
        ws[f"I{idx}"] = f'=SUMIF(\'销售明细\'!A$2:A$500,H{idx},\'销售明细\'!O$2:O$500)'
        ws[f"J{idx}"] = f'=SUMIF(\'销售明细\'!A$2:A$500,H{idx},\'销售明细\'!N$2:N$500)'
        ws[f"K{idx}"] = f'=COUNTIFS(\'销售明细\'!A$2:A$500,H{idx},\'销售明细\'!N$2:N$500,">0")'
    format_table_body(ws, "H10:K16")
    set_date_format(ws, "H10:H16")
    set_num_format(ws, "I10:K16", "#,##0")

    write_section(ws, "B20:F20", "大区库存周转风险")
    write_table_header(ws, "B21:F21", ["大区", "门店库存", "近7日均销", "周转天数", "超60天门店"])
    regions = ["华东", "华南", "华北", "华中", "东北"]
    for idx, region in enumerate(regions, 22):
        ws[f"B{idx}"] = region
        ws[f"C{idx}"] = f'=SUMIF(\'库存明细\'!C$2:C$500,B{idx},\'库存明细\'!J$2:J$500)'
        ws[f"D{idx}"] = f'=SUMIF(\'库存明细\'!C$2:C$500,B{idx},\'库存明细\'!M$2:M$500)'
        ws[f"E{idx}"] = f'=IFERROR(C{idx}/D{idx},"")'
        ws[f"F{idx}"] = f'=COUNTIFS(\'库存明细\'!C$2:C$500,B{idx},\'库存明细\'!O$2:O$500,"Y")'
    format_table_body(ws, "B22:F26")
    set_num_format(ws, "C22:F26", "#,##0.0")
    ws.conditional_formatting.add("E22:E26", CellIsRule(operator="greaterThan", formula=["60"], fill=PatternFill("solid", fgColor="FEE2E2"), font=Font(color=COLORS["red"], bold=True)))
    ws.conditional_formatting.add("E22:E26", IconSetRule("3TrafficLights1", "num", [30, 60, 120], showValue=True))

    write_section(ws, "H20:L20", "出货 / POS 对比")
    write_table_header(ws, "H21:L21", ["KA系统", "POS销售额", "出货金额", "差额", "出货/POS"])
    for idx, system in enumerate(systems, 22):
        ws[f"H{idx}"] = system
        ws[f"I{idx}"] = f'=SUMIF(\'销售明细\'!B$2:B$500,H{idx},\'销售明细\'!O$2:O$500)'
        ws[f"J{idx}"] = f'=SUMIF(\'出货退货\'!B$2:B$500,H{idx},\'出货退货\'!J$2:J$500)'
        ws[f"K{idx}"] = f"=J{idx}-I{idx}"
        ws[f"L{idx}"] = f'=IFERROR(J{idx}/I{idx},0)'
    format_table_body(ws, "H22:L29")
    set_num_format(ws, "I22:K29", "#,##0")
    set_num_format(ws, "L22:L29", "0.0%")

    add_charts(ws)


def write_section(ws, cell_range: str, title: str) -> None:
    ws.merge_cells(cell_range)
    cell = ws[cell_range.split(":")[0]]
    cell.value = title
    cell.fill = PatternFill("solid", fgColor=COLORS["section"])
    cell.font = Font(bold=True, color=COLORS["ink"])
    cell.alignment = Alignment(horizontal="left", vertical="center")
    for rows in ws[cell_range]:
        for c in rows:
            c.fill = PatternFill("solid", fgColor=COLORS["section"])
            c.border = border


def write_table_header(ws, cell_range: str, headers: list[str]) -> None:
    start_cell = ws[cell_range.split(":")[0]]
    row = start_cell.row
    col = start_cell.column
    for offset, title in enumerate(headers):
        c = ws.cell(row=row, column=col + offset)
        c.value = title
        c.fill = PatternFill("solid", fgColor=COLORS["header"])
        c.font = Font(bold=True, color=COLORS["ink"])
        c.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        c.border = border


def format_table_body(ws, cell_range: str) -> None:
    for row in ws[cell_range]:
        for cell in row:
            cell.fill = PatternFill("solid", fgColor=COLORS["panel"])
            cell.border = border
            cell.alignment = Alignment(vertical="center", wrap_text=True)


def add_charts(ws) -> None:
    chart1 = BarChart()
    chart1.title = "各KA销售金额"
    chart1.y_axis.title = "金额"
    chart1.x_axis.title = "KA系统"
    chart1.height = 8
    chart1.width = 14
    chart1.add_data(Reference(ws, min_col=3, min_row=9, max_row=17), titles_from_data=True)
    chart1.set_categories(Reference(ws, min_col=2, min_row=10, max_row=17))
    ws.add_chart(chart1, "B31")

    chart2 = LineChart()
    chart2.title = "销售趋势"
    chart2.y_axis.title = "金额 / 数量"
    chart2.x_axis.title = "日期"
    chart2.height = 8
    chart2.width = 14
    chart2.add_data(Reference(ws, min_col=9, min_row=9, max_col=10, max_row=16), titles_from_data=True)
    chart2.set_categories(Reference(ws, min_col=8, min_row=10, max_row=16))
    ws.add_chart(chart2, "H31")

    chart3 = BarChart()
    chart3.type = "bar"
    chart3.title = "区域库存周转"
    chart3.y_axis.title = "大区"
    chart3.x_axis.title = "周转天数"
    chart3.height = 8
    chart3.width = 14
    chart3.add_data(Reference(ws, min_col=5, min_row=21, max_row=26), titles_from_data=True)
    chart3.set_categories(Reference(ws, min_col=2, min_row=22, max_row=26))
    ws.add_chart(chart3, "B48")


if __name__ == "__main__":
    build()
