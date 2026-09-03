# -*- coding: utf-8 -*-
from __future__ import annotations

from pathlib import Path

from openpyxl import load_workbook
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.formatting.rule import CellIsRule, IconSetRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation


SOURCE_PATH = Path(r"E:\cxy\07-数据与指标\outputs\KA大盘出货数据-四页主题表.xlsx")
OUTPUT_PATH = Path(r"E:\cxy\07-数据与指标\outputs\KA大盘出货数据-四页主题表-含日报总览.xlsx")
SHEET_NAME = "日报总览"

COLORS = {
    "ink": "17202A",
    "muted": "5B6675",
    "line": "D8DEE7",
    "bg": "F6F8FB",
    "panel": "FFFFFF",
    "header": "D9EAF7",
    "section": "EAF0F8",
    "blue": "1D4ED8",
    "green": "15803D",
    "amber": "B45309",
    "red": "B91C1C",
    "purple": "6D28D9",
    "teal": "0891B2",
}

thin = Side(style="thin", color=COLORS["line"])
border = Border(left=thin, right=thin, top=thin, bottom=thin)


def style_box(ws, cell_range: str, fill: str = "FFFFFF") -> None:
    for row in ws[cell_range]:
        for cell in row:
            cell.fill = PatternFill("solid", fgColor=fill)
            cell.border = border
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.font = Font(name="微软雅黑", size=10, color=COLORS["ink"])


def section(ws, cell_range: str, title: str) -> None:
    ws.merge_cells(cell_range)
    style_box(ws, cell_range, COLORS["section"])
    cell = ws[cell_range.split(":")[0]]
    cell.value = title
    cell.font = Font(name="微软雅黑", bold=True, size=12, color=COLORS["ink"])
    cell.alignment = Alignment(horizontal="left", vertical="center")


def header(ws, row: int, start_col: int, titles: list[str]) -> None:
    for i, title in enumerate(titles, start_col):
        cell = ws.cell(row=row, column=i)
        cell.value = title
        cell.fill = PatternFill("solid", fgColor=COLORS["header"])
        cell.font = Font(name="微软雅黑", bold=True, size=10, color=COLORS["ink"])
        cell.border = border
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)


def add_validation(ws, cell: str, values: list[str]) -> None:
    dv = DataValidation(type="list", formula1='"' + ",".join(values) + '"', allow_blank=False)
    ws.add_data_validation(dv)
    dv.add(ws[cell])


def kpi(ws, cell_range: str, title: str, formula: str, color: str, fmt="#,##0") -> None:
    style_box(ws, cell_range, COLORS["panel"])
    top_left = ws[cell_range.split(":")[0]]
    r, c = top_left.row, top_left.column
    ws.cell(r, c).value = title
    ws.cell(r, c).font = Font(name="微软雅黑", bold=True, size=10, color=COLORS["muted"])
    ws.cell(r + 1, c).value = formula
    ws.cell(r + 1, c).font = Font(name="微软雅黑", bold=True, size=18, color=color)
    ws.cell(r + 1, c).number_format = fmt
    ws.cell(r + 2, c).value = "自动汇总"
    ws.cell(r + 2, c).font = Font(name="微软雅黑", size=9, color=COLORS["muted"])


