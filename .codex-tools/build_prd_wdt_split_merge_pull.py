from pathlib import Path
from datetime import date
import importlib.util
import zipfile

from docx import Document
from docx.shared import Inches, Pt
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(r"E:\cxy")
OUT_FILE = ROOT / "04-需求管理" / "PRD-OMS拉取旺店通拆合单数据-v1.0.docx"
ASSET_DIR = ROOT / ".codex-tools" / "prd_wdt_split_merge_pull_assets"
ASSET_DIR.mkdir(parents=True, exist_ok=True)

spec = importlib.util.spec_from_file_location("prd_base", ROOT / ".codex-tools" / "build_prd_split_merge.py")
base = importlib.util.module_from_spec(spec)
spec.loader.exec_module(base)


def font(bold=False, size=24):
    return ImageFont.truetype(base.font_path(bold), size)


def make_pull_flow(path: Path):
    img = Image.new("RGB", (1800, 760), "white")
    d = ImageDraw.Draw(img)
    d.text((60, 40), "旺店通拆合单数据拉取流程", fill="#173A5E", font=font(True, 38))
    d.text((60, 94), "拆合操作只在旺店通执行，OMS拉取结果并建立可追溯关系。", fill="#5D6B78", font=font(False, 22))
    boxes = [
        ((55, 210, 325, 355), "旺店通完成拆合", "输出拆合记录与商品数量"),
        ((405, 210, 675, 355), "OMS增量拉取", "定时任务 / 人工触发"),
        ((755, 210, 1025, 355), "幂等写入", "记录ID + 更新时间游标"),
        ((1105, 210, 1375, 355), "关联与校验", "订单映射 + 数量守恒"),
        ((1455, 210, 1745, 355), "页面展示", "关系记录 / 待匹配数据"),
    ]
    colors = [
        ("#FFF3E8", "#E8A55A"),
        ("#EAF4FD", "#77B5E8"),
        ("#EAF4FD", "#77B5E8"),
        ("#EAF6EC", "#77B980"),
        ("#EAF4FD", "#77B5E8"),
    ]
    for (box, title, subtitle), (fill, outline) in zip(boxes, colors):
        base.draw_rounded_box(d, box, fill, outline, title, subtitle)
    for left, right in zip(boxes, boxes[1:]):
        base.arrow(d, (left[0][2] + 8, 282), (right[0][0] - 8, 282))

    d.rounded_rectangle((240, 500, 790, 635), radius=16, fill="#EAF6EC", outline="#77B980", width=2)
    d.text((515, 540), "自动匹配成功", fill="#18324B", font=font(True, 29), anchor="mm")
    d.text((515, 588), "进入拆单或合单关系记录", fill="#506070", font=font(False, 22), anchor="mm")
    d.rounded_rectangle((1010, 500, 1560, 635), radius=16, fill="#FFF3E8", outline="#E8A55A", width=2)
    d.text((1285, 540), "匹配失败或数量异常", fill="#18324B", font=font(True, 29), anchor="mm")
    d.text((1285, 588), "保留原始数据并进入待匹配池", fill="#506070", font=font(False, 22), anchor="mm")
    base.arrow(d, (1240, 365), (790, 500))
    base.arrow(d, (1240, 365), (1010, 500))
    img.save(path)


