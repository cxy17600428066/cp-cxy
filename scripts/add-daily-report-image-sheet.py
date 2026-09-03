# -*- coding: utf-8 -*-
from __future__ import annotations

from datetime import date
from pathlib import Path

from openpyxl import load_workbook
from openpyxl.chart import BarChart, LineChart, PieChart, Reference
from openpyxl.chart.label import DataLabelList
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter


SOURCE_PATH = Path(r"E:\cxy\07-数据与指标\outputs\KA销售新增统计字段模板.xlsx")
OUTPUT_PATH = Path(r"E:\cxy\07-数据与指标\outputs\KA销售新增统计字段模板-含日报看板.xlsx")
SHEET_NAME = "日报看板-图片版"

COLORS = {
    "ink": "000000",
    "muted": "666666",
    "grid": "000000",
    "header": "A7E6DF",
    "green": "70AD47",
    "orange": "ED7D31",
    "yellow": "FFC000",
    "blue": "5B9BD5",
    "red": "C00000",
    "white": "FFFFFF",
}

thin = Side(style="thin", color=COLORS["grid"])
dashed = Side(style="dashed", color=COLORS["grid"])
border = Border(left=thin, right=thin, top=thin, bottom=thin)
dash_border = Border(left=dashed, right=dashed, top=dashed, bottom=dashed)


def set_cell(ws, cell: str, value, bold=False, size=11, color="000000", align="center") -> None:
    c = ws[cell]
    c.value = value
    c.font = Font(name="微软雅黑", bold=bold, size=size, color=color)
    c.alignment = Alignment(horizontal=align, vertical="center", wrap_text=True)


def merge_value(ws, cell_range: str, value, bold=False, size=11, color="000000", fill=None, align="center") -> None:
    ws.merge_cells(cell_range)
    top_left = cell_range.split(":")[0]
    set_cell(ws, top_left, value, bold=bold, size=size, color=color, align=align)
    for row in ws[cell_range]:
        for cell in row:
            cell.border = border
            if fill:
                cell.fill = PatternFill("solid", fgColor=fill)


def metric_card(ws, cell_range: str, title: str, value: str, sub: str = "") -> None:
    start, end = cell_range.split(":")
    start_cell = ws[start]
    rows = ws[cell_range]
    for row in rows:
        for cell in row:
            cell.border = dash_border
            cell.fill = PatternFill("solid", fgColor=COLORS["white"])
            cell.alignment = Alignment(horizontal="center", vertical="center")

    min_row = start_cell.row
    min_col = start_cell.column
    max_col = ws[end].column
    mid_col = min_col + (max_col - min_col) // 2
    ws.cell(min_row, mid_col).value = title
    ws.cell(min_row, mid_col).font = Font(name="微软雅黑", bold=True, underline="single", size=11)
    ws.cell(min_row + 1, mid_col).value = value
    ws.cell(min_row + 1, mid_col).font = Font(name="微软雅黑", bold=True, size=24)
    if sub:
        ws.cell(min_row + 3, mid_col).value = sub
        ws.cell(min_row + 3, mid_col).font = Font(name="微软雅黑", bold=True, size=10)
    for r in range(min_row, min_row + 4):
        ws.cell(r, mid_col).alignment = Alignment(horizontal="center", vertical="center")


def write_header(ws, row: int, headers: list[str], start_col=1) -> None:
    for idx, title in enumerate(headers, start_col):
        cell = ws.cell(row=row, column=idx)
        cell.value = title
        cell.font = Font(name="微软雅黑", bold=True, size=10)
        cell.fill = PatternFill("solid", fgColor=COLORS["header"])
        cell.alignment = Alignment(horizontal="center", vertical="center")
        cell.border = border


def write_table_rows(ws, start_row: int, rows: list[list], start_col=1, highlight_first=False) -> None:
    for r_offset, values in enumerate(rows):
        row_no = start_row + r_offset
        for c_offset, value in enumerate(values):
            cell = ws.cell(row=row_no, column=start_col + c_offset)
            cell.value = value
            cell.font = Font(name="微软雅黑", size=10)
            cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
            cell.border = border
            if highlight_first and r_offset == 0:
                cell.fill = PatternFill("solid", fgColor=COLORS["header"])