def build() -> None:
    wb = load_workbook(SOURCE_PATH)
    if SHEET_NAME in wb.sheetnames:
        del wb[SHEET_NAME]
    ws = wb.create_sheet(SHEET_NAME, 0)
    ws.sheet_view.showGridLines = False

    for col in range(1, 24):
        ws.column_dimensions[get_column_letter(col)].width = 14
    ws.column_dimensions["A"].width = 4
    ws.column_dimensions["B"].width = 16
    ws.column_dimensions["C"].width = 16
    ws.column_dimensions["D"].width = 16
    ws.column_dimensions["E"].width = 16
    ws.column_dimensions["F"].width = 16
    ws.column_dimensions["G"].width = 4
    ws.column_dimensions["H"].width = 16
    ws.column_dimensions["I"].width = 16
    ws.column_dimensions["J"].width = 16
    ws.column_dimensions["K"].width = 16
    ws.column_dimensions["L"].width = 16
    for row in range(1, 90):
        ws.row_dimensions[row].height = 22
    for row in ws["A1:W90"]:
        for cell in row:
            cell.fill = PatternFill("solid", fgColor=COLORS["bg"])

    ws.merge_cells("A1:W1")
    ws["A1"] = "KA大盘出货数据日报总览"
    ws["A1"].font = Font(name="微软雅黑", bold=True, size=18, color=COLORS["ink"])
    ws["A1"].alignment = Alignment(horizontal="left", vertical="center")
    ws.merge_cells("A2:W2")
    ws["A2"] = "总览页汇总所有主题sheet情况：出货大盘、单品出货/POS、库存周转、超60天门店排名，并提供源数据完整性提示。"
    ws["A2"].font = Font(name="微软雅黑", size=9, color=COLORS["muted"])

    # Parameters.
    labels = [("B3", "统计日期", "C3", "=MAX('销售明细'!A2:A500)"), ("E3", "KA系统", "F3", "全部"), ("H3", "大区", "I3", "全部")]
    for label_cell, label, value_cell, value in labels:
        ws[label_cell] = label
        ws[label_cell].font = Font(name="微软雅黑", bold=True, size=9, color=COLORS["muted"])
        ws[value_cell] = value
        ws[value_cell].fill = PatternFill("solid", fgColor=COLORS["panel"])
        ws[value_cell].border = border
        ws[value_cell].alignment = Alignment(horizontal="center", vertical="center")
        ws[value_cell].font = Font(name="微软雅黑", bold=True, size=10, color=COLORS["ink"])
    ws["C3"].number_format = "yyyy-mm-dd"
    add_validation(ws, "F3", ["全部", "大润发", "盒马", "华润", "沃尔玛", "永辉", "天虹", "比优特", "家得福"])
    add_validation(ws, "I3", ["全部", "华东", "华南", "华北", "华中", "西北", "东北"])

    # KPI cards.
    kpi(ws, "B5:C8", "出货数量", "=SUM('1-KA大盘出货数据'!C7:C14)", COLORS["green"])
    kpi(ws, "D5:E8", "出货金额", "=SUM('1-KA大盘出货数据'!D7:D14)", COLORS["blue"])
    kpi(ws, "H5:I8", "POS销售额", "=SUM('1-KA大盘出货数据'!F7:F14)", COLORS["purple"])
    kpi(ws, "J5:K8", "出货/POS额", "=IFERROR(D6/H6,0)", COLORS["amber"], "0.0%")
    kpi(ws, "M5:N8", "超60天门店", "=SUM('4-超60天门店排名'!D7:D11)", COLORS["red"])
    kpi(ws, "P5:Q8", "平均周转天数", "=AVERAGE('3-门店库存周转天数'!G7:G12)", COLORS["teal"], "#,##0.0")

    # Topic health table.
    section(ws, "B10:K10", "主题页情况一览")
    header(ws, 11, 2, ["主题页", "关键词", "汇总指标", "图表数", "原始数据区", "当前状态", "跳转提示"])
    topic_rows = [
        ["1-KA大盘出货数据", "出货数量/金额、by单品、by渠道", "=SUM('1-KA大盘出货数据'!D7:D14)", 2, "出货退货明细", '=IF(C12=0,"出货金额缺失","可用")', "查看系统/单品/渠道出货"],
        ["2-单品出货POS对比", "出货额、POS额、差异、比例", "=SUM('2-单品出货POS对比'!F7:F12)", 2, "POS销售明细与出货明细", '=IF(C13=0,"POS额缺失","可用")', "查看单品差异"],
        ["3-门店库存周转天数", "大区、单品、近7日均销、周转", "=AVERAGE('3-门店库存周转天数'!G7:G12)", 2, "库存明细", '=IF(C14>60,"高风险","可用")', "查看周转风险"],
        ["4-超60天门店排名", "大区、超60天门店数、排名", "=SUM('4-超60天门店排名'!D7:D11)", 2, "超60天门店明细", '=IF(C15>0,"需处理","正常")', "查看区域排名"],
    ]
    for r, row in enumerate(topic_rows, 12):
        for c, value in enumerate(row, 2):
            ws.cell(r, c).value = value
    style_box(ws, "B12:H15", COLORS["panel"])
    ws["D12"].number_format = "#,##0.0"
    ws["D13"].number_format = "#,##0.0"
    ws["D14"].number_format = "#,##0.0"
    ws["D15"].number_format = "#,##0.0"

    # Helper data tables for charts.
    build_helper_tables(ws)
    add_charts(ws)

    # Data quality & risk prompts.
    section(ws, "B54:K54", "数据质量与业务提醒")
    header(ws, 55, 2, ["检查项", "结果", "说明"])
    checks = [
        ["销售明细行数", "=COUNTA('销售明细'!A2:A500)", "POS销售、渠道、门店、商品字段来源"],
        ["库存明细行数", "=COUNTA('库存明细'!A2:A500)", "库存、近7日平均销量、周转天数字段来源"],
        ["出货退货行数", "=COUNTA('出货退货'!A2:A500)", "出货数量/金额、退货数量/金额字段来源"],
        ["缺出货金额系统数", '=COUNTIF(\'1-KA大盘出货数据\'!J7:J14,"缺出货金额")', "出货金额缺失会影响出货/POS对比"],
        ["超60天风险", '=IF(SUM(\'4-超60天门店排名\'!D7:D11)>0,"存在风险","正常")', "优先处理超60天且库存高的门店"],
    ]
    for r, row in enumerate(checks, 56):
        for c, value in enumerate(row, 2):
            ws.cell(r, c).value = value
    style_box(ws, "B56:D60", COLORS["panel"])
    ws.conditional_formatting.add("C59:C59", CellIsRule(operator="greaterThan", formula=["0"], fill=PatternFill("solid", fgColor="FEE2E2"), font=Font(color=COLORS["red"], bold=True)))
    ws.conditional_formatting.add("C60:C60", CellIsRule(operator="equal", formula=['"存在风险"'], fill=PatternFill("solid", fgColor="FEE2E2"), font=Font(color=COLORS["red"], bold=True)))

    wb.calculation.calcMode = "auto"
    wb.calculation.fullCalcOnLoad = True
    wb.calculation.forceFullCalc = True
    wb.save(OUTPUT_PATH)

    check = load_workbook(OUTPUT_PATH, data_only=False)
    assert SHEET_NAME in check.sheetnames
    ws2 = check[SHEET_NAME]
    assert len(ws2._charts) >= 6
    assert ws2["B10"].value == "主题页情况一览"
    check.close()
    print(OUTPUT_PATH)