def make_relation_flow(path: Path):
    img = Image.new("RGB", (1800, 760), "white")
    d = ImageDraw.Draw(img)
    d.text((60, 40), "拆单与合单关系映射", fill="#173A5E", font=font(True, 38))
    d.text((60, 94), "OMS不改变旺店通结果，按商品行保留来源数量与结果数量。", fill="#5D6B78", font=font(False, 22))

    d.text((65, 210), "拆单", fill="#2E74B5", font=font(True, 25))
    base.draw_rounded_box(d, (245, 170, 555, 310), "#EAF4FD", "#77B5E8", "旺店通原单 A", "SKU1 × 5")
    base.draw_rounded_box(d, (745, 170, 1055, 310), "#F4F6F9", "#B5C0CC", "拆单记录 SP001", "来源 1单 / 结果 2单")
    base.draw_rounded_box(d, (1245, 135, 1585, 255), "#EAF6EC", "#77B980", "结果子单 A-1", "SKU1 × 2")
    base.draw_rounded_box(d, (1245, 285, 1585, 405), "#EAF6EC", "#77B980", "结果子单 A-2", "SKU1 × 3")
    base.arrow(d, (565, 240), (735, 240))
    base.arrow(d, (1065, 240), (1235, 195))
    base.arrow(d, (1065, 240), (1235, 345))

    d.text((65, 540), "合单", fill="#B35C00", font=font(True, 25))
    base.draw_rounded_box(d, (245, 455, 555, 575), "#FFF3E8", "#E8A55A", "旺店通来源单 B", "SKU2 × 2")
    base.draw_rounded_box(d, (245, 605, 555, 725), "#FFF3E8", "#E8A55A", "旺店通来源单 C", "SKU3 × 1")
    base.draw_rounded_box(d, (745, 500, 1055, 650), "#F4F6F9", "#B5C0CC", "合单记录 MG001", "来源 2单 / 结果 1单")
    base.draw_rounded_box(d, (1245, 500, 1585, 650), "#EAF6EC", "#77B980", "合并结果单 BC", "SKU2 × 2 / SKU3 × 1")
    base.arrow(d, (565, 515), (735, 565))
    base.arrow(d, (565, 665), (735, 585))
    base.arrow(d, (1065, 575), (1235, 575))
    img.save(path)


def set_document_styles(doc: Document):
    base.setup_styles(doc)
    for name in ("Title", "Heading 1", "Heading 2", "Heading 3"):
        style = doc.styles[name]
        style.font.name = "Microsoft YaHei"
        style._element.rPr.rFonts.set(qn("w:eastAsia"), "Microsoft YaHei")
        style.font.color.rgb = base.rgb("000000")
    doc.styles["Title"].font.size = Pt(25)
    doc.styles["Title"].font.bold = True


def add_metadata(doc, rows):
    table = base.add_table(doc, ["项目属性", "内容"], rows, [1900, 7460], header_fill=base.LIGHT_BLUE, font_size=9.5)
    table.alignment = base.WD_TABLE_ALIGNMENT.LEFT