def create_charts(ws) -> None:
    # 销售额 pie chart
    pie = PieChart()
    pie.title = "销售额（单位：元，%）"
    pie.add_data(Reference(ws, min_col=18, min_row=3, max_row=5), titles_from_data=False)
    pie.set_categories(Reference(ws, min_col=17, min_row=3, max_row=5))
    pie.height = 7
    pie.width = 9
    pie.dataLabels = DataLabelList()
    pie.dataLabels.showVal = True
    pie.dataLabels.showPercent = True
    ws.add_chart(pie, "A12")

    # 销量 bar chart
    qty = BarChart()
    qty.title = "销量"
    qty.y_axis.scaling.min = 0
    qty.y_axis.scaling.max = 1
    qty.add_data(Reference(ws, min_col=19, min_row=2, max_row=5), titles_from_data=True)
    qty.set_categories(Reference(ws, min_col=17, min_row=3, max_row=5))
    qty.height = 7
    qty.width = 9
    ws.add_chart(qty, "H12")

    # 近7日销量 line chart
    line = LineChart()
    line.title = "近7日销量"
    line.y_axis.scaling.min = 0
    line.y_axis.scaling.max = 1
    line.add_data(Reference(ws, min_col=24, min_row=2, max_col=26, max_row=9), titles_from_data=True)
    line.set_categories(Reference(ws, min_col=23, min_row=3, max_row=9))
    line.height = 7
    line.width = 9
    ws.add_chart(line, "A27")

    # PSD chart
    psd = BarChart()
    psd.title = "PSD"
    psd.y_axis.scaling.min = 0
    psd.y_axis.scaling.max = 1
    psd.add_data(Reference(ws, min_col=20, min_row=2, max_row=5), titles_from_data=True)
    psd.set_categories(Reference(ws, min_col=17, min_row=3, max_row=5))
    psd.height = 7
    psd.width = 9
    ws.add_chart(psd, "H27")

    # 库存 pie chart
    inv = PieChart()
    inv.title = "库存"
    inv.add_data(Reference(ws, min_col=21, min_row=3, max_row=5), titles_from_data=False)
    inv.set_categories(Reference(ws, min_col=17, min_row=3, max_row=5))
    inv.height = 7
    inv.width = 9
    inv.dataLabels = DataLabelList()
    inv.dataLabels.showVal = True
    inv.dataLabels.showPercent = True
    ws.add_chart(inv, "A42")

    # 周转天数 chart
    turn = BarChart()
    turn.title = "周转天数"
    turn.y_axis.scaling.min = 0
    turn.y_axis.scaling.max = 1
    turn.add_data(Reference(ws, min_col=22, min_row=2, max_row=5), titles_from_data=True)
    turn.set_categories(Reference(ws, min_col=17, min_row=3, max_row=5))
    turn.height = 7
    turn.width = 9
    ws.add_chart(turn, "H42")