def build_helper_tables(ws) -> None:
    # System comparison helper.
    header(ws, 18, 2, ["KA系统", "出货金额", "POS销售额", "出货/POS额"])
    for r in range(7, 15):
        out_r = r + 12
        ws[f"B{out_r}"] = f"='1-KA大盘出货数据'!B{r}"
        ws[f"C{out_r}"] = f"='1-KA大盘出货数据'!D{r}"
        ws[f"D{out_r}"] = f"='1-KA大盘出货数据'!F{r}"
        ws[f"E{out_r}"] = f"=IFERROR(C{out_r}/D{out_r},0)"
    style_box(ws, "B19:E26", COLORS["panel"])
    for row in ws["C19:D26"]:
        for cell in row:
            cell.number_format = "#,##0.0"
    for row in ws["E19:E26"]:
        row[0].number_format = "0.0%"

    # Product comparison helper.
    header(ws, 18, 8, ["商品", "出货额", "POS额", "出货/POS额"])
    for r in range(7, 13):
        out_r = r + 12
        ws[f"H{out_r}"] = f"='2-单品出货POS对比'!D{r}"
        ws[f"I{out_r}"] = f"='2-单品出货POS对比'!E{r}"
        ws[f"J{out_r}"] = f"='2-单品出货POS对比'!F{r}"
        ws[f"K{out_r}"] = f"='2-单品出货POS对比'!H{r}"
    style_box(ws, "H19:K24", COLORS["panel"])
    for row in ws["I19:J24"]:
        for cell in row:
            cell.number_format = "#,##0.0"
    for row in ws["K19:K24"]:
        row[0].number_format = "0.0%"

    # Turnover helper.
    header(ws, 30, 2, ["大区-单品", "门店库存", "近7日均销", "周转天数"])
    for r in range(7, 13):
        out_r = r + 24
        ws[f"B{out_r}"] = f"='3-门店库存周转天数'!B{r}&\"-\"&'3-门店库存周转天数'!D{r}"
        ws[f"C{out_r}"] = f"='3-门店库存周转天数'!E{r}"
        ws[f"D{out_r}"] = f"='3-门店库存周转天数'!F{r}"
        ws[f"E{out_r}"] = f"='3-门店库存周转天数'!G{r}"
    style_box(ws, "B31:E36", COLORS["panel"])
    for row in ws["C31:E36"]:
        for cell in row:
            cell.number_format = "#,##0.0"

    # Over 60 ranking helper.
    header(ws, 30, 8, ["大区", "超60天门店数", "平均周转天数"])
    for r in range(7, 12):
        out_r = r + 24
        ws[f"H{out_r}"] = f"='4-超60天门店排名'!C{r}"
        ws[f"I{out_r}"] = f"='4-超60天门店排名'!D{r}"
        ws[f"J{out_r}"] = f"='4-超60天门店排名'!G{r}"
    style_box(ws, "H31:J35", COLORS["panel"])
    for row in ws["I31:J35"]:
        for cell in row:
            cell.number_format = "#,##0.0"

    # Source data overview.
    header(ws, 42, 2, ["源数据页", "记录数", "关键字段"])
    source_rows = [
        ["销售明细", "=COUNTA('销售明细'!A2:A500)", "日期、系统、大区、门店、商品、渠道、销售数量、销售金额"],
        ["库存明细", "=COUNTA('库存明细'!A2:A500)", "日期、系统、大区、门店、商品、库存、近7日平均销量、周转天数"],
        ["出货退货", "=COUNTA('出货退货'!A2:A500)", "日期、系统、大区、门店、商品、出货数量、出货金额、退货"],
    ]
    for r, row in enumerate(source_rows, 43):
        for c, value in enumerate(row, 2):
            ws.cell(r, c).value = value
    style_box(ws, "B43:D45", COLORS["panel"])


