from pathlib import Path
from datetime import date
import os

from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.enum.style import WD_STYLE_TYPE
from PIL import Image, ImageDraw, ImageFont


OUT_DIR = Path(r"E:\cxy\04-需求管理")
OUT_DIR.mkdir(parents=True, exist_ok=True)
OUT_FILE = Path(os.environ.get("PRD_OUT_FILE", str(OUT_DIR / "PRD-OMS发货单拆单与合单功能-v1.0.docx")))
ASSET_DIR = Path(r"E:\cxy\.codex-tools\prd_split_merge_assets")
ASSET_DIR.mkdir(parents=True, exist_ok=True)

BLUE = "2E74B5"
DARK_BLUE = "1F4D78"
INK = "243447"
LIGHT_BLUE = "E8F2FB"
LIGHT_GRAY = "F2F4F7"
MID_GRAY = "D9E1E8"
MUTED = "667085"
GREEN = "2E7D32"
LIGHT_GREEN = "EAF6EC"
ORANGE = "B35C00"
LIGHT_ORANGE = "FFF3E8"
RED = "9B1C1C"
LIGHT_RED = "FDECEC"
WHITE = "FFFFFF"


def rgb(hex_color):
    return RGBColor.from_string(hex_color)


def set_run_font(run, name="Microsoft YaHei", size=None, color=None, bold=None, italic=None):
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rfonts = rpr.rFonts
    if rfonts is None:
        rfonts = OxmlElement("w:rFonts")
        rpr.insert(0, rfonts)
    for attr in ("ascii", "hAnsi", "eastAsia"):
        rfonts.set(qn(f"w:{attr}"), name)
    if size is not None:
        run.font.size = Pt(size)
    if color is not None:
        run.font.color.rgb = rgb(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic


def set_repeat_table_header(row):
    tr_pr = row._tr.get_or_add_trPr()
    tbl_header = OxmlElement("w:tblHeader")
    tbl_header.set(qn("w:val"), "true")
    tr_pr.append(tbl_header)


def prevent_row_split(row):
    tr_pr = row._tr.get_or_add_trPr()
    cant_split = OxmlElement("w:cantSplit")
    tr_pr.append(cant_split)


def set_cell_shading(cell, fill):
    tc_pr = cell._tc.get_or_add_tcPr()
    shd = tc_pr.find(qn("w:shd"))
    if shd is None:
        shd = OxmlElement("w:shd")
        tc_pr.append(shd)
    shd.set(qn("w:fill"), fill)


def set_cell_margins(cell, top=80, start=120, bottom=80, end=120):
    tc = cell._tc
    tc_pr = tc.get_or_add_tcPr()
    tc_mar = tc_pr.first_child_found_in("w:tcMar")
    if tc_mar is None:
        tc_mar = OxmlElement("w:tcMar")
        tc_pr.append(tc_mar)
    for m, v in (("top", top), ("start", start), ("bottom", bottom), ("end", end)):
        node = tc_mar.find(qn(f"w:{m}"))
        if node is None:
            node = OxmlElement(f"w:{m}")
            tc_mar.append(node)
        node.set(qn("w:w"), str(v))
        node.set(qn("w:type"), "dxa")


def set_table_geometry(table, widths_dxa, indent=120):
    total = sum(widths_dxa)
    table.autofit = False
    table.alignment = WD_TABLE_ALIGNMENT.LEFT
    tbl_pr = table._tbl.tblPr
    layout = tbl_pr.find(qn("w:tblLayout"))
    if layout is None:
        layout = OxmlElement("w:tblLayout")
        tbl_pr.append(layout)
    layout.set(qn("w:type"), "fixed")
    tbl_w = tbl_pr.find(qn("w:tblW"))
    if tbl_w is None:
        tbl_w = OxmlElement("w:tblW")
        tbl_pr.append(tbl_w)
    tbl_w.set(qn("w:w"), str(total))
    tbl_w.set(qn("w:type"), "dxa")
    tbl_ind = tbl_pr.find(qn("w:tblInd"))
    if tbl_ind is None:
        tbl_ind = OxmlElement("w:tblInd")
        tbl_pr.append(tbl_ind)
    tbl_ind.set(qn("w:w"), str(indent))
    tbl_ind.set(qn("w:type"), "dxa")

    grid = table._tbl.tblGrid
    for child in list(grid):
        grid.remove(child)
    for width in widths_dxa:
        col = OxmlElement("w:gridCol")
        col.set(qn("w:w"), str(width))
        grid.append(col)

    for row in table.rows:
        prevent_row_split(row)
        for idx, cell in enumerate(row.cells):
            width = widths_dxa[min(idx, len(widths_dxa) - 1)]
            tc_pr = cell._tc.get_or_add_tcPr()
            tc_w = tc_pr.find(qn("w:tcW"))
            if tc_w is None:
                tc_w = OxmlElement("w:tcW")
                tc_pr.append(tc_w)
            tc_w.set(qn("w:w"), str(width))
            tc_w.set(qn("w:type"), "dxa")
            set_cell_margins(cell)
            cell.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER


def set_paragraph_border_bottom(paragraph, color=BLUE, size=14, space=6):
    p_pr = paragraph._p.get_or_add_pPr()
    p_bdr = p_pr.find(qn("w:pBdr"))
    if p_bdr is None:
        p_bdr = OxmlElement("w:pBdr")
        p_pr.append(p_bdr)
    bottom = OxmlElement("w:bottom")
    bottom.set(qn("w:val"), "single")
    bottom.set(qn("w:sz"), str(size))
    bottom.set(qn("w:space"), str(space))
    bottom.set(qn("w:color"), color)
    p_bdr.append(bottom)


def set_cell_text(cell, text, bold=False, color=INK, size=9.5, align=None):
    cell.text = ""
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.12
    if align is not None:
        p.alignment = align
    run = p.add_run(str(text))
    set_run_font(run, size=size, color=color, bold=bold)


def add_rich_cell(cell, lines, size=9.3):
    cell.text = ""
    for i, item in enumerate(lines):
        p = cell.paragraphs[0] if i == 0 else cell.add_paragraph()
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(1)
        p.paragraph_format.line_spacing = 1.08
        if isinstance(item, tuple):
            label, value = item
            r = p.add_run(label)
            set_run_font(r, size=size, color=MUTED, bold=True)
            r = p.add_run(value)
            set_run_font(r, size=size, color=INK)
        else:
            r = p.add_run(str(item))
            set_run_font(r, size=size, color=INK)


def style_table(table, header=True, widths=None, header_fill=LIGHT_GRAY, font_size=9.3):
    table.style = "Table Grid"
    if widths:
        set_table_geometry(table, widths)
    if header and table.rows:
        set_repeat_table_header(table.rows[0])
        for cell in table.rows[0].cells:
            set_cell_shading(cell, header_fill)
            for p in cell.paragraphs:
                for run in p.runs:
                    set_run_font(run, size=font_size, color=DARK_BLUE, bold=True)
    for row in table.rows:
        for cell in row.cells:
            set_cell_margins(cell)
            for p in cell.paragraphs:
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(1)
                p.paragraph_format.line_spacing = 1.08
                for run in p.runs:
                    if not (header and row is table.rows[0]):
                        set_run_font(run, size=font_size, color=INK)


def add_table(doc, headers, rows, widths, header_fill=LIGHT_GRAY, font_size=9.2):
    table = doc.add_table(rows=1, cols=len(headers))
    for i, h in enumerate(headers):
        set_cell_text(table.rows[0].cells[i], h, bold=True, color=DARK_BLUE, size=font_size)
    for values in rows:
        cells = table.add_row().cells
        for i, value in enumerate(values):
            set_cell_text(cells[i], value, size=font_size)
    style_table(table, header=True, widths=widths, header_fill=header_fill, font_size=font_size)
    return table


def add_callout(doc, title, text, kind="info"):
    palette = {
        "info": (LIGHT_BLUE, BLUE),
        "success": (LIGHT_GREEN, GREEN),
        "warn": (LIGHT_ORANGE, ORANGE),
        "risk": (LIGHT_RED, RED),
    }
    fill, accent = palette[kind]
    table = doc.add_table(rows=1, cols=1)
    set_table_geometry(table, [9360])
    set_repeat_table_header(table.rows[0])
    cell = table.cell(0, 0)
    set_cell_shading(cell, fill)
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(title)
    set_run_font(r, size=10.5, color=accent, bold=True)
    p = cell.add_paragraph()
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.15
    r = p.add_run(text)
    set_run_font(r, size=10, color=INK)
    doc.add_paragraph().paragraph_format.space_after = Pt(0)
    return table


def add_para(doc, text="", bold_lead=None, style=None, color=INK, size=10.5, after=6, keep=False):
    p = doc.add_paragraph(style=style)
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.10
    p.paragraph_format.keep_with_next = keep
    if bold_lead and text.startswith(bold_lead):
        r = p.add_run(bold_lead)
        set_run_font(r, size=size, color=color, bold=True)
        r = p.add_run(text[len(bold_lead):])
        set_run_font(r, size=size, color=color)
    else:
        r = p.add_run(text)
        set_run_font(r, size=size, color=color)
    return p


def add_bullets(doc, items, level=0):
    for item in items:
        p = doc.add_paragraph(style="List Bullet" if level == 0 else "List Bullet 2")
        p.paragraph_format.left_indent = Inches(0.5 if level == 0 else 0.75)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.line_spacing = 1.167
        if isinstance(item, tuple):
            lead, rest = item
            r = p.add_run(lead)
            set_run_font(r, size=10.3, color=INK, bold=True)
            r = p.add_run(rest)
            set_run_font(r, size=10.3, color=INK)
        else:
            r = p.add_run(item)
            set_run_font(r, size=10.3, color=INK)


def add_numbered(doc, items):
    for item in items:
        p = doc.add_paragraph(style="List Number")
        p.paragraph_format.left_indent = Inches(0.5)
        p.paragraph_format.first_line_indent = Inches(-0.25)
        p.paragraph_format.space_after = Pt(5)
        p.paragraph_format.line_spacing = 1.167
        r = p.add_run(item)
        set_run_font(r, size=10.3, color=INK)


def add_heading(doc, text, level=1, page_break=False):
    if page_break:
        doc.add_page_break()
    p = doc.add_heading(text, level=level)
    p.paragraph_format.keep_with_next = True
    return p


def add_caption(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(3)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(text)
    set_run_font(r, size=9, color=MUTED, italic=True)


def font_path(bold=False):
    candidates = [
        Path(r"C:\Windows\Fonts\msyhbd.ttc") if bold else Path(r"C:\Windows\Fonts\msyh.ttc"),
        Path(r"C:\Windows\Fonts\simhei.ttf"),
        Path(r"C:\Windows\Fonts\simsun.ttc"),
    ]
    for p in candidates:
        if p.exists():
            return str(p)
    return None


def draw_rounded_box(draw, box, fill, outline, title, subtitle=None, width=2):
    draw.rounded_rectangle(box, radius=18, fill=fill, outline=outline, width=width)
    x1, y1, x2, y2 = box
    f1 = ImageFont.truetype(font_path(True), 30)
    f2 = ImageFont.truetype(font_path(False), 23)
    if subtitle:
        draw.text(((x1 + x2) / 2, y1 + 40), title, fill="#18324B", font=f1, anchor="mm")
        draw.text(((x1 + x2) / 2, y1 + 86), subtitle, fill="#506070", font=f2, anchor="mm")
    else:
        draw.text(((x1 + x2) / 2, (y1 + y2) / 2), title, fill="#18324B", font=f1, anchor="mm")


def arrow(draw, start, end, color="#6B7C8E", width=5):
    draw.line([start, end], fill=color, width=width)
    ex, ey = end
    sx, sy = start
    if abs(ex - sx) >= abs(ey - sy):
        sign = 1 if ex > sx else -1
        pts = [(ex, ey), (ex - 18 * sign, ey - 10), (ex - 18 * sign, ey + 10)]
    else:
        sign = 1 if ey > sy else -1
        pts = [(ex, ey), (ex - 10, ey - 18 * sign), (ex + 10, ey - 18 * sign)]
    draw.polygon(pts, fill=color)


def make_process_diagram(path):
    img = Image.new("RGB", (1800, 860), "white")
    d = ImageDraw.Draw(img)
    title_font = ImageFont.truetype(font_path(True), 38)
    label_font = ImageFont.truetype(font_path(True), 25)
    small = ImageFont.truetype(font_path(False), 22)
    d.text((60, 38), "发货单拆合总体流程", fill="#173A5E", font=title_font)
    d.text((60, 92), "发货管理使用双Tab承载不同状态的订单，拆合结果始终生成新的当前有效发货单。", fill="#5D6B78", font=small)
    d.text((65, 190), "发货订单 Tab", fill="#2E74B5", font=label_font)
    d.text((65, 535), "旺店通驳回订单 Tab", fill="#9B1C1C", font=label_font)

    boxes_top = [
        ((235, 155, 515, 285), "当前有效发货单", "未同步旺店通"),
        ((625, 155, 905, 285), "人工拆单 / 合单", "按温层快捷拆分 / 自定义"),
        ((1015, 155, 1295, 285), "生成结果发货单", "原单停止执行"),
        ((1405, 155, 1690, 285), "同步旺店通", "仅同步最新结果单"),
    ]
    for b, t, s in boxes_top:
        draw_rounded_box(d, b, "#EAF4FD", "#77B5E8", t, s)
    for a, b in zip(boxes_top, boxes_top[1:]):
        arrow(d, (a[0][2] + 10, 220), (b[0][0] - 10, 220))

    draw_rounded_box(d, (235, 500, 515, 630), "#FDECEC", "#D98787", "旺店通状态查询", "仅获知：已驳回")
    draw_rounded_box(d, (625, 500, 905, 630), "#FFF3E8", "#E8A55A", "人工拆单 / 合单", "温层快捷拆分 / 自定义")
    draw_rounded_box(d, (1015, 500, 1295, 630), "#EAF6EC", "#77B980", "标记已处理", "结果进入拆/合单管理")
    draw_rounded_box(d, (1405, 500, 1690, 630), "#EAF4FD", "#77B5E8", "新结果发货单", "重新同步旺店通")
    for x1, x2 in ((515, 625), (905, 1015), (1295, 1405)):
        arrow(d, (x1 + 10, 565), (x2 - 10, 565))

    d.rounded_rectangle((235, 720, 1690, 805), radius=14, fill="#F4F6F9", outline="#D9E1E8", width=2)
    d.text((962, 762), "若拆合结果再次被驳回：新增驳回记录并关联来源拆合编号，不覆盖历史链路。", fill="#4D5C6A", font=small, anchor="mm")
    img.save(path)


def make_relation_diagram(path):
    img = Image.new("RGB", (1800, 520), "white")
    d = ImageDraw.Draw(img)
    title_font = ImageFont.truetype(font_path(True), 38)
    small = ImageFont.truetype(font_path(False), 22)
    d.text((60, 38), "多级拆合关系示例", fill="#173A5E", font=title_font)
    d.text((60, 92), "拆单子单可以与其他未同步发货单再次合单；每一步均保留来源与结果映射。", fill="#5D6B78", font=small)
    boxes = [
        ((70, 185, 340, 340), "原订单 O001", "原发货单 F001"),
        ((420, 185, 690, 340), "拆单 SP001", "子单 F001-1 / F001-2"),
        ((770, 185, 1040, 340), "当前子单 F001-2", "＋ 其他未同步单 F002"),
        ((1120, 185, 1390, 340), "合单 MG001", "生成合并单 HF001"),
        ((1470, 185, 1740, 340), "最终有效发货单", "HF001 → 旺店通"),
    ]
    fills = ["#F4F6F9", "#F0EBFA", "#FFF3E8", "#EAF4FD", "#EAF6EC"]
    outlines = ["#AAB4BE", "#9D82CF", "#E8A55A", "#77B5E8", "#77B980"]
    for (b, t, s), fill, outline in zip(boxes, fills, outlines):
        draw_rounded_box(d, b, fill, outline, t, s)
    for a, b in zip(boxes, boxes[1:]):
        arrow(d, (a[0][2] + 10, 262), (b[0][0] - 10, 262))
    d.text((900, 425), "原则：只有当前有效且未同步的叶子发货单可继续拆合或同步。", fill="#2E74B5", font=small, anchor="mm")
    img.save(path)


def make_return_relation_diagram(path):
    img = Image.new("RGB", (1800, 860), "white")
    d = ImageDraw.Draw(img)
    title_font = ImageFont.truetype(font_path(True), 38)
    lane_font = ImageFont.truetype(font_path(True), 25)
    small = ImageFont.truetype(font_path(False), 22)
    note_font = ImageFont.truetype(font_path(True), 21)
    d.text((60, 38), "售后订单与旺店通退款、退货推送关系", fill="#173A5E", font=title_font)
    d.text((60, 92), "退款、退货均由售后订单发起；售后完成后，系统向旺店通推送1条售后数据。", fill="#5D6B78", font=small)

    d.multiline_text((65, 150), "发货前\n退款 / 取消", fill="#B35C00", font=lane_font, spacing=8)
    before_boxes = [
        ((245, 140, 515, 285), "原订单商品行", "发起售后订单"),
        ((610, 140, 880, 285), "售后处理中", "数量占用，不推送"),
        ((975, 140, 1245, 285), "售后已完成", "扣减剩余履约数量"),
        ((1340, 140, 1610, 285), "推送旺店通", "仅1条售后数据"),
    ]
    before_fills = ["#F4F6F9", "#FFF3E8", "#EAF4FD", "#EAF6EC"]
    before_outlines = ["#AAB4BE", "#E8A55A", "#77B5E8", "#77B980"]
    for (b, t, s), fill, outline in zip(before_boxes, before_fills, before_outlines):
        draw_rounded_box(d, b, fill, outline, t, s)
    for a, b in zip(before_boxes, before_boxes[1:]):
        arrow(d, (a[0][2] + 10, 212), (b[0][0] - 10, 212))
    arrow(d, (1108, 295), (1108, 390), color="#D98787")
    draw_rounded_box(d, (975, 400, 1245, 505), "#FDECEC", "#D98787", "剩余数量 ＝ 0", "当前发货单失效")
    d.text((1125, 350), "若剩余履约量为0", fill="#9B1C1C", font=note_font, anchor="mm")

    d.text((65, 617), "发货后退货", fill="#2E74B5", font=lane_font)
    after_boxes = [
        ((245, 570, 515, 715), "原订单商品行", "发起售后订单"),
        ((610, 570, 880, 715), "拆 / 合来源映射", "关联实际发货明细"),
        ((975, 570, 1245, 715), "售后已完成", "汇总全部履约明细"),
        ((1340, 570, 1610, 715), "推送旺店通", "仅1条售后数据"),
    ]
    after_fills = ["#F4F6F9", "#F0EBFA", "#EAF4FD", "#EAF6EC"]
    after_outlines = ["#AAB4BE", "#9D82CF", "#77B5E8", "#77B980"]
    for (b, t, s), fill, outline in zip(after_boxes, after_fills, after_outlines):
        draw_rounded_box(d, b, fill, outline, t, s)
    for a, b in zip(after_boxes, after_boxes[1:]):
        arrow(d, (a[0][2] + 10, 642), (b[0][0] - 10, 642))
    d.rounded_rectangle((245, 770, 1610, 830), radius=14, fill="#F4F6F9", outline="#D9E1E8", width=2)
    d.text((927, 800), "一张售后订单完成只推送1条数据；多个拆单子单或合单来源作为同一条售后数据的履约明细。", fill="#4D5C6A", font=small, anchor="mm")
    img.save(path)


def add_page_number(paragraph):
    paragraph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    run = paragraph.add_run("第 ")
    set_run_font(run, size=9, color=MUTED)
    fld_char1 = OxmlElement("w:fldChar")
    fld_char1.set(qn("w:fldCharType"), "begin")
    instr_text = OxmlElement("w:instrText")
    instr_text.set(qn("xml:space"), "preserve")
    instr_text.text = " PAGE "
    fld_char2 = OxmlElement("w:fldChar")
    fld_char2.set(qn("w:fldCharType"), "end")
    run._r.append(fld_char1)
    run._r.append(instr_text)
    run._r.append(fld_char2)
    run2 = paragraph.add_run(" 页")
    set_run_font(run2, size=9, color=MUTED)


def setup_styles(doc):
    normal = doc.styles["Normal"]
    normal.font.name = "Microsoft YaHei"
    normal._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
    normal.font.size = Pt(10.5)
    normal.font.color.rgb = rgb(INK)
    normal.paragraph_format.space_after = Pt(6)
    normal.paragraph_format.line_spacing = 1.10

    for style_name, size, color, before, after in (
        ("Heading 1", 16, BLUE, 16, 8),
        ("Heading 2", 13, BLUE, 12, 6),
        ("Heading 3", 11.5, DARK_BLUE, 8, 4),
    ):
        style = doc.styles[style_name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(size)
        style.font.bold = True
        style.font.color.rgb = rgb(color)
        style.paragraph_format.space_before = Pt(before)
        style.paragraph_format.space_after = Pt(after)
        style.paragraph_format.keep_with_next = True

    for style_name in ("List Bullet", "List Bullet 2", "List Number"):
        style = doc.styles[style_name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(10.3)
        style.font.color.rgb = rgb(INK)

    if "PRD Small" not in [s.name for s in doc.styles]:
        style = doc.styles.add_style("PRD Small", WD_STYLE_TYPE.PARAGRAPH)
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.size = Pt(9)
        style.font.color.rgb = rgb(MUTED)
        style.paragraph_format.space_after = Pt(3)


def build_doc():
    process_img = ASSET_DIR / "overall-process.png"
    relation_img = ASSET_DIR / "relation-chain.png"
    return_relation_img = ASSET_DIR / "return-relation.png"
    make_process_diagram(process_img)
    make_relation_diagram(relation_img)
    make_return_relation_diagram(return_relation_img)

    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)
    section.header_distance = Inches(0.492)
    section.footer_distance = Inches(0.492)
    setup_styles(doc)

    header = section.header
    hp = header.paragraphs[0]
    hp.paragraph_format.space_after = Pt(0)
    hr = hp.add_run("产品需求文档（PRD）")
    set_run_font(hr, size=8.5, color=MUTED, bold=True)
    hr = hp.add_run("                                               OMS发货单拆单与合单")
    set_run_font(hr, size=8.5, color=MUTED)
    set_paragraph_border_bottom(hp, color=MID_GRAY, size=6, space=3)
    add_page_number(section.footer.paragraphs[0])

    # Memo masthead
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("PRODUCT REQUIREMENTS DOCUMENT")
    set_run_font(r, size=9.5, color=BLUE, bold=True)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(5)
    r = p.add_run("OMS发货单拆单与合单功能")
    set_run_font(r, size=25, color=INK, bold=True)

    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("覆盖未同步旺店通、旺店通已驳回及多级拆合重组场景")
    set_run_font(r, size=12.5, color=MUTED)

    metadata = [
        ("文档版本", "v1.0"),
        ("文档状态", "评审稿"),
        ("所属系统", "OMS订单系统 / 发货管理"),
        ("关联平台", "旺店通"),
        ("需求负责人", "陈薪宇"),
        ("编制日期", "2026-08-28"),
        ("原型文件", "旺店通拆合单交互演示.html"),
    ]
    for label, value in metadata:
        p = doc.add_paragraph()
        p.paragraph_format.space_after = Pt(2)
        r = p.add_run(f"{label}：")
        set_run_font(r, size=10.3, color=MUTED, bold=True)
        r = p.add_run(value)
        set_run_font(r, size=10.3, color=INK)
    rule = doc.add_paragraph()
    rule.paragraph_format.space_after = Pt(14)
    set_paragraph_border_bottom(rule, color=BLUE, size=16, space=8)

    add_callout(
        doc,
        "核心产品定义",
        "系统以“当前有效发货单”为操作对象：发货管理统一设置“发货订单 / 旺店通驳回订单”两个Tab。未同步旺店通的发货单在发货订单Tab直接拆合；已同步后仅当主动查询到旺店通状态为“已驳回”时，才在旺店通驳回订单Tab处理。每次拆合生成新的有效发货单，历史关系永久保留。",
        "info",
    )

    add_heading(doc, "1. 需求背景", 1)
    add_para(doc, "当前业务流程为：OMS接收订单并生成发货单，随后通过接口同步至第三方平台旺店通，由旺店通承接后续仓储发货执行。历史上，若订单需要拆单，由业务人员在旺店通内完成。")
    add_para(doc, "旺店通拆单后会生成新的第三方单号，而OMS仍持有原发货单及原旺店通单号，导致物流、出库、售后回传时无法稳定匹配，形成数据断链。")
    add_para(doc, "同时，旺店通目前不会主动推送驳回详情。OMS只能通过接口主动查询订单状态，并且仅能获知“已驳回”，无法获得驳回原因、错误类型或拆合建议。因此，需要由业务人员结合订单信息，在OMS内决定并执行拆单或合单。")
    add_para(doc, "随着范围进一步明确，拆合能力不仅用于旺店通驳回后的补救，也应支持尚未同步旺店通的新发货单。拆单生成的子发货单、合单生成的合并发货单，只要仍是当前有效且未同步的单据，均可以继续参与下一次拆合。")
    add_para(doc, "当前退款、退货流程统一通过售后订单发起。售后订单完成后，OMS向旺店通推送1条售后数据。由于发货单可能经历拆单或合单，系统需在售后订单中保留原订单商品行与实际发货单商品行的数量映射，但不得按多个拆单子单或合单来源重复推送多条旺店通数据。")

    add_heading(doc, "2. 业务目标", 1)
    add_bullets(doc, [
        ("完整溯源：", "建立“原始订单—原发货单—拆合批次—结果发货单—旺店通单”的稳定关系链。"),
        ("统一操作：", "所有发货单重组均在OMS完成，旺店通只接收OMS生成的当前有效发货单。"),
        ("前置处理：", "新发货单尚未同步旺店通时即可拆单或合单，减少先同步、再驳回、再处理的无效往返。"),
        ("拆单提效：", "根据商品常温、冷藏、冷冻温层一键生成拆分方案，同时保留自定义数量分配能力。"),
        ("多级重组：", "支持拆单子单再合单、合并发货单再拆单或追加合单，并保留完整历史链路。"),
        ("售后闭环：", "退款、退货由售后订单发起；售后完成后向旺店通幂等推送1条数据，同时保留原订单与实际发货单的数量映射。"),
        ("可控同步：", "确保同一业务链中只有当前有效的叶子发货单可以同步旺店通，避免重复发货。"),
        ("简单闭环：", "驳回订单仅区分未处理与已处理；处理完成后统一进入“拆/合单管理”，通过拆单记录、合单记录Tab查看。"),
    ])
    add_callout(doc, "成功判定", "旺店通回传或查询到的新单号能够唯一定位OMS当前有效发货单，并进一步追溯到每个原订单及商品数量来源。", "success")

    add_heading(doc, "3. 用户痛点", 1)
    add_table(
        doc,
        ["用户角色", "当前痛点", "期望改善"],
        [
            ["发货运营人员", "必须切换旺店通拆单；拆后新单号在OMS中找不到对应关系。", "在OMS内直接拆合，并能查看全部来源与结果单据。"],
            ["订单/客服人员", "无法根据物流或旺店通单号准确追溯原订单，售后定位耗时。", "通过任一订单号、发货单号或旺店通单号定位完整链路。"],
            ["技术支持人员", "第三方拆单产生不可控新号；异常排查依赖人工比对。", "由OMS生成并保存每个结果发货单及接口映射。"],
            ["业务负责人", "缺少拆合记录，无法确认是谁在何时以什么数量完成重组。", "拆/合单管理统一保留操作人、时间、来源、结果和商品数量。"],
        ],
        [1500, 3880, 3980],
        font_size=8.9,
    )

    add_heading(doc, "4. 功能范围", 1, page_break=True)
    add_heading(doc, "4.1 功能模块", 2)
    add_table(
        doc,
        ["模块", "功能范围", "页面定位"],
        [
            ["发货管理", "统一设置“发货订单 / 旺店通驳回订单”Tab。发货订单Tab支持未同步旺店通的普通发货单、拆单子单、合并发货单直接拆合；旺店通驳回订单Tab展示接口查询到的已驳回订单，人工完成拆合后标记已处理。", "统一操作页面 + 双Tab"],
            ["拆单操作", "提供“按温层快捷拆分 / 自定义拆分”两种方式。快捷模式按常温、冷藏、冷冻自动归组；自定义模式支持增加、删除子发货单并手工分配商品数量。", "拆分方式选择、数量分配与确认"],
            ["合单操作", "从符合条件的未同步或已驳回发货单中选择至少两单，生成一个合并发货单。", "来源选择、差异校验与确认"],
            ["拆/合单管理", "合并原拆单管理、合单管理为一个菜单；页面使用“拆单记录 / 合单记录”Tab切换。拆单记录按“处理前→处理后”展示，合单记录按“处理后→处理前”展示。", "统一结果档案，不承载处理状态"],
            ["关联单据", "展示多级拆合链、当前有效发货单和旺店通映射。", "全链路追溯"],
            ["售后订单与旺店通联动", "复用现有售后退款模块：退款、退货由售后订单发起；售后完成后向旺店通推送1条数据，并关联原订单商品行与实际发货单商品行。", "发货管理关联入口 + 售后退款流程"],
        ],
        [1600, 5100, 2660],
        font_size=8.8,
    )

    add_heading(doc, "4.2 允许操作场景", 2)
    add_table(
        doc,
        ["场景", "允许操作", "入口", "结果"],
        [
            ["新发货单未同步旺店通", "拆单、合单", "发货管理 > 发货订单Tab", "生成新的未同步发货单"],
            ["拆单子单未同步旺店通", "继续拆单；与其他单合单", "发货管理 > 发货订单Tab", "保留原单→拆单→再拆/合关系"],
            ["合并发货单未同步旺店通", "拆单；追加合单", "发货管理 > 发货订单Tab", "生成下一层结果单"],
            ["旺店通已接收", "不允许拆合", "无", "继续正常发货"],
            ["旺店通查询为已驳回", "拆单、合单", "发货管理 > 旺店通驳回订单Tab", "完成后标记已处理"],
            ["拆合结果再次被驳回", "再次拆单或合单", "发货管理 > 旺店通驳回订单Tab", "新增关系层，不覆盖历史"],
            ["发货前发生退款或取消", "通过售后订单发起；处理中占用数量，完成后扣减剩余履约量", "售后退款模块 / 发货管理售后影响", "售后完成后向旺店通推送1条数据；全量取消时当前发货单失效"],
            ["发货后发生退货", "通过售后订单发起，并映射实际发货单明细", "售后退款模块 / 发货管理退货关联", "售后完成后汇总映射并向旺店通推送1条数据"],
        ],
        [2700, 2200, 2000, 2460],
        font_size=8.7,
    )

    add_heading(doc, "5. 优先级说明", 1)
    add_table(
        doc,
        ["优先级", "范围", "说明 / 验收重点"],
        [
            ["P0", "发货管理双Tab", "同一页面设置发货订单、旺店通驳回订单Tab，切换时保留各自查询条件。"],
            ["P0", "发货订单前置拆合", "未同步旺店通的当前有效发货单可拆合；已接收单据不可操作。"],
            ["P0", "驳回订单处理", "在旺店通驳回订单Tab主动查询状态；仅展示已驳回；完成拆合后直接标记已处理。"],
            ["P0", "拆单方式与数量分配", "支持按常温、冷藏、冷冻快捷拆分及自定义拆分；整数、非负、无空子单、所有子单数量合计等于原单。"],
            ["P0", "合单校验", "至少两单；均为可操作单据；客户、收件人、手机号、地址一致。"],
            ["P0", "多级拆合与当前有效单", "拆后可合、合后可拆；只有最新有效叶子单可同步。"],
            ["P0", "拆/合单管理统一页面", "合并菜单并提供拆单记录、合单记录Tab；拆单先展示处理前订单，合单先展示处理后订单。"],
            ["P0", "关系映射与档案", "原订单、原发货单、拆合批次、结果单和旺店通单可双向追溯。"],
            ["P0", "接口幂等与提交复核", "重复点击不得生成重复发货单；提交前再次确认来源单仍可处理。"],
            ["P0", "售后订单关联与旺店通推送", "保存原订单商品行与实际发货单商品行映射；售后完成后按售后订单维度向旺店通幂等推送1条数据，失败可重试但不得重复建单。"],
            ["P1", "查询、导出与来源标识", "按各类单号、客户、时间查询；再次驳回显示来源拆合编号。"],
            ["P2", "效率增强", "批量拆合、自动候选推荐、复杂地址标准化等后续优化。"],
        ],
        [900, 2700, 5760],
        font_size=8.6,
    )
    add_callout(doc, "P0发布门槛", "必须先保证单据有效性、商品数量守恒、合单准入、关系可追溯和接口幂等，再考虑批量与智能推荐。", "warn")

    add_heading(doc, "6. 原型或流程图", 1, page_break=True)
    add_heading(doc, "6.1 总体业务流程", 2)
    doc.add_picture(str(process_img), width=Inches(6.45))
    doc.inline_shapes[-1]._inline.docPr.set("title", "总体业务流程图")
    doc.inline_shapes[-1]._inline.docPr.set("descr", "展示发货管理内发货订单与旺店通驳回订单两个Tab的拆合流程，处理完成后进入拆单或合单结果档案。")
    add_caption(doc, "图1  发货管理双Tab拆合流程")
    add_heading(doc, "6.2 多级拆合关系", 2)
    doc.add_picture(str(relation_img), width=Inches(6.45))
    doc.inline_shapes[-1]._inline.docPr.set("title", "多级拆合关系图")
    doc.inline_shapes[-1]._inline.docPr.set("descr", "展示原发货单拆成子单后，子单与其他未同步发货单合并，并保留原订单数量来源的关系链。")
    add_caption(doc, "图2  拆单子单与其他未同步发货单再次合单")
    add_heading(doc, "6.3 售后订单与旺店通推送关系图", 2)
    add_para(doc, "本图仅用于PRD评审时说明售后订单、拆合映射及旺店通推送关系，不作为系统内退款关联页面的展示组件。系统页面直接展示售后订单状态、数量摘要、关联明细和旺店通推送结果。", color=MUTED, size=9.2, after=5)
    doc.add_picture(str(return_relation_img), width=Inches(6.45))
    doc.inline_shapes[-1]._inline.docPr.set("title", "售后订单与旺店通推送关系图")
    doc.inline_shapes[-1]._inline.docPr.set("descr", "展示退款或退货通过售后订单发起，售后完成后向旺店通推送1条数据；拆合后的多个实际发货明细作为同一售后数据的来源映射。")
    add_caption(doc, "图3  售后订单完成后向旺店通推送1条数据")
    add_heading(doc, "6.4 页面原型对应关系", 2)
    add_table(
        doc,
        ["原型页面", "核心交互"],
        [
            ["发货管理", "同一页面使用“发货订单 / 旺店通驳回订单”Tab切换。筛选区采用标签在上、输入框在下的紧凑两行布局，搜索、重置、导出按钮固定在右侧。发货订单Tab对未同步单据显示拆单、合单；旺店通驳回订单Tab可主动刷新状态、处理未处理订单，完成后显示已处理和结果入口。"],
            ["拆单弹窗", "展示原商品、原数量和温层，并提供“按温层快捷拆分 / 自定义拆分”切换。快捷模式自动生成温层子单，自定义模式开放商品数量输入；两种模式均实时校验数量。"],
            ["合单弹窗", "选择至少两张可操作发货单；展示收件信息差异及商品来源；确认合并结果。"],
            ["拆/合单管理", "一个菜单、一个页面；通过“拆单记录 / 合单记录”Tab切换。筛选项采用紧凑型单行布局，字段标签位于输入框上方，搜索与重置按钮同行靠右。拆单记录先展示处理前订单、再展示子单；合单记录先展示合并结果、再展示来源订单。不设置待处理、处理中或再次驳回页签。"],
            ["关联单据抽屉", "展示原订单、历次拆合批次、当前有效发货单及旺店通单号。"],
            ["售后订单关联弹窗", "从发货单、驳回订单或拆合记录进入；页面不展示流程图，直接展示售后订单号、售后状态、数量摘要、原订单与实际发货单明细，以及售后完成后的旺店通推送条数、状态、时间和请求号。"],
        ],
        [2500, 6860],
        font_size=9,
    )
    add_para(doc, "交互原型路径：E:\\cxy\\09-设计与原型\\旺店通拆合单交互演示.html", color=MUTED, size=9.2, after=4)

    add_heading(doc, "7. 关键规则", 1, page_break=True)
    add_heading(doc, "7.1 当前有效发货单规则", 2)
    add_bullets(doc, [
        "每个业务关系链可以有多层拆合记录，但任一时刻只能有一组“当前有效叶子发货单”。",
        "发生拆单后，来源发货单停止执行；其生成的各子发货单成为新的当前有效单据。",
        "发生合单后，所有来源发货单停止执行；新合并发货单成为当前有效单据。",
        "只有当前有效且未同步旺店通的发货单可以继续拆合或同步。",
        "已被旺店通接收、已发货、已取消或已被其他拆合操作消费的单据不得再次拆合。",
    ])

    add_heading(doc, "7.2 拆单规则", 2)
    add_table(
        doc,
        ["规则项", "要求"],
        [
            ["操作内容", "只拆商品数量；温层仅作为商品属性和快捷拆分依据，不设置仓库、快递、包装或运费。"],
            ["拆分方式", "提供“按温层快捷拆分”和“自定义拆分”两种方式，默认展示按温层快捷拆分方案，操作人可切换。"],
            ["温层枚举", "商品温层取商品标准资料，限定为常温、冷藏、冷冻；原商品列表和拆分结果均展示温层。"],
            ["温层快捷拆分", "按常温→冷藏→冷冻的固定顺序，对原单实际包含的温层分别生成1张子发货单；同一温层的商品及其全部数量自动进入同一子单，不创建空温层子单。"],
            ["自定义拆分", "不强制按温层归组，操作人可手工调整各子单商品数量并增加或删除子单；页面保留温层标签作为分配参考。"],
            ["方式切换", "切换拆分方式时重新生成弹窗内尚未提交的方案，不改变来源发货单；页面应明确提示当前采用的拆分方式。"],
            ["数量格式", "只能输入大于或等于0的整数。"],
            ["数量守恒", "同一商品在所有子单中的数量合计必须等于来源发货单数量。"],
            ["子单有效性", "至少生成2张子发货单；每张子单至少包含1件商品，不允许空子单。"],
            ["最小可拆条件", "来源发货单可分配商品总数量必须大于等于2。"],
            ["结果", "生成独立子发货单号；每张子单保留原订单号、来源发货单、拆单批次、拆分方式及商品温层快照。"],
            ["售后数量校验", "可拆数量以扣除退款、取消等售后占用后的剩余履约数量为准；确认拆单时必须重新读取最新售后状态和数量，发生变化则阻止提交并刷新方案。"],
        ],
        [2200, 7160],
        font_size=9.1,
    )

    add_heading(doc, "7.3 合单规则", 2)
    add_table(
        doc,
        ["规则项", "要求"],
        [
            ["参与数量", "至少选择2张当前有效发货单；支持2张以上。"],
            ["单据状态", "全部来源单必须未同步旺店通，或在驳回订单中均为已驳回且未处理。"],
            ["收件信息", "客户、收货人、手机号、省市区及详细地址必须一致；任一不一致则禁止合单。"],
            ["商品展示", "相同SKU可在合并结果中汇总展示，但后台必须保留每个数量的原订单来源。"],
            ["原订单归属", "财务、开票、退款、售后仍归属于各原始订单，合单只改变履约发货单。"],
            ["结果", "生成一个合并发货单号，并关联全部来源订单、发货单及上一层拆合批次。"],
            ["售后数量校验", "每张来源单只允许以扣除退款、取消等占用后的剩余履约数量参与合单；确认合单时重新校验，任一来源发生变化则整体阻止提交。"],
        ],
        [2200, 7160],
        font_size=9.1,
    )

    add_heading(doc, "7.4 旺店通驳回处理规则", 2)
    add_bullets(doc, [
        "OMS通过定时任务或人工按钮主动查询旺店通状态；旺店通不主动推送驳回信息。",
        "接口仅返回“已驳回”时，页面不得显示推测的驳回原因或拆合建议。",
        "驳回订单只保留未处理、已处理两种处理结果；不设置锁定和处理中状态。",
        "不加锁，采用乐观校验：拆单或合单提交前，再次校验该驳回订单是否仍为未处理；若已由其他人完成，终止本次提交并刷新页面。",
        "拆合完成后，来源驳回订单直接标记已处理，并保存处理类型及结果编号。",
        "拆合结果重新同步后发生二次驳回时，新增一条驳回记录，并显示来源拆单/合单编号；不得覆盖前一次驳回历史。",
    ])

    add_heading(doc, "7.5 数据与接口规则", 2)
    add_table(
        doc,
        ["对象/字段", "规则"],
        [
            ["拆合批次号", "每次拆单、合单生成唯一批次号，不允许复用。"],
            ["关系类型", "记录拆分来源、拆分结果、合并来源、合并结果。"],
            ["当前有效标识", "结果单生效后，来源单改为非当前有效；只允许当前有效单参与后续操作。"],
            ["同步请求号", "每次向旺店通同步使用唯一且可重复查询的请求号，保证幂等。"],
            ["旺店通映射", "同一OMS关系链可对应多个历史旺店通单号；映射与接口日志仅在后台保存用于排查，不提供独立的同步记录菜单或展示页面。"],
            ["原型商品样例", "交互原型中的商品名称、单位、温层和图片取自《外包商品列表.xls》；该文件仅作为演示数据源，生产环境以商品标准库接口返回的实时资料为准。"],
            ["商品来源明细", "结果发货单的每个商品数量必须能够追溯到原订单商品行，并保存拆单时使用的商品温层快照。"],
            ["退货履约映射", "退货明细同时保存原订单商品行ID、实际发货单商品行ID、售后/退货明细ID及本次映射数量；合单汇总相同SKU时不得丢失原订单数量来源。"],
            ["售后推送记录", "按售后订单保存售后完成时间、旺店通推送状态、接口请求号、首次/最近推送时间、重试次数和返回结果；一张售后订单完成只对应1条旺店通售后数据。"],
            ["审计信息", "保存操作人、操作时间、来源入口、拆合前后快照。"],
        ],
        [2400, 6960],
        font_size=9,
    )

    add_heading(doc, "7.6 拆/合单管理展示规则", 2)
    add_table(
        doc,
        ["规则项", "要求"],
        [
            ["菜单与页面", "左侧菜单仅保留“拆/合单管理”，不再分别设置拆单管理、合单管理。"],
            ["Tab切换", "页面提供“拆单记录”和“合单记录”两个Tab；切换只改变记录类型，筛选区与列表结构保持一致。"],
            ["筛选区布局", "桌面宽屏下6个筛选项与搜索、重置按钮保持一行，字段标签置于输入框上方以减少横向占用；中等宽度自动换为两行，不设置固定高度，不保留无内容空白区域。"],
            ["展示层级", "操作信息固定在记录顶部；订单信息的先后顺序按拆单、合单各自的阅读重点设置。"],
            ["拆单记录", "先展示处理前订单：原订单、原发货单、原商品数量及温层；再展示处理后订单：拆分后的全部子发货单、各自商品数量、温层和拆分方式。"],
            ["合单记录", "先展示处理后订单：合并后的发货单及汇总商品数量；再展示处理前订单：全部来源订单、来源发货单及各自商品数量。"],
            ["状态范围", "只展示已完成拆单或合单的结果，不设置待处理、处理中等处理状态。"],
        ],
        [2200, 7160],
        font_size=9,
    )

    add_heading(doc, "7.7 发货管理筛选布局规则", 2)
    add_bullets(doc, [
        "发货订单Tab的8个基础筛选项按每行4项排列，共两行；字段标签置于输入框上方，避免标签与长输入框争抢横向空间。",
        "旺店通驳回订单Tab增加“处理情况”后，按第一行5项、第二行4项排列，保持两行完成全部筛选项。",
        "搜索、重置、导出按钮作为独立操作区固定在筛选区右侧并与底行对齐，不再单独占据居中的第三行。",
        "筛选容器不设置固定高度；中等宽度下允许按既定列数自然收缩，避免出现大面积无内容空白。",
    ])

    add_heading(doc, "7.8 退货与售后关联规则", 2)
    add_table(
        doc,
        ["规则项", "要求"],
        [
            ["双重归属", "售后、退款与财务归属于原订单商品行；退货物流与实际发出数量归属于当前实际发货单商品行。每条退货数量必须同时保留两种关联。"],
            ["售后发起入口", "退款、取消与退货均通过售后订单发起，不允许直接从发货单生成旺店通退款/退货数据。发货管理中的入口仅用于查看关联和跳转售后订单。"],
            ["推送触发点", "只有售后订单进入业务定义的“已完成”状态后，才自动触发旺店通推送；申请中、审核中或处理中均不推送。"],
            ["单条推送原则", "一张售后订单完成只向旺店通推送1条售后数据。即使一张售后订单关联多个拆单子发货单、多个合单来源或多条实际发货明细，也不得按映射数量拆成多条推送。"],
            ["发货前退款/取消", "售后处理中先占用对应商品数量；售后完成后扣减剩余履约数量，并推送1条旺店通数据。某发货单剩余数量为0时，该发货单失效且不可继续拆合或同步。"],
            ["拆单后退货", "一个原订单商品行可能分布在多个拆单子发货单。售后订单保存每个实际发货明细的映射数量；售后完成时汇总为1条旺店通售后数据。"],
            ["合单后退货", "一个合并发货单可能包含多个原订单。售后订单先确定原订单商品行，再定位合并发货单中的来源数量；完成后仍只推送1条数据，不得冲减其他原订单。"],
            ["相同SKU", "多个原订单的相同SKU可在发货展示中汇总，但后台按原订单商品行分别保存来源数量；退货时按原订单来源分别计算，不允许跨来源共用可退数量。"],
            ["可退数量", "原订单商品行可退数量＝累计已发货数量－累计有效退货数量。若业务将退款、拒收等状态占用同一数量口径，还需扣减尚未失效的在途占用数量。"],
            ["部分退货", "一张售后订单可关联多个实际发货单商品行，映射数量之和必须等于本次退货数量；映射用于内部追溯，不增加旺店通推送条数。"],
            ["驳回订单处理", "旺店通驳回订单提交拆合前必须重新读取最新售后状态和剩余履约数量；全量退款或取消时不再拆合，按取消结果结束当前发货单。"],
            ["推送幂等", "以售后订单唯一ID和完成版本生成稳定业务幂等键。售后完成事件重复触发或接口超时重试时，返回原推送结果，不得在旺店通重复生成售后数据。"],
            ["推送失败", "售后完成与旺店通推送结果分开记录。推送失败不回退本地已完成售后状态，系统保留失败原因并支持自动或人工重试。"],
            ["历史保留", "退货完成不回写或覆盖既有拆合记录；关联单据链需同时展示原订单、拆合批次、实际发货单及退货单。"],
            ["页面展示", "系统内售后订单关联页面不展示流程图，直接展示售后订单状态、原订单与实际发货单明细、已发/已退/可退数量，以及旺店通推送条数、状态、时间和请求号。"],
        ],
        [2200, 7160],
        font_size=8.7,
    )

    add_heading(doc, "8. 异常场景", 1, page_break=True)
    add_table(
        doc,
        ["异常场景", "系统处理", "用户提示/结果"],
        [
            ["旺店通状态查询超时或失败", "不改变本地已知状态，记录查询失败；允许再次查询。", "状态查询失败，请稍后重试。"],
            ["接口返回状态未知", "不得将订单归入驳回池，也不得自动拆合。", "暂未获取到明确状态。"],
            ["拆单数量为小数、负数或空", "阻止提交。", "商品数量只能填写非负整数。"],
            ["商品缺少温层或温层值非法", "禁用按温层快捷拆分，列出异常商品；仍允许进入自定义拆分。", "部分商品未维护有效温层，请选择自定义拆分或先维护商品资料。"],
            ["原单只包含一个温层", "快捷归组只能形成1张子单，不允许直接提交；引导切换自定义拆分。", "当前订单仅有一个温层，请使用自定义拆分。"],
            ["拆单数量合计不等于原数量", "阻止提交并逐商品显示已分配/应分配数量。", "数量不一致，请重新分配。"],
            ["存在空子发货单", "阻止提交，要求填写数量或删除空子单。", "子发货单N没有商品。"],
            ["商品总数不足2件", "不进入拆单编辑。", "当前商品数量无法拆成两个有效子单。"],
            ["合单不足2张", "阻止提交。", "合单至少选择2张发货单。"],
            ["合单收件信息不一致", "阻止提交并高亮差异字段。", "收货信息不一致，不能合单。"],
            ["来源单已同步/已发货/已取消", "提交前复核失败，取消本次拆合。", "来源单状态已变化，请刷新后重试。"],
            ["来源单已被其他拆合操作消费", "依据当前有效标识拒绝提交。", "该发货单已不是当前有效单据。"],
            ["两人先后处理同一驳回订单", "不锁定；后提交者在确认时发现已处理并终止。", "订单已由其他人员处理，请查看结果。"],
            ["重复点击确认", "使用业务请求号和数据库唯一约束保证只生成一次结果。", "返回第一次成功结果，不重复建单。"],
            ["多张子单仅部分同步成功", "已接收子单不可再拆合；未同步/失败子单仍按自身状态处理。", "逐张展示同步结果，禁止整批重复发送。"],
            ["拆合结果再次被旺店通驳回", "新增驳回记录并关联来源拆合编号。", "显示“拆单后再次驳回”或“合单后再次驳回”。"],
            ["回传旺店通单号无法匹配", "按同步请求号、OMS发货单唯一ID继续匹配；仍失败则记录接口异常。", "进入技术异常排查，不更新错误订单。"],
            ["拆合编辑期间发生退款或取消", "提交时重读售后状态和剩余履约数量；发现变化则整单拒绝提交，不沿用旧方案。", "订单售后数量已变化，请刷新后重新拆合。"],
            ["退货数量超过可退数量", "按原订单商品行及实际发货明细校验累计数量，阻止创建或确认。", "可退数量不足，请刷新售后明细。"],
            ["合单内相同SKU来自多个原订单", "按原订单商品行分别建立退货映射，不使用合并后的汇总数量直接冲减。", "请选择本次退货所属的原订单明细。"],
            ["拆单商品跨多个子单部分退货", "允许一笔售后拆成多条实际发货映射；校验映射数量合计。", "退货数量必须完整分配到实际发货单。"],
            ["发货前商品被全量取消", "将对应履约数量扣减为0；若发货单无其他商品则置为失效。", "该发货单已无可履约商品，不能拆合或同步。"],
            ["售后完成事件重复触发", "按售后订单唯一ID和完成版本进行幂等校验，复用首次推送结果。", "不重复向旺店通生成售后数据。"],
            ["售后完成后旺店通推送失败", "保留售后已完成状态，记录请求参数、失败原因和重试次数；进入自动或人工重试。", "旺店通推送失败，可重新推送。"],
            ["推送超时但结果未知", "使用同一幂等请求号查询或重试，禁止生成新的请求号直接再次建单。", "正在确认旺店通处理结果，请勿重复操作。"],
            ["一张售后单关联多条实际发货明细", "先校验映射数量合计，再汇总生成1条旺店通数据。", "推送条数仍为1条，关联明细可展开查看。"],
            ["已完成售后被撤销或冲正", "不得直接删除已推送记录；根据旺店通是否支持撤销/冲正接口执行后续处理。", "需确认旺店通冲正能力后处理。"],
        ],
        [2750, 4350, 2260],
        font_size=8.25,
    )

    add_heading(doc, "9. 上线影响", 1, page_break=True)
    add_heading(doc, "9.1 业务与操作影响", 2)
    add_bullets(doc, [
        "发货运营人员需要从OMS判断和完成拆合，不再进入旺店通执行拆单或合单；多温层订单可直接使用按温层快捷拆分。",
        "发货管理统一为“发货订单 / 旺店通驳回订单”双Tab：前者承担未同步订单的拆合，后者承担已同步后被驳回订单的处理。",
        "原拆单管理、合单管理合并为“拆/合单管理”，通过Tab查看两类完成结果；培训需说明拆单按处理前→处理后阅读，合单按处理后→处理前阅读。",
        "已接收旺店通的订单必须保持不可拆合，避免第三方重复发货。",
        "售后人员通过售后订单发起退款、取消或退货；售后完成后系统自动向旺店通推送1条数据，发货管理只提供售后订单关联查看和跳转。",
    ])

    add_heading(doc, "9.2 系统与数据影响", 2)
    add_table(
        doc,
        ["影响面", "改造内容"],
        [
            ["订单/发货数据模型", "新增拆合批次、关系表、当前有效标识、结果类型、拆分方式、商品温层快照及来源商品行映射。"],
            ["旺店通同步", "同步对象从原订单固定映射改为当前有效发货单；保存多次历史同步关系。"],
            ["状态查询任务", "定时查询未完成发货单状态；识别已驳回并写入驳回订单。"],
            ["发货管理页面", "合并发货订单与旺店通驳回订单入口为双Tab；根据是否未同步、是否当前有效控制拆单/合单按钮，并分别保留Tab查询条件。"],
            ["售后/退款/退货", "以售后订单为发起与推送主体；保留原订单商品行—实际发货单商品行的数量映射，售后完成后按售后订单维度向旺店通推送1条数据。"],
            ["旺店通售后推送接口", "新增或复用售后数据推送能力，支持售后完成触发、单条数据组装、稳定幂等键、结果查询、失败重试和推送日志。"],
            ["报表/导出", "新增拆单次数、合单次数、再次驳回次数和拆合结果导出。"],
            ["历史数据", "本期不要求补齐旺店通历史拆单关系；上线后新拆合全部在OMS执行。"],
        ],
        [2300, 7060],
        font_size=9,
    )

    add_heading(doc, "9.3 上线与回滚建议", 2)
    add_numbered(doc, [
        "先上线数据模型与关系查询，验证现有发货同步不受影响。",
        "灰度开放发货管理的发货订单Tab拆合，限定测试客户或测试账号进行UAT。",
        "开放同页旺店通驳回订单Tab拆合，并监控新结果单同步成功率和再次驳回率。",
        "确认稳定后，停止业务人员在旺店通内进行拆单/合单。",
        "若需要回滚，关闭OMS拆合入口，但保留已经生成的拆合关系和结果单读取能力，禁止删除历史记录。",
    ])

    add_heading(doc, "10. 需要协作的依赖项", 1, page_break=True)
    add_table(
        doc,
        ["协作方", "依赖事项", "交付/确认内容", "优先级"],
        [
            ["旺店通接口负责人", "订单状态查询、发货同步及售后推送接口", "确认售后数据字段、完成后推送时点、单条数据约束、幂等字段、结果查询与失败重试能力。", "P0"],
            ["OMS后端", "发货单重组与关系模型", "拆合事务、当前有效标识、商品来源映射、唯一约束和接口日志。", "P0"],
            ["OMS前端", "发货管理双Tab、拆合弹窗及结果档案", "Tab切换与查询条件保留、温层快捷/自定义拆分切换、数量校验、差异高亮、关系链展示。", "P0"],
            ["商品标准库/主数据", "商品温层字段", "为参与发货的SKU维护常温、冷藏、冷冻枚举值，并确认接口取值、历史数据补齐和变更生效时点。", "P0"],
            ["订单/售后系统", "售后订单状态、数量映射与完成事件", "提供售后订单发起、完成状态和完成事件；保存原订单商品行到实际发货单商品行的数量映射，并保证一张售后订单只触发1条旺店通数据。", "P0"],
            ["业务运营", "合单准入与操作流程", "确认客户、收件人、手机号、地址必须一致；完成UAT场景验收。", "P0"],
            ["测试团队", "端到端与并发测试", "覆盖前置拆合、驳回拆合、多级拆合、售后完成推送1条、重复完成事件幂等、推送失败重试及结果未知。", "P0"],
            ["数据/BI", "指标与报表口径", "拆合次数、结果单数、再次驳回率、映射失败数。", "P1"],
            ["运维/监控", "定时任务及接口告警", "状态查询失败率、同步超时、映射失败、重复请求告警。", "P1"],
        ],
        [1700, 2200, 4560, 900],
        font_size=8.4,
    )

    add_heading(doc, "10.1 联调前确认清单", 2)
    add_bullets(doc, [
        "旺店通“已驳回”状态枚举值、查询接口频率限制及状态更新时间字段。",
        "同步旺店通时可携带的OMS发货单唯一标识、请求号和来源订单号字段。",
        "同一订单拆成多张发货单后，旺店通分别返回单号的时点和查询方式。",
        "订单/售后系统中触发旺店通推送的准确“售后完成”状态枚举，以及完成事件是否可能重复发送。",
        "一张售后订单关联多个实际发货单商品行时，旺店通单条数据需要的明细结构、最大明细数和数量字段口径。",
        "旺店通售后推送接口的幂等字段、结果查询方式、超时重试策略，以及已推送售后的撤销/冲正能力。",
        "上线后是否通过制度明确禁止业务人员继续在旺店通侧拆合。",
    ])

    add_callout(
        doc,
        "评审结论建议",
        "本期按P0范围建设“OMS当前有效发货单重组”能力，发货管理通过“发货订单 / 旺店通驳回订单”两个Tab承载拆合操作；拆/合单管理作为统一完成结果档案，通过拆单记录、合单记录Tab切换。上线前必须完成数据关系、状态准入、幂等和端到端映射验收。",
        "success",
    )

    # Global table adjacent spacing and metadata.
    props = doc.core_properties
    props.title = "OMS发货单拆单与合单功能 PRD"
    props.subject = "OMS发货管理与旺店通拆合单需求"
    props.author = "卓希产品团队"
    props.keywords = "OMS, 旺店通, 拆单, 合单, 发货管理, PRD"

    doc.save(OUT_FILE)
    print(OUT_FILE)


if __name__ == "__main__":
    build_doc()