def build() -> None:
    wb = load_workbook(SOURCE_PATH)
    if SHEET_NAME in wb.sheetnames:
        del wb[SHEET_NAME]
    ws = wb.create_sheet(SHEET_NAME, 1)
    ws.sheet_view.showGridLines = False

    for col in range(1, 15):
        ws.column_dimensions[get_column_letter(col)].width = 13
    ws.column_dimensions["A"].width = 28
    ws.column_dimensions["H"].width = 3
    for row in range(1, 100):
        ws.row_dimensions[row].height = 21

    set_cell(ws, "N1", "统计时间：  2026-05-31", bold=True, size=11, align="right")

    metric_card(ws, "A2:D6", "销售额", "0元", "环比昨日↓100.0%")
    metric_card(ws, "E2:H6", "销量", "0罐", "环比昨日↓100.0%")
    metric_card(ws, "I2:N6", "当月日均销量", "790罐", "")
    metric_card(ws, "A7:D11", "库存", "0罐", "环比昨日↓100.0%")
    metric_card(ws, "E7:H11", "有库存门店数", "1家", "")
    metric_card(ws, "I7:N11", "动销门店数", "1家", "")

    # Chart source data, kept to the right and hidden.
    source_headers = ["品项", "销售额", "销量", "PSD", "库存", "周转天数"]
    for idx, header in enumerate(source_headers, 17):
        ws.cell(row=2, column=idx).value = header
        ws.cell(row=2, column=idx).font = Font(bold=True)
    for row_no, row in enumerate([
        ["蒜香 780g", 0, 0, 0, 0, 0],
        ["藤椒 780g", 0, 0, 0, 0, 0],
        ["柠檬 780g", 0, 0, 0, 0, 0],
    ], 3):
        for col_no, value in enumerate(row, 17):
            ws.cell(row=row_no, column=col_no).value = value

    ws.cell(row=2, column=23).value = "日期"
    for idx, title in enumerate(["蒜香 780g", "藤椒 780g", "柠檬 780g"], 24):
        ws.cell(row=2, column=idx).value = title
    for offset, day in enumerate(range(25, 32), 3):
        ws.cell(row=offset, column=23).value = date(2026, 5, day)
        ws.cell(row=offset, column=23).number_format = "yyyy/m/d"
        ws.cell(row=offset, column=24).value = 0
        ws.cell(row=offset, column=25).value = 0
        ws.cell(row=offset, column=26).value = 0
    for col in range(17, 27):
        ws.column_dimensions[get_column_letter(col)].hidden = True

    create_charts(ws)

    merge_value(ws, "A56:G56", "门店明细-动销TOP5", bold=True, align="left")
    top_headers = ["门店名称", "销售数量", "销售金额", "库存数量", "库存金额", "库存天数", "排名"]
    write_header(ws, 57, top_headers)
    top_rows = [
        ["保定定州万达店", 50, 1344.9, 315, 5156.5, 6.3, 1],
        ["天津SM店", 47, 1259.9, 333, 5451.1, 7.1, 2],
        ["广州海珠丽影广场店", 38, 1022.2, 286, 4681.8, 7.5, 3],
        ["兰州城关万达店", 37, 993.8, 206, 3372.1, 5.6, 4],
        ["沈阳浑南龙湖店", 36, 962.4, 310, 5074.7, 8.6, 5],
    ]
    write_table_rows(ws, 58, top_rows)

    write_table_rows(ws, 64, [["广州花都融创茂店", "", "", "", "", "", ""]], highlight_first=True)
    ws["A64"].font = Font(name="微软雅黑", bold=True, size=10)
    ws["A64"].alignment = Alignment(horizontal="left", vertical="center")
    ws["B64"] = 12
    ws["C64"] = 322.8
    ws["D64"] = 201
    ws["E64"] = 3290.3
    ws["F64"] = 16.8
    ws["G64"] = 4
    for cell in ws[64][0:7]:
        cell.border = border
        cell.alignment = Alignment(horizontal="center", vertical="center")

    detail_rows = [
        ["深圳光明大仟里店", 12, 322.8, "", 2782.8, 14.2, ""],
        ["深圳南山京东酒馆店", 7, 188.3, "", 2226.3, 19.4, ""],
        ["深圳罗湖金光华店", 7, 188.3, "", 2029.9, 17.7, ""],
        ["重庆云阳滨江大道店", 8, 215.2, "", 1718.8, 13.1, ""],
        ["杭州滨江宝龙店", 2, 53.8, "", 376.5, 11.5, ""],
        ["西安阳光天地店", 2, 53.8, "", 1195, 36.5, ""],
        ["合肥瑶海万达店", 0, 0, "", 409.3, "#NUM!", ""],
        ["合肥旺东风大道店", 0, 0, "", 409.3, "#NUM!", ""],
        ["合肥肥东吾悦店", 0, 0, "", 409.3, "#NUM!", ""],
        ["合肥宝文店", 0, 0, "", 409.3, "#NUM!", ""],
        ["合肥瑶海n7店", 0, 0, "", 409.3, "#NUM!", ""],
        ["巢湖万达店", 0, 0, "", 409.3, "#NUM!", ""],
        ["惠州大亚湾万达店", 0, 0, "", 30.8, "#NUM!", ""],
        ["成都锦江交华店", 0, 0, "", 123.2, "#NUM!", ""],
        ["深圳光明大仟里店", 0, 0, "", 1971.2, "#NUM!", ""],
        ["深圳宝安大仟里店", 0, 0, "", 277.2, "#NUM!", ""],
        ["深圳罗湖益田假日店", 0, 0, "", 30.8, "#NUM!", ""],
        ["盐城中南城店", 0, 0, "", 409.3, "#NUM!", ""],
        ["重庆市-较场口站", 0, 0, "", 61.6, "#NUM!", ""],
        ["阜阳商厦中心店", 0, 0, "", 409.2, "#NUM!", ""],
        ["阜阳颍州万达店", 0, 0, "", 409.3, "#NUM!", ""],
    ]
    write_table_rows(ws, 65, detail_rows, highlight_first=True)
    ws.conditional_formatting.add(
        "F65:F85",
        CellIsRule(operator="equal", formula=['"#NUM!"'], fill=PatternFill("solid", fgColor="FCE4D6"), font=Font(color=COLORS["red"], bold=True)),
    )

    bottom_rows = [
        ["成都锦江城市花园店", 30, "", "深圳罗湖金光华店", 11, ""],
        ["重庆市-华福大道站", 29, "", "昆明五华吾悦店", 9, ""],
        ["嘉兴桐乡吾悦店", 28, "", "大厦望府东路彩虹店", 9, ""],
        ["永辉重庆市--万国城站", 28, "", "西安西长安街店", 9, ""],
        ["", "", "", "北京丰科万达店", 9, ""],
    ]
    write_header(ws, 87, ["门店名称", "销量", "", "门店名称", "销量", ""], start_col=1)
    write_table_rows(ws, 88, bottom_rows, start_col=1)

    # Number formats.
    for rng in ["B58:F64", "B65:F85"]:
        for row in ws[rng]:
            for cell in row:
                if isinstance(cell.value, (int, float)):
                    cell.number_format = "#,##0.0"
    for row in range(58, 65):
        ws[f"B{row}"].number_format = "0"
        ws[f"D{row}"].number_format = "0"
        ws[f"G{row}"].number_format = "0"
    for row in range(65, 86):
        ws[f"B{row}"].number_format = "0"

    wb.save(OUTPUT_PATH)

    # Reopen validation.
    check = load_workbook(OUTPUT_PATH, data_only=False)
    assert SHEET_NAME in check.sheetnames
    assert len(check[SHEET_NAME]._charts) == 6
    assert check[SHEET_NAME]["A56"].value == "门店明细-动销TOP5"
    check.close()
    print(OUTPUT_PATH)


if __name__ == "__main__":
    build()