def add_charts(ws) -> None:
    chart1 = BarChart()
    chart1.title = "系统出货金额 vs POS销售额"
    chart1.y_axis.title = "金额"
    chart1.height = 8
    chart1.width = 15
    chart1.add_data(Reference(ws, min_col=3, min_row=18, max_col=4, max_row=26), titles_from_data=True)
    chart1.set_categories(Reference(ws, min_col=2, min_row=19, max_row=26))
    ws.add_chart(chart1, "M10")

    chart2 = BarChart()
    chart2.title = "单品出货/POS额比例"
    chart2.y_axis.title = "比例"
    chart2.height = 8
    chart2.width = 15
    chart2.add_data(Reference(ws, min_col=11, min_row=18, max_row=24), titles_from_data=True)
    chart2.set_categories(Reference(ws, min_col=8, min_row=19, max_row=24))
    ws.add_chart(chart2, "M27")

    chart3 = LineChart()
    chart3.title = "门店库存与近7日均销"
    chart3.y_axis.title = "数量"
    chart3.height = 8
    chart3.width = 15
    chart3.add_data(Reference(ws, min_col=3, min_row=30, max_col=4, max_row=36), titles_from_data=True)
    chart3.set_categories(Reference(ws, min_col=2, min_row=31, max_row=36))
    ws.add_chart(chart3, "B63")

    chart4 = BarChart()
    chart4.type = "bar"
    chart4.title = "超60天门店数排名"
    chart4.x_axis.title = "门店数"
    chart4.height = 8
    chart4.width = 15
    chart4.add_data(Reference(ws, min_col=9, min_row=30, max_row=35), titles_from_data=True)
    chart4.set_categories(Reference(ws, min_col=8, min_row=31, max_row=35))
    ws.add_chart(chart4, "M44")

    chart5 = PieChart()
    chart5.title = "主题页指标占比"
    chart5.height = 7
    chart5.width = 12
    chart5.add_data(Reference(ws, min_col=4, min_row=12, max_row=15), titles_from_data=False)
    chart5.set_categories(Reference(ws, min_col=2, min_row=12, max_row=15))
    chart5.dataLabels = DataLabelList()
    chart5.dataLabels.showPercent = True
    ws.add_chart(chart5, "B47")

    chart6 = BarChart()
    chart6.title = "源数据记录数"
    chart6.height = 7
    chart6.width = 12
    chart6.add_data(Reference(ws, min_col=3, min_row=42, max_row=45), titles_from_data=True)
    chart6.set_categories(Reference(ws, min_col=2, min_row=43, max_row=45))
    ws.add_chart(chart6, "H47")


if __name__ == "__main__":
    build()