def build_doc():
    pull_flow = ASSET_DIR / "wdt-pull-flow.png"
    relation_flow = ASSET_DIR / "wdt-relation-flow.png"
    make_pull_flow(pull_flow)
    make_relation_flow(relation_flow)

    doc = Document()
    section = doc.sections[0]
    section.page_width = Inches(8.5)
    section.page_height = Inches(11)
    section.top_margin = Inches(0.85)
    section.bottom_margin = Inches(0.8)
    section.left_margin = Inches(0.85)
    section.right_margin = Inches(0.85)
    section.footer_distance = Inches(0.35)
    set_document_styles(doc)
    base.add_page_number(section.footer.paragraphs[0])

    title = doc.add_paragraph(style="Title")
    title.paragraph_format.space_before = Pt(18)
    title.paragraph_format.space_after = Pt(8)
    r = title.add_run("OMS拉取旺店通拆合单数据")
    base.set_run_font(r, size=25, color="000000", bold=True)
    sub = doc.add_paragraph()
    sub.paragraph_format.space_after = Pt(18)
    r = sub.add_run("产品需求文档")
    base.set_run_font(r, size=13, color=base.MUTED)

    add_metadata(doc, [
        ["文档版本", "v1.0"],
        ["文档状态", "评审稿"],
        ["所属系统", "OMS订单系统 / 发货管理"],
        ["关联平台", "旺店通"],
        ["需求负责人", "陈薪宇"],
        ["编制日期", "2026-10-26"],
        ["原型文件", "旺店通拆合单数据拉取交互演示.html"],
    ])
    base.add_para(doc, "产品定义：拆单和合单继续在旺店通执行。OMS只拉取旺店通已完成的拆合记录、结果单号及商品数量，并与OMS原订单和原发货单建立可追溯关系。", bold_lead="产品定义：", size=10.8, after=12)

    base.add_heading(doc, "1 需求背景", 1)
    base.add_para(doc, "此前方案要求在OMS内完成拆单和合单，再将结果同步至旺店通。业务方案现已调整：拆单和合单仍由旺店通处理，OMS不再提供拆合操作，只接收旺店通形成的拆合结果。")
    base.add_para(doc, "旺店通拆单会把一个订单拆成多个结果单；合单会把多个来源单合成一个结果单。如果OMS只保留最初同步关系，后续物流、出库、售后和退货数据可能无法定位到原订单。因此，OMS需要拉取旺店通拆合记录，并保存来源单、结果单和商品数量之间的映射。")
    base.add_para(doc, "旺店通是拆合结果的权威数据源。OMS不得修改旺店通返回的拆合关系，也不得根据推测生成缺失关系。无法自动匹配的数据进入异常池，由业务或技术人员补充标识后重新匹配。")

    base.add_heading(doc, "2 业务目标", 1)
    base.add_bullets(doc, [
        ("完整拉取：", "通过定时任务和人工按钮拉取旺店通已完成的拆单、合单记录。"),
        ("稳定映射：", "建立旺店通来源单、结果单与OMS原订单、原发货单的双向关系。"),
        ("数量可追溯：", "按商品行保留拆前、拆后或合并前、合并后的数量来源。"),
        ("异常可恢复：", "未匹配、数量不守恒或接口失败时保留原始数据和失败原因，支持重试。"),
        ("消费一致：", "物流、售后、退货和订单查询统一使用拉取后的实际拆合关系。"),
    ])
    base.add_para(doc, "成功标准：同一旺店通拆合记录重复拉取不产生重复关系；已匹配记录可从任一旺店通来源单或结果单追溯到对应OMS订单和商品数量。", bold_lead="成功标准：")

    base.add_heading(doc, "3 用户痛点", 1)
    base.add_table(doc, ["用户角色", "当前问题", "目标体验"], [
        ["发货运营人员", "拆合在旺店通完成后，OMS仍显示原发货关系，无法确认实际执行单。", "在OMS查看旺店通拆合结果和最终单号，不重复人工录入。"],
        ["客服与售后人员", "结果旺店通单号与OMS原订单之间缺少稳定关系。", "输入任一单号即可定位原订单、商品数量和实际结果单。"],
        ["技术支持人员", "接口重复拉取、顺序错乱或字段缺失时难以判断数据是否完整。", "查看拉取批次、原始记录、匹配状态和明确失败原因。"],
        ["业务负责人", "无法统计哪些拆合数据已同步、哪些仍待匹配。", "通过统一页面查看拉取结果与异常存量。"],
    ], [1550, 3900, 3910], font_size=8.9)

    base.add_heading(doc, "4 功能范围", 1, page_break=True)
    base.add_heading(doc, "4.1 本期功能", 2)
    base.add_table(doc, ["模块", "功能", "页面或任务"], [
        ["拆合数据拉取", "支持定时增量拉取和人工立即拉取；保存拉取批次、水位和接口结果。", "旺店通拆合单同步页面 / 后台任务"],
        ["拆单关系入库", "保存一个旺店通来源单到多个结果子单的关系，以及每个商品行的原数量与结果数量。", "拆单关系Tab"],
        ["合单关系入库", "保存多个旺店通来源单到一个合并结果单的关系，并按OMS原订单保留商品数量来源。", "合单关系Tab"],
        ["OMS订单匹配", "优先按OMS发货单唯一标识、原同步请求号或既有旺店通映射定位原订单。", "匹配服务"],
        ["异常池", "承载未匹配、映射冲突和数量异常数据，显示原因并支持重新匹配。", "待匹配数据Tab"],
        ["关系查询", "支持按OMS订单号、发货单号、旺店通来源单或结果单查询完整关系。", "列表与详情弹窗"],
        ["下游消费", "订单物流、售后退货等模块读取实际拆合关系。", "既有业务页面"],
    ], [1750, 5000, 2610], font_size=8.7)

    base.add_heading(doc, "4.2 本期不包含", 2)
    base.add_bullets(doc, [
        "不在OMS内执行拆单、合单、商品数量分配或合单候选选择。",
        "不由OMS向旺店通推送拆单或合单结果，也不提供旺店通驳回订单重处理。",
        "不允许在OMS修改旺店通拆合来源单、结果单或商品数量。",
        "不增加仓库、快递、包裹、运费等拆合附加信息。",
        "不根据客户、地址或商品名称进行高风险模糊自动匹配。",
    ])

    base.add_heading(doc, "5 优先级说明", 1)
    base.add_table(doc, ["优先级", "范围", "验收重点"], [
        ["P0", "接口拉取与游标", "定时与人工拉取共用幂等机制；失败不推进成功水位。"],
        ["P0", "拆单与合单关系模型", "支持一对多、多对一和多级拆合链；保留商品行来源数量。"],
        ["P0", "OMS订单匹配", "使用稳定业务标识匹配；冲突时不得覆盖已有关系。"],
        ["P0", "数量守恒校验", "拆单结果合计等于来源数量；合单结果等于全部来源数量合计。"],
        ["P0", "列表与详情", "可查询拆合类型、来源单、结果单、OMS订单、匹配状态和拉取时间。"],
        ["P0", "异常池与重试", "保留原始数据、错误原因和重试结果。"],
        ["P1", "导出与批量重新匹配", "支持导出异常数据并按补齐的映射标识批量重试。"],
        ["P2", "关系链可视化", "展示跨多次拆合的完整树状或链式关系。"],
    ], [900, 2850, 5610], font_size=8.7)

    base.add_heading(doc, "6 原型或流程图", 1, page_break=True)
    base.add_heading(doc, "6.1 数据拉取流程", 2)
    doc.add_picture(str(pull_flow), width=Inches(6.65))
    doc.inline_shapes[-1]._inline.docPr.set("title", "旺店通拆合单数据拉取流程")
    doc.inline_shapes[-1]._inline.docPr.set("descr", "旺店通完成拆合后，OMS增量拉取、幂等入库、匹配原订单并进入成功关系记录或待匹配池。")
    base.add_caption(doc, "图1 旺店通拆合单数据拉取流程")
    base.add_heading(doc, "6.2 拆单与合单关系", 2)
    doc.add_picture(str(relation_flow), width=Inches(6.65))
    doc.inline_shapes[-1]._inline.docPr.set("title", "拆单与合单关系映射")
    doc.inline_shapes[-1]._inline.docPr.set("descr", "拆单是一张来源单对应多张结果子单，合单是多张来源单对应一张合并结果单，并保留商品数量来源。")
    base.add_caption(doc, "图2 拆单与合单关系映射")
    base.add_heading(doc, "6.3 页面原型", 2)
    base.add_table(doc, ["页面区域", "核心内容"], [
        ["页面头部", "突出“立即拉取”主操作，并明确OMS只拉取、不执行拆合。"],
        ["数据摘要", "展示最近成功拉取时间、本次记录数、已匹配数和待匹配数；原型数字明确为演示数据。"],
        ["筛选区", "按OMS订单、OMS发货单、旺店通单号、拆合类型、匹配状态和操作时间查询。"],
        ["记录Tab", "全部记录、拆单关系、合单关系、待匹配数据。"],
        ["关系详情", "展示旺店通来源单、拆合记录、结果单、商品数量、OMS匹配结果和校验结论。"],
        ["待匹配处理", "展示失败原因和建议处理方式；重新匹配不修改旺店通原始拆合数据。"],
    ], [2200, 7160], font_size=9.0)
    base.add_para(doc, r"交互原型路径：E:\cxy\09-设计与原型\旺店通拆合单数据拉取交互演示.html", color=base.MUTED, size=9.2)

    base.add_heading(doc, "7 关键规则", 1, page_break=True)
    base.add_heading(doc, "7.1 数据源与拉取规则", 2)
    base.add_table(doc, ["规则项", "要求"], [
        ["权威数据源", "旺店通拆合记录是拆合结果的唯一权威来源，OMS不得自行推导或改写。"],
        ["拉取对象", "仅拉取旺店通已完成且可稳定读取来源单、结果单和商品数量的拆单、合单记录。"],
        ["触发方式", "后台定时任务自动拉取；页面提供人工立即拉取。两者使用相同游标和幂等规则。"],
        ["增量游标", "至少使用旺店通更新时间与记录唯一ID组合推进水位，避免同一时间多条记录遗漏。具体分页和回溯窗口由接口联调确认。"],
        ["水位推进", "当前批次全部分页读取并成功持久化后才推进成功水位；部分失败时保留原水位或按可恢复断点重试。"],
        ["原始数据", "保存关键原始响应、旺店通记录ID、更新时间、拉取批次和接口请求号，供问题追踪。"],
        ["只读边界", "OMS拉取任务不向旺店通写入拆合数据，不触发重新拆合。"],
    ], [2200, 7160], font_size=8.8)

    base.add_heading(doc, "7.2 关系与数量规则", 2)
    base.add_table(doc, ["规则项", "要求"], [
        ["拆单关系", "一个旺店通来源单对应一个拆单记录和多张结果子单；每个结果商品行保存来源商品行与数量。"],
        ["合单关系", "多张旺店通来源单对应一个合单记录和一张结果单；相同SKU可汇总展示，但后台按OMS原订单商品行分别保存来源数量。"],
        ["数量守恒", "拆单结果商品数量合计必须等于来源商品数量；合单结果数量必须等于全部来源单对应商品数量合计。"],
        ["多级拆合", "旺店通结果单再次参与拆单或合单时，新增下一层关系，不覆盖上一层。"],
        ["当前结果单", "沿关系链定位没有后续拆合的叶子结果单，作为物流和售后查询的实际旺店通单。"],
        ["历史保留", "关系被后续更新或冲正时保留历史版本、更新时间和原始响应，不物理删除已被业务引用的关系。"],
    ], [2200, 7160], font_size=8.8)

    base.add_heading(doc, "7.3 OMS匹配规则", 2)
    base.add_numbered(doc, [
        "优先读取旺店通记录中的OMS发货单唯一ID、OMS同步请求号或双方约定的业务标识。",
        "若拆合来源单已存在旺店通单号与OMS发货单映射，可沿既有映射定位原订单商品行。",
        "多个OMS发货单同时命中或稳定标识缺失时进入待匹配池，不按客户、地址、商品名称等字段自动选定。",
        "重新匹配只更新OMS关系和匹配结果，不修改旺店通来源单、结果单和商品数量。",
        "关系写入前检查同一旺店通拆合记录是否已存在；重复拉取执行幂等更新。",
    ])

    base.add_heading(doc, "7.4 状态与权限", 2)
    base.add_table(doc, ["对象", "状态或权限"], [
        ["拉取批次", "执行中、成功、部分失败、失败；页面主列表不必展示执行中明细，但应提供任务反馈。"],
        ["拆合记录", "已匹配、待匹配、数据异常。状态文字与颜色同时展示。"],
        ["页面权限", "具备发货管理查询权限的人员可查看；人工拉取和重新匹配需要单独操作权限。"],
        ["数据修改", "业务用户不能编辑旺店通拆合关系与商品数量。"],
    ], [2200, 7160], font_size=8.8)

    base.add_heading(doc, "8 异常场景", 1, page_break=True)
    base.add_table(doc, ["异常场景", "系统处理", "页面反馈"], [
        ["旺店通接口超时或不可用", "当前批次失败或进入重试，不推进成功水位。", "显示失败原因和重试入口，保留上次成功时间。"],
        ["分页拉取中途失败", "记录已完成页和失败页；按接口能力从安全断点重试。", "批次标记部分失败，不把未读取数据计为成功。"],
        ["重复返回同一拆合记录", "按旺店通记录ID幂等更新。", "不新增重复关系。"],
        ["相同更新时间包含多条记录", "使用更新时间与唯一ID组合游标。", "不漏拉、不重复新增。"],
        ["数据到达顺序错乱", "来源单映射尚未到达时先保留原始记录并进入待匹配。", "提示等待前置映射或人工重试。"],
        ["旺店通来源单无法匹配OMS", "保存完整拆合原始数据，不写入错误订单关系。", "进入待匹配数据并显示缺失标识。"],
        ["多个OMS发货单同时命中", "停止自动匹配并记录候选冲突。", "提示存在映射冲突，需要人工确认稳定标识。"],
        ["拆单数量不守恒", "关系标记数据异常，不供物流或售后作为有效结果。", "展示来源数量、结果合计和差额。"],
        ["合单结果缺少来源明细", "保留记录但不标记已匹配。", "提示旺店通返回字段不完整。"],
        ["同一关系后续被旺店通更新", "按更新时间生成新版本或更新当前版本，并保留历史快照。", "详情展示最近更新时间。"],
        ["定时任务与人工拉取并发", "通过任务互斥或共享幂等键避免重复推进水位。", "后发任务复用进行中任务或提示稍后重试。"],
        ["重新匹配仍缺少标识", "保留待匹配状态和本次失败原因。", "输入不丢失，提示检查旺店通接口字段。"],
    ], [2500, 4450, 2410], font_size=8.2)

    base.add_heading(doc, "9 上线影响", 1, page_break=True)
    base.add_heading(doc, "9.1 业务影响", 2)
    base.add_bullets(doc, [
        "发货人员继续在旺店通执行拆单和合单，不再进入OMS操作拆合。",
        "OMS新增旺店通拆合单同步页面，用于确认数据是否已拉取、是否匹配和数量是否完整。",
        "未匹配数据需要接口标识补齐或人工核对，不能直接用于物流、售后和退货定位。",
        "客服、售后和物流查询改为沿拉取后的拆合关系定位旺店通实际结果单。",
    ])
    base.add_heading(doc, "9.2 系统影响", 2)
    base.add_table(doc, ["影响面", "改造内容"], [
        ["数据模型", "新增拉取批次、拆合记录、来源单、结果单、商品行数量映射、原始响应和匹配结果。"],
        ["接口任务", "新增定时增量拉取、人工拉取、分页重试、水位管理和接口限流处理。"],
        ["订单映射", "增强旺店通单号与OMS发货单、原订单商品行的映射能力。"],
        ["发货管理页面", "新增拆合数据同步列表、筛选、关系详情和待匹配异常池；移除新版本中的OMS拆合操作。"],
        ["物流与售后", "读取叶子结果单和商品来源数量；异常关系不得进入自动处理。"],
        ["监控", "增加拉取延迟、批次失败、未匹配数量、数量异常和映射冲突告警。"],
    ], [2300, 7060], font_size=8.9)
    base.add_heading(doc, "9.3 上线建议", 2)
    base.add_numbered(doc, [
        "先完成旺店通接口字段和历史数据范围确认，并在测试环境验证拆单、合单、多级拆合样例。",
        "上线数据表与拉取任务，先只记录不供下游消费，核对数量守恒和匹配准确性。",
        "灰度开放查询页面和待匹配处理，完成历史存量数据初始化。",
        "匹配结果稳定后，再切换物流、售后和退货模块读取新关系。",
        "回滚时停止新拉取任务并恢复下游旧查询逻辑，但保留已拉取原始数据和关系记录。",
    ])

    base.add_heading(doc, "10 需要协作的依赖项", 1, page_break=True)
    base.add_table(doc, ["协作方", "依赖事项", "需要确认或交付", "优先级"], [
        ["旺店通接口负责人", "拆合记录查询接口", "提供记录唯一ID、更新时间、拆合类型、来源单、结果单、商品行和数量；确认分页、限流、历史查询和更新机制。", "P0"],
        ["OMS后端", "拉取任务与关系模型", "实现批次、水位、幂等、分页重试、原始响应、关系入库和匹配服务。", "P0"],
        ["OMS前端", "同步页面与异常池", "实现筛选、Tab、立即拉取、关系详情、失败反馈和重新匹配。", "P0"],
        ["订单与发货服务", "稳定业务标识", "提供OMS发货单唯一ID、同步请求号和旺店通单号既有映射。", "P0"],
        ["物流与售后系统", "下游读取规则", "确认叶子结果单、原订单商品行和数量来源的消费方式及异常阻断规则。", "P0"],
        ["业务运营", "历史范围与异常处理", "确认历史数据起始时间、人工核对责任和验收样例。", "P0"],
        ["测试团队", "端到端数据测试", "覆盖拆单、合单、多级关系、重复拉取、分页失败、乱序、未匹配、数量异常和并发任务。", "P0"],
        ["运维与监控", "任务调度和告警", "配置任务执行、失败重试、接口延迟、未匹配积压和数据异常告警。", "P1"],
    ], [1550, 2050, 4860, 900], font_size=8.1)

    base.add_heading(doc, "10.1 联调前确认清单", 2)
    base.add_bullets(doc, [
        "旺店通拆合记录的唯一ID、更新时间精度及同一时间多条数据的排序字段。",
        "来源单和结果单是否同时返回OMS业务标识、原同步请求号或可稳定反查的旺店通单号。",
        "拆单和合单商品行的SKU、规格、单位、数量及同一SKU合并规则。",
        "记录是否可能修改、撤销或删除，以及历史版本和最终状态的查询方式。",
        "接口分页上限、频率限制、可查询历史范围和失败重试建议。",
        "上线时需要初始化的历史时间范围，以及存量关系的验收抽样方式。",
    ])

    props = doc.core_properties
    props.title = "OMS拉取旺店通拆合单数据 PRD"
    props.subject = "旺店通拆合单数据拉取与OMS关系映射"
    props.author = "卓希产品团队"
    props.keywords = "OMS, 旺店通, 拆单, 合单, 数据拉取, 关系映射, PRD"
    doc.save(OUT_FILE)
    print(OUT_FILE)


if __name__ == "__main__":
    build_doc()
